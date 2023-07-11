const querydata = [
  {
    id: 0,
    tableName: "m_instrument",
    sheetName: "master_instrument",
    sheetColumns: ["name", "alias_name", "alias_id", "result_type", "is_bidirectional"],
    query: `SELECT name, name as alias_name, id as alias_id, 'INDIVIDUAL' as result_type, false as is_bidirectional
    FROM m_instrument
    ORDER BY id`,
  },
  {
    id: 1,
    tableName: "m_departement",
    sheetName: "master_departement",
    sheetColumns: ["name", "english_name", "position", "type"],
    query: `SELECT "group" AS name, "language_1" AS english_name, "position", 'SUB_DEPARTMENT' AS type
      FROM "m_group"
      UNION
      SELECT md.departement as name, md.language_1 as english_name, md.position, 'DEPARTMENT' AS type
      FROM m_departement md
      ORDER BY position;`,
  },
  {
    id: 2,
    tableName: "m_test",
    sheetName: "master_test",
    sheetColumns: [
      "type",
      "position",
      "department",
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
      "speciment",
      "tube",
      "methode",
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
      md.department, 
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
      ls.specimen as tube, 
      method.metode,
      (SELECT COALESCE(
    (
        SELECT STRING_AGG(minst.name, ', ') AS instrument
        FROM m_instrument minst
        WHERE minst.uid::text IN (NULL)
    ),
    'Manual'
)) AS instrument, 
      'InHouse' as run_plan,
      0 as tat_days,
      0 as tat_hours,
      0 as tat_minutes,
      NULL as note_signification_clinical,
      NULL as note_increase,
      NULL as note_decrease,
      NULL as note_other,
      NULL as note_signification_clinical_en,
      NULL as note_increase_en,
      NULL as note_decrease_en,
      NULL as note_other_en,
      tariff.tariff as price
      FROM m_test as mt
      left join m_tariff tariff ON tariff.uid_test = mt.uid AND tariff.uid_patient_type = 'dc401a5a-e229-4397-95e0-2edf2e9150e9'
      inner join m_departement md ON md.uid = mt.uid_departement
      left join l_unit lu ON lu.uid = mt.uid_unit
      left join m_test parentTest ON mt.id_parent = parentTest.id
      inner join l_specimen ls ON ls.uid = mt.uid_specimen
      left join m_method_lab method ON method.uid = mt.uid_method
      inner join l_results_type result ON result.uid = mt.uid_result_input_type
      where mt.enabled = true
      Order By position`,
  },
  {
    id: 3,
    tableName: "m_test_panel",
    sheetName: "master_panel",
    sheetColumns: [
      "department",
      "name",
      "english_name",
      "position",
      "members",
    ],
    query: `SELECT
    md.departement,
    mtp.panel_name AS name,
    CASE WHEN mtp.language_1 = '' THEN NULL ELSE mtp.language_1 END AS english_name,
    mtp.position,
    (
      SELECT string_agg(mt.test_name, ', ' ORDER BY mt.position ASC)
      FROM m_test mt
      WHERE mt.uid IN (SELECT ctestpanel.uid_test
                       FROM c_test_panel ctestpanel
                       WHERE uid_panel = mtp.uid and ctestpanel.enabled = true)
                       AND mt.enabled = true
    ) AS members
  FROM
    m_test_panel mtp
  INNER JOIN
    m_departement md ON md.uid = mtp.uid_departement
  where mtp.enabled = true
  ORDER BY
    mtp.position ASC;`,
  },
  {
    id: 4,
    tableName: "nilai_normal_numeric",
    sheetName: "nilai_normal_numeric",
    sheetColumns: [
      "name",
      "age_min",
      "age_max",
      "unit",
      "low_male",
      "high_male",
      "low_female",
      "high_female",
      "critical_low_male",
      "critical_high_male",
      "critical_low_female",
      "critical_high_female",
      "normal_flag",
      "low_flag",
      "high_flag",
      "critical_low_flag",
      "critical_high_flag",
    ],
    query: `SELECT mt.test_name AS name, 
      numeric.age_min, 
      numeric.age_max, 
      COALESCE(UPPER(NULLIF(numeric.age_unit, '')), 'T') as unit, 
      numeric.male_min as low_male, 
      numeric.male_max as high_male, 
      numeric.female_min as low_female, 
      numeric.female_max as high_female, 
      numeric.unspecified_min, 
      numeric.unspecified_max,
      numeric.critical_min as critical_low_male,
      numeric.critical_max as critical_high_male,
      numeric.critical_min as critical_low_female,
      numeric.critical_max as critical_high_female,
      NULL as normal_flag,
      'L' as low_flag,
      'H' as high_flag,
      'CL' as critical_low_flag,
      'CH' as critical_high_flag
      FROM m_normal_value_numeric_detail AS numeric
      INNER JOIN m_test mt ON mt.uid = numeric.uid_test;`,
  },
  {
    id: 5,
    tableName: "nilai_normal_alpha",
    sheetName: "nilai_normal_alpha",
    sheetColumns: [
      "name",
      "age_min",
      "age_max",
      "unit",
      "male_value",
      "female_value",
      "normal_flag",
      "abnormal_flag",
      "options",
    ],
    query: `SELECT mt.test_name AS name, 
      alpha.age_min, 
      alpha.age_max, 
      COALESCE(UPPER(NULLIF(alpha.age_unit, '')), 'T') AS unit,
      alpha.male_text as male_value,
      alpha.female_text as female_value,
      NULL AS normal_flag,
      '*' AS abnormal_flag,
      COALESCE((SELECT string_agg(opt.alphanum_ref, ', ' ORDER BY opt.id ASC) FROM l_alphanum_ref AS opt WHERE opt.uid_test = mt.uid), alpha.male_text) AS options
      FROM m_normal_value_alphanum_detail AS alpha
      INNER JOIN m_test mt ON alpha.uid_test = mt.uid
      AND alpha.enabled = true
      AND mt.enabled = true;`,
  },
  {
    id: 6,
    tableName: "nilai_normal_limitation",
    sheetName: "nilai_normal_limitation",
    sheetColumns: [
      "name",
      "age_min",
      "age_max",
      "unit",
      "sign_male",
      "male_value",
      "sign_female",
      "female_value",
      "normal_flag",
      "abnormal_flag",
    ],
    query: `SELECT mt.test_name AS name, 
      l.age_min, 
      l.age_max,
      COALESCE(UPPER(NULLIF(l.age_unit, '')), 'T') AS unit,
      l.sign_male, 
      l.male_normal_value as male_value, 
      l.sign_female, 
      l.female_normal_value as female_value, 
      l.sign_unspecified, 
      l.unspecified_normal_value, 
      l.normal_flag, 
      l.abnormal_flag 
      FROM m_normal_value_limitation_detail AS l
      INNER JOIN m_test mt ON l.uid_test = mt.uid
      where mt.enabled = true
      order by mt.position asc;`,
  },
];

module.exports = {
  querydata,
};
