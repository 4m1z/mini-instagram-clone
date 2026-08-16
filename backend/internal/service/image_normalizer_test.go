package service

import (
	"bytes"
	"encoding/binary"
	"hash/crc32"
	"image"
	"image/png"
	"strings"
	"testing"
)

func TestNormalizeImage(t *testing.T) {
	var source bytes.Buffer
	if err := png.Encode(&source, image.NewNRGBA(image.Rect(0, 0, 2000, 1000))); err != nil {
		t.Fatalf("encode fixture: %v", err)
	}

	output, err := normalizeImage(&source)
	if err != nil {
		t.Fatalf("normalizeImage() error = %v", err)
	}

	normalized, format, err := image.Decode(bytes.NewReader(output))
	if err != nil {
		t.Fatalf("decode output: %v", err)
	}
	if format != "jpeg" {
		t.Errorf("format = %q, want jpeg", format)
	}
	if got, want := normalized.Bounds().Size(), image.Pt(1600, 800); got != want {
		t.Errorf("dimensions = %v, want %v", got, want)
	}
	r, g, b, _ := normalized.At(0, 0).RGBA()
	if r < 0xf000 || g < 0xf000 || b < 0xf000 {
		t.Errorf("transparent background was not flattened onto white")
	}
}

func TestNormalizeImageRejectsExcessiveDimensions(t *testing.T) {
	_, err := normalizeImage(bytes.NewReader(pngHeader(5001, 5000)))
	if err == nil || !strings.Contains(err.Error(), "maximum 25 megapixels") {
		t.Fatalf("error = %v, want maximum dimensions validation error", err)
	}
}

func pngHeader(width, height uint32) []byte {
	var buf bytes.Buffer
	buf.Write([]byte("\x89PNG\r\n\x1a\n"))

	payload := make([]byte, 13)
	binary.BigEndian.PutUint32(payload[0:4], width)
	binary.BigEndian.PutUint32(payload[4:8], height)
	payload[8] = 8
	payload[9] = 2

	binary.Write(&buf, binary.BigEndian, uint32(len(payload)))
	buf.WriteString("IHDR")
	buf.Write(payload)
	checksum := crc32.NewIEEE()
	checksum.Write([]byte("IHDR"))
	checksum.Write(payload)
	binary.Write(&buf, binary.BigEndian, checksum.Sum32())
	return buf.Bytes()
}
