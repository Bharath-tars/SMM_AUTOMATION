# LinkedIn API Connector

This Python script connects to the LinkedIn API, authenticates using OAuth 2.0, and posts a test message to your LinkedIn profile.

## Features

- OAuth 2.0 authentication with LinkedIn
- Profile information retrieval
- Posting text updates to LinkedIn
- Local callback server to handle the OAuth flow

## Prerequisites

- Python 3.6 or higher
- LinkedIn Developer account with an application set up
- Client ID and Client Secret from LinkedIn Developer Portal

## Installation

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Make sure your LinkedIn API credentials are correctly set in the `server/.env` file:

```
LINKEDIN_CLIENT_ID="your_client_id"
LINKEDIN_CLIENT_SECRET="your_client_secret"
LINKEDIN_REDIRECT_URI="http://localhost:3000/auth/linkedin/callback"
```

## Usage

Run the script with Python:

```bash
python linkedin_api_connector.py
```

The script will:

1. Open your default web browser to the LinkedIn authorization page
2. Start a local server to receive the callback with the authorization code
3. Exchange the authorization code for an access token
4. Retrieve your LinkedIn profile information
5. Post a random test message to your LinkedIn profile

## How It Works

1. **Authentication Flow**:
   - The script generates an authorization URL with your client ID and required scopes
   - After you authorize the app, LinkedIn redirects to your callback URL with an authorization code
   - The script exchanges this code for an access token

2. **Profile Retrieval**:
   - Uses the `/me` endpoint to get basic profile information
   - Uses the `/emailAddress` endpoint to get your email address

3. **Posting**:
   - Creates a post using the `/ugcPosts` endpoint
   - Uses your user ID and access token for authentication

## Troubleshooting

- If you encounter an error about invalid redirect URI, make sure the redirect URI in your LinkedIn application settings matches exactly with the one in your `.env` file.
- If you get authentication errors, check that your client ID and client secret are correct.
- For posting errors, ensure your application has the `w_member_social` permission scope.

## Extending the Script

You can modify this script to:

- Add image or video sharing capabilities
- Schedule posts for later publication
- Implement analytics tracking
- Add more sophisticated error handling and retries