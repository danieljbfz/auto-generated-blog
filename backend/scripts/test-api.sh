#!/bin/bash

# =============================================================================
# API Testing Script
# =============================================================================
# Tests all major endpoints of the Auto-Generated Blog API
# Usage: ./scripts/test-api.sh [base_url]
# Example: ./scripts/test-api.sh http://localhost:3001
# =============================================================================

# Configuration
BASE_URL="${1:-http://127.0.0.1:3001}"
API_URL="$BASE_URL/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_header() {
    echo -e "\n${BLUE}===============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "\n${YELLOW}Testing:${NC} $description"
    echo -e "${YELLOW}Method:${NC} $method"
    echo -e "${YELLOW}Endpoint:${NC} $endpoint"
    
    if [ -n "$data" ]; then
        echo -e "${YELLOW}Data:${NC} $data"
        response=$(curl -s -X "$method" "$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\n%{http_code}")
    else
        response=$(curl -s -X "$method" "$endpoint" \
            -w "\n%{http_code}")
    fi
    
    # Extract status code (last line) and body (everything else)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Pretty print JSON if jq is available
    if command -v jq &> /dev/null; then
        echo -e "${YELLOW}Response:${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${YELLOW}Response:${NC} $body"
    fi
    
    echo -e "${YELLOW}Status:${NC} $http_code"
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        print_success "Test passed"
    else
        print_error "Test failed"
    fi
}

# =============================================================================
# START TESTS
# =============================================================================

print_header "API Testing Suite for $BASE_URL"
print_info "Make sure the server is running!"
sleep 1

# -----------------------------------------------------------------------------
print_header "1. Health Checks"
# -----------------------------------------------------------------------------

test_endpoint "GET" "$BASE_URL/health" \
    "Root health check"

test_endpoint "GET" "$API_URL/health" \
    "API health check"

test_endpoint "GET" "$API_URL/health/detailed" \
    "Detailed health check with component status"

test_endpoint "GET" "$API_URL/health/ready" \
    "Readiness probe (Kubernetes-style)"

test_endpoint "GET" "$API_URL/health/live" \
    "Liveness probe (Kubernetes-style)"

# -----------------------------------------------------------------------------
print_header "2. API Root"
# -----------------------------------------------------------------------------

test_endpoint "GET" "$API_URL" \
    "API root with endpoint listing"

# -----------------------------------------------------------------------------
print_header "3. Articles"
# -----------------------------------------------------------------------------

test_endpoint "GET" "$API_URL/articles/feed" \
    "Get published articles feed"

test_endpoint "GET" "$API_URL/articles?status=published&limit=5" \
    "List articles with filters"

test_endpoint "GET" "$API_URL/articles?page=1&limit=10&sortBy=createdAt&sortOrder=desc" \
    "List articles with pagination and sorting"

# Note: These will only work if you have articles in the database
print_info "The following tests require existing data in the database"

# Uncomment and modify these once you have data:
# test_endpoint "GET" "$API_URL/articles/by-slug/your-article-slug" \
#     "Get article by slug"

# test_endpoint "GET" "$API_URL/articles/YOUR_ARTICLE_ID_HERE" \
#     "Get article by ID"

# -----------------------------------------------------------------------------
print_header "4. Categories"
# -----------------------------------------------------------------------------

test_endpoint "GET" "$API_URL/categories" \
    "List all categories (flat)"

test_endpoint "GET" "$API_URL/categories/tree" \
    "Get category tree (hierarchical)"

test_endpoint "GET" "$API_URL/categories/roots" \
    "Get root categories"

# Uncomment once you have categories:
# test_endpoint "GET" "$API_URL/categories/YOUR_CATEGORY_ID_HERE" \
#     "Get category by ID"

# test_endpoint "GET" "$API_URL/categories/YOUR_CATEGORY_ID_HERE/children" \
#     "Get children of category"

# -----------------------------------------------------------------------------
print_header "5. Authors"
# -----------------------------------------------------------------------------

test_endpoint "GET" "$API_URL/authors" \
    "List all active authors"

# Uncomment once you have authors:
# test_endpoint "GET" "$API_URL/authors/YOUR_AUTHOR_ID_HERE" \
#     "Get author by ID"

# test_endpoint "GET" "$API_URL/authors/by-slug/your-author-slug" \
#     "Get author by slug"

# -----------------------------------------------------------------------------
print_header "6. Tags"
# -----------------------------------------------------------------------------

test_endpoint "GET" "$API_URL/tags" \
    "List all tags"

test_endpoint "GET" "$API_URL/tags/popular?limit=10" \
    "Get popular tags"

# Uncomment once you have tags:
# test_endpoint "GET" "$API_URL/tags/YOUR_TAG_ID_HERE" \
#     "Get tag by ID"

# test_endpoint "GET" "$API_URL/tags/by-slug/your-tag-slug" \
#     "Get tag by slug"

# -----------------------------------------------------------------------------
print_header "7. AI Article Generation (Advanced)"
# -----------------------------------------------------------------------------

print_info "Triggering AI article generation..."
print_info "This may take 10-30 seconds depending on the AI service"

test_endpoint "POST" "$API_URL/articles/generate" \
    "Generate and publish AI article"

# -----------------------------------------------------------------------------
print_header "8. Create Operations (Examples)"
# -----------------------------------------------------------------------------

print_info "The following are examples of create operations"
print_info "Uncomment and modify to test with real data"

# Example: Create Author
# test_endpoint "POST" "$API_URL/authors" \
#     "Create new author" \
#     '{
#       "name": "Test Author",
#       "type": "human",
#       "bio": "A test author for API testing"
#     }'

# Example: Create Category
# test_endpoint "POST" "$API_URL/categories" \
#     "Create new category" \
#     '{
#       "name": "Test Category",
#       "description": "A test category"
#     }'

# Example: Create Tag
# test_endpoint "POST" "$API_URL/tags" \
#     "Create new tag" \
#     '{
#       "name": "Test Tag"
#     }'

# Example: Create Article (requires valid authorId and categoryId)
# test_endpoint "POST" "$API_URL/articles" \
#     "Create new article" \
#     '{
#       "authorId": "YOUR_AUTHOR_ID_HERE",
#       "categoryId": "YOUR_CATEGORY_ID_HERE",
#       "title": "Test Article Title",
#       "body": "This is a test article body with at least 100 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
#       "excerpt": "This is a test excerpt with at least 50 characters for validation.",
#       "status": "draft",
#       "tags": ["test", "api"]
#     }'

# -----------------------------------------------------------------------------
print_header "9. Error Handling Tests"
# -----------------------------------------------------------------------------

print_info "Testing error responses"

test_endpoint "GET" "$API_URL/articles/invalid-uuid" \
    "Test invalid UUID (should return 400)"

test_endpoint "GET" "$API_URL/articles/00000000-0000-0000-0000-000000000000" \
    "Test non-existent article (should return 404)"

test_endpoint "GET" "$API_URL/nonexistent-endpoint" \
    "Test non-existent endpoint (should return 404)"

# -----------------------------------------------------------------------------
print_header "Test Suite Complete"
# -----------------------------------------------------------------------------

print_success "All tests executed!"
print_info "Check the output above for any failures"
print_info ""
print_info "To test write operations, uncomment the examples in section 8"
print_info "and replace placeholder IDs with real data from your database"