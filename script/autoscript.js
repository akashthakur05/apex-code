import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ======================================================
   PATHS
====================================================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, "..");
const CONFIG_DIR = path.join(ROOT, "config");
const DATA_DIR = path.join(ROOT, "data");
const LIB_DIR = path.join(ROOT, "lib");
const PUBLIC_DATA_JSON_PATH = path.join(ROOT, "public", "data.json");

const SOURCES_PATH = path.join(CONFIG_DIR, "sources.json");
const MOCK_TS_PATH = path.join(LIB_DIR, "mock-data.ts");
console.log(MOCK_TS_PATH)


const sortById= (arr = []) =>
  [...arr].sort((a, b) => {
    const ai = Number(a.id);
    const bi = Number(b.id);

    // numeric ids → descending
    if (!Number.isNaN(ai) && !Number.isNaN(bi)) {
      return bi - ai;
    }

    // fallback to string compare → descending
    return String(b.id).localeCompare(String(a.id));
  });

/* ======================================================
   LOGGING
====================================================== */

const log = (t, m) => console.log(`[${t}] ${m}`);

/* ======================================================
   HELPERS
====================================================== */

const fetchJSON = async (url, headers = {}) => {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`HTTP ${r.status} → ${url}`);
  return r.json();
};

const read = f => fs.promises.readFile(f, "utf8");
const write = (f, c) => fs.promises.writeFile(f, c);

const mergeTests = (existing = [], incoming = []) => {
  const map = new Map(existing.map(t => [String(t.id), t]));
  for (const t of incoming) {
    map.set(String(t.id), {
      ...map.get(String(t.id)),
      ...t,
      is_completed: false,
      is_test_attempted: false
    });
  }
  return [...map.values()];
};

/* ======================================================
   TS PARSING
====================================================== */

function extractInstitutes(ts) {
  const m = ts.match(
    /export const coachingInstitutes\s*:[^=]+=\s*(\[[\s\S]*?\]);/
  );

  if (!m) {
    throw new Error("coachingInstitutes not found — regex mismatch");
  }

  return {
    full: m[0],
    arr: m[1]
  };
}


const parseArray = txt => eval(txt);
const stringify = obj => JSON.stringify(obj, null, 2);

/* ======================================================
   UPDATE mock-data.ts
====================================================== */

async function updateMockTs(source, tests) {
  const ts = await read(MOCK_TS_PATH);
  const { full, arr } = extractInstitutes(ts);
  const institutes = parseArray(arr);

  const inst = institutes.find(i => i.folder_name === source.folder_name);
  if (!inst) return log("WARN", `Institute missing: ${source.folder_name}`);

  inst.tests = mergeTests(inst.tests, tests);

  const updated =
    `export const coachingInstitutes: CoachingInstitute[] = ${stringify(institutes)};`;

  await write(MOCK_TS_PATH, ts.replace(full, updated));
  log("WRITE", `mock-data.ts updated → ${source.folder_name}`);
}

/* ======================================================
   PROCESS SOURCE
====================================================== */

async function processSource(source) {
  log("INFO", `Fetching tests → ${source.name}`);
  const data = await fetchJSON(source.url, source.headers);
  

  if (!Array.isArray(data.test_titles) || !data.test_titles.length) {
    return log("WARN", `No tests → ${source.name}`);
  }

  // await updateMockTs(source, data.test_titles);
  await updateDataJson(source, data.test_titles);


  const base = path.join(DATA_DIR, source.folder_name);
  const sectionDir = path.join(base, "Section");
  await fs.promises.mkdir(sectionDir, { recursive: true });

  const sections = {};

  for (const t of data.test_titles) {
    if (!t.id || !t.test_questions_url) continue;

    const testFile = path.join(base, `${t.id}.json`);
    const questions = fs.existsSync(testFile)
      ? JSON.parse(await read(testFile))
      : await fetchJSON(t.test_questions_url, source.headers);

    if (!fs.existsSync(testFile)) {
      await write(testFile, stringify(questions));
      log("FETCH", `Test ${t.id}`);
    }

    for (const q of questions) {
      const sid = String(q.section_id ?? 0);
      sections[sid] ??= new Map();
      sections[sid].set(q.id, q);
    }
  }

  for (const [sid, map] of Object.entries(sections)) {
    const f = path.join(sectionDir, `${sid}.json`);
    const old = fs.existsSync(f) ? JSON.parse(await read(f)) : [];
    const merged = new Map(old.map(q => [q.id, q]));
    for (const [id, q] of map) merged.set(id, q);
    await write(f, stringify([...merged.values()]));
    log("WRITE", `Section ${sid}`);
  }

  log("DONE", source.name);
}


const DATA_JSON_PATH = path.join(LIB_DIR, "data.json");

async function updateDataJson(source, tests) {
  const data = fs.existsSync(DATA_JSON_PATH)
    ? JSON.parse(await read(DATA_JSON_PATH))
    : [];

  let institute = data.find(
    i => i.folder_name === source.folder_name
  );

  if (!institute) {
    institute = {
      id: String(data.length + 1),
      name: source.name,
      logo: source.logo || "",
      test_series_id: String(source.test_series_id ?? ""),
      repository_url: "",
      folder_name: source.folder_name,
      sectionMap: source.sectionMap || {},
      tests: []
    };
    data.push(institute);
  }

  institute.tests = sortById(
  mergeTests(institute.tests, tests)
);
  // Not Removing due to backward compatibility with coaching-list.tsx which is using test length to show number of tests available for each institute
  await write(DATA_JSON_PATH, stringify(data));
  await write(PUBLIC_DATA_JSON_PATH, stringify(data));
  log("WRITE", `data.json updated → ${source.folder_name}`);
}


/* ======================================================
   RUN
====================================================== */

async function run() {
  const sources = JSON.parse(await read(SOURCES_PATH));
  for (const s of sources) if (s.enabled) await processSource(s);
  log("DONE", "All sources processed");
}



run().catch(e => {
  log("ERROR", e.stack || e.message);
  process.exit(1);
});
