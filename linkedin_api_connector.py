import os
import random
import requests
import webbrowser
from urllib.parse import urlencode
from dotenv import load_dotenv
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import time

# Load environment variables from .env file
load_dotenv('server/.env')

# LinkedIn API credentials
LINKEDIN_CLIENT_ID = os.getenv('LINKEDIN_CLIENT_ID')
LINKEDIN_CLIENT_SECRET = os.getenv('LINKEDIN_CLIENT_SECRET')
LINKEDIN_REDIRECT_URI = os.getenv('LINKEDIN_REDIRECT_URI')

# LinkedIn API endpoints
LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2'
LINKEDIN_API_URL = 'https://api.linkedin.com/v2'

# Sample text for test post
SAMPLE_POSTS = [
    "Excited to share my latest project on LinkedIn automation!",
    "Just testing my new LinkedIn integration tool. Ignore this post!",
    "Automation makes social media management so much easier. Testing my new tool!",
    "Working on a new LinkedIn posting automation tool. This is a test post.",
    "Testing, testing, 1-2-3! This is an automated post from my Python script."
]

# Global variable to store the authorization code
auth_code = None

# Custom HTTP request handler to capture the authorization code
class LinkedInCallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global auth_code
        
        # Parse query parameters
        import urllib.parse
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        
        # Get authorization code
        if 'code' in params:
            auth_code = params['code'][0]
            
            # Send response to browser
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<html><head><title>LinkedIn Authorization</title></head>")
            self.wfile.write(b"<body><h1>Authorization Successful!</h1>")
            self.wfile.write(b"<p>You can now close this window and return to the application.</p>")
            self.wfile.write(b"</body></html>")
        else:
            # Send error response
            self.send_response(400)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<html><head><title>LinkedIn Authorization</title></head>")
            self.wfile.write(b"<body><h1>Authorization Failed!</h1>")
            self.wfile.write(b"<p>Failed to get authorization code from LinkedIn.</p>")
            self.wfile.write(b"</body></html>")

class LinkedInAPI:
    def __init__(self):
        self.access_token = None
        self.user_id = None
    
    def get_authorization_url(self):
        """Generate LinkedIn authorization URL"""
        params = {
            'response_type': 'code',
            'client_id': LINKEDIN_CLIENT_ID,
            'redirect_uri': LINKEDIN_REDIRECT_URI,
            'scope': 'r_liteprofile r_emailaddress w_member_social',
            'state': str(random.randint(10000, 99999))
        }
        return f"{LINKEDIN_AUTH_URL}/authorization?{urlencode(params)}"
    
    def get_access_token(self, code):
        """Exchange authorization code for access token"""
        try:
            response = requests.post(
                f"{LINKEDIN_AUTH_URL}/accessToken",
                params={
                    'grant_type': 'authorization_code',
                    'code': code,
                    'client_id': LINKEDIN_CLIENT_ID,
                    'client_secret': LINKEDIN_CLIENT_SECRET,
                    'redirect_uri': LINKEDIN_REDIRECT_URI
                },
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            )
            
            if response.status_code != 200:
                print(f"Error getting access token: {response.text}")
                return False
                
            data = response.json()
            self.access_token = data['access_token']
            print(f"Access token obtained successfully!")
            print(f"Token expires in: {data['expires_in']} seconds")
            return True
        except Exception as e:
            print(f"Error getting access token: {str(e)}")
            return False
    
    def get_user_profile(self):
        """Get user profile information"""
        try:
            # Get basic profile information
            profile_response = requests.get(
                f"{LINKEDIN_API_URL}/me",
                headers={
                    'Authorization': f"Bearer {self.access_token}"
                }
            )
            
            if profile_response.status_code != 200:
                print(f"Error getting profile: {profile_response.text}")
                return False
            
            profile = profile_response.json()
            self.user_id = profile['id']
            
            # Get email address
            email_response = requests.get(
                f"{LINKEDIN_API_URL}/emailAddress?q=members&projection=(elements*(handle~))",
                headers={
                    'Authorization': f"Bearer {self.access_token}"
                }
            )
            
            if email_response.status_code != 200:
                print(f"Error getting email: {email_response.text}")
            else:
                email_data = email_response.json()
                email = email_data['elements'][0]['handle~']['emailAddress']
                print(f"\nProfile Information:")
                print(f"ID: {profile['id']}")
                print(f"First Name: {profile['localizedFirstName']}")
                print(f"Last Name: {profile['localizedLastName']}")
                print(f"Email: {email}")
            
            return True
        except Exception as e:
            print(f"Error getting profile: {str(e)}")
            return False
    
    def create_post(self, content):
        """Create a post on LinkedIn"""
        try:
            # Create post data
            post_data = {
                "author": f"urn:li:person:{self.user_id}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": content
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            # Send post request
            response = requests.post(
                f"{LINKEDIN_API_URL}/ugcPosts",
                json=post_data,
                headers={
                    'Authorization': f"Bearer {self.access_token}",
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            )
            
            if response.status_code == 201:
                print(f"\nPost created successfully!")
                print(f"Post ID: {response.headers.get('x-restli-id')}")
                return True
            else:
                print(f"\nError creating post: {response.status_code}")
                print(response.text)
                return False
        except Exception as e:
            print(f"Error creating post: {str(e)}")
            return False

def main():
    # Create LinkedIn API instance
    linkedin = LinkedInAPI()
    
    # Get authorization URL
    auth_url = linkedin.get_authorization_url()
    print(f"\nPlease authorize the application by visiting this URL:")
    print(auth_url)
    
    # Open browser for authorization
    webbrowser.open(auth_url)
    
    # Start local server to handle callback
    server_address = ('localhost', 3000)
    httpd = HTTPServer(server_address, LinkedInCallbackHandler)
    print(f"\nWaiting for authorization...")
    
    # Run server until authorization code is received
    while auth_code is None:
        httpd.handle_request()
    
    # Stop server
    httpd.server_close()
    
    print(f"\nAuthorization code received!")
    
    # Exchange authorization code for access token
    if not linkedin.get_access_token(auth_code):
        print("Failed to get access token. Exiting...")
        return
    
    # Get user profile
    if not linkedin.get_user_profile():
        print("Failed to get user profile. Exiting...")
        return
    
    # Create a test post
    test_post = random.choice(SAMPLE_POSTS)
    print(f"\nCreating test post with content:\n\"{test_post}\"")
    
    if linkedin.create_post(test_post):
        print("\nLinkedIn API connection test completed successfully!")
    else:
        print("\nFailed to create test post.")

if __name__ == "__main__":
    main()