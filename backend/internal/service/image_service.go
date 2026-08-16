package service

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/4m1z/mini-instagram-clone/backend/internal/domain"
)

const (
	MaxFileSizeBytes = 10 << 20 // 10 MiB
	MaxTitleLength   = 120
	MaxTagLength     = 32
)

var ErrFileTooLarge = errors.New("file too large")

type ImageRepository interface {
	Create(ctx context.Context, img domain.Image) error
	List(ctx context.Context, filter domain.ImageFilter) ([]domain.Image, error)
	Tags(ctx context.Context) ([]string, error)
}

type FileStore interface {
	Save(name string, r io.Reader) error
	Delete(name string) error
}

type ImagePublisher interface {
	PublishImageCreated(img domain.Image)
}

type UploadImageInput struct {
	Title string
	Tag   string
	File  io.Reader
	Size  int64
}

type ImageService struct {
	repo               ImageRepository
	files              FileStore
	publisher          ImagePublisher
	now                func() time.Time
}

func NewImageService(repo ImageRepository, files FileStore, publisher ImagePublisher) *ImageService {
	return &ImageService{
		repo:               repo,
		files:              files,
		publisher:          publisher,
		now:                time.Now,
	}
}

func (s *ImageService) Feed(ctx context.Context, tag string) ([]domain.Image, error) {
	return s.repo.List(ctx, domain.ImageFilter{Tag: NormalizeTag(tag)})
}

func (s *ImageService) Tags(ctx context.Context) ([]string, error) {
	return s.repo.Tags(ctx)
}

func (s *ImageService) Upload(ctx context.Context, in UploadImageInput) (domain.Image, error) {
	title := strings.TrimSpace(in.Title)
	tag := NormalizeTag(in.Tag)

	v := &domain.ValidationError{}
	validateTitle(v, title)
	validateTag(v, tag)
	if in.File == nil {
		v.Add("image", "an image file is required")
	}
	if err := v.OrNil(); err != nil {
		return domain.Image{}, err
	}
	if in.Size > MaxFileSizeBytes {
		return domain.Image{}, ErrFileTooLarge
	}
	if err := ctx.Err(); err != nil {
		return domain.Image{}, err
	}

	body, err := normalizeImage(in.File)
	if err != nil {
		return domain.Image{}, err
	}
	if err := ctx.Err(); err != nil {
		return domain.Image{}, err
	}

	id, err := newID()
	if err != nil {
		return domain.Image{}, err
	}

	img := domain.Image{
		ID:        id,
		Title:     title,
		Tag:       tag,
		Filename:  id + normalizedExtension,
		MimeType:  normalizedMimeType,
		SizeBytes: int64(len(body)),
		CreatedAt: s.now().UTC(),
	}

	if err := s.files.Save(img.Filename, bytes.NewReader(body)); err != nil {
		return domain.Image{}, fmt.Errorf("store file: %w", err)
	}
	if err := s.repo.Create(ctx, img); err != nil {
		// Keep storage and metadata consistent.
		_ = s.files.Delete(img.Filename)
		return domain.Image{}, fmt.Errorf("persist image: %w", err)
	}

	if s.publisher != nil {
		s.publisher.PublishImageCreated(img)
	}
	return img, nil
}

func NormalizeTag(tag string) string {
	return strings.ToLower(strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(tag), "#")))
}

func validateTitle(v *domain.ValidationError, title string) {
	switch {
	case title == "":
		v.Add("title", "a title is required")
	case utf8.RuneCountInString(title) > MaxTitleLength:
		v.Add("title", fmt.Sprintf("must be at most %d characters", MaxTitleLength))
	}
}

func validateTag(v *domain.ValidationError, tag string) {
	switch {
	case tag == "":
		v.Add("tag", "a tag is required")
	case utf8.RuneCountInString(tag) > MaxTagLength:
		v.Add("tag", fmt.Sprintf("must be at most %d characters", MaxTagLength))
	}
}

func newID() (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("generate id: %w", err)
	}
	return hex.EncodeToString(buf), nil
}
