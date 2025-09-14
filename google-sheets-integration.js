// Google Sheets Integration for Project Management Tool

class GoogleSheetsManager {
    constructor() {
        this.isSignedIn = false;
        this.currentUser = null;
        this.currentSheet = null;
        this.sheets = [];
        this.init();
    }

    init() {
        this.loadGoogleAPI();
        this.bindEvents();
    }

    async loadGoogleAPI() {
        try {
            await new Promise((resolve) => {
                gapi.load('client', resolve);
            });
            
            await gapi.client.init({
                apiKey: 'YOUR_API_KEY', // Replace with your API key
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                clientId: 'YOUR_CLIENT_ID', // Replace with your client ID
                scope: 'https://www.googleapis.com/auth/spreadsheets'
            });
            
            console.log('Google API loaded successfully');
        } catch (error) {
            console.error('Error loading Google API:', error);
        }
    }

    // Authentication
    handleCredentialResponse(response) {
        console.log('Credential response:', response);
        this.isSignedIn = true;
        this.currentUser = response.credential;
        this.updateUI();
        this.loadUserSheets();
    }

    signOut() {
        google.accounts.id.disableAutoSelect();
        this.isSignedIn = false;
        this.currentUser = null;
        this.sheets = [];
        this.updateUI();
    }

    updateUI() {
        const authSection = document.getElementById('authSection');
        const sheetActions = document.getElementById('sheetActions');
        const welcomeScreen = document.getElementById('welcomeScreen');
        
        if (this.isSignedIn) {
            authSection.style.display = 'none';
            sheetActions.style.display = 'block';
            welcomeScreen.style.display = 'flex';
        } else {
            authSection.style.display = 'block';
            sheetActions.style.display = 'none';
        }
    }

    // Google Sheets Operations
    async createGoogleSheet(title = 'Project Management Sheet') {
        if (!this.isSignedIn) {
            alert('Please sign in with Google first');
            return;
        }

        try {
            const response = await gapi.client.sheets.spreadsheets.create({
                resource: {
                    properties: {
                        title: title
                    },
                    sheets: [{
                        properties: {
                            title: 'Sheet1'
                        }
                    }]
                }
            });

            const spreadsheetId = response.result.spreadsheetId;
            const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
            
            console.log('Created Google Sheet:', response.result);
            
            // Add to our sheets list
            this.sheets.push({
                id: spreadsheetId,
                title: title,
                url: spreadsheetUrl,
                created: new Date().toISOString()
            });
            
            this.renderSheetsList();
            
            // Open the sheet in a new tab
            window.open(spreadsheetUrl, '_blank');
            
            alert(`Google Sheet "${title}" created successfully!`);
            
        } catch (error) {
            console.error('Error creating Google Sheet:', error);
            alert('Error creating Google Sheet. Please try again.');
        }
    }

    async loadGoogleSheet() {
        if (!this.isSignedIn) {
            alert('Please sign in with Google first');
            return;
        }

        const sheetId = prompt('Enter Google Sheet ID (from the URL):');
        if (!sheetId) return;

        try {
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: sheetId
            });

            const sheet = response.result;
            const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
            
            // Add to our sheets list if not already there
            const existingSheet = this.sheets.find(s => s.id === sheetId);
            if (!existingSheet) {
                this.sheets.push({
                    id: sheetId,
                    title: sheet.properties.title,
                    url: sheetUrl,
                    loaded: new Date().toISOString()
                });
                this.renderSheetsList();
            }
            
            // Open the sheet in a new tab
            window.open(sheetUrl, '_blank');
            
            alert(`Google Sheet "${sheet.properties.title}" loaded successfully!`);
            
        } catch (error) {
            console.error('Error loading Google Sheet:', error);
            alert('Error loading Google Sheet. Please check the Sheet ID and try again.');
        }
    }

    async shareGoogleSheet(sheetId) {
        if (!this.isSignedIn) {
            alert('Please sign in with Google first');
            return;
        }

        const email = prompt('Enter email address to share with:');
        if (!email) return;

        const role = prompt('Enter role (reader, writer, owner):', 'writer');
        if (!role) return;

        try {
            const response = await gapi.client.drive.permissions.create({
                fileId: sheetId,
                resource: {
                    role: role,
                    type: 'user',
                    emailAddress: email
                }
            });

            alert(`Sheet shared with ${email} as ${role}`);
            
        } catch (error) {
            console.error('Error sharing sheet:', error);
            alert('Error sharing sheet. Please try again.');
        }
    }

    async loadUserSheets() {
        if (!this.isSignedIn) return;

        try {
            const response = await gapi.client.drive.files.list({
                q: "mimeType='application/vnd.google-apps.spreadsheet'",
                fields: 'files(id, name, createdTime, modifiedTime, webViewLink)',
                orderBy: 'modifiedTime desc'
            });

            this.sheets = response.result.files.map(file => ({
                id: file.id,
                title: file.name,
                url: file.webViewLink,
                created: file.createdTime,
                modified: file.modifiedTime
            }));

            this.renderSheetsList();
            
        } catch (error) {
            console.error('Error loading user sheets:', error);
        }
    }

    renderSheetsList() {
        const sheetList = document.getElementById('sheetList');
        if (!sheetList) return;

        sheetList.innerHTML = '';

        this.sheets.forEach(sheet => {
            const sheetItem = document.createElement('div');
            sheetItem.className = 'sheet-item';
            sheetItem.innerHTML = `
                <span class="sheet-item-name" onclick="googleSheetsManager.openSheet('${sheet.id}')">
                    <i class="fab fa-google-drive"></i> ${sheet.title}
                </span>
                <div class="sheet-item-actions">
                    <button class="sheet-item-action" onclick="googleSheetsManager.openSheet('${sheet.id}')" title="Open">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button class="sheet-item-action" onclick="googleSheetsManager.shareSheet('${sheet.id}')" title="Share">
                        <i class="fas fa-share"></i>
                    </button>
                    <button class="sheet-item-action" onclick="googleSheetsManager.copySheetLink('${sheet.url}')" title="Copy Link">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;
            sheetList.appendChild(sheetItem);
        });
    }

    openSheet(sheetId) {
        const sheet = this.sheets.find(s => s.id === sheetId);
        if (sheet) {
            window.open(sheet.url, '_blank');
        }
    }

    shareSheet(sheetId) {
        this.shareGoogleSheet(sheetId);
    }

    copySheetLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            alert('Sheet link copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Sheet link copied to clipboard!');
        });
    }

    bindEvents() {
        // Handle Google Sign-In button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('g_id_signin')) {
                // Google Sign-In button clicked
                console.log('Google Sign-In clicked');
            }
        });
    }
}

// Global Functions
function createGoogleSheet() {
    const title = prompt('Enter sheet title:', 'Project Management Sheet');
    if (title) {
        googleSheetsManager.createGoogleSheet(title);
    }
}

function loadGoogleSheet() {
    googleSheetsManager.loadGoogleSheet();
}

function shareGoogleSheet() {
    const sheetId = prompt('Enter Google Sheet ID to share:');
    if (sheetId) {
        googleSheetsManager.shareGoogleSheet(sheetId);
    }
}

function handleCredentialResponse(response) {
    googleSheetsManager.handleCredentialResponse(response);
}

// Initialize the Google Sheets Manager
const googleSheetsManager = new GoogleSheetsManager();
