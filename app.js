const express = require('express');
const cors = require('cors');
const path = require('path');
const { handleUpload } = require('./src/controllers/uploadController');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/upload', handleUpload);

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde ayaklandı`);
});