# Deployment Fix - Static Site Configuration

## Problem
Vercel deployment was failing with:
```
ENOTDIR: not a directory, mkdir '/vercel/path0/node_modules'
```

## Root Cause
1. `prebuild` script in package.json was running `node script/autoscript.js`
2. This script tries to fetch external data and write to the filesystem during build
3. With `output: "export"` (static export), the build environment doesn't support this

## Solutions Applied

### 1. Removed Prebuild Script
**File: package.json**
- Removed the `"prebuild": "node script/autoscript.js"` line
- Build now runs only `next build` → `next export` without the pre-build step

### 2. Lazy-Loaded Firebase Imports
**File: components/notifications-provider.tsx**
- Firebase modules now load dynamically on the client only
- No Firebase imports at module level (prevents build-time errors)
- Used dynamic `import()` in useEffect hooks
- Graceful error handling if Firebase fails to load

### 3. Lazy-Loaded Auth Provider
**File: components/notifications-provider.tsx**
- Auth context is imported dynamically when needed
- Allows notifications to work even if auth isn't fully initialized

### 4. Updated Firestore Export
**File: lib/firebase.ts**
- Added `getFirestore` import and `db` export
- Now properly exports Firestore instance for lazy imports

### 5. Static Data Fetching
**File: components/coaching-list.tsx**
- Converted from async server component to client component
- Uses `fetch('/data.json')` instead of `fs.readFileSync()`
- Data.json copied to public folder for client-side access

## Architecture

### Build Time (Static Export)
- ✅ No async operations
- ✅ No file system access
- ✅ Pure React components
- ✅ Generates static HTML + JS

### Runtime (Browser)
- ✅ Firebase loads on demand
- ✅ Auth initializes when needed
- ✅ Notifications fetch from Firestore
- ✅ Graceful fallbacks for missing Firebase

## Deployment Instructions

1. **Push code to Vercel**
   ```bash
   git push origin main
   ```

2. **Vercel will automatically:**
   - Run `pnpm install` (no prebuild script)
   - Run `next build` (generates static export)
   - Deploy the `/out` directory as static site

3. **Verify deployment:**
   - Check that site loads
   - Verify notifications appear on homepage
   - Test Firebase features if logged in

## Configuration

### Next.js Config
```js
// next.config.js
const nextConfig = {
  output: "export",           // Static export
  images: { unoptimized: true }
};
```

### Environment Variables Needed
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

All Firebase variables must be `NEXT_PUBLIC_*` for client-side access in static export.

## Benefits
- ✅ Truly static site (no Node.js server needed)
- ✅ Can deploy anywhere (Netlify, Vercel, GitHub Pages, S3, etc.)
- ✅ Firebase works on client-side
- ✅ No build-time data fetching issues
- ✅ Faster deployments (no prebuild step)
- ✅ Graceful degradation if Firebase is unavailable
