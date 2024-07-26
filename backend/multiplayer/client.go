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
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err != nil {
			fmt.Println("Error unmarshalling message:", err)
			continue
		}
		if action, ok := msg["action"].(string); ok {
			switch action {
			case "answer":
				c.handleAnswer(msg)
			case "start_game":
				c.handleStartGame()
			}
		}
		fmt.Println("Message:", string(message))
	}
}

func (c *Client) handleStartGame() {
	c.Room.Mutex.Lock()
	defer c.Room.Mutex.Unlock()

	if c.Room.Host == c {
		if len(c.Room.Questions) > 0 {
			initialQuestion := c.Room.Questions[0]
			c.broadcastState("initial_question", initialQuestion)
		}
	}
}

func (c *Client) broadcastState(action string, data interface{}) {
	c.Room.Mutex.Lock()
	defer c.Room.Mutex.Unlock()

	response := map[string]interface{}{
		"action": action,
	}
	if data != nil {
		response["data"] = data
	}
	respJSON, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Error marshalling json:", err)
	}

	for client := range c.Room.Clients {
		client.Send <- respJSON
	}
}

func (c *Client) handleAnswer(msg map[string]interface{}) {
	answer, _ := msg["answer"].(string)
	question := c.Room.Questions[c.State.CurrentQuestion]

	if answer == question.CorrectAnswer {
		c.State.Score++
	}

	c.State.CurrentQuestion++
	if c.State.CurrentQuestion < len(c.Room.Questions) {
		nextQuestion := c.Room.Questions[c.State.CurrentQuestion]
		c.broadcastState("next_question", nextQuestion)
	} else {
		c.broadcastState("game_over", map[string]interface{}{
			"score": c.State.Score,
		})
	}
}

func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
	}()
	for message := range c.Send {
		err := c.Conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			fmt.Println("Error writing message:", err)
			break
		}
	}
}
