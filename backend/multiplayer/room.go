package multiplayer

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/SahilTyagii/qwiz-backend/models"
)

type Room struct {
	ID           string
	Clients      map[*Client]bool
	Questions    []models.Question
	Started      bool
	Host         *Client
	CreationTime time.Time
	Mutex        sync.Mutex
}

func GetRoom(roomID string) *Room {
	hub.Mutex.Lock()
	defer hub.Mutex.Unlock()
	room, exists := hub.Rooms[roomID]
	if !exists {
		room = &Room{
			ID:           roomID,
			Clients:      make(map[*Client]bool),
			CreationTime: time.Now(),
		}
		hub.Rooms[roomID] = room
	}
	fmt.Println("Room retrieved or created:", roomID)
	return room
}

func CreateRoom(w http.ResponseWriter, r *http.Request) {
	roomID := idGenerator(6)
	var requestBody struct {
		QuestionURL string `json:"questionURL"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	fmt.Println(requestBody.QuestionURL)
	questions, err := fetchQuestions(requestBody.QuestionURL)
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

func fetchQuestions(questionURL string) ([]models.Question, error) {
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

	if err := json.NewDecoder(tokenResp.Body).Decode(&token); err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s&token=%s", questionURL, token.Token)
	fmt.Println(url)
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

func (r *Room) GetAllClientsData() []map[string]string {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	var clientsData []map[string]string
	for client := range r.Clients {
		clientData := map[string]string{
			"username": client.Username,
			"avatar":   client.Avatar,
		}
		clientsData = append(clientsData, clientData)
	}
	return clientsData
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

func MonitorRoomExpiration(rooms map[string]*Room, expirationDuration time.Duration) {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			now := time.Now()
			hub.Mutex.Lock()
			for roomID, room := range rooms {
				room.Mutex.Lock()
				age := now.Sub(room.CreationTime)
				room.Mutex.Unlock()

				if age > expirationDuration {
					deleteRoom(roomID)
				}
			}
			hub.Mutex.Unlock()
		}
	}
}

func deleteRoom(roomID string) {
	hub.Mutex.Lock()
	defer hub.Mutex.Unlock()

	room, exists := hub.Rooms[roomID]
	if !exists {
		return
	}

	fmt.Println("Deleting room: ", roomID)
	for client := range room.Clients {
		client.Conn.Close()
	}
	delete(hub.Rooms, roomID)
}
