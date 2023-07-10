const fs = require("fs");
const path = require("path");
require("dotenv").config();

const querydata = process.env.QUERY_TYPE;

const defaultQuery = path.join(
  __dirname,
  "..",
  "query-type",
  "query-default.js"
);

const siteQuery = path.join(__dirname, "..", "query-type", `${querydata}.js`);

if (fs.existsSync(siteQuery)) {
  const siteQueryContent = fs.readFileSync(siteQuery, "utf8");
} else {
  const defaultContent = fs.readFileSync(defaultQuery, "utf8");

  fs.writeFileSync(defaultContent, activeLocaleContent, "utf8");
  console.info(
    `Tidak ditemukan template locale untuk "${querydata}", menggunakan template locale default`
  );
}
