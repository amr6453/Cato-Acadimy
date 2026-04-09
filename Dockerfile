# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Setup Django Backend
# ==========================================
FROM python:3.10-slim

# Create a non-root user for Hugging Face Spaces
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR $HOME/app

COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn whitenoise

COPY --chown=user:user . .
COPY --chown=user:user --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 7860

# Adjust 'lern.wsgi' below if your main django app is named differently.
CMD ["sh", "-c", "python manage.py runserver 0.0.0.0:7860"]
