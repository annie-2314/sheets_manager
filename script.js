// Excel-like Project Management Tool - Main JavaScript File

class ExcelLikeProjectManager {
    constructor() {
        this.workbook = this.loadWorkbook();
        this.currentSheetId = null;
        this.editingCell = null;
        this.init();
    }

    init() {
        this.renderSheetList();
        this.bindEvents();
        this.showWelcomeScreen();
    }

    // Data Management
    loadWorkbook() {
        const saved = localStorage.getItem('excelProjectManagerWorkbook');
        const workbook = saved ? JSON.parse(saved) : {
            id: 'workbook_1',
            name: 'Project Workbook',
            sheets: {},
            currentSheetId: null,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        // Ensure sheets is always an object
        if (!workbook.sheets || typeof workbook.sheets !== 'object') {
            workbook.sheets = {};
        }
        
        return workbook;
    }

    saveWorkbook() {
        this.workbook.lastModified = new Date().toISOString();
        localStorage.setItem('excelProjectManagerWorkbook', JSON.stringify(this.workbook));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Sheet Management
    createSheet(name, columns = 5, rows = 10) {
        const sheetId = this.generateId();
        
        const sheet = {
            id: sheetId,
            name: name,
            data: this.createEmptyData(columns, rows),
            columns: this.createColumns(columns),
            lastModified: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        this.workbook.sheets[sheetId] = sheet;
        
        if (!this.workbook.currentSheetId) {
            this.workbook.currentSheetId = sheetId;
        }
        
        this.currentSheetId = sheetId;
        this.saveWorkbook();
        this.renderSheetList();
        this.renderTable();
        return sheetId;
    }

    createEmptyData(columns, rows) {
        const data = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < columns; j++) {
                row.push('');
            }
            data.push(row);
        }
        return data;
    }

    createColumns(count) {
        const columns = [];
        for (let i = 0; i < count; i++) {
            columns.push({
                id: `col_${i}`,
                name: this.getColumnName(i),
                width: 120
            });
        }
        return columns;
    }

    getColumnName(index) {
        let result = '';
        while (index >= 0) {
            result = String.fromCharCode(65 + (index % 26)) + result;
            index = Math.floor(index / 26) - 1;
        }
        return result;
    }

    deleteSheet(sheetId) {
        if (Object.keys(this.workbook.sheets).length <= 1) {
            alert('Cannot delete the last sheet. The workbook must have at least one sheet.');
            return;
        }

        if (confirm('Are you sure you want to delete this sheet?')) {
            delete this.workbook.sheets[sheetId];
            
            if (this.workbook.currentSheetId === sheetId) {
                this.workbook.currentSheetId = Object.keys(this.workbook.sheets)[0];
            }
            
            this.currentSheetId = this.workbook.currentSheetId;
            this.saveWorkbook();
            this.renderSheetList();
            this.renderTable();
        }
    }

    renameSheet(sheetId, newName) {
        if (!this.workbook.sheets[sheetId]) return;

        this.workbook.sheets[sheetId].name = newName;
        this.workbook.sheets[sheetId].lastModified = new Date().toISOString();
        this.saveWorkbook();
        this.renderSheetList();
    }

    switchSheet(sheetId) {
        this.workbook.currentSheetId = sheetId;
        this.currentSheetId = sheetId;
        this.saveWorkbook();
        this.renderSheetList();
        this.renderTable();
    }

    // Excel Import/Export
    importExcelFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = (e) => {
            if (e.target.files[0]) {
                this.processExcelFile(e.target.files[0]);
            }
        };
        input.click();
    }

    processExcelFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Clear existing sheets
                this.workbook.sheets = {};
                this.workbook.currentSheetId = null;
                
                // Import each sheet
                workbook.SheetNames.forEach((sheetName, index) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const sheetId = this.generateId();
                    
                    // Convert sheet data to our format
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                    
                    // Find the actual data range
                    let maxCols = 0;
                    jsonData.forEach(row => {
                        if (Array.isArray(row)) {
                            maxCols = Math.max(maxCols, row.length);
                        }
                    });
                    
                    // Create columns
                    const columns = [];
                    for (let i = 0; i < maxCols; i++) {
                        columns.push({
                            id: `col_${i}`,
                            name: this.getColumnName(i),
                            width: 120
                        });
                    }
                    
                    // Create data array
                    const data = [];
                    jsonData.forEach((row, rowIndex) => {
                        const dataRow = [];
                        for (let colIndex = 0; colIndex < maxCols; colIndex++) {
                            dataRow.push(row[colIndex] || '');
                        }
                        data.push(dataRow);
                    });
                    
                    const sheet = {
                        id: sheetId,
                        name: sheetName,
                        data: data,
                        columns: columns,
                        lastModified: new Date().toISOString(),
                        createdAt: new Date().toISOString()
                    };
                    
                    this.workbook.sheets[sheetId] = sheet;
                    
                    if (index === 0) {
                        this.workbook.currentSheetId = sheetId;
                        this.currentSheetId = sheetId;
                    }
                });
                
                this.saveWorkbook();
                this.renderSheetList();
                this.renderTable();
                
                alert(`Successfully imported ${workbook.SheetNames.length} sheet(s) from Excel file!`);
                
            } catch (error) {
                console.error('Error importing Excel file:', error);
                alert('Error importing Excel file. Please make sure the file is a valid Excel file.');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    exportToExcel() {
        if (!this.currentSheetId || !this.workbook.sheets[this.currentSheetId]) {
            alert('No sheet selected to export');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            
            // Export all sheets
            Object.values(this.workbook.sheets).forEach(sheet => {
                const ws = XLSX.utils.aoa_to_sheet(sheet.data);
                XLSX.utils.book_append_sheet(wb, ws, sheet.name);
            });
            
            // Generate filename
            const filename = `${this.workbook.name || 'Project_Workbook'}.xlsx`;
            
            // Save file
            XLSX.writeFile(wb, filename);
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Error exporting to Excel. Please try again.');
        }
    }

    // UI Rendering
    renderSheetList() {
        const sheetList = document.getElementById('sheetList');
        if (!sheetList) {
            return;
        }
        sheetList.innerHTML = '';

        Object.values(this.workbook.sheets).forEach(sheet => {
            const sheetItem = document.createElement('div');
            sheetItem.className = 'sheet-item';
            if (this.currentSheetId === sheet.id) {
                sheetItem.classList.add('active');
            }

            sheetItem.innerHTML = `
                <span class="sheet-item-name" onclick="excelManager.switchSheet('${sheet.id}')">
                    <i class="fas fa-file-excel"></i> ${sheet.name}
                </span>
                <div class="sheet-item-actions">
                    <button class="sheet-item-action" onclick="excelManager.duplicateSheet('${sheet.id}')" title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="sheet-item-action" onclick="excelManager.deleteSheet('${sheet.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            sheetList.appendChild(sheetItem);
        });
    }

    renderTable() {
        const tableContainer = document.getElementById('tableContainer');
        const welcomeScreen = document.getElementById('welcomeScreen');
        const tableHead = document.getElementById('tableHead');
        const tableBody = document.getElementById('tableBody');

        if (!this.currentSheetId || !this.workbook.sheets[this.currentSheetId]) {
            tableContainer.style.display = 'none';
            welcomeScreen.style.display = 'flex';
            return;
        }

        const sheet = this.workbook.sheets[this.currentSheetId];
        if (!sheet) return;

        tableContainer.style.display = 'flex';
        welcomeScreen.style.display = 'none';

        // Render headers
        tableHead.innerHTML = '';
        const headerRow = document.createElement('tr');
        
        // Add row number header
        const rowHeader = document.createElement('th');
        rowHeader.style.width = '50px';
        rowHeader.style.textAlign = 'center';
        rowHeader.innerHTML = '#';
        headerRow.appendChild(rowHeader);

        // Add column headers
        sheet.columns.forEach((column, index) => {
            const th = document.createElement('th');
            th.innerHTML = `
                <input type="text" value="${column.name}" 
                       onchange="excelManager.updateColumnName(${index}, this.value)"
                       style="width: 100%; border: none; background: transparent; font-weight: 600;">
            `;
            th.style.width = column.width + 'px';
            headerRow.appendChild(th);
        });

        // Add add column button
        const addColTh = document.createElement('th');
        addColTh.innerHTML = '<button class="btn btn-sm" onclick="excelManager.addColumn()"><i class="fas fa-plus"></i></button>';
        addColTh.style.width = '50px';
        headerRow.appendChild(addColTh);

        tableHead.appendChild(headerRow);

        // Render data rows
        tableBody.innerHTML = '';
        sheet.data.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            
            // Add row number
            const rowNumber = document.createElement('td');
            rowNumber.style.textAlign = 'center';
            rowNumber.style.fontWeight = '600';
            rowNumber.innerHTML = rowIndex + 1;
            tr.appendChild(rowNumber);

            // Add data cells
            row.forEach((cell, colIndex) => {
                const td = document.createElement('td');
                td.innerHTML = `
                    <input type="text" value="${cell}" 
                           onchange="excelManager.updateCell(${rowIndex}, ${colIndex}, this.value)"
                           onfocus="excelManager.setEditingCell(${rowIndex}, ${colIndex})"
                           onblur="excelManager.clearEditingCell()">
                `;
                tr.appendChild(td);
            });

            // Add add row button for this row
            const addRowTd = document.createElement('td');
            addRowTd.innerHTML = `<button class="btn btn-sm" onclick="excelManager.addRowAt(${rowIndex})"><i class="fas fa-plus"></i></button>`;
            tr.appendChild(addRowTd);

            tableBody.appendChild(tr);
        });

        // Add final add row button
        const addRowTr = document.createElement('tr');
        const addRowTd = document.createElement('td');
        addRowTd.colSpan = sheet.columns.length + 2;
        addRowTd.innerHTML = '<button class="btn btn-sm" onclick="excelManager.addRow()"><i class="fas fa-plus"></i> Add Row</button>';
        addRowTd.style.textAlign = 'center';
        addRowTd.style.padding = '1rem';
        addRowTr.appendChild(addRowTd);
        tableBody.appendChild(addRowTr);
    }

    // Event Handlers
    updateCell(rowIndex, colIndex, value) {
        if (!this.currentSheetId || !this.workbook.sheets[this.currentSheetId]) return;
        
        const sheet = this.workbook.sheets[this.currentSheetId];
        
        if (sheet.data[rowIndex]) {
            sheet.data[rowIndex][colIndex] = value;
            sheet.lastModified = new Date().toISOString();
            this.saveWorkbook();
        }
    }

    updateColumnName(colIndex, name) {
        if (!this.currentSheetId || !this.workbook.sheets[this.currentSheetId]) return;
        
        const sheet = this.workbook.sheets[this.currentSheetId];
        
        if (sheet.columns[colIndex]) {
            sheet.columns[colIndex].name = name;
            sheet.lastModified = new Date().toISOString();
            this.saveWorkbook();
        }
    }

    addRow() {
        if (!this.currentSheetId || !this.workbook.sheets[this.currentSheetId]) return;
        
        const sheet = this.workbook.sheets[this.currentSheetId];
        
        const newRow = new Array(sheet.columns.length).fill('');
        sheet.data.push(newRow);
        sheet.lastModified = new Date().toISOString();
        this.saveWorkbook();
        this.renderTable();
    }

    addRowAt(rowIndex) {
        if (!this.currentSheetId || !this.workbook.sheets[this.currentSheetId]) return;
        
        const sheet = this.workbook.sheets[this.currentSheetId];
        
        const newRow = new Array(sheet.columns.length).fill('');
        sheet.data.splice(rowIndex + 1, 0, newRow);
        sheet.lastModified = new Date().toISOString();
        this.saveWorkbook();
        this.renderTable();
    }

    addColumn() {
        if (!this.currentSheetId || !this.workbook.sheets[this.currentSheetId]) return;
        
        const sheet = this.workbook.sheets[this.currentSheetId];
        
        const newColumnName = this.getColumnName(sheet.columns.length);
        sheet.columns.push({
            id: `col_${sheet.columns.length}`,
            name: newColumnName,
            width: 120
        });
        
        sheet.data.forEach(row => row.push(''));
        sheet.lastModified = new Date().toISOString();
        this.saveWorkbook();
        this.renderTable();
    }

    setEditingCell(row, col) {
        this.editingCell = { row, col };
    }

    clearEditingCell() {
        this.editingCell = null;
    }

    showWelcomeScreen() {
        this.currentSheetId = null;
        this.renderSheetList();
        this.renderTable();
    }

    // Modal Functions
    showCreateSheetModal() {
        document.getElementById('createSheetModal').classList.add('show');
        document.getElementById('sheetName').focus();
    }


    confirmCreateSheet() {
        const name = document.getElementById('sheetName').value.trim();
        const columns = parseInt(document.getElementById('initialColumns').value);
        const rows = parseInt(document.getElementById('initialRows').value);

        if (!name) {
            alert('Please enter a sheet name');
            return;
        }

        this.createSheet(name, columns, rows);
        this.closeModal('createSheetModal');
        
        // Reset form
        document.getElementById('sheetName').value = '';
        document.getElementById('initialColumns').value = '5';
        document.getElementById('initialRows').value = '10';
    }

    showRenameSheetModal() {
        if (!this.currentSheetId || !this.workbook.sheets[this.currentSheetId]) return;
        
        const sheet = this.workbook.sheets[this.currentSheetId];
        document.getElementById('newSheetName').value = sheet.name;
        document.getElementById('renameSheetModal').classList.add('show');
        document.getElementById('newSheetName').focus();
    }

    confirmRenameSheet() {
        const newName = document.getElementById('newSheetName').value.trim();
        
        if (!newName) {
            alert('Please enter a sheet name');
            return;
        }

        this.renameSheet(this.currentSheetId, newName);
        this.closeModal('renameSheetModal');
    }

    duplicateSheet(sheetId) {
        const originalSheet = this.workbook.sheets[sheetId];
        if (!originalSheet) return;

        const newSheetId = this.generateId();
        const newSheet = JSON.parse(JSON.stringify(originalSheet));
        newSheet.id = newSheetId;
        newSheet.name = originalSheet.name + ' (Copy)';
        newSheet.lastModified = new Date().toISOString();
        newSheet.createdAt = new Date().toISOString();

        this.workbook.sheets[newSheetId] = newSheet;
        this.saveWorkbook();
        this.renderSheetList();
    }

    // Utility Functions
    bindEvents() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        this.showCreateSheetModal();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveWorkbook();
                        break;
                }
            }
        });
    }
}

// Global Functions (called from HTML)
function createNewSheet() {
    excelManager.showCreateSheetModal();
}

function addSheet() {
    const name = prompt('Enter sheet name:', `Sheet${Object.keys(excelManager.workbook.sheets).length + 1}`);
    if (name) {
        excelManager.createSheet(name);
    }
}

function renameSheet() {
    excelManager.showRenameSheetModal();
}

function deleteSheet() {
    if (!excelManager.currentSheetId) return;
    
    if (confirm('Are you sure you want to delete this sheet?')) {
        excelManager.deleteSheet(excelManager.currentSheetId);
    }
}

function addRow() {
    excelManager.addRow();
}

function addColumn() {
    excelManager.addColumn();
}

function importExcelFile() {
    excelManager.importExcelFile();
}

function exportToExcel() {
    excelManager.exportToExcel();
}

function openGoogleSheets() {
    // Open Google Sheets in a new tab
    window.open('https://sheets.google.com', '_blank');
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function confirmCreateSheet() {
    excelManager.confirmCreateSheet();
}

function confirmRenameSheet() {
    excelManager.confirmRenameSheet();
}

// Initialize the application
const excelManager = new ExcelLikeProjectManager();