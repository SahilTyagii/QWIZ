package multiplayer

import (
	"encoding/json"
	"fmt"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn     *websocket.Conn
	Send     chan []byte
	Username string
	Avatar   string
	State    *PlayerState
	Hub      *Hub
	Room     *Room
}

type PlayerState struct {
	CurrentQuestion int
	Score           int
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}
		// Handle message, update player state, etc
		fmt.Println("Received message from client:", string(message))
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err != nil {
			fmt.Println("Error unmarshalling message:", err)
			continue
		}
		if action, ok := msg["action"].(string); ok {
			switch action {
			case "start_game":
				c.handleStartGame()
			case "wrong_answer":
				c.handleAnswer(false)
			case "correct_answer":
				c.handleAnswer(true)
			}
		}
		fmt.Println("Message:", string(message))
	}
}

func (c *Client) handleStartGame() {

	fmt.Println("Host:", c.Room.Host.Username)
	if c.Room.Host == c {
		fmt.Println("Client is host, starting game")
		if len(c.Room.Questions) > 0 {
			c.Room.Mutex.Lock()
			// initialQuestion := c.Room.Questions[0]
			questions := c.Room.Questions
			c.Room.Mutex.Unlock()
			fmt.Println("Broadcasting initial question:")
			c.broadcastState("initial_question", questions)
		} else {
			fmt.Println("No questions available to start the game")
		}
	} else {
		fmt.Println("Client is not host, cannot start game")
	}
}

func (c *Client) broadcastState(action string, data interface{}) {
	response := map[string]interface{}{
		"action": action,
		"data":   data,
	}
	respJSON, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Error marshalling json:", err)
		return
	}
	// fmt.Println("Broadcasting JSON:", string(respJSON))

	// Lock only for reading the clients
	c.Room.Mutex.Lock()
	clients := make([]*Client, 0, len(c.Room.Clients))
	for client := range c.Room.Clients {
		clients = append(clients, client)
	}
	c.Room.Mutex.Unlock()

	for _, client := range clients {
		select {
		case client.Send <- respJSON:
			fmt.Println("Sent message to client:", client.Username)
		default:
			fmt.Println("Failed to send message to client:", client.Username)
		}
	}
}

func (c *Client) handleAnswer(correct bool) {
	if correct {
		c.State.Score++
	}

	c.State.CurrentQuestion++

	c.broadcastState("player_state", map[string]interface{}{
		"player": c.Username,
		"state":  c.State,
	})
}

func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			// fmt.Println("Writing message to WebSocket:", string(message))
			err := c.Conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				fmt.Println("Error writing message:", err)
				return
			}
		}
	}
}
