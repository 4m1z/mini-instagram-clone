package httpapi

import (
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type RouterDeps struct {
	Images    *ImageHandler
	FilesDir  string
	FilesPath string // e.g. "/files/"
	Log       *slog.Logger
}

func NewRouter(d RouterDeps) http.Handler {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.MaxMultipartMemory = 4 << 20
	router.HandleMethodNotAllowed = true
	router.Use(withCORS(), requestLogger(d.Log), recoverPanics(d.Log))

	api := router.Group("/api")
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	api.GET("/images", d.Images.List)
	api.GET("/tags", d.Images.Tags)
	api.POST("/uploads", d.Images.Upload)

	filesPath := strings.TrimSuffix(d.FilesPath, "/")
	files := http.StripPrefix(filesPath, http.FileServer(http.Dir(d.FilesDir)))
	serveFile := func(c *gin.Context) {
		if c.Param("filepath") == "/" {
			writeError(c, http.StatusNotFound, codeNotFound, "The requested resource was not found.", nil)
			return
		}
		files.ServeHTTP(c.Writer, c.Request)
	}
	router.GET(filesPath+"/*filepath", serveFile)
	router.HEAD(filesPath+"/*filepath", serveFile)

	router.NoRoute(func(c *gin.Context) {
		writeError(c, http.StatusNotFound, codeNotFound, "The requested resource was not found.", nil)
	})
	router.NoMethod(func(c *gin.Context) {
		writeError(c, http.StatusMethodNotAllowed, codeBadRequest, "The request method is not allowed.", nil)
	})

	// Gin's multipart setting controls memory usage, not total request size.
	// This outer limit rejects oversized and chunked bodies for every route.
	return http.MaxBytesHandler(router, maxRequestBody)
}

func withCORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func requestLogger(log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		log.Info("request",
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"duration", time.Since(start).String(),
		)
	}
}

func recoverPanics(log *slog.Logger) gin.HandlerFunc {
	return gin.CustomRecoveryWithWriter(io.Discard, func(c *gin.Context, recovered any) {
		log.Error("panic recovered", "path", c.Request.URL.Path, "panic", recovered)
		writeError(c, http.StatusInternalServerError, codeInternal,
			"Something went wrong. Please try again.", nil)
	})
}
