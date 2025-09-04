Backend Plan and Priorities

- Stack: Rails 8 API (JWT, Postgres), React + Vite client.
- Status: Users CRUD + JWT login in place; adding current-user route and preparing for judge aggregation.

Immediate Wins (Auth + Hygiene)

- Add GET /api/v1/me to return the authenticated user (done).
- Standardize auth errors and JSON shapes; check token expiration handling.
- Users: enforce unique email (DB index + validation), presence/format validations.
- CORS: restrict dev origin to http://localhost:5173 (Vite).

Near-Term Endpoints

- Leaderboard: GET /api/v1/leaderboard returning top users by score (paginate; later add time windows/filters).
- Events: model + CRUD (title, starts_at, ends_at, location, kind, description); GET /api/v1/events for landing sections.
- Profiles: extend User with safe JSON (exclude password_digest) and optional fields (bio, role).

Judge Aggregation (Validation Plan)

- Goal: Demonstrate end-to-end flow that aggregates external judge stats (e.g., Codeforces, AtCoder) into user scores and exposes them via API.

- Data Model (minimal):
  - Users: add codeforces_handle, atcoder_handle (nullable strings).
  - Optional: submissions table (user_id, source, problem_id, verdict, points, submitted_at) for history.

- Service Interface:
  - AggregationService#sync_user(user): fetches from adapters, merges, updates user.score and/or submissions.
  - Adapters: CodeforcesAdapter, AtcoderAdapter with a common method: fetch_stats(handle) -> { rating, solved, submissions: [...] }.

- API Surface (initial):
  - PATCH /api/v1/users/:id/handles { codeforces_handle, atcoder_handle } (auth required).
  - POST /api/v1/integrations/sync (admin-only): triggers async sync for all users or a subset.
  - GET /api/v1/users/:id/progress: returns aggregated snapshot for display.

- Jobs and Scheduling:
  - SolidQueue job: SyncUserJob(user_id) using AggregationService.
  - Optional cron/recurring (config/recurring.yml) to refresh daily/hourly.

- Validation Strategy (ASAP, no external calls needed):
  - Implement adapters with a MockHTTP client and canned fixtures to simulate responses.
  - Seed a few users with handles; run the sync job; verify updated scores and progress endpoints.
  - Acceptance: leaderboard reflects mock stats; progress endpoint returns expected schema.

API Notes

- POST /api/v1/login -> { token }
- GET /api/v1/me -> current user JSON (excludes password_digest)
- Users CRUD (index/show/create/update/destroy) currently present, protected by JWT (create skipped for signup).

Decision Points

- Roles now or later? Suggest add role (member/admin) now for admin-only sync.
- Leaderboard computation: simple sum vs. normalized per-source; start simple, evolve.
- Submissions persistence: start without storing full history; add table when needed.

Next Steps (proposed)

1) Add email uniqueness + basic validations.
2) Tighten CORS for dev.
3) Define AggregationService + mock adapters + SyncUserJob.
4) Add user handle fields and minimal progress endpoint.
5) Add leaderboard endpoint backed by current score.

