// Google Sheets Only Project Manager
// This app only works with Google Sheets - no local tables

class GoogleSheetsManager {
    constructor() {
        this.isSignedIn = false;
        this.currentUser = null;
        this.currentSheet = null;
        this.sheets = [];
        this.init();
    }

    async init() {
        await this.loadGoogleAPI();
        this.bindEvents();
        this.checkAuthStatus();
    }

    async loadGoogleAPI() {
        try {
            // Load Google API
            await new Promise((resolve) => {
                gapi.load('client', resolve);
            });

            // Initialize with your credentials
            await gapi.client.init({
                apiKey: 'AIzaSyAqhs-9DBfJjuLDrZR_MuTCcPDjnI3Qoxk',
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                clientId: 'YOUR_CLIENT_ID', // You'll need to get this from Google Console
                scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive'
            });

            console.log('Google API loaded successfully');
        } catch (error) {
            console.error('Error loading Google API:', error);
            this.showError('Failed to load Google API. Please check your configuration.');
        }
    }

    bindEvents() {
        // Handle Google Sign-In
        window.handleCredentialResponse = (response) => {
            this.handleSignIn(response);
        };

        // Handle sign-in errors
        window.handleCredentialError = (error) => {
            console.error('Sign-in error:', error);
            this.showError('Sign-in failed. Please try again.');
        };
    }

    checkAuthStatus() {
        // Check if user is already signed in
        const token = localStorage.getItem('google_access_token');
        if (token) {
            this.isSignedIn = true;
            this.updateUI();
            this.loadUserSheets();
        }
    }

    async handleSignIn(response) {
        try {
            // Get access token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: 'YOUR_CLIENT_ID',
                    client_secret: 'YOUR_CLIENT_SECRET',
                    code: response.credential,
                    grant_type: 'authorization_code',
                    redirect_uri: 'postmessage'
                })
            });

            const tokenData = await tokenResponse.json();
            
            if (tokenData.access_token) {
                localStorage.setItem('google_access_token', tokenData.access_token);
                this.isSignedIn = true;
                this.currentUser = response;
                this.updateUI();
                this.loadUserSheets();
            }
        } catch (error) {
            console.error('Error during sign-in:', error);
            this.showError('Sign-in failed. Please try again.');
        }
    }

    signOut() {
        localStorage.removeItem('google_access_token');
        this.isSignedIn = false;
        this.currentUser = null;
        this.sheets = [];
        this.updateUI();
        google.accounts.id.disableAutoSelect();
    }

    updateUI() {
        const signinScreen = document.getElementById('signinScreen');
        const sheetsContainer = document.getElementById('sheetsContainer');
        const userInfo = document.getElementById('user-info');
        const signinButton = document.getElementById('signin-button');

        if (this.isSignedIn) {
            signinScreen.style.display = 'none';
            sheetsContainer.style.display = 'block';
            userInfo.style.display = 'block';
            signinButton.style.display = 'none';
            
            if (this.currentUser) {
                document.getElementById('user-email').textContent = this.currentUser.email || 'User';
            }
        } else {
            signinScreen.style.display = 'flex';
            sheetsContainer.style.display = 'none';
            userInfo.style.display = 'none';
            signinButton.style.display = 'block';
        }
    }

    async loadUserSheets() {
        if (!this.isSignedIn) return;

        try {
            const response = await gapi.client.drive.files.list({
                q: "mimeType='application/vnd.google-apps.spreadsheet'",
                fields: 'files(id, name, createdTime, modifiedTime, webViewLink, owners)',
                orderBy: 'modifiedTime desc'
            });

            this.sheets = response.result.files.map(file => ({
                id: file.id,
                title: file.name,
                url: file.webViewLink,
                created: file.createdTime,
                modified: file.modifiedTime,
                owners: file.owners
            }));

            this.renderSheetsList();
        } catch (error) {
            console.error('Error loading sheets:', error);
            this.showError('Failed to load sheets. Please try again.');
        }
    }

    renderSheetsList() {
        const sheetsList = document.getElementById('sheetsList');
        if (!sheetsList) return;

        sheetsList.innerHTML = '';

        if (this.sheets.length === 0) {
            sheetsList.innerHTML = '<div class="no-sheets">No sheets found. Create a new sheet to get started.</div>';
            return;
        }

        this.sheets.forEach(sheet => {
            const sheetItem = document.createElement('div');
            sheetItem.className = 'sheet-item';
            sheetItem.innerHTML = `
                <div class="sheet-info">
                    <h4>${sheet.title}</h4>
                    <p>Modified: ${new Date(sheet.modified).toLocaleDateString()}</p>
                    <p>Owners: ${sheet.owners ? sheet.owners.map(o => o.emailAddress).join(', ') : 'Unknown'}</p>
                </div>
                <div class="sheet-actions">
                    <button class="btn btn-sm" onclick="googleSheetsManager.openSheet('${sheet.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm" onclick="googleSheetsManager.shareSheet('${sheet.id}')">
                        <i class="fas fa-share"></i> Share
                    </button>
                    <button class="btn btn-sm" onclick="googleSheetsManager.openInGoogleSheets('${sheet.url}')">
                        <i class="fas fa-external-link-alt"></i> Open
                    </button>
                </div>
            `;
            sheetsList.appendChild(sheetItem);
        });
    }

    async createNewSheet() {
        const title = document.getElementById('sheetTitle').value.trim();
        if (!title) {
            alert('Please enter a sheet title');
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
            
            // Add to sheets list
            this.sheets.unshift({
                id: spreadsheetId,
                title: title,
                url: spreadsheetUrl,
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            });

            this.renderSheetsList();
            this.closeModal('createSheetModal');
            
            // Open the new sheet
            this.openSheet(spreadsheetId);
            
            alert(`Google Sheet "${title}" created successfully!`);
        } catch (error) {
            console.error('Error creating sheet:', error);
            this.showError('Failed to create sheet. Please try again.');
        }
    }

    async loadExistingSheet() {
        const sheetIdOrUrl = document.getElementById('sheetId').value.trim();
        if (!sheetIdOrUrl) {
            alert('Please enter a sheet ID or URL');
            return;
        }

        try {
            // Extract sheet ID from URL if needed
            let sheetId = sheetIdOrUrl;
            if (sheetIdOrUrl.includes('docs.google.com/spreadsheets/d/')) {
                sheetId = sheetIdOrUrl.split('/d/')[1].split('/')[0];
            }

            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: sheetId
            });

            const sheet = response.result;
            const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
            
            // Add to sheets list if not already there
            const existingSheet = this.sheets.find(s => s.id === sheetId);
            if (!existingSheet) {
                this.sheets.unshift({
                    id: sheetId,
                    title: sheet.properties.title,
                    url: sheetUrl,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                });
                this.renderSheetsList();
            }

            this.closeModal('loadSheetModal');
            this.openSheet(sheetId);
            
            alert(`Google Sheet "${sheet.properties.title}" loaded successfully!`);
        } catch (error) {
            console.error('Error loading sheet:', error);
            this.showError('Failed to load sheet. Please check the sheet ID and try again.');
        }
    }

    openSheet(sheetId) {
        const sheet = this.sheets.find(s => s.id === sheetId);
        if (!sheet) return;

        this.currentSheet = sheet;
        document.getElementById('currentSheetTitle').textContent = sheet.title;
        
        // Show editor
        document.getElementById('sheetsContainer').style.display = 'none';
        document.getElementById('sheetEditor').style.display = 'block';
        
        // Load sheet in iframe
        const iframe = document.getElementById('sheetIframe');
        iframe.src = sheet.url;
    }

    closeEditor() {
        document.getElementById('sheetEditor').style.display = 'none';
        document.getElementById('sheetsContainer').style.display = 'block';
        this.currentSheet = null;
    }

    async shareSheet(sheetId) {
        this.currentSheet = this.sheets.find(s => s.id === sheetId);
        if (!this.currentSheet) return;

        document.getElementById('shareModal').classList.add('show');
    }

    async confirmShareSheet() {
        const email = document.getElementById('shareEmail').value.trim();
        const role = document.getElementById('shareRole').value;
        const message = document.getElementById('shareMessage').value.trim();

        if (!email) {
            alert('Please enter an email address');
            return;
        }

        try {
            await gapi.client.drive.permissions.create({
                fileId: this.currentSheet.id,
                resource: {
                    role: role,
                    type: 'user',
                    emailAddress: email
                }
            });

            this.closeModal('shareModal');
            alert(`Sheet shared with ${email} as ${role}`);
        } catch (error) {
            console.error('Error sharing sheet:', error);
            this.showError('Failed to share sheet. Please try again.');
        }
    }

    openInGoogleSheets(url) {
        if (url) {
            window.open(url, '_blank');
        } else if (this.currentSheet) {
            window.open(this.currentSheet.url, '_blank');
        }
    }

    refreshSheets() {
        this.loadUserSheets();
    }

    showError(message) {
        alert(message);
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
}

// Global Functions
function createNewSheet() {
    document.getElementById('createSheetModal').classList.add('show');
    document.getElementById('sheetTitle').focus();
}

function loadExistingSheet() {
    document.getElementById('loadSheetModal').classList.add('show');
    document.getElementById('sheetId').focus();
}

function shareCurrentSheet() {
    if (googleSheetsManager.currentSheet) {
        googleSheetsManager.shareSheet(googleSheetsManager.currentSheet.id);
    }
}

function openInGoogleSheets() {
    googleSheetsManager.openInGoogleSheets();
}

function closeEditor() {
    googleSheetsManager.closeEditor();
}

function signOut() {
    googleSheetsManager.signOut();
}

function refreshSheets() {
    googleSheetsManager.refreshSheets();
}

function confirmCreateSheet() {
    googleSheetsManager.createNewSheet();
}

function confirmLoadSheet() {
    googleSheetsManager.loadExistingSheet();
}

function confirmShareSheet() {
    googleSheetsManager.confirmShareSheet();
}

function closeModal(modalId) {
    googleSheetsManager.closeModal(modalId);
}

// Initialize the application
const googleSheetsManager = new GoogleSheetsManager();
