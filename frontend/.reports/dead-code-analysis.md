# Dead Code Analysis Report
**Project**: PositionDoctor Frontend
**Date**: 2026-02-01
**Analysis Type**: Static Code Analysis
**Tools**: depcheck, manual analysis, grep

---

## Executive Summary

This report analyzes the PositionDoctor frontend React application for dead code, unused exports, and unused dependencies. The codebase is generally well-maintained with minimal dead code.

### Key Findings

| Category | Count | Risk Level |
|----------|-------|------------|
| Unused Dependencies | 2 | SAFE |
| Unused Exports | 8 | SAFE |
| Unused Files | 1 | SAFE |
| Dead Code Within Files | Minimal | SAFE |

---

## 1. Unused Dependencies (SAFE)

Based on depcheck analysis:

### Dependencies to Remove

| Package | Version | Size | Reason |
|---------|---------|------|--------|
| `@maplibre/maplibre-gl-geocoder` | ^1.2.0 | ~180 KB | Not imported anywhere in the codebase |
| `@turf/turf` | ^6.5.0 | ~250 KB | Not imported anywhere in the codebase |

### DevDependencies to Remove

| Package | Version | Reason |
|---------|---------|--------|
| `@typescript-eslint/eslint-plugin` | ^6.0.0 | Configured but ESLint may not be actively used |
| `@typescript-eslint/parser` | ^6.0.0 | Configured but ESLint may not be actively used |
| `eslint-plugin-react-hooks` | ^4.6.0 | Configured but ESLint may not be actively used |
| `postcss` | ^8.4.0 | Listed as dep but used by Tailwind |

**Note**: The devDependencies are actually used by the build system. Only `@maplibre/maplibre-gl-geocoder` and `@turf/turf` are truly unused.

### Why These Were Likely Added

- `@maplibre/maplibre-gl-geocoder`: Likely intended for map search functionality but the app uses Leaflet directly instead
- `@turf/turf`: Likely intended for geospatial analysis but all analysis happens on the backend

**Action**: Safe to remove these two dependencies.

---

## 2. Unused Exports (SAFE)

### Components (src/components/)

| Export | File | Status | Reason |
|--------|------|--------|--------|
| `ErrorBoundaryClass` | ErrorBoundary.tsx | UNUSED | Only the functional `ErrorBoundary` is used |
| `ResultPanelSkeleton` | Skeleton.tsx | UNUSED | Not imported anywhere |
| `Skeleton` | Skeleton.tsx | UNUSED | Not imported anywhere |
| `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` | ui/Card.tsx | UNUSED | UI components not used in current design |
| `ErrorDisplay` | ErrorDisplay.tsx | UNUSED | Only used in FileUploader which has inline error handling |

### Utils (src/utils/)

| Export | File | Status | Reason |
|--------|------|--------|--------|
| `diagnoseTrackWithProgress` | api.ts | UNUSED | Only `diagnoseTrack` is used |
| `getHealth` | api.ts | UNUSED | No health check endpoint is called |
| `downloadReport` | api.ts | UNUSED | Not called anywhere |
| `getDownloadUrl` | api.ts | UNUSED | Not used, `getExportUrl` is used instead |
| `formatFileSize` | gpxParser.ts | UNUSED | Not imported anywhere |
| `estimatePayloadSize` | gpxParser.ts | UNUSED | Not imported anywhere |

### Types (src/types/index.ts)

| Export | Status | Reason |
|--------|--------|--------|
| `Bounds` | UNUSED | Not imported anywhere (used in Point interface but never directly) |
| `ElevationStats` | UNUSED | Part of TrajectoryStats but not used directly |
| `AnomalyType` | UNUSED | Only PointStatus is used |
| `Severity` | UNUSED | Defined but not used in current implementation |

---

## 3. Unused Files (SAFE)

| File | Reason |
|------|--------|
| `src/data/` | Empty directory (contains only . and ..) |

---

## 4. Potentially Dead Code Within Files

### src/App.tsx

```tsx
// Line 142: APIModal is rendered but its state is controlled via store
// The apiModalOpen state in store is never set to true
<APIModal />
```

**Status**: CAUTION - The modal is rendered but there's no way to open it in the current UI. The store has `toggleApiModal` action but it's never called.

### src/components/ErrorBoundary.tsx

```tsx
// Lines 17-38: ErrorBoundaryClass is exported but never used
export class ErrorBoundaryClass extends Component<Props, State> {
  // ... implementation
}
```

**Status**: SAFE - The functional `ErrorBoundary` on line 13 is used instead.

### src/vite.config.ts

```typescript
// Lines 28-30: Manual chunks configured for maplibre
manualChunks: {
  'maplibre': ['maplibre-gl', '@maplibre/maplibre-gl-geocoder'],
},
```

**Status**: CAUTION - References `@maplibre/maplibre-gl-geocoder` which is not installed/used.

---

## 5. Dependencies Status

### Used Dependencies

| Package | Used In | Purpose |
|---------|---------|---------|
| `i18next` | i18n/config.ts | Internationalization |
| `react-i18next` | i18n/config.ts, App.tsx, ErrorBoundary.tsx | React i18n integration |
| `react` | All components | Core framework |
| `react-dom` | main.tsx | DOM rendering |
| `react-dropzone` | FileUploader.tsx | File upload functionality |
| `zustand` | hooks/useStore.ts | State management |
| `leaflet` | TrajectoryComparison.tsx | Map rendering |

### Used DevDependencies

All devDependencies are used by the build system (Vite, TypeScript, Tailwind).

---

## 6. Safe Removal Recommendations

### Priority 1: Can Remove Immediately (SAFE)

```bash
npm uninstall @maplibre/maplibre-gl-geocoder @turf/turf
```

### Priority 2: Code Cleanup (SAFE)

1. Remove unused exports from `src/components/Skeleton.tsx`
2. Remove unused exports from `src/components/ui/Card.tsx`
3. Remove `ErrorBoundaryClass` from `src/components/ErrorBoundary.tsx`
4. Remove unused exports from `src/utils/api.ts`
5. Remove unused exports from `src/utils/gpxParser.ts`

### Priority 3: Configuration Update (CAUTION)

Update `vite.config.ts` to remove the manual chunk configuration for maplibre:

```typescript
// Remove or update:
build: {
  outDir: 'dist',
  sourcemap: true,
  // Remove the rollupOptions or update to only include used packages
}
```

---

## 7. Duplicate Code Analysis

### No Significant Duplicates Found

The codebase does not have significant duplicate code. Each component and utility has a distinct purpose.

### Minor Similarities

- `getIconPath` function appears in both `APIModal.tsx` and `Navigation.tsx` - could be extracted to a shared utility
- Icon path logic in `APIDocsPage.tsx` is similar but has different icons

**Recommendation**: Extract common icon utilities to `src/utils/icons.ts` if more components need this.

---

## 8. Missing But Potentially Useful

The following utilities exist but are not used - they might be useful for future features:

1. **`diagnoseTrackWithProgress`** - Could be used to show upload progress
2. **`getHealth`** - Could be used for API health monitoring
3. **`formatFileSize`** - Could be used to show file sizes in the uploader

**Recommendation**: Keep these utilities as they provide value for potential features.

---

## 9. File Structure Analysis

```
src/
├── components/
│   ├── APIDocsPage/           (2 files - all used)
│   ├── ui/
│   │   ├── Card.tsx            (5 exports - ALL UNUSED)
│   │   └── index.ts            (re-exports Card exports)
│   ├── AlgorithmEffect.tsx     (used)
│   ├── AlgorithmList.tsx       (used)
│   ├── APIModal.tsx           (rendered but not triggered)
│   ├── DownloadSection.tsx     (used)
│   ├── ErrorBoundary.tsx      (ErrorBoundaryClass unused)
│   ├── ErrorDisplay.tsx       (unused)
│   ├── FileUploader.tsx        (used)
│   ├── HealthScoreCard.tsx     (used)
│   ├── LanguageSwitcher.tsx   (used)
│   ├── MapContainer.tsx        (used)
│   ├── ResultPanel.tsx        (used)
│   ├── Skeleton.tsx           (2 exports unused)
│   └── TrajectoryComparison.tsx (used)
├── data/                       (EMPTY)
├── hooks/
│   ├── useStore.ts            (used)
│   └── useTranslation.ts      (used)
├── i18n/
│   ├── config.ts              (used)
│   ├── en.ts                  (used)
│   └── zh.ts                  (used)
├── pages/
│   └── APIDocsPage.tsx        (used)
├── styles/
│   └── index.css              (used)
├── types/
│   └── index.ts               (some types unused)
├── utils/
│   ├── api.ts                 (some exports unused)
│   └── gpxParser.ts          (some exports unused)
├── App.tsx                    (main)
├── main.tsx                   (main)
├── vite-env.d.ts              (env types)
└── index.css                  (styles)
```

---

## 10. Action Plan Summary

### Immediate Actions (SAFE)

1. Remove unused dependencies:
   ```bash
   npm uninstall @maplibre/maplibre-gl-geocoder @turf/turf
   ```

2. Remove unused files:
   ```bash
   rmdir src/data
   ```

3. Remove or comment unused exports in:
   - `src/components/ui/Card.tsx` - entire file unused
   - `src/components/Skeleton.tsx` - remove unused exports
   - `src/components/ErrorBoundary.tsx` - remove ErrorBoundaryClass

### Code Quality Improvements

1. Fix vite.config.ts manualChunks configuration
2. Consider extracting common icon utilities
3. Review APIModal - either wire it up or remove it

---

## 11. Bundle Impact Estimate

### Current Bundle Size (estimated)

| Category | Size |
|----------|------|
| Core (React + ReactDOM) | ~130 KB |
| Leaflet | ~140 KB |
| i18next | ~50 KB |
| Zustand | ~3 KB |
| React Dropzone | ~15 KB |
| **Total** | ~338 KB |

### Potential Savings

| Item | Savings |
|------|---------|
| Removing @maplibre/maplibre-gl-geocoder | ~180 KB |
| Removing @turf/turf | ~250 KB |
| Removing unused UI components | ~5 KB |
| **Total Potential Savings** | ~435 KB |

---

## 12. Risk Assessment

### SAFE to Remove

- Unused npm dependencies (@maplibre/maplibre-gl-geocoder, @turf/turf)
- Unused component exports (Skeleton, ResultPanelSkeleton, Card components)
- Unused utility exports (diagnoseTrackWithProgress, getHealth, formatFileSize, etc.)
- Empty data/ directory

### CAUTION - Review Before Removing

- `APIModal` - It's rendered but may have been planned for future use
- `ErrorDisplay` - Currently unused but provides good UX for errors
- Unused utilities in `api.ts` and `gpxParser.ts` - Could be useful for features

### DANGER - Do NOT Remove

- All types in `types/index.ts` - Even if unused, they define the API contract
- `ErrorBoundary` functional component - Used in main.tsx
- Any currently imported/exported components

---

## Conclusion

The PositionDoctor frontend codebase is in good shape with minimal dead code. The main cleanup opportunities are:

1. **2 unused npm packages** (~430 KB potential savings)
2. **Several unused exports** that can be cleaned up
3. **1 empty directory** to remove

No critical dead code was found. The unused exports appear to be from iteration during development where features were changed or simplified.

**Recommendation**: Remove the two unused npm packages for immediate bundle size reduction, and clean up unused exports during normal development cycles.
