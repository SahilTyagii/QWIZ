package multiplayer

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Hub struct {
	Rooms      map[string]*Room
	Register   chan *Client
	Unregister chan *Client
	Mutex      sync.Mutex
}

var hub = Hub{
	Rooms:      make(map[string]*Room),
	Register:   make(chan *Client),
	Unregister: make(chan *Client),
}

func ServeWs(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	roomID := params["roomID"]
	username := params["username"]
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading to Websocket:", err)
		return
	}
	client := &Client{
		Conn:     conn,
		Send:     make(chan []byte, 256),
		Username: username,
		State:    &PlayerState{CurrentQuestion: 0, Score: 0},
		Hub:      &hub,
		Room:     GetRoom(roomID),
	}

	client.Room.Mutex.Lock()
	client.Room.Clients[client] = true
	if client.Room.Host == nil {
		client.Room.Host = client
	}
	client.Room.Mutex.Unlock()

	go client.ReadPump()
	go client.WritePump()
	hub.Register <- client

	if !client.Room.Started {
		welcomeMsg := map[string]interface{}{
			"action": "waiting_for_players",
		}
		respJSON, err := json.Marshal(welcomeMsg)
		if err != nil {
			fmt.Println("Error marshalling json", err)
		}
		client.Send <- respJSON
		client.broadcastState("player", map[string]interface{}{
			"username": client.Username,
		})
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Unregister:
			client.Room.Mutex.Lock()
			if _, ok := client.Room.Clients[client]; ok {
				delete(client.Room.Clients, client)
				close(client.Send)
			}
			client.Room.Mutex.Unlock()
		}
	}
}

func init() {
	go hub.Run()
}
