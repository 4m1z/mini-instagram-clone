package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/4m1z/mini-instagram-clone/backend/internal/config"
	"github.com/4m1z/mini-instagram-clone/backend/internal/httpapi"
	"github.com/4m1z/mini-instagram-clone/backend/internal/repository"
	"github.com/4m1z/mini-instagram-clone/backend/internal/service"
	"github.com/4m1z/mini-instagram-clone/backend/internal/storage"
	"github.com/4m1z/mini-instagram-clone/backend/internal/websocket"
)

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

	err := run(log)
	if err != nil {
		log.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func run(log *slog.Logger) error {
	cfg := config.Load()

	db, err := repository.Open(cfg.DatabaseDSN)
	if err != nil {
		return err
	}
	defer db.Close()

	files, err := storage.NewLocalStore(cfg.UploadsDir)
	if err != nil {
		return err
	}

	hub := websocket.NewHub(log)
	mapper := httpapi.NewImageMapper(cfg.FilesPath)
	images := service.NewImageService(
		repository.NewImageRepository(db),
		files,
		httpapi.NewImageEventPublisher(hub, mapper),
	)

	router := httpapi.NewRouter(httpapi.RouterDeps{
		Images:    httpapi.NewImageHandler(images, mapper, log),
		WS:        websocket.NewHandler(hub, log),
		FilesDir:  files.Dir(),
		FilesPath: cfg.FilesPath,
		Log:       log,
	})

	srv := &http.Server{
		Addr:              cfg.Addr,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       60 * time.Second,
		WriteTimeout:      0, // WebSocket connections are long lived
		IdleTimeout:       120 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	errCh := make(chan error, 1)
	go func() {
		log.Info("listening", "addr", cfg.Addr, "uploads", cfg.UploadsDir, "db", cfg.DatabaseDSN)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
		log.Info("shutting down")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return srv.Shutdown(shutdownCtx)
	}
}
