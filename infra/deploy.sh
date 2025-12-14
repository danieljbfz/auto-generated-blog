#!/bin/bash
set -e

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="406005162296"
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI

echo "Pulling latest images..."
docker pull ${ECR_URI}/auto-blog-backend:latest
docker pull ${ECR_URI}/auto-blog-frontend:latest

echo "Stopping old containers..."
docker-compose -f /home/ec2-user/docker-compose.prod.yml down || true

echo "Starting new containers..."
docker-compose -f /home/ec2-user/docker-compose.prod.yml up -d

echo "Deployment complete!"
docker-compose -f /home/ec2-user/docker-compose.prod.yml ps