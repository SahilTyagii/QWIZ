package multiplayer

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"

	"github.com/SahilTyagii/qwiz-backend/models"
)

type Room struct {
	ID        string
	Clients   map[*Client]bool
	Questions []models.Question
	Started   bool
	Host      *Client
	Mutex     sync.Mutex
}

func GetRoom(roomID string) *Room {
	hub.Mutex.Lock()
	defer hub.Mutex.Unlock()
	room, exists := hub.Rooms[roomID]
	if !exists {
		room = &Room{
			ID:      roomID,
			Clients: make(map[*Client]bool),
		}
		hub.Rooms[roomID] = room
	}
	return room
}

func CreateRoom(w http.ResponseWriter, r *http.Request) {
	roomID := idGenerator(6)
	category := r.URL.Query().Get("category")
	difficulty := r.URL.Query().Get("difficulty")

	questions, err := fetchQuestions(category, difficulty)
	if err != nil {
		http.Error(w, "Failed to fetch questions", http.StatusInternalServerError)
		return
	}
	var newRoom struct {
		RoomID string `json:"roomID"`
	}
	newRoom.RoomID = roomID
	room := GetRoom(roomID)
	room.Questions = questions
	json.NewEncoder(w).Encode(newRoom)
}

func fetchQuestions(category string, difficulty string) ([]models.Question, error) {
	tokenURL := "https://opentdb.com/api_token.php?command=request"
	tokenResp, err := http.Get(tokenURL)
	if err != nil {
		return nil, err
	}
	defer tokenResp.Body.Close()
	var token struct {
		ResponseCode    int    `json:"response_code"`
		ResponseMessage string `json:"response_message"`
		Token           string `json:"token"`
	}

	url := fmt.Sprintf("https://opentdb.com/api.php?amount=30&category=%s&difficulty=%s&token=%s", category, difficulty, token.Token)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var triviaResponse models.TriviaResponse
	if err := json.NewDecoder(resp.Body).Decode(&triviaResponse); err != nil {
		return nil, err
	}
	return triviaResponse.Results, nil
}

func idGenerator(max int) string {
	b := make([]byte, max)
	n, err := io.ReadAtLeast(rand.Reader, b, max)
	if n != max {
		panic(err)
	}
	for i := 0; i < len(b); i++ {
		b[i] = table[int(b[i])%len(table)]
	}
	return string(b)
}

var table = [...]byte{'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'}
