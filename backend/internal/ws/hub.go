package ws

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
)

type Hub struct {
	mu    sync.RWMutex
	rooms map[string]map[*websocket.Conn]bool
}

func NewHub() *Hub {
	return &Hub{rooms: map[string]map[*websocket.Conn]bool{}}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(_ *http.Request) bool {
		return true
	},
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	pentestID := chi.URLParam(r, "id")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	h.mu.Lock()
	if _, ok := h.rooms[pentestID]; !ok {
		h.rooms[pentestID] = map[*websocket.Conn]bool{}
	}
	h.rooms[pentestID][conn] = true
	h.mu.Unlock()

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}

	h.mu.Lock()
	delete(h.rooms[pentestID], conn)
	if len(h.rooms[pentestID]) == 0 {
		delete(h.rooms, pentestID)
	}
	h.mu.Unlock()
	_ = conn.Close()
}

func (h *Hub) Broadcast(pentestID, level, message string) {
	h.mu.RLock()
	clients := h.rooms[pentestID]
	h.mu.RUnlock()
	if len(clients) == 0 {
		return
	}

	payload, _ := json.Marshal(map[string]string{
		"time":    time.Now().UTC().Format(time.RFC3339),
		"level":   level,
		"message": message,
	})

	for conn := range clients {
		if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
			_ = conn.Close()
		}
	}
}
