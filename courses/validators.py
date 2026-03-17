import os
from django.core.exceptions import ValidationError

def validate_file_size(value):
    """
    Validator to restrict file size to 500MB.
    """
    filesize = value.size
    # 500MB = 500 * 1024 * 1024 bytes
    if filesize > 500 * 1024 * 1024:
        raise ValidationError("The maximum file size that can be uploaded is 500MB")
    return value
