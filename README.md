## Mini Instagram Clone

A small anonymous image-sharing app built with React 19, Go, SQLite, local file storage, REST, and WebSockets.

### Running

Prerequisite: Docker 

#### Development

```bash
docker compose -f docker-compose.dev.yml up --build
```
- App : http://localhost:3000
- Backend: http://localhost:8080

<details> <summary> db & uploaded files files </summary> 
- SQLite: `backend/data/app.db`
- Uploads: `backend/data/uploads/`
</details>


#### Production
```bash
docker compose up --build -d
```

- app: http://localhost:8000
- Backend: http://localhost:8080
<details><summary>production data</summary> Production data is stored in the `backend-data` Docker volume. It survives container restarts, rebuilds, and normal `docker compose down`/`up` cycles.
</details>


### Architecture

#### Backend & Infrastructure

- I use Gin for HTTP handlers, and the WebSocket hub manages live clients.
- The image service decodes and validates uploads, limits decoded dimensions, and normalizes images to bounded, metadata-free JPEGs before saving anything.
- I save image metadata in SQLite and image files on the filesystem.
- I broadcast a new image only after its file and metadata are saved successfully.
- In development, Vite and Air give us frontend and backend hot reload.
- In production, Bun/Vite builds the frontend, and nginx serves it and proxies API, file, and WebSocket traffic to Go.

#### Frontend

- I use React 19 form actions for image uploads and field errors.
- I use TanStack Query for server data and cache updates after uploads or live events.
- I keep the current page and selected tag in the URL query params.
- I map API DTOs to frontend types before components use them.
- I use one WebSocket connection for live updates, and it reconnects automatically.


### Bonus Features
- I added Docker for development and production.
- I use TanStack Query caching for the feed and tags.
- I normalize uploaded images before saving them.
- I spent some extra time on a responsive and polished UI.


### Documentation

See the [API reference](docs/API.md) 

I could add Swagger docs for the endpoints, but I skipped it for this small project.
