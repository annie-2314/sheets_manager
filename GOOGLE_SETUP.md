# Google Sheets Integration Setup Guide

This project now integrates with Google Sheets API to provide real Excel functionality with collaboration features.

## 🚀 Features

- **Real Google Sheets**: Create and edit actual Google Sheets
- **Collaboration**: Multiple people can edit the same sheet in real-time
- **Authentication**: Secure Google sign-in
- **Sharing**: Share sheets with specific people or make them public
- **Access Control**: Set different permission levels (reader, writer, owner)

## 🔧 Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API and Google Drive API

### Step 2: Configure OAuth 2.0

1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Set application type to "Web application"
4. Add your domain to "Authorized JavaScript origins"
5. Copy the Client ID

### Step 3: Get API Key

1. In Google Cloud Console, go to "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API Key

### Step 4: Update Configuration

Open `google-sheets-integration.js` and replace:

```javascript
// Replace these with your actual credentials
apiKey: 'YOUR_API_KEY', // Your Google API Key
clientId: 'YOUR_CLIENT_ID', // Your OAuth 2.0 Client ID
```

Also update in `index.html`:

```html
<!-- Replace with your actual Client ID -->
data-client_id="YOUR_GOOGLE_CLIENT_ID"
```

### Step 5: Test the Integration

1. Open `index.html` in your browser
2. Sign in with Google
3. Create a new Google Sheet
4. Share it with others for collaboration

## 📋 How to Use

### Creating Sheets
1. Click "New Google Sheet" button
2. Enter a title for your sheet
3. The sheet will be created in your Google Drive
4. It opens automatically in a new tab

### Loading Existing Sheets
1. Click "Load Google Sheet" button
2. Enter the Sheet ID from the URL
3. The sheet will be added to your list and opened

### Sharing Sheets
1. Click the share icon next to any sheet
2. Enter email addresses
3. Set permission levels (reader, writer, owner)
4. Send the link to collaborators

### Real-time Collaboration
- Multiple people can edit the same sheet simultaneously
- Changes appear in real-time for all users
- Google handles all the synchronization
- Works exactly like Google Sheets

## 🔒 Security Features

- **OAuth 2.0 Authentication**: Secure Google sign-in
- **Permission Control**: Set who can view/edit sheets
- **API Key Protection**: Keep your API keys secure
- **HTTPS Required**: Works only on secure connections

## 🌐 Deployment

For production use:

1. **Use HTTPS**: Google APIs require secure connections
2. **Domain Verification**: Add your domain to Google Console
3. **API Quotas**: Monitor your API usage
4. **Error Handling**: Implement proper error handling

## 📱 Mobile Support

- Works on mobile devices
- Google Sheets mobile app integration
- Responsive design for all screen sizes

## 🆘 Troubleshooting

### Common Issues:

1. **"Please sign in with Google first"**
   - Make sure you're signed in to Google
   - Check if pop-ups are blocked

2. **"Error creating Google Sheet"**
   - Verify your API keys are correct
   - Check if Google Sheets API is enabled

3. **"Error loading Google Sheet"**
   - Verify the Sheet ID is correct
   - Make sure you have access to the sheet

### Debug Mode:

Open browser console (F12) to see detailed error messages and debug information.

## 🔄 Updates

To update the integration:

1. Keep your API keys current
2. Monitor Google API changes
3. Update the integration code as needed

## 📞 Support

For issues with Google Sheets API:
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com/)

For issues with this integration:
- Check the browser console for errors
- Verify your API configuration
- Test with a simple sheet first
