#!/bin/bash

# Art Frames - Deployment Helper Script
# This script automates verification and deployment tasks
# Usage: ./deploy-helper.sh [command]

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="art-frames"
IMAGE_TAG="latest"
CONTAINER_NAME="art-frames"
PORT=3000

# Helper functions
print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Commands
cmd_build() {
    print_header "Building Docker Image"
    
    print_info "Building ${PROJECT_NAME}:${IMAGE_TAG}..."
    docker build -t ${PROJECT_NAME}:${IMAGE_TAG} .
    
    print_success "Docker build completed"
    
    # Show image info
    SIZE=$(docker images ${PROJECT_NAME} --format "{{.Size}}")
    print_info "Image size: $SIZE"
}

cmd_test_local() {
    print_header "Testing Docker Image Locally"
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_error ".env.local not found"
        echo "Please create .env.local with Supabase credentials"
        exit 1
    fi
    
    # Source environment variables
    export $(cat .env.local | grep -v '^#' | xargs)
    
    print_info "Starting container on port $PORT..."
    docker run -d \
        --name ${CONTAINER_NAME}-test \
        -p ${PORT}:3000 \
        -e NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
        -e NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        ${PROJECT_NAME}:${IMAGE_TAG}
    
    # Wait for container to start
    sleep 3
    
    print_info "Testing health check..."
    HEALTH=$(curl -s http://localhost:${PORT}/api/health | grep -o "healthy" || echo "failed")
    
    if [ "$HEALTH" = "healthy" ]; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        docker logs ${CONTAINER_NAME}-test
        docker stop ${CONTAINER_NAME}-test
        docker rm ${CONTAINER_NAME}-test
        exit 1
    fi
    
    print_info "Testing homepage..."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/)
    if [ "$STATUS" = "200" ]; then
        print_success "Homepage loaded (HTTP 200)"
    else
        print_error "Homepage returned HTTP $STATUS"
    fi
    
    print_info "Stopping test container..."
    docker stop ${CONTAINER_NAME}-test
    docker rm ${CONTAINER_NAME}-test
    
    print_success "Local testing completed"
}

cmd_push() {
    print_header "Pushing Docker Image"
    
    if [ -z "$1" ]; then
        print_error "Registry URL required"
        echo "Usage: ./deploy-helper.sh push <registry>/<username>/${PROJECT_NAME}:${IMAGE_TAG}"
        exit 1
    fi
    
    REGISTRY="$1"
    
    print_info "Tagging image for registry: $REGISTRY"
    docker tag ${PROJECT_NAME}:${IMAGE_TAG} ${REGISTRY}
    
    print_info "Pushing to registry..."
    docker push ${REGISTRY}
    
    print_success "Image pushed to registry"
}

cmd_run() {
    print_header "Running Docker Container"
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_error ".env.local not found"
        exit 1
    fi
    
    # Source environment variables
    export $(cat .env.local | grep -v '^#' | xargs)
    
    # Check if container is already running
    if docker ps | grep -q ${CONTAINER_NAME}; then
        print_warning "Container already running. Stopping existing container..."
        docker stop ${CONTAINER_NAME}
    fi
    
    print_info "Starting container..."
    docker run -d \
        --restart always \
        --name ${CONTAINER_NAME} \
        -p ${PORT}:3000 \
        -e NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
        -e NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        ${PROJECT_NAME}:${IMAGE_TAG}
    
    sleep 2
    
    print_info "Checking container status..."
    if docker ps | grep -q ${CONTAINER_NAME}; then
        print_success "Container is running"
        docker ps | grep ${CONTAINER_NAME}
    else
        print_error "Container failed to start"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
    
    print_info "Testing health endpoint..."
    sleep 2
    curl -s http://localhost:${PORT}/api/health | jq . || echo "Failed to connect"
}

cmd_logs() {
    print_header "Container Logs"
    docker logs -f ${CONTAINER_NAME}
}

cmd_stop() {
    print_header "Stopping Container"
    
    if docker ps | grep -q ${CONTAINER_NAME}; then
        print_info "Stopping ${CONTAINER_NAME}..."
        docker stop ${CONTAINER_NAME}
        print_success "Container stopped"
    else
        print_warning "Container is not running"
    fi
}

cmd_verify() {
    print_header "Verifying Production Deployment"
    
    if [ -z "$1" ]; then
        print_error "Domain URL required"
        echo "Usage: ./deploy-helper.sh verify https://your-domain.com"
        exit 1
    fi
    
    DOMAIN="$1"
    
    print_info "Testing: $DOMAIN"
    
    # Test 1: Health check
    print_info "1. Testing health endpoint..."
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" ${DOMAIN}/api/health)
    if [ "$HEALTH" = "200" ]; then
        print_success "Health check: ${DOMAIN}/api/health (HTTP 200)"
    else
        print_error "Health check failed (HTTP $HEALTH)"
    fi
    
    # Test 2: Homepage
    print_info "2. Testing homepage..."
    HOME=$(curl -s -o /dev/null -w "%{http_code}" ${DOMAIN}/)
    if [ "$HOME" = "200" ]; then
        print_success "Homepage: ${DOMAIN}/ (HTTP 200)"
    else
        print_error "Homepage failed (HTTP $HOME)"
    fi
    
    # Test 3: Product page
    print_info "3. Testing product page..."
    PRODUCT=$(curl -s -o /dev/null -w "%{http_code}" ${DOMAIN}/product/p1)
    if [ "$PRODUCT" = "200" ]; then
        print_success "Product page: ${DOMAIN}/product/p1 (HTTP 200)"
    else
        print_error "Product page failed (HTTP $PRODUCT)"
    fi
    
    # Test 4: API endpoint
    print_info "4. Testing API endpoint..."
    API=$(curl -s -o /dev/null -w "%{http_code}" ${DOMAIN}/api/waitlist/count)
    if [ "$API" = "200" ]; then
        print_success "API endpoint: ${DOMAIN}/api/waitlist/count (HTTP 200)"
    else
        print_error "API endpoint failed (HTTP $API)"
    fi
    
    # Test 5: SSL certificate
    print_info "5. Checking SSL certificate..."
    CERT=$(curl -vI ${DOMAIN} 2>&1 | grep "CN=" || echo "")
    if [ ! -z "$CERT" ]; then
        print_success "SSL certificate valid"
    else
        print_warning "Could not verify SSL certificate"
    fi
    
    # Test 6: Page load time
    print_info "6. Measuring page load time..."
    LOAD_TIME=$(curl -o /dev/null -s -w "%{time_total}" ${DOMAIN}/)
    print_info "Homepage load time: ${LOAD_TIME}s"
    if (( $(echo "$LOAD_TIME < 3" | bc -l) )); then
        print_success "Load time is acceptable (< 3s)"
    else
        print_warning "Load time is slow (> 3s)"
    fi
    
    print_success "Verification completed"
}

cmd_test_e2e() {
    print_header "Running E2E Tests"
    
    if [ -z "$1" ]; then
        print_error "Domain URL required"
        echo "Usage: ./deploy-helper.sh test-e2e https://your-domain.com"
        exit 1
    fi
    
    DOMAIN="$1"
    
    print_info "Running E2E tests against: $DOMAIN"
    print_warning "Make sure you have pnpm installed and Playwright configured"
    
    PLAYWRIGHT_TEST_BASE_URL=${DOMAIN} pnpm test:e2e
}

cmd_help() {
    cat << 'EOF'

Art Frames - Deployment Helper Script

Usage: ./deploy-helper.sh [command] [options]

Commands:

  build                     Build Docker image
  
  test-local                Test Docker image locally
                           (requires .env.local)
  
  run                       Run Docker container locally
                           (requires .env.local)
  
  logs                      View container logs
  
  stop                      Stop running container
  
  push <registry>           Push image to Docker registry
                           Example: ./deploy-helper.sh push myrepo/art-frames:latest
  
  verify <url>              Verify production deployment
                           Example: ./deploy-helper.sh verify https://art-frames.com
  
  test-e2e <url>            Run E2E tests against production
                           Example: ./deploy-helper.sh test-e2e https://art-frames.com
  
  help                      Show this help message

Examples:

  # Build and test locally
  ./deploy-helper.sh build
  ./deploy-helper.sh test-local
  
  # Deploy to Docker Hub
  ./deploy-helper.sh build
  ./deploy-helper.sh push myusername/art-frames:latest
  
  # Run locally
  ./deploy-helper.sh run
  
  # Verify production
  ./deploy-helper.sh verify https://art-frames.com
  ./deploy-helper.sh test-e2e https://art-frames.com

Dependencies:
  - Docker
  - curl
  - pnpm (for E2E tests)

Configuration:
  - .env.local (for Supabase credentials)

EOF
}

# Main script
if [ $# -eq 0 ]; then
    cmd_help
    exit 0
fi

case "$1" in
    build)
        cmd_build
        ;;
    test-local)
        cmd_test_local
        ;;
    push)
        cmd_push "$2"
        ;;
    run)
        cmd_run
        ;;
    logs)
        cmd_logs
        ;;
    stop)
        cmd_stop
        ;;
    verify)
        cmd_verify "$2"
        ;;
    test-e2e)
        cmd_test_e2e "$2"
        ;;
    help)
        cmd_help
        ;;
    *)
        print_error "Unknown command: $1"
        cmd_help
        exit 1
        ;;
esac

exit 0
