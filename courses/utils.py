import os
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .models import Lesson

def lesson_file_upload_to(instance: 'Lesson', filename: str) -> str:
    """
    Dynamic upload path for lesson files.
    Path: courses/{course_id}/sections/{section_id}/lessons/{filename}
    """
    course_id = instance.section.course.id
    section_id = instance.section.id
    return f'courses/{course_id}/sections/{section_id}/lessons/{filename}'
