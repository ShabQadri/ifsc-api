const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const cors = require("cors");

const app = express();
app.use(cors());

let ifscData = [];

fs.createReadStream("IFSC.csv")
  .pipe(csv())
  .on("data", (row) => {
    Object.keys(row).forEach(
      (key) => (row[key] = (row[key] || "").trim())
    );
    ifscData.push(row);
  })
  .on("end", () => {
    console.log(`Loaded ${ifscData.length} IFSC records!`);
  });

app.get("/", (req, res) => {
  res.send("IFSC API is running!");
});

app.get("/api/search", (req, res) => {
  const { bank, state, branch, ifsc, q } = req.query;
  let results = ifscData;

  if (q) {
    const qLower = q.toLowerCase();
    results = results.filter(
      (row) =>
        row.BANK.toLowerCase().includes(qLower) ||
        row.BRANCH.toLowerCase().includes(qLower) ||
        row.IFSC.toLowerCase().includes(qLower) ||
        row.CITY.toLowerCase().includes(qLower) ||
        row.STATE.toLowerCase().includes(qLower)
    );
  }
  if (bank) results = results.filter(r => r.BANK.toLowerCase().includes(bank.toLowerCase()));
  if (state) results = results.filter(r => r.STATE.toLowerCase().includes(state.toLowerCase()));
  if (branch) results = results.filter(r => r.BRANCH.toLowerCase().includes(branch.toLowerCase()));
  if (ifsc) results = results.filter(r => r.IFSC.toLowerCase() === ifsc.toLowerCase());

  res.json(results.slice(0, 50));
});

app.get("/api/ifsc/:ifsc", (req, res) => {
  const code = req.params.ifsc.toUpperCase();
  const found = ifscData.find(r => r.IFSC === code);
  if (found) res.json(found);
  else res.status(404).json({ error: "IFSC code not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("IFSC API running on port", PORT);
});