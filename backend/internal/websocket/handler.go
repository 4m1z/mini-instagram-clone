package websocket

import (
	"log/slog"
	"net/http"
	"time"

	gorillaws "github.com/gorilla/websocket"
)

const (
	writeTimeout = 10 * time.Second
	pongTimeout  = 60 * time.Second
	pingInterval = 30 * time.Second
)

// Handler upgrades HTTP requests to WebSocket connections and registers them
// with the hub.
type Handler struct {
	hub      *Hub
	log      *slog.Logger
	upgrader gorillaws.Upgrader
}

func NewHandler(hub *Hub, log *slog.Logger) *Handler {
	return &Handler{
		hub: hub,
		log: log,
		upgrader: gorillaws.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			// The API is public and anonymous, so any origin may listen.
			CheckOrigin: func(*http.Request) bool { return true },
		},
	}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		// Upgrade already wrote an error response.
		h.log.Debug("websocket upgrade failed", "error", err)
		return
	}

	c := h.hub.add()
	go h.readLoop(conn, c)
	h.writeLoop(conn, c)
}

// readLoop discards incoming messages (clients only listen) but keeps the
// connection healthy and detects disconnects.
func (h *Handler) readLoop(conn *gorillaws.Conn, c *client) {
	defer h.hub.remove(c)

	conn.SetReadLimit(512)
	_ = conn.SetReadDeadline(time.Now().Add(pongTimeout))
	conn.SetPongHandler(func(string) error {
		return conn.SetReadDeadline(time.Now().Add(pongTimeout))
	})

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			return
		}
	}
}

func (h *Handler) writeLoop(conn *gorillaws.Conn, c *client) {
	ping := time.NewTicker(pingInterval)
	defer func() {
		ping.Stop()
		conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			if !ok {
				_ = conn.WriteControl(gorillaws.CloseMessage,
					gorillaws.FormatCloseMessage(gorillaws.CloseNormalClosure, ""),
					time.Now().Add(writeTimeout))
				return
			}
			_ = conn.SetWriteDeadline(time.Now().Add(writeTimeout))
			if err := conn.WriteMessage(gorillaws.TextMessage, msg); err != nil {
				return
			}
		case <-ping.C:
			_ = conn.SetWriteDeadline(time.Now().Add(writeTimeout))
			if err := conn.WriteMessage(gorillaws.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
