package httpapi

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/4m1z/mini-instagram-clone/backend/internal/domain"
	"github.com/4m1z/mini-instagram-clone/backend/internal/service"
	"github.com/gin-gonic/gin"
)

const (
	codeValidation  = "validation_error"
	codeTooLarge    = "payload_too_large"
	codeNotFound    = "not_found"
	codeBadRequest  = "bad_request"
	codeUnsupported = "unsupported_media_type"
	codeInternal    = "internal_error"
)

type errorBody struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

type errorResponse struct {
	Error errorBody `json:"error"`
}

func writeError(c *gin.Context, status int, code, message string, fields map[string]string) {
	c.JSON(status, errorResponse{Error: errorBody{Code: code, Message: message, Fields: fields}})
}

func writeServiceError(c *gin.Context, log *slog.Logger, err error) {
	var validation *domain.ValidationError
	switch {
	case errors.As(err, &validation):
		fields := make(map[string]string, len(validation.Fields))
		for _, f := range validation.Fields {
			if _, exists := fields[f.Field]; !exists {
				fields[f.Field] = f.Message
			}
		}
		writeError(c, http.StatusUnprocessableEntity, codeValidation, "The submitted data is invalid.", fields)
	case errors.Is(err, service.ErrFileTooLarge):
		writeError(c, http.StatusRequestEntityTooLarge, codeTooLarge, "The image is too large (maximum 10 MB).", nil)
	case errors.Is(err, domain.ErrNotFound):
		writeError(c, http.StatusNotFound, codeNotFound, "The requested resource was not found.", nil)
	default:
		log.Error("unhandled request error", "error", err)
		writeError(c, http.StatusInternalServerError, codeInternal, "Something went wrong. Please try again.", nil)
	}
}
