// Package repository contains the SQLite metadata persistence layer.
package repository

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite" // pure Go driver, no cgo needed
)

const schema = `
CREATE TABLE IF NOT EXISTS images (
	id          TEXT    PRIMARY KEY,
	title       TEXT    NOT NULL,
	tag         TEXT    NOT NULL,
	filename    TEXT    NOT NULL,
	mime_type   TEXT    NOT NULL,
	size_bytes  INTEGER NOT NULL,
	created_at  TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_images_tag_created_at ON images (tag, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images (created_at DESC);
`

// Open opens (and migrates) the SQLite database at path.
func Open(path string) (*sql.DB, error) {
	if dir := filepath.Dir(path); dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return nil, fmt.Errorf("create db dir: %w", err)
		}
	}

	dsn := path + "?_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)&_pragma=foreign_keys(1)"
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}
	// SQLite handles a single writer; keep the pool small and predictable.
	db.SetMaxOpenConns(1)

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping sqlite: %w", err)
	}
	if _, err := db.Exec(schema); err != nil {
		db.Close()
		return nil, fmt.Errorf("migrate sqlite: %w", err)
	}
	return db, nil
}
