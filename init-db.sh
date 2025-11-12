#!/bin/bash

# Initialize Apex Sandbox Database Schema
# This script runs all the SQL scripts in the correct order

echo "Initializing Apex Sandbox database schema..."

# Check if Docker container is running
if ! docker ps | grep -q apex-sandbox-db; then
    echo "Error: PostgreSQL container 'apex-sandbox-db' is not running."
    echo "Please start it first with: docker-compose up -d"
    exit 1
fi

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker exec apex-sandbox-db pg_isready -U apex_user -d apex_sandbox > /dev/null 2>&1; do
    sleep 1
done

echo "PostgreSQL is ready. Running SQL scripts..."

# Run SQL scripts in order
echo "Creating users table..."
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/users.sql

echo "Creating session table..."
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/session.sql

echo "Creating problem_categories table..."
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/problem_categories.sql

echo "Creating problems table..."
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/problems.sql

echo "Creating problem_attempts table..."
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/problem_attempts.sql

echo "Creating problem_user_success table..."
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/problem_user_success.sql

echo ""
echo "✓ Database schema initialized successfully!"
echo ""
echo "You can now start the application with:"
echo "  Backend:  node -r dotenv/config index.js"
echo "  Frontend: cd client && npm start"
