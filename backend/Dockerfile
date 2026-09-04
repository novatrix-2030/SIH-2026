FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for compiling C extensions if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port
EXPOSE 8000

# Set environment variable for default port if not provided
ENV PORT=8000

# Command to run FastAPI server using Uvicorn
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
