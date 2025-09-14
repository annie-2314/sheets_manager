# Google Sheets Only Project Manager - Setup Guide

This is a **Google Sheets-only** project management tool. It provides direct access to Google Sheets with email-based collaboration - no local tables or Excel files.

## 🎯 Features

- **Google Sheets Only**: Direct access to real Google Sheets
- **Email-based Access**: Share sheets with specific email addresses
- **Real-time Collaboration**: Multiple users can edit simultaneously
- **Google Authentication**: Secure sign-in with Google accounts
- **Sheet Management**: Create, load, and manage Google Sheets
- **Embedded Editor**: Edit sheets directly in the app
- **Permission Control**: Set reader, writer, or owner permissions

## 🔧 Setup Instructions

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Google Sheets API
   - Google Drive API

### Step 2: Create OAuth 2.0 Credentials

1. Go to "Credentials" in Google Cloud Console
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Set application type to "Web application"
4. Add authorized origins:
   - `http://localhost` (for testing)
   - `https://yourdomain.com` (for production)
5. Copy the Client ID and Client Secret

### Step 3: Update Configuration

Open `google-sheets-manager.js` and replace:

```javascript
// Replace these with your actual credentials
apiKey: 'YOUR_API_KEY', // Your Google API Key
clientId: 'YOUR_CLIENT_ID', // Your OAuth 2.0 Client ID
clientSecret: 'YOUR_CLIENT_SECRET', // Your OAuth 2.0 Client Secret
```

### Step 4: Configure OAuth Consent Screen

1. Go to "OAuth consent screen" in Google Cloud Console
2. Choose "External" user type
3. Fill in required information:
   - App name: "Project Management Tool"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive`
5. Add test users (emails that can access the app)

### Step 5: Test the Application

1. Open `google-sheets-only.html` in your browser
2. Sign in with Google
3. Create a new sheet
4. Share it with team members

## 📋 How to Use

### 1. Sign In
- Click "Sign in with Google"
- Authorize the app to access your Google Sheets
- Your sheets will be loaded automatically

### 2. Create New Sheet
- Click "New Sheet" button
- Enter a title for your sheet
- The sheet will be created in your Google Drive
- You can edit it directly in the app

### 3. Load Existing Sheet
- Click "Load Sheet" button
- Enter the Google Sheet ID or URL
- The sheet will be added to your list

### 4. Share Sheets
- Click "Share" on any sheet
- Enter email addresses
- Set permission levels:
  - **Reader**: Can only view
  - **Writer**: Can edit
  - **Owner**: Full control
- Add optional message

### 5. Edit Sheets
- Click "Edit" on any sheet
- The sheet opens in an embedded editor
- All changes are saved to Google Sheets
- Multiple people can edit simultaneously

## 🔒 Security & Permissions

### Email-based Access Control
- Only people with Google accounts can access
- You control who can view/edit each sheet
- Permission levels: Reader, Writer, Owner
- Real-time collaboration through Google

### Google Authentication
- Secure OAuth 2.0 authentication
- No passwords stored locally
- Google handles all security

## 🌐 Deployment

### For Production:

1. **Use HTTPS**: Google APIs require secure connections
2. **Domain Verification**: Add your domain to Google Console
3. **Update Origins**: Add your production domain to OAuth settings
4. **Monitor Quotas**: Watch your API usage

### Environment Variables:
```javascript
// For production, use environment variables
const API_KEY = process.env.GOOGLE_API_KEY;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
```

## 📱 Mobile Support

- Works on mobile devices
- Responsive design
- Google Sheets mobile app integration
- Touch-friendly interface

## 🆘 Troubleshooting

### Common Issues:

1. **"Sign-in failed"**
   - Check your OAuth configuration
   - Verify client ID and secret
   - Ensure OAuth consent screen is configured

2. **"Failed to load sheets"**
   - Check if Google Sheets API is enabled
   - Verify API key is correct
   - Check browser console for errors

3. **"Failed to create sheet"**
   - Verify Google Drive API is enabled
   - Check user permissions
   - Ensure proper scopes are granted

### Debug Mode:
- Open browser console (F12)
- Check for error messages
- Verify API responses

## 🔄 API Limits

- **Google Sheets API**: 100 requests per 100 seconds per user
- **Google Drive API**: 1,000 requests per 100 seconds per user
- **File Size**: Up to 10 million cells per spreadsheet

## 📞 Support

### Google API Issues:
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Google Cloud Console](https://console.cloud.google.com/)

### App Issues:
- Check browser console for errors
- Verify your API configuration
- Test with a simple sheet first

## 🚀 Advanced Features

### Custom Scopes:
```javascript
// Add more scopes if needed
scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file'
```

### Error Handling:
```javascript
// Add custom error handling
try {
    await gapi.client.sheets.spreadsheets.create(...);
} catch (error) {
    console.error('Custom error handling:', error);
    // Handle specific errors
}
```

This setup gives you a **pure Google Sheets** project management tool with real-time collaboration and email-based access control!
