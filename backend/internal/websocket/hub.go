package websocket

import (
	"encoding/json"
	"log/slog"
	"sync"
)

const clientBufferSize = 32

type Event struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

type client struct {
	send chan []byte
}

// Hub keeps track of connected clients and fans out events to them.
type Hub struct {
	mu      sync.RWMutex
	clients map[*client]struct{}
	log     *slog.Logger
}

func NewHub(log *slog.Logger) *Hub {
	return &Hub{clients: make(map[*client]struct{}), log: log}
}

// Broadcast marshals the event once and delivers it to every client.
func (h *Hub) Broadcast(event Event) {
	data, err := json.Marshal(event)
	if err != nil {
		h.log.Error("marshal ws event", "type", event.Type, "error", err)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()
	for c := range h.clients {
		select {
		case c.send <- data:
		default:
			// Slow or broken client: close its channel, the writer goroutine
			// will terminate and unregister it.
			h.log.Warn("dropping slow websocket client")
			close(c.send)
			delete(h.clients, c)
		}
	}
}

// ClientCount is used by the health endpoint and tests.
func (h *Hub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

func (h *Hub) add() *client {
	c := &client{send: make(chan []byte, clientBufferSize)}
	h.mu.Lock()
	h.clients[c] = struct{}{}
	h.mu.Unlock()
	return c
}

func (h *Hub) remove(c *client) {
	h.mu.Lock()
	if _, ok := h.clients[c]; ok {
		delete(h.clients, c)
		close(c.send)
	}
	h.mu.Unlock()
}
