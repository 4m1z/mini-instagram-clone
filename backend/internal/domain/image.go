package domain

import "time"

type Image struct {
	ID        string
	Title     string
	Tag       string
	Filename  string
	MimeType  string
	SizeBytes int64
	CreatedAt time.Time
}

type ImageFilter struct {
	Tag string
}
