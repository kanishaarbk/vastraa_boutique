FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Docker build context is the ecom project root
COPY backend/requirements.txt ./requirements.txt

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copy only the Django backend into the container
COPY backend/ .

# Collect Django admin/static files during image build
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Render provides PORT automatically; 8000 is used locally
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-2}"]