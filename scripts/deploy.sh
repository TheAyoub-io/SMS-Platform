#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting deployment..."

# 1. Validate environment
echo "Validating environment variables..."
if [ -z "$DATABASE_URL" ] || [ -z "$JWT_SECRET_KEY" ]; then
  echo "Error: Required environment variables are not set."
  exit 1
fi
echo "Environment validation passed."

# 2. Pull latest images
echo "Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# 3. Bring down the old version
echo "Bringing down old application containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# 4. Run database migrations
echo "Running database migrations..."
# The 'app' service from docker-compose.yml has the code and can run alembic
docker-compose run --rm app alembic upgrade head
echo "Migrations completed."

# 5. Bring up the new version
echo "Starting new application containers..."
docker-compose -f docker-compose.prod.yml up -d

# 6. Health Check
echo "Performing health check..."
sleep 10 # Give services time to start
response=$(curl --write-out '%{http_code}' --silent --output /dev/null http://localhost/health)

if [ "$response" -ne 200 ]; then
    echo "Health check failed with status code $response! Rolling back..."
    # A real rollback might involve tagging images and reverting to a previous tag
    docker-compose -f docker-compose.prod.yml down
    echo "Deployment rolled back."
    exit 1
fi

echo "Health check passed. Deployment successful!"
exit 0
