const express = require('express');

const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
    res.send("Hello welcome to this web app");
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`); 
});

