#!/bin/bash
# PositionDoctor Deployment Script

set -e

echo "🚀 PositionDoctor Deployment Script"
echo "=================================="

# Parse arguments
ENV=${1:-dev}

if [ "$ENV" = "prod" ]; then
    echo "📦 Building for production..."
    docker-compose -f docker-compose.yml build
    echo "✅ Build complete. Run 'docker-compose up -d' to start."
elif [ "$ENV" = "dev" ]; then
    echo "🔧 Starting development environment..."

    # Check dependencies
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Start services
    docker-compose up -d

    echo "✅ Services started!"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8080"
    echo ""
    echo "To view logs, run: docker-compose logs -f"
    echo "To stop, run: docker-compose down"
else
    echo "Usage: $0 [dev|prod]"
    echo "  dev  - Start development environment"
    echo "  prod - Build for production"
    exit 1
fi
