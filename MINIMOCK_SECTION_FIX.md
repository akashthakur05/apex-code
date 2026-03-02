# Mini-Mock Section Aggregation & Display Fix

## Problem
Mini-mock type sources had two issues:
1. Questions were not being aggregated by section_id during autoscript fetch
2. Section display (section filter cards) was hidden for mini-mock sources

## Root Cause Analysis

Mini-mock tests are **subject-specific** - each individual test contains questions from only ONE section (e.g., only Maths or only Hindi). This means:
- Individual test pages won't show multiple section tabs (because there's only one section per test)
- The real value is in the **section aggregation** - viewing ALL questions from a specific section across ALL tests
- The section viewer page (`/coaching/[id]/section/[sectionId]`) is where users should browse by section

## Solution Implemented

### 1. Added sectionMap to Mini-Mock Sources (config/sources.json)
Added section mapping to both mini-mock sources so section IDs can be displayed with proper names:

```json
{
  "name": "RWAUPSIMINIMOCK",
  "type": "minimock",
  "sectionMap": {
    "215": "Basic Law/Constitution/General Knowledge",
    "213": "Hindi",
    "222": "Numerical & Mental Ability Test",
    "223": "Mental Aptitude/Intelligence/Reasoning"
  }
}
```

### 2. Enabled Section Aggregation for Mini-Mock (script/autoscript.js)
Modified the mini-mock processing logic to:
- Create a `Section` directory under each mini-mock folder
- Aggregate questions by `section_id` as they are fetched
- Write section files (e.g., `Section/215.json`) containing all questions for that section across all tests
- Handle both new fetches and existing test files

### 3. Fixed sectionMap Update for Existing Institutes (script/autoscript.js)
Added logic to update sectionMap for existing institutes:
```javascript
// Update sectionMap for existing institutes if provided in source
if (source.sectionMap) {
  institute.sectionMap = source.sectionMap;
}
```

### 4. Enabled Section Filter for Mini-Mock (components/test-list.tsx)
Removed the condition that was hiding the section filter cards for mini-mock sources. Now users can:
- See section cards on the test list page
- Click a section to view ALL questions from that section across all tests
- Navigate to `/coaching/[id]/section/[sectionId]` for section-specific practice

## How It Works

### Section Aggregation (Backend)
```javascript
// For each test in mini-mock
const questions = await fetchJSON(t.test_questions_url, source.headers);

// Aggregate by section_id
for (const q of questions) {
  const sid = String(q.section_id ?? 0);
  sections[sid] ??= new Map();
  sections[sid].set(q.id, q);
}

// Write section files
for (const [sid, map] of Object.entries(sections)) {
  const f = path.join(sectionDir, `${sid}.json`);
  await write(f, stringify([...merged.values()]));
}
```

### Section Display (Frontend)
1. **Test List Page**: Shows section filter cards for all sections
2. **Section Viewer Page**: Displays all questions from a specific section across all tests
3. **Individual Test Page**: Shows section tabs only if test has multiple sections (rare for mini-mock)

## User Flow

### For Mini-Mock Sources:
1. User clicks on mini-mock coaching → sees subject selection
2. User selects a subject → sees test list AND section filter cards
3. User can either:
   - Click a test to practice that specific test
   - Click a section card to practice ALL questions from that section across all tests

### Section Viewer Benefits:
- Practice all Maths questions from all tests in one place
- Practice all Hindi questions from all tests in one place
- Better for topic-wise preparation
- Questions are aggregated from multiple tests

## File Structure

After running autoscript, mini-mock folders have:
```
data/RWAUPSIMINIMOCK/
├── 33538.json          # Individual test files (single section each)
├── 33539.json
├── Section/
│   ├── 213.json        # ALL Hindi questions from ALL tests
│   ├── 215.json        # ALL GK questions from ALL tests
│   ├── 222.json        # ALL Maths questions from ALL tests
│   └── 223.json        # ALL Reasoning questions from ALL tests
```

## Testing

To test the changes:
1. Run autoscript: `node script/autoscript.js`
2. Verify Section folders are created for mini-mock sources
3. Check lib/data.json - sectionMap should no longer be empty `{}`
4. Navigate to a mini-mock subject page (e.g., `/coaching/6/subject/Maths`)
5. **Verify section filter cards appear below the test list**
6. Click a section card to view all questions from that section
7. Individual test pages will show section tabs only if they have multiple sections (rare)

## Benefits

1. **Section-Based Practice**: Users can practice all questions from a specific section across all tests
2. **Better Organization**: Questions are grouped by subject area (Hindi, Maths, Reasoning, etc.)
3. **Flexible Navigation**: Users can choose between test-based or section-based practice
4. **Data Reusability**: Section files enable section-specific views
5. **Consistent Experience**: Same section navigation as normal sources

## Notes

- Mini-mock tests are typically single-section (subject-specific)
- Section aggregation is the key feature - it combines questions from all tests by section
- Section filter cards are now visible for mini-mock sources
- The section viewer page is where users get the most value for mini-mock
- Backward compatible - normal sources continue to work unchanged
- **You must run autoscript after updating sources.json for changes to take effect**
