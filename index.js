const dotenv = require("dotenv");
const fs = require("fs");
const { promisify } = require("util");
const { join } = require("path");
const { Workbook } = require("exceljs");
const { Client } = require("pg");
const { querydata } = require("./query-type/query-default");

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
              row.department_type,
              row.local_code
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
              row.result_type,
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
              row.bridging_code,
              row.department_type
            ]);
            break;

          case 3:
            worksheet.addRow([
              row.departement,
              row.name,
              row.english_name,
              row.speciment,
              formatPosition(row.position),
              row.members,
              row.department_type,
              row.local_code
            ]);
            break;

          case 4:
            worksheet.addRow([
              row.name,
              row.age_min,
              row.age_min_unit,
              row.age_max,
              row.age_max_unit,
              row.low_male,
              row.high_male,
              row.low_female,
              row.high_female,
              row.critical_low_male,
              row.critical_high_male,
              row.critical_low_female,
              row.critical_high_female,
              row.normal_flag,
              row.low_flag,
              row.high_flag,
              row.critical_low_flag,
              row.critical_high_flag,
              row.local_code,
              row.id_nilai_normal_v1
            ]);
            break;

          case 5:
            worksheet.addRow([
              row.name,
              row.age_min,
              row.age_min_unit,
              row.age_max,
              row.age_max_unit,
              row.male_value,
              row.female_value,
              row.normal_flag,
              row.abnormal_flag,
              row.options,
              row.local_code,
              row.id_nilai_normal_v1
            ]);
            break;

          case 6:
            worksheet.addRow([
              row.name,
              row.age_min,
              row.age_min_unit,
              row.age_max,
              row.age_max_unit,
              row.sign_male ? row.sign_male : row.sign_unspecified,
              row.male_value ? row.male_value : row.unspecified_normal_value,
              row.sign_female ? row.sign_female : row.sign_unspecified,
              row.female_value
                ? row.female_value
                : row.unspecified_normal_value,
              row.normal_flag,
              row.abnormal_flag,
              row.local_code,
              row.id_nilai_normal_v1
            ]);
            break;

          default:
            worksheet.addRow([
              row.name,
              row.alias_name,
              row.alias_id,
              row.panel_order_type,
              row.result_type,
              row.is_bidirectional,
            ]);
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
const outputFilePath = join(__dirname + "/master/", "master-data.xlsx");
exportTablesToExcel(outputFilePath, tables);
