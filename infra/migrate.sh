#!/bin/bash

echo "Running migrations..."

# Create a single file with all the migrations
cat backend/database/migrations/*.sql > backend/database/migrations/init-schema.sql

# Copy the file to the EC2 instance
scp -i ~/.ssh/auto-blog-key.pem backend/database/seeds/001_initial_data.sql ec2-user@13.60.75.58:/home/ec2-user/

# Run the migrations
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d autoblog < init-schema.sql

# Run the seeds as well
scp -i ~/.ssh/auto-blog-key.pem backend/database/seeds/001_initial_data.sql ec2-user@13.60.75.58:/home/ec2-user/
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d autoblog < init-seeds.sql