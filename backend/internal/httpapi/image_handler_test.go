package httpapi

import (
	"bytes"
	"context"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/4m1z/mini-instagram-clone/backend/internal/domain"
	"github.com/4m1z/mini-instagram-clone/backend/internal/service"
	"github.com/gin-gonic/gin"
)

func TestImageHandlerRejectsConcurrentUploadBeforeParsing(t *testing.T) {
	useCases := &blockingImageUseCases{
		started: make(chan struct{}),
		release: make(chan struct{}),
	}
	handler := NewImageHandler(
		useCases,
		NewImageMapper("/files/"),
		slog.New(slog.NewTextHandler(io.Discard, nil)),
	)

	firstContext, firstResponse := uploadContext(t)
	firstDone := make(chan struct{})
	go func() {
		handler.Upload(firstContext)
		close(firstDone)
	}()
	<-useCases.started

	secondResponse := httptest.NewRecorder()
	secondContext, _ := gin.CreateTestContext(secondResponse)
	secondContext.Request = httptest.NewRequest(http.MethodPost, "/api/uploads", http.NoBody)
	secondContext.Request.Header.Set("Content-Type", "multipart/form-data; boundary=unused")
	handler.Upload(secondContext)

	if secondResponse.Code != http.StatusServiceUnavailable {
		t.Errorf("concurrent status = %d, want %d", secondResponse.Code, http.StatusServiceUnavailable)
	}
	if got := secondResponse.Header().Get("Retry-After"); got != "1" {
		t.Errorf("Retry-After = %q, want 1", got)
	}
	if !strings.Contains(secondResponse.Body.String(), `"code":"service_busy"`) {
		t.Errorf("response body = %s, want service_busy error", secondResponse.Body.String())
	}

	close(useCases.release)
	<-firstDone
	if firstResponse.Code != http.StatusCreated {
		t.Errorf("first upload status = %d, want %d", firstResponse.Code, http.StatusCreated)
	}
}

func uploadContext(t *testing.T) (*gin.Context, *httptest.ResponseRecorder) {
	t.Helper()
	var body bytes.Buffer
	form := multipart.NewWriter(&body)
	if err := form.WriteField("title", "Landscape"); err != nil {
		t.Fatalf("write title: %v", err)
	}
	if err := form.WriteField("tag", "nature"); err != nil {
		t.Fatalf("write tag: %v", err)
	}
	file, err := form.CreateFormFile("image", "landscape.png")
	if err != nil {
		t.Fatalf("create image field: %v", err)
	}
	if _, err := file.Write([]byte("fixture")); err != nil {
		t.Fatalf("write image field: %v", err)
	}
	if err := form.Close(); err != nil {
		t.Fatalf("close multipart form: %v", err)
	}

	response := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(response)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/uploads", &body)
	c.Request.Header.Set("Content-Type", form.FormDataContentType())
	return c, response
}

type blockingImageUseCases struct {
	started chan struct{}
	release chan struct{}
}

func (u *blockingImageUseCases) Feed(context.Context, string) ([]domain.Image, error) {
	return nil, nil
}

func (u *blockingImageUseCases) Tags(context.Context) ([]string, error) {
	return nil, nil
}

func (u *blockingImageUseCases) Upload(context.Context, service.UploadImageInput) (domain.Image, error) {
	close(u.started)
	<-u.release
	return domain.Image{}, nil
}
