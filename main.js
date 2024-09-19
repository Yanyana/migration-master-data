const express = require('express');
const { join } = require('path');
const dotenv = require("dotenv");
const { exportTablesToExcel } = require('.');
const { querydata } = require('./query-type/query-default');
dotenv.config();

const app = express();
const port = process.env.APP_PORT || 4080;
const tables = querydata;
const outputFilePath = join(__dirname, "master-data.xlsx");

app.get('/download', async(req, res) => {
  const createFile = await exportTablesToExcel(outputFilePath, tables);
  console.log(createFile, 'success')
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
