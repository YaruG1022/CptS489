const express = require('express');
const path = require('path');

const app = express();

const PORT = 3000;

// Serve the entire project root as static files so all HTML, CSS, and assets are reachable.
// e.g. http://localhost:3000/src/customer-dashboard.html
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`); 
    console.log(`Customer dashboard: http://localhost:${PORT}/src/customer-dashboard.html`);
});

