## AI Coding Agent Project Instructions

Goal: Provide precise, context-rich guidance so AI assistants can contribute productively without inventing architecture. Keep changes minimal, incremental, and aligned with existing patterns.

### 1. High-Level Architecture

- Monorepo-style layout with three concerns kept loosely coupled:
  - `frontend/` React + TypeScript + Vite HMR SPA (currently mostly template scaffold).
  - `backend/` Node.js (ES modules) Express service exposing:
    - File upload + OCR via Google Gemini (`/ocr`, `/upload`).
    - External data proxy endpoints: Bhuvan LULC (`/api/lulc`), OpenStreetMap Nominatim search (`/api/osm/search`).
  - `Model/` FastAPI microservice (`data.py`) intended for ML inference using three pickled sklearn models (`pmk_model.pkl`, `pmjvm_model.pkl`, `jjm_model.pkl`). Not yet integrated with backend HTTP layer.
- No shared code layer yet (duplication acceptable short-term). Avoid introducing cross-folder imports unless a deliberate consolidation is approved.

### 2. Runtime & Processes

- Backend start (development): `cd backend && npm install && npm start` (uses `nodemon server.js`). Server listens on `http://localhost:5000`.
- ML service (expected but undocumented): Run `uvicorn data:app --reload` from `Model/` after ensuring dependencies (extend `requirements.txt` as models require sklearn, pandas, numpy, joblib, fastapi, uvicorn, python-dotenv, requests). Do NOT silently add packages—open a PR updating `requirements.txt`.
- Frontend dev (default Vite): `cd frontend && npm install && npm run dev` (likely port 5173). Cross-origin allowed explicitly in FastAPI middleware for `http://localhost:5173`.

### 3. External Integrations & Keys

- Google Gemini: `GEMINI_API_KEY` required in backend `.env`. Fail-fast logging already present; preserve.
- Geoapify Geocoding: `GEOCODING_API` used in `Model/data.py`.
- Bhuvan LULC: Token currently hard‑coded default in query handler; if refactoring, move token to env var `BHUVAN_TOKEN` but keep backward compatibility.
- OpenStreetMap: Respect 1 req/sec (existing `setTimeout` based delay). Maintain or centralize if abstracting.

### 4. Backend Conventions

- Uses ES modules (`"type": "module"`)—always `import` syntax.
- Logging: `morgan('dev')` plus manual `console.log` for proxy debugging. If adding endpoints, mirror concise contextual logging.
- File uploads: Multer disk storage -> `uploads/` at repository root (relative to backend run CWD). Keep filename pattern `Date.now() + '-' + originalname`.
- Error handling: Central Express error middleware already distinguishes multer errors. Extend with care—avoid swallowing stack traces during dev.
- OCR route pattern: Normalize any new AI routes to: validate input -> transform -> external model call -> shape minimal JSON (`{ message, <payload> }`).

### 5. FastAPI (Model Service) Notes

- Current code mixes direct execution (`print(make_prediction(...))`) with FastAPI app definition—remove side-effect call if cleaning.
- `make_prediction` incorrectly calls `get_location(API_KEY, add)` where `add` is a Pydantic model; should use `add.address`. Preserve intent when fixing; document change in PR.
- Models loaded per request (inefficient). If optimizing, move `joblib.load` calls to module-level guarded init; keep response schema identical.

### 6. Data & Security Considerations

- No authentication implemented yet despite `models/User.js`. Mongoose is referenced but not wired (no connection or usage). Do NOT introduce partial auth (session/jwt) without a full vertical slice (user creation, login, password hashing already present in schema hook).
- Never log raw API keys or full uploaded file contents.
- Enforce existing allowed MIME types when extending upload logic.

### 7. Adding Features Safely (Examples)

- New backend proxy: create route under a clear namespace (`/api/<service>`), validate required query params early, log summarized upstream URL, forward selective headers only.
- Extend OCR for multi-page PDFs: detect `.pdf`, pass instruction text clarifying multi-page extraction; keep existing response shape adding optional `pages` array rather than breaking `extractedText`.
- Frontend consumption (future): Centralize API base URL in a small utility when first frontend fetch is added; do not hard-code endpoints across components.

### 8. Testing & Validation (Current State)

- No automated tests; if adding, colocate Jest tests in `backend/__tests__/` and avoid breaking `npm test` placeholder without updating scripts.
- For Python, prefer `pytest` and add a separate `requirements-dev.txt` instead of bloating runtime requirements.

### 9. PR / Change Expectations

- Keep diffs minimal and scoped (one concern per PR: e.g., "Add FastAPI model loading optimization").
- Surface any API shape changes explicitly in description.
- When adding deps, justify purpose inline in PR body.

### 10. What NOT to Do Without Approval

- Do not restructure directories into a monorepo tool (e.g., turborepo) yet.
- Do not introduce authentication flow stubs that are unused.
- Do not migrate to TypeScript in backend without plan for loaders and nodemon compatibility.
- Do not silently modify ML model pickle filenames; update all references if renaming.

### 11. Quick Reference Index

- Backend entry: `backend/server.js`
- Upload storage: `uploads/` (git-tracked currently; consider `.gitignore` in future)
- User schema (unused yet): `backend/models/User.js`
- ML service: `Model/data.py` + `pmk_model.pkl`, `pmjvm_model.pkl`, `jjm_model.pkl`
- Frontend scaffold: `frontend/src/`

---

If any section is outdated or you need clarification (e.g., planned integration path between Express and FastAPI), request confirmation before refactor.
