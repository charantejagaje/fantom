# Friend Feature — Frontend Extension Point

Build your feature UI here. The platform already:

1. Has a **"Team Feature"** navigation item (in `src/platform/PlatformApp.tsx`).
2. Renders `src/platform/sections/TeamFeatureSection.tsx`, which calls
   `GET /api/v1/friend-feature/capabilities` — implement that endpoint in
   `backend/app/api/friend_feature.py` and it shows up here automatically.

## How to plug in your UI

1. Add components in this folder (e.g. `MyFeaturePanel.tsx`).
2. Either:
   - extend `TeamFeatureSection.tsx` to render your panel when
     `caps.capabilities` includes your capability id, **or**
   - add your own route/section in `PlatformApp.tsx` under the existing
     "Team Feature" nav item (one import + one conditional render).
3. Data access goes through `src/platform/api.ts` (add typed helpers there).
   Do not call `fetch` directly from components.

## Rules

- No hardcoded analytics numbers — consume the API.
- Label provenance (observed vs model-predicted vs simulated) on anything numeric.
- Don't modify core files beyond the minimal wiring described above.
