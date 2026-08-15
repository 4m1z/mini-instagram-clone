package httpapi

import (
	"github.com/4m1z/mini-instagram-clone/backend/internal/domain"
	"github.com/4m1z/mini-instagram-clone/backend/internal/websocket"
)

const EventImageCreated = "image.created"

type Broadcaster interface {
	Broadcast(event websocket.Event)
}

type ImageEventPublisher struct {
	broadcaster Broadcaster
	mapper      ImageMapper
}

func NewImageEventPublisher(b Broadcaster, mapper ImageMapper) *ImageEventPublisher {
	return &ImageEventPublisher{broadcaster: b, mapper: mapper}
}

func (p *ImageEventPublisher) PublishImageCreated(img domain.Image) {
	p.broadcaster.Broadcast(websocket.Event{
		Type:    EventImageCreated,
		Payload: p.mapper.ToDTO(img),
	})
}
