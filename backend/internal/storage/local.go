package storage

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

type LocalStore struct {
	dir string
}

func NewLocalStore(dir string) (*LocalStore, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("create storage dir: %w", err)
	}
	return &LocalStore{dir: dir}, nil
}

func (s *LocalStore) Dir() string { return s.dir }

func (s *LocalStore) Save(name string, r io.Reader) error {
	path, err := s.resolve(name)
	if err != nil {
		return err
	}

	f, err := os.CreateTemp(s.dir, ".upload-*")
	if err != nil {
		return fmt.Errorf("create temp file: %w", err)
	}
	tempPath := f.Name()
	defer os.Remove(tempPath)

	if _, err := io.Copy(f, r); err != nil {
		f.Close()
		return fmt.Errorf("write file: %w", err)
	}
	if err := f.Chmod(0o644); err != nil {
		f.Close()
		return fmt.Errorf("set file permissions: %w", err)
	}
	if err := f.Close(); err != nil {
		return fmt.Errorf("close file: %w", err)
	}
	if err := os.Rename(tempPath, path); err != nil {
		return fmt.Errorf("publish file: %w", err)
	}
	return nil
}

func (s *LocalStore) Delete(name string) error {
	path, err := s.resolve(name)
	if err != nil {
		return err
	}
	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("delete file: %w", err)
	}
	return nil
}

// resolve guards against path traversal and separators in the file name.
func (s *LocalStore) resolve(name string) (string, error) {
	if name == "" || name != filepath.Base(name) || strings.ContainsAny(name, `/\`) || name == "." || name == ".." {
		return "", fmt.Errorf("invalid file name %q", name)
	}
	return filepath.Join(s.dir, name), nil
}
