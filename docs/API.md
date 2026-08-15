
### `GET /api/health`

Returns `200` when the backend is running:

```json
{"status":"ok"}
```

### `GET /api/images`

Returns images newest first. Pass an optional exact tag filter, for example `/api/images?tag=nature`.

```json
{
  "images": [
    {
      "id": "...",
      "title": "Sunset",
      "tag": "nature",
      "imageUrl": "/files/image-id.jpg",
      "createdAt": "2026-08-15T12:00:00Z"
    }
  ]
}
```

### `GET /api/tags`

Returns distinct tags in alphabetical order:

```json
{"tags":["city","nature"]}
```

### `POST /api/uploads`

Accepts `multipart/form-data` with these fields:

- `title`: required, max: 120 chars 
- `tag`: required, max 32 chars
- `image`: one JPEG, PNG, GIF, or WEBP file, max 10 MB

Tags are trimmed, lowercased, and stored without a leading `#`.

A successful upload returns `201`:

```json
{
  "id": "...",
  "title": "Sunset",
  "tag": "nature",
  "imageUrl": "/files/image-id.jpg",
  "createdAt": "2026-08-15T12:00:00Z"
}
```

Common errors are `413` for an oversized upload, `415` for the wrong request media type, `422` for invalid fields or image content, and `500` for an internal failure.

### `GET /files/{filename}`

Returns the stored image with `200`, or `404` when it does not exist.

### `GET /api/ws`

Upgrades to a WebSocket connection. Each persisted upload broadcasts:

```json
{
  "type": "image.created",
  "payload": {
    "id": "...",
    "title": "Sunset",
    "tag": "nature",
    "imageUrl": "/files/image-id.jpg",
    "createdAt": "2026-08-15T12:00:00Z"
  }
}
```
