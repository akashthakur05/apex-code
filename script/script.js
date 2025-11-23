import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFolder = path.join(__dirname, "..", "data");

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch: " + url);
  return res.json();
}

async function saveJSON(filePath, data) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log("✅ Saved:", filePath);
}

async function processFile(fileName) {
  const filePath = path.join(dataFolder, fileName);

  // Skip non-JSON
  if (!fileName.endsWith(".json")) return;

  const folderName = fileName.replace(".json", "");
  const folderPath = path.join(dataFolder, folderName);
  const sectionDir = path.join(folderPath, "Section");

  // Create folders
  await fs.promises.mkdir(folderPath, { recursive: true });
  await fs.promises.mkdir(sectionDir, { recursive: true });

  console.log(`📁 Processing: ${fileName}`);

  // Read JSON for test_titles
  const raw = await fs.promises.readFile(filePath, "utf8");
  const json = JSON.parse(raw);

  if (!json.test_titles) {
    console.log("⚠️ No test_titles found in", fileName);
    return;
  }

  // ⭐ GLOBAL accumulator for all test questions
  const globalSectionsMap = {}; // sectionId => all questions

  // Loop through tests
  for (const test of json.test_titles) {
    const id = test.id;
    const url = test.test_questions_url;

    if (!id || !url) {
      console.log("⚠️ Skipping test (missing id/url)");
      continue;
    }

    console.log(`🌐 Fetching test ${id} from: ${url}`);

    try {
      const testData = await fetchJSON(url);

      // Save individual test JSON
      const testFile = path.join(folderPath, `${id}.json`);
      await saveJSON(testFile, testData);

      // ⭐ Add to global aggregator
      for (const q of testData) {
        const sectionId = String(q.section_id || "0");

        if (!globalSectionsMap[sectionId]) {
          globalSectionsMap[sectionId] = [];
        }

        globalSectionsMap[sectionId].push(q);
      }

    } catch (err) {
      console.log(`❌ Failed to fetch test ${id}:`, err.message);
    }
  }

  // ⭐ After ALL tests processed — save aggregated section files
  for (const [sectionId, questions] of Object.entries(globalSectionsMap)) {
    const sectionPath = path.join(sectionDir, `${sectionId}.json`);
    await saveJSON(sectionPath, questions);
  }

  console.log(`🎉 Finished aggregating sections in: ${fileName}`);
}

async function run() {
  const allFiles = await fs.promises.readdir(dataFolder);

  for (const file of allFiles) {
    await processFile(file);
  }

  console.log("🚀 All JSON files processed.");
}

run();
