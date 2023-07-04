const fs = require("fs");
const { promisify } = require("util");
const { join } = require("path");
const { Workbook } = require("exceljs");
const { Client } = require("pg");

// Konfigurasi koneksi ke database PostgreSQL
const dbConfig = {
  user: "postgres",
  password: "123456",
  host: "localhost",
  port: 5432,
  database: "KLAB_PROD",
};

// Daftar tabel yang akan diekspor
const tables = [
  {
    id: 1,
    tableName: "m_departement",
    sheetName: "m_departement",
    sheetColumns: ["nama", "english_name", "position", "type"],
    query: `SELECT departement as nama, language_1 as english_name, position
    FROM m_departement
    ORDER BY position`,
  },
  {
    id: 2,
    tableName: "m_test",
    sheetName: "master_test",
    sheetColumns: [
      "type",
      "position",
      "departement",
      "parent",
      "alias_code",
      "local_code",
      "name",
      "english_name",
      "unit",
      "decimal",
      "results_type",
      "is_transaction",
      "is_analyze",
      "is_formula",
      "is_rulebase",
      "specimen",
      "tube",
      "metode",
      "instrument",
      "run_plan",
      "tat_days",
      "tat_hours",
      "tat_minutes",
      "note_signification_clinical",
      "note_increase",
      "note_decrease",
      "note_other",
      "note_signification_clinical_en",
      "note_increase_en",
      "note_decrease_en",
      "note_other_en",
      "price",
    ],
    query: `SELECT 
    Case when mt.id_parent IS NOT NULL then 'SUB_TEST' else 'INDIVIDUAL' end as type, 
    mt.position, 
    md.departement, 
    parentTest.test_name as parent,
    mt.alias_code, 
    Case when mt.alias_name = 'null' then NULL else mt.alias_name end as local_code,  
    mt.test_name as name, 
    mt.language_1 as english_name,
    lu.unit, 
    mt.decimal_digit as decimal, 
    UPPER(result.results_type) as results_type, 
    Case when mt.id_parent IS NOT NULL then false else true end as is_transaction,
    Case when mt.id_parent IS NOT NULL then true else true end as is_analyze,
    Case when mt.formula IS NULL then false else mt.formula end as is_formula,
    Case when mt.id_parent IS NOT NULL then false else false end as is_rulebase,
    ls.specimen, 
    tube.tube, 
    method.metode,
    (SELECT STRING_AGG(minst.name, ', ') AS instrument
    FROM m_instrument minst
    WHERE minst.uid::text IN (mt.uid_instruments)), 
    plan.name as run_plan,
    tat.days as tat_days,
    tat.hours as tat_hours,
    tat.minutes as tat_minutes,
    note.signification_clinical as note_signification_clinical,
    note.increase as note_increase,
    note.decrease as note_decrease,
    note.other as note_other,
    note.signification_clinical_en as note_signification_clinical_en,
    note.increase_en as note_increase_en,
    note.decrease_en as note_decrease_en,
    note.other_en as note_other_en,
    tariff.tariff as price
    FROM m_test as mt
    left join m_tariff tariff ON tariff.uid_test = mt.uid AND tariff.uid_patient_type = 'dc401a5a-e229-4397-95e0-2edf2e9150e9'
    inner join m_departement md ON md.uid = mt.uid_departement
    left join l_unit lu ON lu.uid = mt.uid_unit
    left join m_test parentTest ON mt.id_parent = parentTest.id
    left join m_run_plan plan ON plan.uid = mt.uid_run_plan
    inner join l_specimen ls ON ls.uid = mt.uid_specimen
    inner join m_tube tube ON tube.uid = ls.uid_tube
    inner join m_method_lab method ON method.uid = mt.uid_method
    inner join l_results_type result ON result.uid = mt.uid_result_input_type
    left join m_tat_parameter tat ON tat.uid_test = mt.uid
    left join m_clinical_note note ON note.uid_test = mt.uid
    where mt.enabled = true
    Order By position`,
  },
  {
    id: 3,
    tableName: "m_test_panel",
    sheetName: "m_test_panel",
    sheetColumns: ["department", "name", "english_name", "position", "members"],
    query: `SELECT uid_departement, panel_name, language_1, position
    FROM m_test_panel mtp
    inner join m_departement dept ON mtp.uid_departement = dept.uid
    ORDER BY position`,
  },
];

function formatPosition(tanggal) {
    const parts = tanggal.split('.');
    const formattedParts = parts.map(part => parseInt(part).toString()); // Menghapus angka nol pada awal setiap bagian
    
    return formattedParts.join('.');
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
              row.nama,
              row.name,
              formatPosition(row.position),
              type.DEPRTEMENT,
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

          default:
            break;
        }
      });

      // Mengatur lebar kolom secara otomatis
      worksheet.columns.forEach((column) => {
        column.width = Math.max(column.width, 12);
      });
    }

    // Menyimpan workbook ke file Excel
    // const writeFileAsync = promisify(workbook.xlsx.writeFile);
    // await writeFileAsync(outputPath);
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
const outputFilePath = join(__dirname, "master-data.xlsx");
exportTablesToExcel(outputFilePath, tables);
