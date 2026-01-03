#!/usr/bin/env python3
"""
Rizz Academy Backend API Testing Script
Tests all backend APIs including authentication, quiz, progress, foundation, and combat endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://rizz-mobile.preview.emergentagent.com/api"
SESSION_TOKEN = "test_session_1767421541595"  # From mongosh setup

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}=== Testing {test_name} ==={Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def make_request(method, endpoint, headers=None, data=None, expected_status=200):
    """Make HTTP request and return response"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print_info(f"{method.upper()} {endpoint} -> Status: {response.status_code}")
        
        if response.status_code != expected_status:
            print_error(f"Expected status {expected_status}, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
        
        return response
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {e}")
        return None

def test_health_check():
    """Test basic health endpoints"""
    print_test_header("Health Check")
    
    # Test root endpoint
    response = make_request("GET", "/")
    if response:
        data = response.json()
        if data.get("message") == "Rizz Academy API":
            print_success("Root endpoint working")
        else:
            print_error(f"Unexpected root response: {data}")
    
    # Test health endpoint
    response = make_request("GET", "/health")
    if response:
        data = response.json()
        if data.get("status") == "healthy":
            print_success("Health endpoint working")
        else:
            print_error(f"Unexpected health response: {data}")

def test_quiz_questions():
    """Test GET /api/quiz/questions"""
    print_test_header("Quiz Questions API")
    
    response = make_request("GET", "/quiz/questions")
    if response:
        data = response.json()
        questions = data.get("questions", [])
        
        if len(questions) == 10:
            print_success(f"Retrieved {len(questions)} quiz questions")
            
            # Validate question structure
            first_question = questions[0]
            required_fields = ["id", "question", "options"]
            
            if all(field in first_question for field in required_fields):
                print_success("Question structure is valid")
                
                # Check options structure
                options = first_question.get("options", [])
                if len(options) == 4:
                    print_success("Question has 4 options")
                    
                    option = options[0]
                    if "value" in option and "text" in option:
                        print_success("Option structure is valid")
                    else:
                        print_error("Option missing required fields")
                else:
                    print_error(f"Expected 4 options, got {len(options)}")
            else:
                print_error("Question missing required fields")
        else:
            print_error(f"Expected 10 questions, got {len(questions)}")

def test_foundation_prompts():
    """Test GET /api/foundation/prompts"""
    print_test_header("Foundation Prompts API")
    
    response = make_request("GET", "/foundation/prompts")
    if response:
        data = response.json()
        
        expected_types = ["journal", "affirmation", "reflection"]
        
        for prompt_type in expected_types:
            if prompt_type in data:
                prompts = data[prompt_type]
                if isinstance(prompts, list) and len(prompts) > 0:
                    print_success(f"{prompt_type} prompts available ({len(prompts)} items)")
                else:
                    print_error(f"{prompt_type} prompts missing or empty")
            else:
                print_error(f"Missing {prompt_type} prompts")

def test_combat_scenarios():
    """Test GET /api/combat/scenarios"""
    print_test_header("Combat Scenarios API")
    
    response = make_request("GET", "/combat/scenarios")
    if response:
        data = response.json()
        scenarios = data.get("scenarios", [])
        
        if len(scenarios) > 0:
            print_success(f"Retrieved {len(scenarios)} scenarios")
            
            # Validate scenario structure
            scenario = scenarios[0]
            required_fields = ["id", "name", "description"]
            
            if all(field in scenario for field in required_fields):
                print_success("Scenario structure is valid")
            else:
                print_error("Scenario missing required fields")
        else:
            print_error("No scenarios returned")

def test_authenticated_endpoints():
    """Test endpoints that require authentication"""
    print_test_header("Authenticated Endpoints")
    
    headers = {
        "Authorization": f"Bearer {SESSION_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Test GET /api/auth/me
    print_info("Testing GET /api/auth/me")
    response = make_request("GET", "/auth/me", headers=headers)
    if response:
        user_data = response.json()
        if "user_id" in user_data and "email" in user_data:
            print_success("Auth me endpoint working")
            user_id = user_data["user_id"]
        else:
            print_error("Auth me response missing required fields")
            return False
    else:
        print_error("Auth me endpoint failed")
        return False
    
    # Test GET /api/user/progress
    print_info("Testing GET /api/user/progress")
    response = make_request("GET", "/user/progress", headers=headers)
    if response:
        progress_data = response.json()
        required_fields = ["user_id", "xp", "level", "streak_days"]
        
        if all(field in progress_data for field in required_fields):
            print_success("User progress endpoint working")
            print_info(f"User XP: {progress_data.get('xp')}, Level: {progress_data.get('level')}")
        else:
            print_error("Progress response missing required fields")
    else:
        print_error("User progress endpoint failed")
    
    # Test POST /api/quiz/submit
    print_info("Testing POST /api/quiz/submit")
    quiz_answers = {
        "answers": [
            {"question_id": 1, "answer": "A"},
            {"question_id": 2, "answer": "B"},
            {"question_id": 3, "answer": "C"},
            {"question_id": 4, "answer": "D"},
            {"question_id": 5, "answer": "A"},
            {"question_id": 6, "answer": "B"},
            {"question_id": 7, "answer": "C"},
            {"question_id": 8, "answer": "D"},
            {"question_id": 9, "answer": "A"},
            {"question_id": 10, "answer": "B"}
        ]
    }
    
    response = make_request("POST", "/quiz/submit", headers=headers, data=quiz_answers)
    if response:
        quiz_result = response.json()
        required_fields = ["user_id", "archetype", "archetype_title", "strengths"]
        
        if all(field in quiz_result for field in required_fields):
            print_success("Quiz submit endpoint working")
            print_info(f"Archetype: {quiz_result.get('archetype_title')}")
        else:
            print_error("Quiz result missing required fields")
    else:
        print_error("Quiz submit endpoint failed")
    
    # Test GET /api/foundation/entries
    print_info("Testing GET /api/foundation/entries")
    response = make_request("GET", "/foundation/entries", headers=headers)
    if response:
        entries_data = response.json()
        if "entries" in entries_data:
            print_success("Foundation entries GET endpoint working")
            print_info(f"Found {len(entries_data['entries'])} entries")
        else:
            print_error("Foundation entries response missing 'entries' field")
    else:
        print_error("Foundation entries GET endpoint failed")
    
    # Test POST /api/foundation/entries
    print_info("Testing POST /api/foundation/entries")
    journal_entry = {
        "entry_type": "journal",
        "content": "This is a test journal entry for API testing.",
        "mood": "confident"
    }
    
    response = make_request("POST", "/foundation/entries", headers=headers, data=journal_entry)
    if response:
        entry_result = response.json()
        required_fields = ["entry_id", "user_id", "content", "entry_type"]
        
        if all(field in entry_result for field in required_fields):
            print_success("Foundation entries POST endpoint working")
        else:
            print_error("Foundation entry result missing required fields")
    else:
        print_error("Foundation entries POST endpoint failed")
    
    # Test POST /api/combat/chat
    print_info("Testing POST /api/combat/chat")
    chat_request = {
        "message": "Hi there, how are you doing today?",
        "scenario": "coffee_shop"
    }
    
    response = make_request("POST", "/combat/chat", headers=headers, data=chat_request)
    if response:
        chat_result = response.json()
        required_fields = ["response", "session_id"]
        
        if all(field in chat_result for field in required_fields):
            print_success("Combat chat endpoint working")
            print_info(f"AI Response: {chat_result.get('response')[:100]}...")
            if chat_result.get('feedback'):
                print_info(f"Feedback: {chat_result.get('feedback')[:100]}...")
        else:
            print_error("Combat chat result missing required fields")
    else:
        print_error("Combat chat endpoint failed")

def test_unauthenticated_access():
    """Test that protected endpoints properly reject unauthenticated requests"""
    print_test_header("Authentication Protection")
    
    protected_endpoints = [
        ("GET", "/auth/me"),
        ("GET", "/user/progress"),
        ("POST", "/quiz/submit"),
        ("GET", "/foundation/entries"),
        ("POST", "/foundation/entries"),
        ("POST", "/combat/chat")
    ]
    
    for method, endpoint in protected_endpoints:
        print_info(f"Testing {method} {endpoint} without auth")
        
        # Make request without auth headers, expecting 401
        url = f"{BASE_URL}{endpoint}"
        try:
            if method.upper() == "GET":
                response = requests.get(url, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json={}, timeout=30)
            
            if response.status_code == 401:
                print_success(f"{endpoint} properly protected")
            else:
                print_error(f"{endpoint} should return 401, got {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print_error(f"Request failed: {e}")

def main():
    """Run all tests"""
    print(f"{Colors.BOLD}🧪 Rizz Academy Backend API Test Suite{Colors.ENDC}")
    print(f"Testing against: {BASE_URL}")
    print(f"Session token: {SESSION_TOKEN}")
    
    # Run all tests
    test_health_check()
    test_quiz_questions()
    test_foundation_prompts()
    test_combat_scenarios()
    test_authenticated_endpoints()
    test_unauthenticated_access()
    
    print(f"\n{Colors.BOLD}🏁 Testing Complete{Colors.ENDC}")

if __name__ == "__main__":
    main()