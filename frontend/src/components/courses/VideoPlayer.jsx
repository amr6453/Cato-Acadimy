import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

/**
 * Premium HLS Video Player using Video.js
 * Handles secure AES-128 encrypted streams by sending credentials with key requests.
 */
const VideoPlayer = ({ src, onEnded, lessonId }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Initializing Video.js player
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered');
      videoElement.classList.add('vjs-premium-player');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
          children: [
            'playToggle',
            'volumePanel',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            'progressControl',
            'playbackRateMenuButton',
            'subsCapsButton',
            'audioTrackButton',
            'fullscreenToggle',
          ],
        },
        userActions: {
          hotkeys: true
        },
        sources: [{
          src: src,
          type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
        }],
        html5: {
          vhs: {
            withCredentials: true // Crucial for fetching the AES key from the secure API
          }
        }
      }, () => {
        console.log(`Video.js player ready for lesson: ${lessonId} with source: ${src}`);
      });

      // Handle Skip/Rewind with Keys or custom events
      const handleKeyDown = (e) => {
        const player = playerRef.current;
        if (!player) return;

        if (e.key === 'ArrowRight') {
          player.currentTime(player.currentTime() + 10);
        } else if (e.key === 'ArrowLeft') {
          player.currentTime(player.currentTime() - 10);
        } else if (e.key === ' ') {
          e.preventDefault();
          if (player.paused()) player.play();
          else player.pause();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      player.on('dispose', () => window.removeEventListener('keydown', handleKeyDown));

      player.on('ended', () => {
        if (onEnded) onEnded();
      });

      player.on('error', () => {
        const error = player.error();
        console.error('VideoJS Error:', error);
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
      });

    } else {
      // Update source if it changes
      const player = playerRef.current;
      player.src({ 
        src, 
        type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4' 
      });
    }
  }, [src, lessonId, onEnded]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative group">
      {/* Decorative gradient background for the player container */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[32px] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      
      <div data-vjs-player className="relative rounded-[24px] overflow-hidden premium-shadow bg-black aspect-video border border-white/10">
        <div ref={videoRef} />
        
        {/* Quality indicator overlay */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <span className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-black text-white/60 tracking-widest uppercase">
                {src.includes('.m3u8') ? '720P • HLS SECURE' : 'MP4 • FALLBACK'}
            </span>
        </div>
      </div>

      <style jsx global>{`
        /* Force VideoJS controls to be visible */
        .video-js.vjs-premium-player .vjs-control-bar {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent) !important;
          height: 60px !important;
          bottom: 0 !important;
          z-index: 100 !important;
        }

        /* Customize Big Play Button */
        .video-js.vjs-premium-player .vjs-big-play-button {
          background-color: #6366f1 !important;
          border: none !important;
          width: 80px !important;
          height: 80px !important;
          line-height: 78px !important;
          border-radius: 50% !important;
          z-index: 101 !important;
          top: 50% !important;
          left: 50% !important;
          margin-top: -40px !important;
          margin-left: -40px !important;
          transition: all 0.3s ease !important;
        }

        .video-js.vjs-premium-player:hover .vjs-big-play-button {
          transform: scale(1.1) rotate(5deg) !important;
        }

        /* Progress Bar Styling */
        .video-js.vjs-premium-player .vjs-progress-control {
          background: rgba(255,255,255,0.1) !important;
          height: 8px !important;
          position: absolute !important;
          top: -8px !important;
          width: 100% !important;
          left: 0 !important;
        }

        .video-js.vjs-premium-player .vjs-play-progress {
          background-color: #6366f1 !important;
        }

        .video-js.vjs-premium-player .vjs-slider {
          background: none !important;
        }

        /* Control Icons */
        .video-js.vjs-premium-player .vjs-button > .vjs-icon-placeholder:before {
          line-height: 60px !important;
          font-size: 20px !important;
        }

        /* Time Displays */
        .video-js.vjs-premium-player .vjs-time-control {
          line-height: 60px !important;
          font-weight: 900 !important;
          font-family: inherit !important;
          display: block !important;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
