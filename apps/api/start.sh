#!/bin/bash
# Wrapper script to ensure correct working directory for NestJS API
# NestJS ConfigModule automatically loads .env files from the current working directory

# Change to API directory (NestJS ConfigModule looks for .env here)
cd /home/ubuntu/poultryco/apps/api

# Start the application
# NestJS ConfigModule.forRoot() will automatically load .env file
exec node dist/main.js

