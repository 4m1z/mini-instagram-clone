package service

import (
	"bufio"
	"bytes"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"strings"

	"github.com/4m1z/mini-instagram-clone/backend/internal/domain"
	"github.com/disintegration/imaging"
	_ "golang.org/x/image/webp"
)

const (
	maxSourcePixels             = 25_000_000
	normalizedMaxDimension      = 1600
	normalizedJPEGQuality       = 85
	normalizedMimeType          = "image/jpeg"
	normalizedExtension         = ".jpg"
)

var allowedMimeTypes = map[string]struct{}{
	"image/jpeg": {},
	"image/png":  {},
	"image/gif":  {},
	"image/webp": {},
}

func normalizeImage(r io.Reader) ([]byte, error) {
	reader := bufio.NewReader(r)
	head, err := reader.Peek(512)
	if err != nil && !errors.Is(err, io.EOF) {
		return nil, fmt.Errorf("read upload: %w", err)
	}

	mimeType, _, _ := strings.Cut(http.DetectContentType(head), ";")
	if _, ok := allowedMimeTypes[mimeType]; !ok {
		return nil, invalidImageError()
	}

	var consumed bytes.Buffer
	config, _, err := image.DecodeConfig(io.TeeReader(reader, &consumed))
	if err != nil {
		return nil, invalidImageError()
	}
	if config.Width <= 0 || config.Height <= 0 || int64(config.Width) > maxSourcePixels/int64(config.Height) {
		return nil, invalidImageDimensionsError()
	}

	content := io.MultiReader(bytes.NewReader(consumed.Bytes()), reader)
	var source image.Image
	if mimeType == "image/gif" {
		source, err = decodeGIFCanvas(content, config)
	} else {
		source, err = imaging.Decode(content, imaging.AutoOrientation(true))
	}
	if err != nil {
		return nil, invalidImageError()
	}

	resized := imaging.Fit(source, normalizedMaxDimension, normalizedMaxDimension, imaging.Lanczos)
	canvas := imaging.New(resized.Bounds().Dx(), resized.Bounds().Dy(), color.White)
	normalized := imaging.Overlay(canvas, resized, image.Point{}, 1)

	var output bytes.Buffer
	if err := imaging.Encode(&output, normalized, imaging.JPEG, imaging.JPEGQuality(normalizedJPEGQuality)); err != nil {
		return nil, fmt.Errorf("encode normalized image: %w", err)
	}
	return output.Bytes(), nil
}

func decodeGIFCanvas(r io.Reader, config image.Config) (image.Image, error) {
	frame, err := gif.Decode(r)
	if err != nil {
		return nil, invalidImageError()
	}

	canvas := imaging.New(config.Width, config.Height, color.Transparent)
	return imaging.Overlay(canvas, frame, frame.Bounds().Min, 1), nil
}

func invalidImageError() error {
	v := &domain.ValidationError{}
	v.Add("image", "unsupported or invalid image, allowed: JPEG, PNG, GIF, static WEBP")
	return v
}

func invalidImageDimensionsError() error {
	v := &domain.ValidationError{}
	v.Add("image", "image dimensions are too large (maximum 25 megapixels)")
	return v
}
