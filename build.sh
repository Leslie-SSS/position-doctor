#!/bin/bash
set -e

echo "Building PositionDoctor Docker containers..."

# Change to project directory first
cd /home/leslie/keepbuild/projects/position-doctor

# Build backend
echo "Building backend..."
docker build -t position-doctor-backend ./backend

# Build frontend
echo "Building frontend..."
docker build -t position-doctor-frontend ./frontend

echo "Build complete!"
echo "Run 'docker-compose up' to start the services"
