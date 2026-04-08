# Using a single stage Python build since frontend is pre-built locally
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    python3-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn whitenoise

# Copy everything (includes pre-built frontend/dist and staticfiles)
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBUG=True
ENV PORT=7860
ENV SECRET_KEY="hf_space_default_key"
ENV CELERY_BROKER_URL="memory://"
ENV CELERY_RESULT_BACKEND="rpc://"
ENV PYTHONPATH=/app

# Ensure collectstatic finds the existing files (fast)
RUN python manage.py collectstatic --noinput

# Give permissions
RUN chmod -R 777 /app

# Expose port 7860
EXPOSE 7860

# Start command using shell form to ensure environment variables like $PORT are expanded
# and to allow running multiple commands (migrate + gunicorn)
CMD ["sh", "-c", "python manage.py migrate && python manage.py reset_all_passwords && gunicorn lern.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --access-logfile - --error-logfile -"]
