# Golf Tracker

Golf Tracker is a local development app for managing golf courses and scorecard
rounds. It includes a FastAPI backend backed by SQLite and a Next.js frontend
that provides dashboards, course management, and round entry screens.

## Architecture

- **Backend:** FastAPI application in `backend/` using SQLAlchemy models and a
  SQLite database. On startup, the API creates the required tables if they do not
  already exist.
- **Database:** SQLite file database configured as `sqlite:///./golf.db`, created
  relative to the directory where the backend process starts.
- **Frontend:** Next.js application in `frontend/` using React client components.
  The frontend talks to the backend through `NEXT_PUBLIC_API_URL`, defaulting to
  `http://localhost:8000`.
- **Local development:** Backend and frontend can be run separately from local
  toolchains or together with Docker Compose.

## Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer
- npm
- Docker and Docker Compose, if using the Compose workflow

## Backend setup

From the `golf` directory:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. Interactive OpenAPI docs
are available at `http://localhost:8000/docs`.

## Frontend setup

From the `golf/frontend` directory:

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`. To point the frontend
at a different backend URL, set `NEXT_PUBLIC_API_URL` before starting the dev
server:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## Docker Compose local startup

From the `golf` directory:

```bash
docker compose up
```

Compose starts:

- `backend` on `http://localhost:8000`
- `frontend` on `http://localhost:3000`

The services use bind mounts so source changes are reflected in the running
development servers. The backend writes `golf.db` in the `golf` directory.

To stop and remove containers:

```bash
docker compose down
```

## API endpoints

Base URL: `http://localhost:8000`

### Health

#### `GET /api/health`

Returns backend health status.

Response:

```json
{
  "status": "ok"
}
```

### Courses

#### `GET /api/courses`

Returns all courses ordered by `id`.

Response:

```json
[
  {
    "id": 1,
    "name": "Pebble Beach Golf Links",
    "location": "Pebble Beach, CA",
    "holes": 18,
    "par": 72
  }
]
```

#### `POST /api/courses`

Creates a course.

Request body:

```json
{
  "name": "Pebble Beach Golf Links",
  "location": "Pebble Beach, CA",
  "holes": 18,
  "par": 72
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "name": "Pebble Beach Golf Links",
  "location": "Pebble Beach, CA",
  "holes": 18,
  "par": 72
}
```

### Rounds

#### `GET /api/rounds`

Returns all rounds ordered by `id`.

Optional query parameters:

- `course_id` - only return rounds for the given course ID

Response:

```json
[
  {
    "id": 1,
    "course_id": 1,
    "player_name": "Ada Lovelace",
    "score": 70,
    "date_played": "2026-05-10"
  }
]
```

#### `POST /api/rounds`

Creates a round linked to an existing course.

Request body:

```json
{
  "course_id": 1,
  "player_name": "Ada Lovelace",
  "score": 70,
  "date_played": "2026-05-10"
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "course_id": 1,
  "player_name": "Ada Lovelace",
  "score": 70,
  "date_played": "2026-05-10"
}
```

If `course_id` does not match an existing course, the API returns `404 Not Found`:

```json
{
  "detail": "Course not found"
}
```
