# Project Management Tool

A simple, Excel-like project management tool built with HTML, CSS, and JavaScript that allows you to create and manage multiple tables with sheets, just like Excel.

## Features

### 🗂️ Table Management
- **Create Tables**: Create multiple project tables with custom names
- **Delete Tables**: Remove tables you no longer need
- **Duplicate Tables**: Copy existing tables with all their data
- **Table List**: View all your tables in a sidebar

### 📊 Sheet Management
- **Multiple Sheets**: Each table can have multiple sheets (like Excel tabs)
- **Add Sheets**: Create new sheets within any table
- **Rename Sheets**: Customize sheet names
- **Delete Sheets**: Remove unwanted sheets (minimum one sheet per table)
- **Sheet Tabs**: Easy navigation between sheets

### ✏️ Excel-like Editing
- **Cell Editing**: Click any cell to edit its content
- **Add Rows**: Insert new rows anywhere in your data
- **Add Columns**: Add new columns with automatic naming (A, B, C, etc.)
- **Column Headers**: Customize column names
- **Row Numbers**: Automatic row numbering

### 💾 Data Persistence
- **Auto-Save**: All changes are automatically saved to your browser's localStorage
- **Data Persistence**: Your data persists between browser sessions
- **No Server Required**: Everything runs locally in your browser

### 🔗 Sharing & Collaboration
- **Share URLs**: Generate shareable links for your tables
- **Import/Export**: Import and export table data as JSON files
- **Access Control**: Set different access levels (View, Edit, Admin)

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern Interface**: Clean, professional design inspired by modern spreadsheet applications
- **Keyboard Shortcuts**: 
  - `Ctrl+N` (or `Cmd+N`): Create new table
  - `Ctrl+S` (or `Cmd+S`): Save data
- **Smooth Animations**: Polished user experience with smooth transitions

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. Click "Create Your First Table" or use the "New Table" button
3. Enter a table name and set initial columns/rows
4. Start editing your data!

### Creating and Managing Tables
- **New Table**: Click the "New Table" button in the header
- **Switch Tables**: Click on any table in the sidebar
- **Delete Table**: Click the trash icon next to any table name
- **Duplicate Table**: Click the copy icon to duplicate a table

### Working with Sheets
- **Add Sheet**: Click "Add Sheet" in the toolbar
- **Rename Sheet**: Click "Rename" in the toolbar
- **Delete Sheet**: Click the "×" on any sheet tab
- **Switch Sheets**: Click on any sheet tab

### Editing Data
- **Edit Cells**: Click any cell to start editing
- **Add Rows**: Click "Add Row" or use the "+" button in any row
- **Add Columns**: Click "Add Column" in the toolbar
- **Rename Columns**: Click on column headers to edit names

### Sharing and Collaboration
- **Share Table**: Click the share icon next to any table name
- **Copy Share URL**: Use the generated URL to share with others
- **Import Data**: Use the "Import" button to load JSON files
- **Export Data**: Use the "Export" button to save your data

## File Structure

```
pro mgt/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This documentation file
```

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No external dependencies
- **localStorage**: Client-side data persistence
- **Font Awesome**: Icons for better UX

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Data Storage
- All data is stored in your browser's localStorage
- No server or database required
- Data persists between browser sessions
- Export/import functionality for backup and sharing

## Customization

### Adding New Features
The code is well-structured and modular, making it easy to add new features:

- **New Table Types**: Modify the `createTable()` method
- **Additional Cell Types**: Extend the cell rendering in `renderTable()`
- **Custom Validations**: Add validation logic in the update methods
- **New Keyboard Shortcuts**: Extend the `bindEvents()` method

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- The CSS uses CSS custom properties for easy theming
- Responsive design breakpoints can be adjusted

## Troubleshooting

### Common Issues
1. **Data not saving**: Check if localStorage is enabled in your browser
2. **Tables not loading**: Clear browser cache and reload
3. **Import not working**: Ensure the JSON file is properly formatted
4. **Mobile issues**: Use landscape mode for better table editing

### Browser Requirements
- JavaScript must be enabled
- localStorage must be available
- Modern browser with ES6 support

## Future Enhancements

Potential features that could be added:
- Real-time collaboration
- Formula support
- Chart creation
- Advanced filtering and sorting
- User authentication
- Cloud storage integration
- Mobile app version

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please check the browser console for error messages and ensure you're using a supported browser version.
