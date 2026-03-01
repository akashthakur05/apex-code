# MiniMock Nested Subject Flow Implementation

## Overview
This document explains how to set up and use the new MiniMock nested subject flow architecture. This allows coaching institutes to be organized by subjects, where each subject contains its own set of tests.

## Architecture

### Key Components

1. **Types** (`lib/types.ts`)
   - `SubjectSource`: Defines a subject with its label and test series ID
   - `CoachingInstituteWithMiniMock`: Extended coaching institute with minimock support

2. **Utilities** (`lib/source-utils.ts`)
   - `isMiniMockSource()`: Check if a coaching is a minimock source
   - `getSubjectSources()`: Get all subjects for a coaching institute
   - `getTestsBySubject()`: Filter tests by subject
   - `getCoachingTestSeriesId()`: Get appropriate test series ID

3. **UI Components**
   - `SubjectSelection`: Displays available subjects as a grid
   - Updated `TestList`: Shows subject in header and navigation

4. **Routes**
   - `/coaching/[coachingId]`: Normal coaching page (auto-redirects minimock sources)
   - `/coaching/[coachingId]/subject`: Subject selection page (minimock only)
   - `/coaching/[coachingId]/subject/[subject]`: Tests for specific subject

## How to Add a MiniMock Source to data.json

### Normal Coaching Institute (Default)
```json
{
  "id": "1",
  "name": "RWAUPSI",
  "logo": "/rwa.jpeg",
  "test_series_id": "407",
  "repository_url": "...",
  "folder_name": "RWAUPSI",
  "sectionMap": { ... },
  "tests": [ ... ]
}
```

### MiniMock Coaching Institute
```json
{
  "id": "minimock-1",
  "name": "MiniMock Tests",
  "logo": "/minimock.jpeg",
  "test_series_id": "",
  "repository_url": "...",
  "folder_name": "MiniMock",
  "type": "minimock",
  "subjectSources": [
    {
      "subject": "physics",
      "label": "Physics",
      "test_series_id": "101",
      "count": 15
    },
    {
      "subject": "chemistry",
      "label": "Chemistry",
      "test_series_id": "102",
      "count": 12
    },
    {
      "subject": "biology",
      "label": "Biology",
      "test_series_id": "103",
      "count": 10
    }
  ],
  "sectionMap": { ... },
  "tests": [
    {
      "id": "101-1",
      "title": "Physics - Chapter 1",
      "test_series_id": "101",
      ...
    },
    {
      "id": "102-1",
      "title": "Chemistry - Chapter 1",
      "test_series_id": "102",
      ...
    },
    ...
  ]
}
```

## Key Differences

### Normal Source
- Users click coaching → see all tests
- Navigation: Home → Coaching → Tests

### MiniMock Source
- Users click coaching → see subject selection
- Then select subject → see tests for that subject
- Navigation: Home → Coaching → Subject Selection → Tests for Subject

## Backward Compatibility

The `type` field is optional:
- If `type` is not specified, defaults to normal behavior
- Existing coaching institutes continue to work unchanged
- New minimock sources must explicitly set `type: "minimock"`

## Important Notes

1. **Subject Names Must Match**: The `subject` field in `subjectSources` must match the test `test_series_id` filter exactly
2. **Static Generation**: Both normal and minimock routes support static generation
3. **Dynamic Routes**: Subject parameter is URL-encoded to handle special characters
4. **Filtering**: Tests are filtered client-side by `test_series_id` matching the subject's series ID

## Usage Examples

### Check if a coaching is minimock:
```typescript
import { isMiniMockSource } from '@/lib/source-utils'

if (isMiniMockSource(coaching)) {
  // Show subject selection
} else {
  // Show all tests
}
```

### Get tests for a specific subject:
```typescript
import { getTestsBySubject } from '@/lib/source-utils'

const testsForPhysics = getTestsBySubject(coaching, 'physics')
```

### Navigate to subject tests:
```typescript
// User navigates to:
// /coaching/minimock-1/subject/physics
// Which shows all tests with test_series_id === "101"
```

## Generated Routes

For the MiniMock example above, these routes are automatically generated:

1. `/coaching/minimock-1` → Redirects to subject selection
2. `/coaching/minimock-1/subject` → Shows Physics, Chemistry, Biology cards
3. `/coaching/minimock-1/subject/physics` → Shows 15 Physics tests
4. `/coaching/minimock-1/subject/chemistry` → Shows 12 Chemistry tests
5. `/coaching/minimock-1/subject/biology` → Shows 10 Biology tests

All routes are statically generated for optimal performance.
