package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/4m1z/mini-instagram-clone/backend/internal/domain"
)

type ImageRepository struct {
	db *sql.DB
}

func NewImageRepository(db *sql.DB) *ImageRepository { return &ImageRepository{db: db} }

func (r *ImageRepository) Create(ctx context.Context, img domain.Image) error {
	const q = `INSERT INTO images (id, title, tag, filename, mime_type, size_bytes, created_at)
	           VALUES (?, ?, ?, ?, ?, ?, ?)`
	_, err := r.db.ExecContext(ctx, q,
		img.ID, img.Title, img.Tag, img.Filename, img.MimeType, img.SizeBytes,
		img.CreatedAt.UTC().Format(time.RFC3339Nano),
	)
	if err != nil {
		return fmt.Errorf("insert image: %w", err)
	}
	return nil
}

func (r *ImageRepository) List(ctx context.Context, f domain.ImageFilter) ([]domain.Image, error) {
	q := `SELECT id, title, tag, filename, mime_type, size_bytes, created_at FROM images`
	args := []any{}
	if f.Tag != "" {
		q += ` WHERE tag = ?`
		args = append(args, f.Tag)
	}
	q += ` ORDER BY created_at DESC, id DESC`

	rows, err := r.db.QueryContext(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("query images: %w", err)
	}
	defer rows.Close()

	images := make([]domain.Image, 0, 32)
	for rows.Next() {
		img, err := scanImage(rows)
		if err != nil {
			return nil, err
		}
		images = append(images, img)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate images: %w", err)
	}
	return images, nil
}

func (r *ImageRepository) Tags(ctx context.Context) ([]string, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT DISTINCT tag FROM images ORDER BY tag ASC`)
	if err != nil {
		return nil, fmt.Errorf("query tags: %w", err)
	}
	defer rows.Close()

	tags := make([]string, 0, 16)
	for rows.Next() {
		var tag string
		if err := rows.Scan(&tag); err != nil {
			return nil, fmt.Errorf("scan tag: %w", err)
		}
		tags = append(tags, tag)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate tags: %w", err)
	}
	return tags, nil
}

func scanImage(rows *sql.Rows) (domain.Image, error) {
	var (
		img       domain.Image
		createdAt string
	)
	if err := rows.Scan(&img.ID, &img.Title, &img.Tag, &img.Filename, &img.MimeType, &img.SizeBytes, &createdAt); err != nil {
		return domain.Image{}, fmt.Errorf("scan image: %w", err)
	}
	ts, err := time.Parse(time.RFC3339Nano, createdAt)
	if err != nil {
		return domain.Image{}, fmt.Errorf("parse created_at: %w", err)
	}
	img.CreatedAt = ts.UTC()
	return img, nil
}
