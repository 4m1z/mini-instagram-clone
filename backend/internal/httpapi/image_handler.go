package httpapi

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/4m1z/mini-instagram-clone/backend/internal/domain"
	"github.com/4m1z/mini-instagram-clone/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// maxRequestBody leaves a little room on top of the file limit for the
// multipart envelope and the text fields.
const maxRequestBody = service.MaxFileSizeBytes + (1 << 20)

const maxConcurrentUploads = 1

// ImageUseCases is the slice of the service layer this handler needs.
type ImageUseCases interface {
	Feed(ctx context.Context, tag string) ([]domain.Image, error)
	Tags(ctx context.Context) ([]string, error)
	Upload(ctx context.Context, in service.UploadImageInput) (domain.Image, error)
}

// ImageHandler is a thin HTTP adapter around ImageUseCases.
type ImageHandler struct {
	images  ImageUseCases
	mapper  ImageMapper
	log     *slog.Logger
	uploads chan struct{}
}

func NewImageHandler(images ImageUseCases, mapper ImageMapper, log *slog.Logger) *ImageHandler {
	return &ImageHandler{
		images:  images,
		mapper:  mapper,
		log:     log,
		uploads: make(chan struct{}, maxConcurrentUploads),
	}
}

// GET /api/images[?tag=]
func (h *ImageHandler) List(c *gin.Context) {
	images, err := h.images.Feed(c.Request.Context(), c.Query("tag"))
	if err != nil {
		writeServiceError(c, h.log, err)
		return
	}
	c.JSON(http.StatusOK, ImageListDTO{Images: h.mapper.ToDTOs(images)})
}

// GET /api/tags
func (h *ImageHandler) Tags(c *gin.Context) {
	tags, err := h.images.Tags(c.Request.Context())
	if err != nil {
		writeServiceError(c, h.log, err)
		return
	}
	if tags == nil {
		tags = []string{}
	}
	c.JSON(http.StatusOK, TagListDTO{Tags: tags})
}

// POST /api/uploads (multipart/form-data).
func (h *ImageHandler) Upload(c *gin.Context) {
	if c.ContentType() != "multipart/form-data" {
		c.JSON(http.StatusUnsupportedMediaType, errorResponse{Error: errorBody{Code: codeUnsupported, Message: "Expected a multipart/form-data request.", Fields: nil}})
		return
	}
	select {
	case h.uploads <- struct{}{}:
		defer func() { <-h.uploads }()
	default:
		c.Header("Retry-After", "1")
		c.JSON(http.StatusServiceUnavailable, errorResponse{Error: errorBody{Code: codeBusy, Message: "Another image is being processed. Please retry shortly.", Fields: nil}})
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		if isTooLarge(err) {
			writeServiceError(c, h.log, service.ErrFileTooLarge)
			return
		}
		c.JSON(http.StatusBadRequest, errorResponse{Error: errorBody{Code: codeBadRequest, Message: "The upload could not be read.", Fields: nil}})
		return
	}
	defer form.RemoveAll()

	in := service.UploadImageInput{
		Title: c.PostForm("title"),
		Tag:   c.PostForm("tag"),
	}
	files := form.File["image"]
	if len(files) > 1 {
		c.JSON(http.StatusUnprocessableEntity, errorResponse{Error: errorBody{Code: codeValidation, Message: "The submitted data is invalid.", Fields: map[string]string{"image": "only one image may be uploaded"}}})
		return
	}

	if len(files) == 1 {
		file, err := files[0].Open()
		if err != nil {
			c.JSON(http.StatusBadRequest, errorResponse{Error: errorBody{Code: codeBadRequest, Message: "The image could not be read.", Fields: nil}})
			return
		}
		defer file.Close()
		in.File = file
		in.Size = files[0].Size
	}

	img, err := h.images.Upload(c.Request.Context(), in)
	if err != nil {
		writeServiceError(c, h.log, err)
		return
	}
	c.JSON(http.StatusCreated, h.mapper.ToDTO(img))
}

func isTooLarge(err error) bool {
	var maxErr *http.MaxBytesError
	return errors.As(err, &maxErr) || strings.Contains(err.Error(), "too large")
}
