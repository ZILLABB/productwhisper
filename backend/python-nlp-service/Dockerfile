# Use Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -m nltk.downloader vader_lexicon

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
