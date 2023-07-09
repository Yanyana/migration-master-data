const dotenv = require("dotenv");
const fs = require("fs");
const { promisify } = require("util");
const { join } = require("path");
const { Workbook } = require("exceljs");
const { Client } = require("pg");
const { querydata } = require("./query-type/query-klab");

dotenv.config();

// Konfigurasi koneksi ke database PostgreSQL
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
};

// Daftar tabel yang akan diekspor
const tables = querydata;

function formatPosition(tanggal) {
  const parts = tanggal.split(".");
  const formattedParts = parts.map((part) => parseInt(part).toString()); // Menghapus angka nol pada awal setiap bagian

  return formattedParts.join(".");
}

// Fungsi untuk mengekspor tabel ke file Excel
async function exportTablesToExcel(outputPath, tables) {
  const type = {
    DEPRTEMENT: "DEPRTEMENT",
    SUBDEPARTEMENT: "SUB_DEPARTEMENT",
    INDIVIDUAL: "INDIVIDUAL",
    SUBTEST: "SUB_TEST",
    NUMERIC: "NUMERIC",
    ALPHANUMERIC: "ALPHANUMERIC",
    MEMO: "MEMO",
    LIMITATION: "LIMITATION",
    FREETEXT: "FREETEXT",
  };
  const workbook = new Workbook();

  // Membuat koneksi ke database PostgreSQL
  const client = new Client(dbConfig);
  await client.connect();

  try {
    for (const table of tables) {
      const worksheet = workbook.addWorksheet(table.sheetName);

      // Mengatur header kolom
      worksheet.addRow(table.sheetColumns);

      // Eksekusi query dan mendapatkan hasilnya
      const result = await client.query(table.query);

      // Menambahkan data hasil query ke worksheet
      result.rows.forEach((row) => {
        switch (table.id) {
          case 1:
            worksheet.addRow([
              row.name,
              row.english_name,
              formatPosition(row.position),
              row.type,
            ]);
            break;

          case 2:
            worksheet.addRow([
              row.type,
              formatPosition(row.position),
              row.departement,
              row.parent,
              row.alias_code,
              row.local_code,
              row.name,
              row.english_name,
              row.unit,
              row.decimal,
              row.results_type,
              row.is_transaction,
              row.is_analyze,
              row.is_formula,
              row.is_rulebase,
              row.specimen,
              row.tube,
              row.metode,
              row.instrument,
              row.run_plan,
              row.tat_days,
              row.tat_hours,
              row.tat_minutes,
              row.note_signification_clinical,
              row.note_increase,
              row.note_decrease,
              row.note_other,
              row.note_signification_clinical_en,
              row.note_increase_en,
              row.note_decrease_en,
              row.note_other_en,
              row.price,
            ]);
            break;

          case 3:
            worksheet.addRow([
              row.departement,
              row.name,
              row.english_name,
              formatPosition(row.position),
              row.members,
            ]);
            break;

          case 4:
            worksheet.addRow([
              row.name,
              row.age_min,
              row.age_max,
              row.unit,
              row.male_value,
              row.female_value,
              row.normal_flag,
              row.abnormal_flag,
              row.options
            ]);
            break;

          case 5:
            worksheet.addRow([
              row.name,
              row.age_min,
              row.age_max,
              row.unit,
              row.sign_male ? row.sign_male : row.sign_unspecified,
              row.male_value ? row.male_value : row.unspecified_normal_value,
              row.sign_female ? row.sign_female : row.sign_unspecified,
              row.female_value ? row.female_value : row.unspecified_normal_value,
              row.normal_flag,
              row.abnormal_flag,
            ]);
            break;

          default:
            break;
        }
      });

      // Mengatur lebar kolom secara otomatis
      worksheet.columns.forEach((column) => {
        column.width = Math.max(column.width, 12);
      });
    }
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Tabel berhasil diekspor ke ${outputPath}`);
  } catch (error) {
    console.error("Terjadi kesalahan saat mengekspor tabel:", error);
  } finally {
    // Menutup koneksi ke database
    await client.end();
  }
}

// Eksekusi fungsi exportTablesToExcel
const outputFilePath = join(__dirname + '/master/', "master-data.xlsx");
exportTablesToExcel(outputFilePath, tables);
