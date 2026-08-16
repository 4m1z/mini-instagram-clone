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
	codeBusy        = "service_busy"
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
		c.JSON(http.StatusUnprocessableEntity, errorResponse{Error: errorBody{Code: codeValidation, Message: "The submitted data is invalid.", Fields: fields}})
	case errors.Is(err, service.ErrFileTooLarge):
		c.JSON(http.StatusRequestEntityTooLarge, errorResponse{Error: errorBody{Code: codeTooLarge, Message: "The image is too large (maximum 10 MB).", Fields: nil}})
	case errors.Is(err, domain.ErrNotFound):
		c.JSON(http.StatusNotFound, errorResponse{Error: errorBody{Code: codeNotFound, Message: "The requested resource was not found.", Fields: nil}})
	default:
		log.Error("unhandled request error", "error", err)
		c.JSON(http.StatusInternalServerError, errorResponse{Error: errorBody{Code: codeInternal, Message: "Something went wrong. Please try again.", Fields: nil}})
	}
}
