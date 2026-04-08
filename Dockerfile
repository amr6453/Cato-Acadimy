# Stage 1: Build Frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
# Install dependencies separately for caching
COPY frontend/package*.json ./
RUN npm install
# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Final Python Image
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

# Copy project files
COPY . .

# Copy built frontend from Stage 1
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBUG=True
ENV PORT=7860
ENV SECRET_KEY="hf_space_default_key"
ENV CELERY_BROKER_URL="memory://"
ENV CELERY_RESULT_BACKEND="rpc://"
ENV PYTHONPATH=/app

# Ensure collectstatic finds the built frontend files
RUN python manage.py collectstatic --noinput

# Give permissions
RUN chmod -R 777 /app

# Expose port 7860
EXPOSE 7860

# Start command: migrate + create superuser (if not exists) + reset passwords + gunicorn
CMD ["sh", "-c", "python manage.py migrate && echo \"from users.models import CustomUser; CustomUser.objects.create_superuser('admin@example.com', 'Admin@123') if not CustomUser.objects.filter(email='admin@example.com').exists() else None\" | python manage.py shell && python manage.py reset_all_passwords && gunicorn lern.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --access-logfile - --error-logfile -"]
