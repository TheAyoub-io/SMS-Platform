#!/bin/bash

set -e

# Configuration
BACKUP_DIR="/opt/sms_platform_backups"
DB_CONTAINER_NAME="sms-campaign-platform_db_1" # This name depends on docker-compose project name
DB_NAME="sms_campaign_db"
DB_USER="user"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
MAX_BACKUPS=7 # Number of backups to keep

echo "Starting database backup..."

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Perform the database dump using pg_dump inside the container
echo "Creating database dump..."
docker exec "$DB_CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Database backup successful: $BACKUP_FILE"
else
    echo "Error: Database backup failed."
    exit 1
fi

# Backup rotation: remove oldest backups
echo "Cleaning up old backups..."
ls -1t "$BACKUP_DIR" | tail -n +$(($MAX_BACKUPS + 1)) | while read -r old_backup; do
    echo "Removing old backup: $old_backup"
    rm -f "$BACKUP_DIR/$old_backup"
done

echo "Backup process completed."
exit 0
