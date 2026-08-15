package config

import (
	"os"
	"strings"
)

type Config struct {
	Addr        string
	DatabaseDSN string
	UploadsDir  string
	FilesPath   string
}

func Load() Config {
	return Config{
		Addr:        env("APP_ADDR", ":8080"),
		DatabaseDSN: env("APP_DB_PATH", "./data/app.db"),
		UploadsDir:  env("APP_UPLOADS_DIR", "./data/uploads"),
		FilesPath:   ensureSlashes(env("APP_FILES_PATH", "/files/")),
	}
}

func env(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func ensureSlashes(p string) string {
	if !strings.HasPrefix(p, "/") {
		p = "/" + p
	}
	if !strings.HasSuffix(p, "/") {
		p += "/"
	}
	return p
}
