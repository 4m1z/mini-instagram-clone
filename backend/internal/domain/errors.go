package domain

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

type FieldError struct {
	Field   string
	Message string
}

type ValidationError struct {
	Fields []FieldError
}

func (e *ValidationError) Error() string {
	if len(e.Fields) == 0 {
		return "validation failed"
	}
	return fmt.Sprintf("validation failed: %s %s", e.Fields[0].Field, e.Fields[0].Message)
}

func (e *ValidationError) Add(field, message string) {
	e.Fields = append(e.Fields, FieldError{Field: field, Message: message})
}

func (e *ValidationError) HasErrors() bool { return len(e.Fields) > 0 }

func (e *ValidationError) OrNil() error {
	if e.HasErrors() {
		return e
	}
	return nil
}
