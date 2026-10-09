import fs from "fs";
import path from "path";
import { minify } from "terser";

const filesToBundle = [
  "chart.js",
  "dashboard.js",
  "fluid-selector.js",
  "chatbot.js",
  "inventory.js",
  "inventoryChart.js",
  "cylinderviz.js",
  "inspectioncofidence.js",
  "pipeDataScript_883.js",
  "bk_stressData.js",
  "bk_stressscript.js",
  "bk_stress_dataloader.js",
  "b313.js",
  "simple.js",
  "viiidiv1.js",
  "remaining.js",
  "Toxic.js",
  "data.js",
  "Damagemechanism.js",
  "main.js",
  "main-cduvdu.js",
  "msp.js",
  "h2u.js",
  "categoryLoader.js",
  "search.js",
  "mechanism.js",
  "global-script.js",
  "probability.js",
  "api581.js",
  "savedata.js",
  "Damage_mechanisms_criteria.js",
  "bulkupload.js",
  "js/logic.js",
  "js/rbac.js",
  "js/admin-panel.js",
  "js/recent-tabs.js",
  "chemical-suite.js",
  "structural-thickness.js"
];

async function bundle() {
  console.log("Bundling calculation and logic scripts...");
  let combinedCode = "";

  for (const file of filesToBundle) {
    if (!fs.existsSync(file)) {
      console.warn(`File not found, skipping: ${file}`);
      continue;
    }
    const content = fs.readFileSync(file, "utf8");
    combinedCode += `\n/* Module: protected */\n${content};\n`;
  }

  console.log(`Combined raw code length: ${combinedCode.length} characters`);

  const minified = await minify(combinedCode, {
    ecma: 2020,
    mangle: {
      toplevel: false // preserve global functions called by HTML onclick/onchange handlers
    },
    compress: {
      drop_console: false,
      drop_debugger: true
    },
    format: {
      comments: false // strip all proprietary comments and calculation notes
    }
  });

  if (minified.error) {
    console.error("Minification error:", minified.error);
    process.exit(1);
  }

  const outPath = path.resolve("assets/app-engine.min.js");
  fs.writeFileSync(outPath, minified.code, "utf8");
  console.log(`Successfully generated protected bundle: ${outPath} (${minified.code.length} characters)`);
}

bundle().catch(err => {
  console.error("Bundle failure:", err);
  process.exit(1);
});
