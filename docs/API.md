### `GET /api/health`

Checks if the backend is running.

```json
{"status":"ok"}
```

### `GET /api/images`

Returns uploaded images, newest first. Optional: `?tag=nature`

```json
{
  "images": [
    {
      "id": "...",
      "title": "...",
      "tag": "...",
      "imageUrl": "...",
      "createdAt": "..."
    }
  ]
}
```

### `GET /api/tags`

Returns all available tags.

```json
{"tags":["city","nature"]}
```

### `POST /api/uploads`

Uploads a new image.

`multipart/form-data`

- `title` — max 120
- `tag` — max 32
- `image` — JPEG, PNG, GIF, WEBP, max 10 MB

```json
{
  "id": "...",
  "title": "...",
  "tag": "...",
  "imageUrl": "...",
  "createdAt": "..."
}
```

### `GET /files/{filename}`

Returns a stored image, or `404` if not found.

### `GET /api/ws`

WebSocket endpoint for new image events.

```json
{
  "type": "image.created",
  "payload": {
    "id": "...",
    "title": "...",
    "tag": "...",
    "imageUrl": "...",
    "createdAt": "..."
  }
}
```