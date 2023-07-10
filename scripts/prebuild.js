const fs = require("fs");
const path = require("path");
require("dotenv").config();

const querydata = process.env.QUERY_TYPE ? process.env.QUERY_TYPE : 'query-site';

const defaultQuery = path.join(
  __dirname,
  "..",
  "query-type",
  "query-default.js"
);

const siteQuery = path.join(__dirname, "..", "query-type", `${querydata}.js`);

if (fs.existsSync(siteQuery)) {
  const siteQueryContent = fs.readFileSync(siteQuery, "utf8");
  fs.writeFileSync(defaultQuery, siteQueryContent, 'utf8');
} else {
  console.info(
    `Tidak ditemukan template locale untuk "${querydata}", menggunakan template locale default`
  );
}
