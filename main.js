const express = require('express');
const { join } = require('path');
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.DB_PORT || 5000;

app.get('/download', (req, res) => {
  const outputFilePath = join(__dirname, 'master-data.xlsx');

  // Menentukan nama file saat didownload
  const downloadFileName = 'downloaded-master-data.xlsx';

  // Menggunakan fungsi res.download() untuk mengirim file sebagai respons
  res.download(outputFilePath, downloadFileName, (err) => {
    if (err) {
      // Handle error saat download
      console.error('Error during download:', err);
      res.status(500).send('Error during download');
    } else {
      console.log('File downloaded successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
