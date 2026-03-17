import secrets
import subprocess
import os
import shutil
from django.conf import settings
from celery import shared_task
from courses.models import Lesson

@shared_task
def process_video_hls(lesson_id):
    """
    Transcodes raw video to HLS with AES-128 encryption.
    """
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return f"Lesson {lesson_id} not found"

    if not lesson.video_file:
        return "No video file to process"

    lesson.video_status = Lesson.PROCESSING
    lesson.save()

    # 1. Setup paths
    input_path = lesson.video_file.path
    lesson_hls_dir = os.path.join(settings.HLS_OUTPUT_ROOT, str(lesson.id))
    if not os.path.exists(lesson_hls_dir):
        os.makedirs(lesson_hls_dir)
    
    output_playlist = os.path.join(lesson_hls_dir, 'playlist.m3u8')
    key_file_path = os.path.join(lesson_hls_dir, 'video.key')
    key_info_path = os.path.join(lesson_hls_dir, 'key_info.txt')

    # 2. Generate 16-byte AES key
    encryption_key = secrets.token_bytes(16)
    lesson.encryption_key = encryption_key
    lesson.save()

    with open(key_file_path, 'wb') as f:
        f.write(encryption_key)

    # 3. Create Key Info File for FFmpeg
    # URI is the secure endpoint that provides the key
    key_uri = f"{settings.BASE_URL}/api/video-key/{lesson.id}/"
    with open(key_info_path, 'w') as f:
        f.write(f"{key_uri}\n")
        f.write(f"{key_file_path}\n")

    # 4. Run FFmpeg Transcoding
    # -hls_key_info_file: points to our encryption config
    # -hls_time: segment length in seconds
    # -hls_playlist_type: vod for static files
    ffmpeg_cmd = [
        'ffmpeg', '-y', '-i', input_path,
        '-profile:v', 'main', '-level', '3.0', '-s', '1280x720',
        '-start_number', '0', '-hls_time', '10', '-hls_list_size', '0',
        '-hls_key_info_file', key_info_path,
        '-f', 'hls', output_playlist
    ]
    
    print(f"Task for lesson {lesson_id}: Starting FFmpeg command: {' '.join(ffmpeg_cmd)}")

    try:
        subprocess.run(ffmpeg_cmd, check=True)
        
        # 5. Cleanup & Update Lesson
        lesson.video_status = Lesson.COMPLETED
        # Store relative path for URL generation
        lesson.hls_playlist = os.path.join('hls', str(lesson.id), 'playlist.m3u8').replace('\\', '/')
        lesson.save()

        # Delete key_info and local key file (keep only in DB)
        os.remove(key_info_path)
        os.remove(key_file_path)
        
        # Proactively delete raw video if required (CAUTION: ensure backup if needed)
        # os.remove(input_path)
        
        return f"Successfully processed lesson {lesson_id}"

    except subprocess.CalledProcessError as e:
        lesson.video_status = Lesson.FAILED
        lesson.save()
        return f"FFmpeg error: {e.stderr.decode()}"
    except Exception as e:
        lesson.video_status = Lesson.FAILED
        lesson.save()
        return f"Processing error: {str(e)}"
