#!/bin/bash

# Test script for Event Management System MySQL Backend
# This script tests all API endpoints

API_URL="http://localhost:5000/api"

echo "========================================="
echo "Event Management System - API Tests"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "Test 1: Health Check"
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/health)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Server is running"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ FAIL${NC} - Server not responding"
fi
echo ""

# Test 2: Register User
echo "Test 2: Register User (Organizer)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Organizer",
    "email": "test.organizer@demo.com",
    "password": "demo123",
    "role": "organizer"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Registration endpoint working"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ FAIL${NC} - Registration failed"
fi
echo ""

# Test 3: Login User
echo "Test 3: Login User"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.organizer@demo.com",
    "password": "demo123"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Login successful"
    echo "Response: $BODY"
    USER_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
else
    echo -e "${RED}✗ FAIL${NC} - Login failed"
fi
echo ""

# Test 4: Get All Events
echo "Test 4: Get All Events"
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/events)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Events endpoint working"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ FAIL${NC} - Events fetch failed"
fi
echo ""

# Test 5: Create Event
echo "Test 5: Create Event"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/events \
  -H "Content-Type: application/json" \
  -d '{
    "organizer_id": 1,
    "title": "API Test Event",
    "description": "Testing event creation via API",
    "date": "2026-12-31",
    "time": "10:00 AM",
    "location": "Test Location",
    "capacity": 100,
    "category": "Technology"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Event created successfully"
    echo "Response: $BODY"
    EVENT_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
else
    echo -e "${RED}✗ FAIL${NC} - Event creation failed"
fi
echo ""

# Test 6: Register Attendee
echo "Test 6: Register Attendee"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Attendee",
    "email": "test.attendee@demo.com",
    "password": "demo123",
    "role": "attendee"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Attendee registration working"
else
    echo -e "${RED}✗ FAIL${NC} - Attendee registration failed"
fi
echo ""

# Test 7: Submit Feedback
echo "Test 7: Submit Feedback"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "user_id": 1,
    "rating": 5,
    "comment": "Great event! API test feedback."
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Feedback submission working"
else
    echo -e "${RED}✗ FAIL${NC} - Feedback submission failed"
fi
echo ""

# Test 8: Get Analytics
echo "Test 8: Get Event Analytics"
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/analytics/event/1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Analytics endpoint working"
else
    echo -e "${RED}✗ FAIL${NC} - Analytics fetch failed"
fi
echo ""

echo "========================================="
echo "Test Summary"
echo "========================================="
echo "All critical endpoints tested!"
echo ""
echo "Next steps:"
echo "1. Check MySQL database for test data"
echo "2. Open http://localhost:5000 in browser"
echo "3. Test frontend integration"
echo ""
