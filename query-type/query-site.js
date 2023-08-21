const querydata = [
  {
    id: 0,
    tableName: "m_instrument",
    sheetName: "master_instrument",
    sheetColumns: [
      "name",
      "alias_name",
      "alias_id",
      "panel_order_type",
      "result_type",
      "is_bidirectional",
    ],
    query: `SELECT name, name as alias_name, id as alias_id, 
    'INDIVIDUAL' as panel_order_type,
    'INDIVIDUAL' as result_type, false as is_bidirectional
    FROM m_instrument
    WHERE enabled = true
    ORDER BY id`,
  },
  {
    id: 1,
    tableName: "m_department",
    sheetName: "master_department",
    sheetColumns: [
      "name",
      "english_name",
      "position",
      "type",
      "department_type",
    ],
    query: `SELECT "group" AS name,
    "language_1" AS english_name,
    "position",
    'SUB_DEPARTMENT' AS type,
    'PK' AS department_type, id as local_code
  FROM "m_group"
  UNION
  SELECT md.departement as name,
    md.language_1 as english_name,
    md.position,
    'DEPARTMENT' AS type,
    'PK' AS department_type
  FROM m_departement md
  where md.enabled = true
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
      "result_type",
      "is_transaction",
      "is_analyze",
      "is_formula",
      "is_rulebase",
      "speciment",
      "tube",
      "method",
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
      "bridging_code",
      "department_type",
    ],
    query: `SELECT 
    Case when mt.id_parent IS NOT NULL then 'SUB_TEST' else 'INDIVIDUAL' end as type, 
    mt.position, 
    md.departement, 
    parentTest.test_name as parent,
    mt.alias_code, 
    mt.id as local_code, 
    mt.test_name as name,
    Case when mt.language_1 = 'null' then NULL 
    when mt.language_1 = '' then NULL else mt.test_name end as english_name, 
    lu.unit, 
    mt.decimal_digit as decimal, 
    REPLACE(UPPER(result.results_type), ' ', '') as result_type, 
    Case when mt.id_parent IS NOT NULL then false else true end as is_transaction,
    Case when mt.id_parent IS NOT NULL then true else true end as is_analyze,
    Case when mt.formula IS NULL then false else mt.formula end as is_formula,
    Case when mt.id_parent IS NOT NULL then false else false end as is_rulebase,
    ls.specimen, 
    ls.specimen as tube, 
    method.metode,
    'Manual'AS instrument,
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
    '10000' as price,
    (SELECT test_id FROM e_mapping_test where uid_test = mt.uid limit 1) as bridging_code,
    'PK' as department_type
    FROM m_test as mt
    inner join m_departement md ON md.uid = mt.uid_departement
    left join l_unit lu ON lu.uid = mt.uid_unit
    left join m_test parentTest ON mt.id_parent = parentTest.id
    left join l_specimen ls ON ls.uid = mt.uid_specimen
    left join m_method_lab method ON method.uid = mt.uid_method
    left join l_results_type result ON result.uid = mt.uid_result_input_type
    where mt.enabled = true
    ORDER BY (
        SELECT ARRAY_AGG(CAST(elem AS INTEGER))
        FROM UNNEST(STRING_TO_ARRAY(mt.position, '.')) AS elem
    ) ASC;`,
  },
  {
    id: 3,
    tableName: "m_test_panel",
    sheetName: "master_panel",
    sheetColumns: [
      "departement",
      "name",
      "english_name",
      "speciment",
      "position",
      "members",
      "department_type",
    ],
    query: `SELECT
    md.departement,
    mtp.panel_name AS name,
    CASE WHEN mtp.language_1 = '' THEN NULL ELSE mtp.language_1 END AS english_name,
    (SELECT COALESCE(
      (SELECT spec.specimen
        FROM c_test_panel memberpanel
        INNER JOIN m_test test ON test.uid = memberpanel.uid_test
        INNER JOIN l_specimen spec ON spec.uid = test.uid_specimen
        WHERE uid_panel = mtp.uid AND memberpanel.enabled = true
        AND test.uid_specimen IS NOT NULL
        LIMIT 1),
        '-'
    )) AS specimen,
    mtp.position,
    (
      SELECT string_agg(mt.id::text, ', ' ORDER BY mt.position ASC)
      FROM m_test mt
      WHERE mt.uid IN (SELECT ctestpanel.uid_test
                       FROM c_test_panel ctestpanel
                       WHERE uid_panel = mtp.uid and ctestpanel.enabled = true)
                       AND mt.enabled = true
    ) AS members,
    'PK' AS department_type,
    mtp.id as local_code
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
      "age_min_unit",
      "age_max",
      "age_max_unit",
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
    CASE
        WHEN numeric.age_unit = 'b' THEN 'MONTH'
        WHEN numeric.age_unit = 't' THEN 'YEAR'
        WHEN numeric.age_unit = 'h' THEN 'DAY'
    ELSE 'YEAR'
    END AS age_min_unit,
    numeric.age_max,
    CASE
        WHEN numeric.age_unit = 'b' THEN 'MONTH'
        WHEN numeric.age_unit = 't' THEN 'YEAR'
        WHEN numeric.age_unit = 'h' THEN 'DAY'
    ELSE 'YEAR'
    END AS age_max_unit, 
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
    INNER JOIN m_test mt ON mt.uid = numeric.uid_test
    where mt.uid_result_input_type = '20602a4d-d1cf-4fea-b302-29ea0634b840' OR mt.uid_result_type_free_text = '20602a4d-d1cf-4fea-b302-29ea0634b840' and numeric.enabled = true
    ORDER BY (
        SELECT ARRAY_AGG(CAST(elem AS INTEGER))
        FROM UNNEST(STRING_TO_ARRAY(mt.position, '.')) AS elem
    ) ASC;`,
  },
  {
    id: 5,
    tableName: "nilai_normal_alpha",
    sheetName: "nilai_normal_alpha",
    sheetColumns: [
      "name",
      "age_min",
      "age_min_unit",
      "age_max",
      "age_max_unit",
      "male_value",
      "female_value",
      "normal_flag",
      "abnormal_flag",
      "options",
    ],
    query: `SELECT mt.test_name AS name, 
    alpha.age_min, 
    CASE
        WHEN alpha.age_unit = 'b' THEN 'MONTH'
        WHEN alpha.age_unit = 't' THEN 'YEAR'
        WHEN alpha.age_unit = 'h' THEN 'DAY'
    ELSE 'YEAR'
    END AS age_min_unit,
    alpha.age_max, 
    CASE
        WHEN alpha.age_unit = 'b' THEN 'MONTH'
        WHEN alpha.age_unit = 't' THEN 'YEAR'
        WHEN alpha.age_unit = 'h' THEN 'DAY'
    ELSE 'YEAR'
    END AS age_max_unit,
    alpha.male_text as male_value,
    alpha.female_text as female_value,
    NULL AS normal_flag,
    '*' AS abnormal_flag,
    COALESCE((SELECT string_agg(opt.alphanum_ref, ', ' ORDER BY opt.id ASC) FROM l_alphanum_ref AS opt WHERE opt.uid_test = mt.uid and opt.enabled = true), alpha.male_text) AS options
    FROM m_normal_value_alphanum_detail AS alpha
    INNER JOIN m_test mt ON alpha.uid_test = mt.uid
    AND alpha.enabled = true
    AND mt.enabled = true
where mt.uid_result_input_type = '11c28a21-4f22-4659-8671-8d97defded3f' OR mt.uid_result_type_free_text = '11c28a21-4f22-4659-8671-8d97defded3f' and alpha.enabled = true and mt.enabled = true
ORDER BY (
        SELECT ARRAY_AGG(CAST(elem AS INTEGER))
        FROM UNNEST(STRING_TO_ARRAY(mt.position, '.')) AS elem
    ) ASC;`,
  },
  {
    id: 6,
    tableName: "nilai_normal_limitation",
    sheetName: "nilai_normal_limitation",
    sheetColumns: [
      "name",
      "age_min",
      "age_min_unit",
      "age_max",
      "age_max_unit",
      "sign_male",
      "male_value",
      "sign_female",
      "female_value",
      "normal_flag",
      "abnormal_flag",
    ],
    query: `SELECT mt.test_name AS name, 
    l.age_min, 
    CASE
        WHEN l.age_unit = 'b' THEN 'MONTH'
        WHEN l.age_unit = 't' THEN 'YEAR'
        WHEN l.age_unit = 'h' THEN 'DAY'
    ELSE 'YEAR'
    END AS age_min_unit,
    l.age_max,
    CASE
        WHEN l.age_unit = 'b' THEN 'MONTH'
        WHEN l.age_unit = 't' THEN 'YEAR'
        WHEN l.age_unit = 'h' THEN 'DAY'
    ELSE 'YEAR'
    END AS age_max_unit,
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
    where mt.uid_result_input_type = 'ef891bdb-ee9b-43a9-a951-8fa2d8f9dbed' OR mt.uid_result_type_free_text = 'ef891bdb-ee9b-43a9-a951-8fa2d8f9dbed' and l.enabled = true and mt.enabled = true
    ORDER BY (
        SELECT ARRAY_AGG(CAST(elem AS INTEGER))
        FROM UNNEST(STRING_TO_ARRAY(mt.position, '.')) AS elem
    ) ASC;`,
  },
];

module.exports = {
  querydata,
};
