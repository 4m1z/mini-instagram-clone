package httpapi

import (
	"time"

	"github.com/4m1z/mini-instagram-clone/backend/internal/domain"
)

type ImageDTO struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Tag       string `json:"tag"`
	ImageURL  string `json:"imageUrl"`
	CreatedAt string `json:"createdAt"`
}

type ImageListDTO struct {
	Images []ImageDTO `json:"images"`
}

type TagListDTO struct {
	Tags []string `json:"tags"`
}

type ImageMapper struct {
	filesPrefix string // e.g. "/files/"
}

func NewImageMapper(filesPrefix string) ImageMapper {
	return ImageMapper{filesPrefix: filesPrefix}
}

func (m ImageMapper) ToDTO(img domain.Image) ImageDTO {
	return ImageDTO{
		ID:        img.ID,
		Title:     img.Title,
		Tag:       img.Tag,
		ImageURL:  m.filesPrefix + img.Filename,
		CreatedAt: img.CreatedAt.UTC().Format(time.RFC3339),
	}
}

func (m ImageMapper) ToDTOs(images []domain.Image) []ImageDTO {
	out := make([]ImageDTO, 0, len(images))
	for _, img := range images {
		out = append(out, m.ToDTO(img))
	}
	return out
}
