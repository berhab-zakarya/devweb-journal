const fs = require("fs");
const s = JSON.parse(fs.readFileSync("api-docs.json", "utf8"));
const paths = s.paths || {};
for (const p of Object.keys(paths).sort()) {
  const obj = paths[p];
  for (const m of Object.keys(obj)) {
    const op = obj[m];
    const rb = op.requestBody && op.requestBody.content ? Object.keys(op.requestBody.content).join(",") : "-";
    const resp = (op.responses && (op.responses["200"] || op.responses["201"] || op.responses["204"])) || null;
    let wrap = "-";
    if (resp && resp.content && resp.content["application/json"] && resp.content["application/json"].schema) {
      const sch = resp.content["application/json"].schema;
      if (sch.type === "object" && sch.properties) {
        wrap = Object.keys(sch.properties).join("|");
      } else if (sch["$ref"]) {
        wrap = "$ref:" + sch["$ref"];
      } else {
        wrap = sch.type || "schema";
      }
    }
    console.log([m.toUpperCase().padEnd(6), p.padEnd(45), ("req:" + rb).padEnd(45), "resp:" + wrap].join("  "));
  }
}
