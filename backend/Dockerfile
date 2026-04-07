# Use Python 3.10 slim base image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENV_STATE=production

# Set work directory
WORKDIR /app

# Install system dependencies (including curl for Healthcheck)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies as a separate layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user and group
RUN addgroup --system appgroup && adduser --system --group appuser

# Copy project files and change ownership
COPY --chown=appuser:appgroup . /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Make start script executable (if it exists) and run
# Defaulting to uvicorn/gunicorn directly since start.sh is configured
CMD ["sh", "-c", "if [ -f start.sh ]; then ./start.sh; else gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000; fi"]
