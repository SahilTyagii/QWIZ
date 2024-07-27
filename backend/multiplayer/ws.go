package multiplayer

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

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
	avatar := params["avatar"]
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading to Websocket:", err)
		return
	}
	fmt.Println("WebSocket connection upgraded for user:", username, "in room:", roomID)
	client := &Client{
		Conn:     conn,
		Send:     make(chan []byte, 256),
		Username: username,
		Avatar:   avatar,
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

	// Send initial message to the client
	welcomeMsg := map[string]interface{}{
		"action":  "waiting_for_players",
		"message": "Welcome to the game room. Waiting for more players...",
	}
	respJSON, err := json.Marshal(welcomeMsg)
	if err != nil {
		fmt.Println("Error marshalling json", err)
	}
	fmt.Println("Sending initial message to client:", string(respJSON))
	client.Send <- respJSON
	fmt.Println("Message sent to client")

	// Broadcast to all clients in the room about the new player
	client.handlePlayerJoined()
	client.broadcastState("set_host", map[string]interface{}{
		"host": client.Room.Host.Username,
	})
}

func (c *Client) handlePlayerJoined() {
	allClientData := c.Room.GetAllClientsData()

	c.broadcastState("player_joined", map[string]interface{}{
		"clients": allClientData,
	})
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			fmt.Println("Registering client: ", client.Username)
			client.Room.Mutex.Lock()
			client.Room.Clients[client] = true
			if client.Room.Host == nil {
				client.Room.Host = client
			}
			client.Room.Mutex.Unlock()
			fmt.Println("Registered client succesfully: ", client.Username)
		case client := <-h.Unregister:
			fmt.Println("Unregistering client: ", client.Username)
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
	go MonitorRoomExpiration(hub.Rooms, 10*time.Minute)
}
