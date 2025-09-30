# QWIZ Backend Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication System](#authentication-system)
3. [WebSocket Implementation](#websocket-implementation)
4. [Concurrency & Multithreading](#concurrency--multithreading)
5. [Room Management](#room-management)
6. [Database Integration](#database-integration)
7. [API Endpoints](#api-endpoints)
8. [Request Flow](#request-flow)
9. [Architecture Diagrams](#architecture-diagrams)

---

## Overview

The QWIZ backend is built with **Go (Golang)** and leverages several key technologies:
- **Gorilla Mux**: HTTP router for RESTful APIs
- **Gorilla WebSocket**: Real-time bidirectional communication
- **MongoDB**: NoSQL database for user data persistence
- **JWT (JSON Web Tokens)**: Secure authentication mechanism
- **Goroutines**: Go's lightweight threads for concurrent operations
- **Channels**: Go's concurrency primitives for safe communication

The architecture follows a modular design with clear separation of concerns:
```
backend/
├── main.go              # Entry point, server initialization
├── router/              # Route definitions and middleware setup
├── controllers/         # Request handlers (auth, users)
├── middleware/          # Authentication middleware
├── multiplayer/         # WebSocket, rooms, clients
├── models/              # Data structures
├── config/              # Database configuration
└── helper/              # Database operations
```

---

## Authentication System

### How It Works

The authentication system uses **JWT (JSON Web Tokens)** for stateless authentication:

#### 1. Registration Flow (`/api/register`)

**File**: `backend/controllers/auth.go` - `Register()` function

```go
// High-level flow:
1. Client sends username and password
2. Server validates input
3. Password is hashed using bcrypt
4. User data stored in MongoDB
5. Response sent to client
```

**Key Implementation Details**:
- **Password Hashing**: Uses `bcrypt.GenerateFromPassword()` with default cost
- **Concurrency**: Registration runs in a goroutine with a timeout context
- **Timeout**: 10-second context timeout prevents hanging requests
- **WaitGroup**: Ensures goroutine completion before response

```go
// Simplified code flow:
var wg sync.WaitGroup
wg.Add(1)

go func() {
    defer wg.Done()
    registerErr = helper.CreateUser(user)  // Runs concurrently
}()

// Wait with timeout
ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
defer cancel()
```

#### 2. Login Flow (`/api/login`)

**File**: `backend/controllers/auth.go` - `Login()` function

```go
// High-level flow:
1. Client sends username and password
2. Server fetches user from database (in goroutine)
3. Password verified using bcrypt.CompareHashAndPassword()
4. JWT token generated with 24-hour expiration
5. Token signed with secret key from environment
6. Token sent to client in response and as HTTP cookie
```

**JWT Token Structure**:
```go
Claims {
    Username: "user123",
    StandardClaims: {
        ExpiresAt: time.Now().Add(24 * time.Hour).Unix()
    }
}
```

**Token Generation**:
```go
token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
tokenString, _ := token.SignedString([]byte(jwtKey))
```

#### 3. Authentication Middleware

**File**: `backend/middleware/middleware.go` - `AuthMiddleware()` function

**Protected Routes**: Routes under `/api` prefix with `protected.Use(middleware.AuthMiddleware)`

```go
// How it works:
1. Extract token from "Authorization" header
2. Remove "Bearer " prefix
3. Parse and validate JWT token
4. Verify signature using JWT_KEY
5. Extract user claims
6. Store claims in request context
7. Pass request to next handler OR return 401 Unauthorized
```

**Usage in Router**:
```go
protected := router.PathPrefix("/api").Subrouter()
protected.Use(middleware.AuthMiddleware)  // Applied to all routes
protected.HandleFunc("/users/me", controllers.GetCurrentUser).Methods("GET")
```

### Security Features
- **Bcrypt Hashing**: One-way cryptographic hash for passwords
- **JWT Signing**: Tokens signed with secret key, preventing tampering
- **Token Expiration**: 24-hour validity forces periodic re-authentication
- **Stateless Auth**: No server-side session storage needed

---

## WebSocket Implementation

### Architecture Overview

The multiplayer system uses **WebSockets** for real-time, bidirectional communication between clients and server.

**Key Components**:
1. **Hub**: Central coordinator managing all rooms and client connections
2. **Room**: Game room containing multiple clients and game state
3. **Client**: Individual player connection with WebSocket and state

### Hub Structure

**File**: `backend/multiplayer/ws.go`

```go
type Hub struct {
    Rooms      map[string]*Room    // All active game rooms
    Register   chan *Client        // Channel for registering new clients
    Unregister chan *Client        // Channel for removing clients
    Mutex      sync.Mutex          // Protects concurrent access to Rooms map
}
```

**Hub Initialization**:
```go
var hub = Hub{
    Rooms:      make(map[string]*Room),
    Register:   make(chan *Client),
    Unregister: make(chan *Client),
}

func init() {
    go hub.Run()  // Start hub in background goroutine
    go MonitorRoomExpiration(hub.Rooms, 10*time.Minute)  // Cleanup old rooms
}
```

### Client Structure

**File**: `backend/multiplayer/client.go`

```go
type Client struct {
    Conn     *websocket.Conn    // WebSocket connection
    Send     chan []byte        // Buffered channel for outgoing messages
    Username string             // Player identifier
    Avatar   string             // Player avatar
    State    *PlayerState       // Game state (score, current question)
    Hub      *Hub               // Reference to hub
    Room     *Room              // Reference to room
}

type PlayerState struct {
    CurrentQuestion int
    Score           int
}
```

### WebSocket Connection Flow

#### 1. Connection Establishment (`/ws/{roomID}/{username}/{avatar}`)

**File**: `backend/multiplayer/ws.go` - `ServeWs()` function

```go
// Step-by-step flow:
1. Extract roomID, username, avatar from URL parameters
2. Upgrade HTTP connection to WebSocket using upgrader
3. Create new Client struct with buffered Send channel (256 messages)
4. Get or create Room for the roomID
5. Add client to room's client map (thread-safe with mutex)
6. Assign first client as room host
7. Start two goroutines:
   - ReadPump(): Reads incoming messages from client
   - WritePump(): Writes outgoing messages to client
8. Send client to hub.Register channel
9. Send welcome message to client
10. Broadcast player_joined event to all clients in room
```

**WebSocket Upgrader Configuration**:
```go
var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true  // Allow all origins (configure for production)
    },
}
```

#### 2. Reading Messages from Client (ReadPump)

**File**: `backend/multiplayer/client.go` - `ReadPump()` function

```go
// Continuous loop reading messages:
func (c *Client) ReadPump() {
    defer func() {
        c.Hub.Unregister <- c  // Unregister on disconnect
        c.Conn.Close()
    }()
    
    for {
        _, message, err := c.Conn.ReadMessage()
        if err != nil {
            break  // Connection closed or error
        }
        
        // Parse JSON message
        var msg map[string]interface{}
        json.Unmarshal(message, &msg)
        
        // Handle different actions
        switch msg["action"] {
            case "start_game":
                c.handleStartGame()
            case "correct_answer":
                c.handleAnswer(true)
            case "wrong_answer":
                c.handleAnswer(false)
        }
    }
}
```

**Message Actions**:
- `start_game`: Host starts the game, broadcasts questions to all players
- `correct_answer`: Player answered correctly, increment score
- `wrong_answer`: Player answered incorrectly, advance question

#### 3. Writing Messages to Client (WritePump)

**File**: `backend/multiplayer/client.go` - `WritePump()` function

```go
// Continuous loop writing messages:
func (c *Client) WritePump() {
    defer c.Conn.Close()
    
    for {
        select {
        case message, ok := <-c.Send:
            if !ok {
                // Channel closed, close connection
                c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
                return
            }
            // Write message to WebSocket
            c.Conn.WriteMessage(websocket.TextMessage, message)
        }
    }
}
```

**Why Two Goroutines?**
- **ReadPump**: Dedicated to reading incoming messages without blocking writes
- **WritePump**: Dedicated to writing outgoing messages without blocking reads
- **Non-blocking**: Both operations happen concurrently, preventing deadlocks

### Broadcasting Messages

**File**: `backend/multiplayer/client.go` - `broadcastState()` function

```go
// Broadcast message to all clients in room:
func (c *Client) broadcastState(action string, data interface{}) {
    // 1. Create message structure
    response := map[string]interface{}{
        "action": action,
        "data":   data,
    }
    respJSON, _ := json.Marshal(response)
    
    // 2. Get all clients (thread-safe)
    c.Room.Mutex.Lock()
    clients := make([]*Client, 0, len(c.Room.Clients))
    for client := range c.Room.Clients {
        clients = append(clients, client)
    }
    c.Room.Mutex.Unlock()
    
    // 3. Send to each client's Send channel
    for _, client := range clients {
        select {
        case client.Send <- respJSON:
            // Message sent successfully
        default:
            // Channel full, skip this client
        }
    }
}
```

**Broadcast Events**:
- `waiting_for_players`: Initial connection message
- `player_joined`: New player joined, sends updated player list
- `set_host`: Notifies all clients who the host is
- `initial_question`: Game started, sends all questions
- `player_state`: Player answered, broadcasts updated score/progress

---

## Concurrency & Multithreading

Go's concurrency model is fundamental to QWIZ's architecture. Here's how it's used:

### 1. Goroutines (Lightweight Threads)

**What are Goroutines?**
- Lightweight threads managed by Go runtime
- Much cheaper than OS threads (~2KB stack vs ~2MB)
- QWIZ can handle thousands of concurrent connections

**Where Used in QWIZ**:

#### a) Hub Event Loop
```go
func (h *Hub) Run() {
    for {
        select {
        case client := <-h.Register:
            // Register client (thread-safe)
        case client := <-h.Unregister:
            // Unregister client (thread-safe)
        }
    }
}

// Started once at initialization:
func init() {
    go hub.Run()  // Runs forever in background
}
```

#### b) Per-Client Message Handlers
```go
// Each client gets 2 dedicated goroutines:
go client.ReadPump()   // Reads from WebSocket
go client.WritePump()  // Writes to WebSocket
```

#### c) Authentication Operations
```go
// Database operations run in goroutines with timeout:
go func() {
    defer wg.Done()
    registerErr = helper.CreateUser(user)
}()
```

#### d) Room Expiration Monitor
```go
func init() {
    go MonitorRoomExpiration(hub.Rooms, 10*time.Minute)
}

// Runs every minute, checks for expired rooms:
func MonitorRoomExpiration(rooms map[string]*Room, expirationDuration time.Duration) {
    ticker := time.NewTicker(1 * time.Minute)
    defer ticker.Stop()
    
    for {
        select {
        case <-ticker.C:
            // Check and delete expired rooms
        }
    }
}
```

### 2. Channels (Communication Between Goroutines)

**What are Channels?**
- Typed conduits for sending and receiving values
- Thread-safe by design
- Used for communication between goroutines

**Channel Usage in QWIZ**:

#### a) Hub Channels
```go
Register   chan *Client    // Register new clients
Unregister chan *Client    // Unregister disconnected clients
```

**How it works**:
```go
// Sending to channel (non-blocking):
hub.Register <- client

// Receiving from channel (blocking until message arrives):
client := <-h.Register
```

#### b) Client Send Channel
```go
Send chan []byte  // Buffered channel with 256 message capacity
```

**Buffered vs Unbuffered**:
- Unbuffered: Sender blocks until receiver ready
- Buffered (256): Can queue up to 256 messages before blocking

**Why buffered?**
- Prevents slow clients from blocking the entire system
- Messages can be queued if client temporarily can't receive

#### c) Synchronization Channels
```go
done := make(chan struct{})  // Used as signal

go func() {
    wg.Wait()
    close(done)  // Signal completion
}()

select {
case <-done:
    // Work completed
case <-ctx.Done():
    // Timeout
}
```

### 3. Mutexes (Mutual Exclusion Locks)

**What are Mutexes?**
- Locks that ensure only one goroutine accesses shared data at a time
- Prevents race conditions

**Mutex Usage in QWIZ**:

#### a) Hub Mutex
```go
// Protects hub.Rooms map:
hub.Mutex.Lock()
room, exists := hub.Rooms[roomID]
if !exists {
    room = &Room{...}
    hub.Rooms[roomID] = room
}
hub.Mutex.Unlock()
```

#### b) Room Mutex
```go
// Protects room.Clients map:
client.Room.Mutex.Lock()
client.Room.Clients[client] = true
client.Room.Mutex.Unlock()
```

**Critical Sections Protected**:
- Adding/removing clients from room
- Accessing room's client list
- Modifying room state
- Accessing hub's room map

### 4. WaitGroups (Goroutine Synchronization)

**What are WaitGroups?**
- Counter for waiting on multiple goroutines to finish

**Usage in Auth**:
```go
var wg sync.WaitGroup
wg.Add(1)  // Increment counter

go func() {
    defer wg.Done()  // Decrement counter when done
    // Do work...
}()

wg.Wait()  // Block until counter reaches 0
```

### 5. Context (Timeout and Cancellation)

**What is Context?**
- Carries deadlines, cancellation signals, and request-scoped values

**Usage in Auth**:
```go
ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
defer cancel()

// Use context in select:
select {
case <-done:
    // Work completed
case <-ctx.Done():
    http.Error(w, "Request timed out", http.StatusGatewayTimeout)
}
```

### Concurrency Patterns in QWIZ

#### Pattern 1: Fan-Out (Hub to Multiple Clients)
```
Hub -> Register channel -> Multiple clients being registered concurrently
```

#### Pattern 2: Worker Pool (Multiple ReadPumps/WritePumps)
```
Multiple clients, each with dedicated reader/writer goroutines
Client 1: ReadPump | WritePump
Client 2: ReadPump | WritePump
Client 3: ReadPump | WritePump
```

#### Pattern 3: Pub-Sub (Broadcasting)
```
One client sends message -> broadcastState -> All clients in room receive
```

#### Pattern 4: Timeout Pattern
```
Goroutine doing work + Context with timeout -> Either completes or times out
```

---

## Room Management

### Room Structure

**File**: `backend/multiplayer/room.go`

```go
type Room struct {
    ID           string                 // Unique room identifier (6 digits)
    Clients      map[*Client]bool       // Connected clients
    Questions    []models.Question      // Quiz questions
    Started      bool                   // Game started flag
    Host         *Client                // First client who joined
    CreationTime time.Time              // For expiration tracking
    Mutex        sync.Mutex             // Thread-safety
}
```

### Room Lifecycle

#### 1. Room Creation (`/create-room`)

**File**: `backend/multiplayer/room.go` - `CreateRoom()` function

```go
// Step-by-step flow:
1. Generate random 6-digit room ID
2. Client sends questionURL with quiz parameters
3. Fetch session token from Open Trivia DB
4. Fetch questions using token (prevents duplicates)
5. Create or get room using GetRoom()
6. Assign questions to room
7. Return roomID to client
```

**Question Fetching**:
```go
func fetchQuestions(questionURL string) ([]models.Question, error) {
    // 1. Get session token from API
    tokenURL := "https://opentdb.com/api_token.php?command=request"
    
    // 2. Append token to question URL
    url := fmt.Sprintf("%s&token=%s", questionURL, token.Token)
    
    // 3. Fetch questions
    resp, _ := http.Get(url)
    
    // 4. Parse response
    var triviaResponse models.TriviaResponse
    json.NewDecoder(resp.Body).Decode(&triviaResponse)
    
    return triviaResponse.Results, nil
}
```

**ID Generation**:
```go
func idGenerator(max int) string {
    b := make([]byte, max)
    io.ReadAtLeast(rand.Reader, b, max)  // Cryptographically secure random
    
    // Convert to digits
    for i := 0; i < len(b); i++ {
        b[i] = table[int(b[i])%len(table)]
    }
    return string(b)  // Returns 6-digit string like "482917"
}
```

#### 2. Getting/Creating Room

**File**: `backend/multiplayer/room.go` - `GetRoom()` function

```go
func GetRoom(roomID string) *Room {
    hub.Mutex.Lock()
    defer hub.Mutex.Unlock()
    
    room, exists := hub.Rooms[roomID]
    if !exists {
        // Create new room
        room = &Room{
            ID:           roomID,
            Clients:      make(map[*Client]bool),
            CreationTime: time.Now(),
        }
        hub.Rooms[roomID] = room
    }
    return room
}
```

**Thread-Safety**: 
- Hub mutex prevents concurrent map access
- Multiple clients can try to join same room simultaneously

#### 3. Client Joining Room

**Happens in**: `ServeWs()` function

```go
client.Room.Mutex.Lock()
client.Room.Clients[client] = true
if client.Room.Host == nil {
    client.Room.Host = client  // First client becomes host
}
client.Room.Mutex.Unlock()
```

#### 4. Starting Game

**File**: `backend/multiplayer/client.go` - `handleStartGame()` function

```go
func (c *Client) handleStartGame() {
    // Only host can start game
    if c.Room.Host == c {
        if len(c.Room.Questions) > 0 {
            // Get all questions
            c.Room.Mutex.Lock()
            questions := c.Room.Questions
            c.Room.Mutex.Unlock()
            
            // Broadcast to all clients
            c.broadcastState("initial_question", questions)
        }
    }
}
```

**Frontend triggers this by sending**:
```javascript
sendMessage(JSON.stringify({ action: "start_game" }))
```

#### 5. Room Expiration

**File**: `backend/multiplayer/room.go` - `MonitorRoomExpiration()` function

```go
func MonitorRoomExpiration(rooms map[string]*Room, expirationDuration time.Duration) {
    ticker := time.NewTicker(1 * time.Minute)  // Check every minute
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
                
                if age > expirationDuration {  // Default: 10 minutes
                    deleteRoom(roomID)
                }
            }
            hub.Mutex.Unlock()
        }
    }
}
```

**Why expiration?**
- Prevents memory leaks from abandoned rooms
- Cleans up inactive rooms automatically
- Default: 10 minutes after creation

#### 6. Room Deletion

```go
func deleteRoom(roomID string) {
    hub.Mutex.Lock()
    defer hub.Mutex.Unlock()
    
    room, exists := hub.Rooms[roomID]
    if !exists {
        return
    }
    
    // Close all client connections
    for client := range room.Clients {
        client.Conn.Close()
    }
    
    // Remove from hub
    delete(hub.Rooms, roomID)
}
```

**Triggered when**:
- Room is older than 10 minutes
- Last client leaves the room

### Room State Management

**Client List**:
```go
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
```

**Sent to clients when**:
- New player joins (`player_joined` event)
- Client requests room info

---

## Database Integration

### MongoDB Setup

**File**: `backend/config/database.go`

```go
// Connection established at initialization:
func init() {
    // 1. Load environment variables
    err := godotenv.Load()
    
    // 2. Get credentials
    dbUserName = os.Getenv("DB_USERNAME")
    dbPassword = os.Getenv("DB_PASSWORD")
    
    // 3. Build connection string
    connectionString := fmt.Sprintf(
        "mongodb+srv://%s:%s@cluster0.dfi5ulj.mongodb.net/?retryWrites=true&w=majority",
        dbUserName, dbPassword
    )
    
    // 4. Connect to MongoDB
    client, _ := mongo.Connect(context.TODO(), clientOptions)
    
    // 5. Get collection reference
    Collection = client.Database("qwiz").Collection("users")
}
```

**Database**: `qwiz`  
**Collection**: `users`  
**Driver**: MongoDB Go Driver (`go.mongodb.org/mongo-driver`)

### User Model

**File**: `backend/models/models.go`

```go
type User struct {
    ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
    Username  string             `json:"username,omitempty"`
    Password  string             `json:"password,omitempty"`  // bcrypt hashed
    Avatar    int                `json:"avatar,omitempty"`
    Highscore int                `json:"highscore"`
    Accuracy  float64            `json:"accuracy"`
}
```

### Database Operations

**File**: `backend/helper/helper.go`

All database operations are in this file:

#### 1. Create User
```go
func CreateUser(user models.User) error {
    // Check if username exists
    var existingUser models.User
    err := config.Collection.FindOne(context.Background(), 
        bson.M{"username": user.Username}).Decode(&existingUser)
    if err == nil {
        return fmt.Errorf("username already exists")
    }
    
    // Generate new ObjectID
    if user.ID == primitive.NilObjectID {
        user.ID = primitive.NewObjectID()
    }
    
    // Insert into database
    _, err = config.Collection.InsertOne(context.Background(), user)
    return err
}
```

#### 2. Get User by Username
```go
func GetUserByUsername(username string) (models.User, error) {
    var user models.User
    err := config.Collection.FindOne(context.Background(), 
        bson.M{"username": username}).Decode(&user)
    return user, err
}
```

#### 3. Update Operations
```go
// Update avatar
func UpdateAvatar(userId string, newAvatar int) error {
    id, _ := primitive.ObjectIDFromHex(userId)
    filter := bson.M{"_id": id}
    update := bson.M{"$set": bson.M{"avatar": newAvatar}}
    _, err := config.Collection.UpdateOne(context.Background(), filter, update)
    return err
}

// Similar for UpdateUsername, UpdateHighscore, UpdateAccuracy
```

#### 4. Get All Users
```go
func GetAllUsers() ([]primitive.M, error) {
    cursor, err := config.Collection.Find(context.Background(), bson.D{{}})
    defer cursor.Close(context.Background())
    
    var users []primitive.M
    for cursor.Next(context.Background()) {
        var user bson.M
        cursor.Decode(&user)
        users = append(users, user)
    }
    return users, nil
}
```

### Why MongoDB?

**Advantages for QWIZ**:
1. **Flexible Schema**: User model can evolve without migrations
2. **JSON-like Documents**: Natural fit for Go structs and JSON APIs
3. **Scalability**: Easy to scale horizontally
4. **Fast Queries**: Indexed username lookups for auth
5. **Cloud Integration**: MongoDB Atlas for easy deployment

---

## API Endpoints

### Public Endpoints (No Auth Required)

#### 1. Register
- **Method**: POST
- **URL**: `/api/register`
- **Body**: 
  ```json
  {
    "username": "player123",
    "password": "securepass"
  }
  ```
- **Response**: User object with hashed password
- **Status Codes**: 201 (Created), 400 (Bad Request), 408 (Timeout)

#### 2. Login
- **Method**: POST
- **URL**: `/api/login`
- **Body**:
  ```json
  {
    "username": "player123",
    "password": "securepass"
  }
  ```
- **Response**: 
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Status Codes**: 200 (OK), 401 (Unauthorized), 408 (Timeout)

#### 3. Get All Users
- **Method**: GET
- **URL**: `/api/users`
- **Response**: Array of user objects
- **Status Codes**: 200 (OK)

#### 4. Create Room
- **Method**: POST
- **URL**: `/create-room`
- **Body**:
  ```json
  {
    "questionURL": "https://opentdb.com/api.php?amount=10&category=9"
  }
  ```
- **Response**:
  ```json
  {
    "response_code": 1,
    "roomID": "482917"
  }
  ```
- **Status Codes**: 200 (OK), 400 (Bad Request), 500 (Internal Error)

#### 5. WebSocket Connection
- **URL**: `/ws/{roomID}/{username}/{avatar}`
- **Protocol**: WebSocket (ws:// or wss://)
- **Example**: `/ws/482917/player123/1`

### Protected Endpoints (Auth Required)

All require `Authorization: Bearer <token>` header.

#### 1. Get Current User
- **Method**: GET
- **URL**: `/api/users/me`
- **Response**: Current user object
- **Status Codes**: 200 (OK), 401 (Unauthorized)

#### 2. Get User by ID
- **Method**: GET
- **URL**: `/api/users/{id}`
- **Response**: User object
- **Status Codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized)

#### 3. Update Avatar
- **Method**: PUT
- **URL**: `/api/users/{id}/avatar`
- **Body**:
  ```json
  {
    "avatar": 2
  }
  ```
- **Status Codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized)

#### 4. Update Username
- **Method**: PUT
- **URL**: `/api/users/{id}/username`
- **Body**:
  ```json
  {
    "username": "newusername"
  }
  ```
- **Status Codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized)

#### 5. Update Highscore
- **Method**: PUT
- **URL**: `/api/users/{id}/highscore`
- **Body**:
  ```json
  {
    "highscore": 150
  }
  ```
- **Status Codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized)

#### 6. Update Accuracy
- **Method**: PUT
- **URL**: `/api/users/{id}/accuracy`
- **Body**:
  ```json
  {
    "accuracy": 85.5
  }
  ```
- **Status Codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized)

#### 7. Delete User
- **Method**: DELETE
- **URL**: `/api/users/{id}`
- **Status Codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized)

#### 8. Delete All Users
- **Method**: DELETE
- **URL**: `/api/users`
- **Status Codes**: 200 (OK), 401 (Unauthorized)

---

## Request Flow

### Flow 1: User Registration

```
Client                          Server                          Database
  |                               |                               |
  |-- POST /api/register -------->|                               |
  |   {username, password}        |                               |
  |                               |-- Hash password               |
  |                               |-- Start goroutine ----------->|
  |                               |   with 10s timeout            |
  |                               |                               |
  |                               |<-- Check username exists -----|
  |                               |                               |
  |                               |-- Insert user --------------->|
  |                               |                               |
  |                               |<-- Success/Error -------------|
  |                               |                               |
  |<-- 201 Created OR 400 --------|                               |
  |   {user object}               |                               |
```

### Flow 2: User Login

```
Client                          Server                          Database
  |                               |                               |
  |-- POST /api/login ----------->|                               |
  |   {username, password}        |                               |
  |                               |-- Start goroutine ----------->|
  |                               |   with 10s timeout            |
  |                               |                               |
  |                               |<-- Fetch user by username ----|
  |                               |                               |
  |                               |-- Compare bcrypt hashes       |
  |                               |-- Generate JWT token          |
  |                               |-- Sign with secret key        |
  |                               |                               |
  |<-- 200 OK OR 401 -------------|                               |
  |   {token}                     |                               |
  |   Set-Cookie: token           |                               |
```

### Flow 3: Protected API Request

```
Client                          Middleware                      Controller
  |                               |                               |
  |-- GET /api/users/me --------->|                               |
  |   Authorization: Bearer token |                               |
  |                               |-- Extract token               |
  |                               |-- Parse & validate JWT        |
  |                               |-- Verify signature            |
  |                               |                               |
  |                               |-- Store claims in context --->|
  |                               |                               |
  |                               |                               |-- Get username
  |                               |                               |-- Query database
  |                               |                               |
  |<-- 200 OK OR 401 -----------------------------------|
  |   {user object}               |                               |
```

### Flow 4: Room Creation and Game Start

```
Client 1 (Host)                 Server                          Client 2
  |                               |                               |
  |-- POST /create-room --------->|                               |
  |   {questionURL}               |                               |
  |                               |-- Fetch questions from API    |
  |                               |-- Generate room ID            |
  |                               |-- Create room                 |
  |<-- {roomID: "482917"} --------|                               |
  |                               |                               |
  |-- WS /ws/482917/host/1 ------>|                               |
  |                               |-- Upgrade to WebSocket        |
  |                               |-- Create Client               |
  |                               |-- Add to room                 |
  |                               |-- Set as host                 |
  |                               |-- Start ReadPump goroutine    |
  |                               |-- Start WritePump goroutine   |
  |                               |-- Register in hub             |
  |<-- waiting_for_players -------|                               |
  |<-- set_host ------------------|                               |
  |                               |                               |
  |                               |<-- WS /ws/482917/player2/2 --|
  |                               |-- Same WebSocket setup        |
  |<-- player_joined -------------|------------------------------>|
  |   {clients: [host, player2]}  |-- broadcast to all         -->|
  |                               |                               |
  |-- {action: "start_game"} ---->|                               |
  |                               |-- Check if sender is host     |
  |                               |-- Get questions               |
  |<-- initial_question -----------|------------------------------>|
  |   {questions: [...]}          |-- broadcast to all         -->|
  |                               |                               |
  |-- {action: "correct_answer"} >|                               |
  |                               |-- Increment score             |
  |<-- player_state --------------|------------------------------>|
  |   {player, score, question}   |-- broadcast to all         -->|
```

### Flow 5: Client Disconnect

```
Client                          Hub                             Room
  |                               |                               |
  |-- Close WebSocket             |                               |
  |                               |                               |
  X ReadPump error detected       |                               |
  |                               |                               |
  |-- Send to Unregister -------->|                               |
  |                               |                               |
  |                               |-- Remove from room.Clients -->|
  |                               |                               |
  |                               |-- Close Send channel          |
  |                               |                               |
  |                               |-- Check if room empty ------->|
  |                               |                               |
  |                               |-- Delete room if empty        |
```

---

## Architecture Diagrams

### Overall System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        QWIZ Backend                          │
└─────────────────────────────────────────────────────────────┘

                              main.go
                                 │
                                 ├── Load .env
                                 ├── Setup CORS
                                 └── Start Server :4000
                                          │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
               router.Router()                          Goroutines
                    │                                         │
        ┌───────────┼───────────┐                  ┌─────────┴─────────┐
        │           │           │                  │                   │
    Public      Protected   WebSocket         hub.Run()      MonitorRoomExpiration()
    Routes    (middleware)   Routes               │                   │
        │           │           │           ┌──────┴──────┐     ┌─────┴──────┐
        │           │           │           │             │     │            │
   ┌────┴────┐  ┌───┴───┐  ┌───┴────┐  Register   Unregister  Check      Delete
   │         │  │       │  │        │  Channel      Channel   Expired    Rooms
Register  Login Auth  ServeWs       │             │           Rooms
   │         │    │       │         └──────┬──────┘           Every 1min
   │         │    │       │                │
   │         │    │       └────────────────┼────────────────────┐
   │         │    │                        │                    │
   │         │    └────────────────────────┼──────────┐         │
   │         │                             │          │         │
   ├─────────┴─────────────────────────────┼──────────┼─────────┤
   │                                       │          │         │
   │              controllers/         multiplayer/  │         │
   │                                       │          │         │
   │         ┌────────────────────────────┼──────────┼─────────┤
   │         │                            │          │         │
bcrypt    JWT    AuthMiddleware          Hub      Room     Client
hashing  token    validation             │          │         │
   │         │          │                 │          │         │
   │         │          │                 │          │         │
WaitGroup Context   Context          Channels   Mutex    Goroutines
Timeout   Timeout   Set/Get          Sync       Lock     Read/Write
   │         │          │                 │          │         │
   │         │          │                 │          │         │
   └─────────┴──────────┴─────────────────┴──────────┴─────────┘
                                 │
                                 │
                          helper/config
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              MongoDB Driver              Database
                 CRUD Ops                Connection
                    │                         │
                    └────────────┬────────────┘
                                 │
                          MongoDB Atlas
                        (Cloud Database)
                                 │
                        Collection: users
                        Database: qwiz
```

### WebSocket Connection Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Hub (Singleton)                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Rooms: map[string]*Room                               │  │
│  │  Register: chan *Client                                │  │
│  │  Unregister: chan *Client                              │  │
│  │  Mutex: sync.Mutex                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│         ┌───────────────────────────────────────┐            │
│         │  Run() - Infinite Loop (goroutine)    │            │
│         │  ┌─────────────────────────────────┐  │            │
│         │  │  select {                        │  │            │
│         │  │    case client := <-Register:   │  │            │
│         │  │    case client := <-Unregister: │  │            │
│         │  │  }                               │  │            │
│         │  └─────────────────────────────────┘  │            │
│         └───────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
    ┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
    │  Room "123"  │  │  Room "456"  │  │  Room "789"  │
    │              │  │              │  │              │
    │ Host: *Cli1  │  │ Host: *Cli4  │  │ Host: *Cli6  │
    │ Questions:[..]│  │ Questions:[..]│  │ Questions:[..]│
    │ Clients:     │  │ Clients:     │  │ Clients:     │
    │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
    │  │ Cli1: ✓│  │  │  │ Cli4: ✓│  │  │  │ Cli6: ✓│  │
    │  │ Cli2: ✓│  │  │  │ Cli5: ✓│  │  │  │ Cli7: ✓│  │
    │  │ Cli3: ✓│  │  │  └────────┘  │  │  └────────┘  │
    │  └────────┘  │  │              │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
            │                 │                 │
     ┌──────┴──────┐   ┌──────┴──────┐   ┌──────┴──────┐
     │             │   │             │   │             │
 ┌───▼───┐  ┌─────▼─┐ ┌▼────┐ ┌─────▼─┐ ┌▼────┐ ┌─────▼─┐
 │Client1│  │Client2│ │Cli3 │ │Client4│ │Cli5 │ │Client6│
 │       │  │       │ │     │ │       │ │     │ │       │
 │ Conn  │  │ Conn  │ │Conn │ │ Conn  │ │Conn │ │ Conn  │
 │ Send  │  │ Send  │ │Send │ │ Send  │ │Send │ │ Send  │
 │ State │  │ State │ │State│ │ State │ │State│ │ State │
 │       │  │       │ │     │ │       │ │     │ │       │
 │Read() │  │Read() │ │Read │ │Read() │ │Read │ │Read() │
 │Write()│  │Write()│ │Write│ │Write()│ │Write│ │Write()│
 └───┬───┘  └───┬───┘ └──┬──┘ └───┬───┘ └──┬──┘ └───┬───┘
     │          │        │        │        │        │
  ┌──▼──┐    ┌──▼──┐ ┌───▼──┐ ┌───▼──┐ ┌───▼──┐ ┌───▼──┐
  │ WS  │    │ WS  │ │  WS  │ │  WS  │ │  WS  │ │  WS  │
  └──┬──┘    └──┬──┘ └───┬──┘ └───┬──┘ └───┬──┘ └───┬──┘
     │          │        │        │        │        │
  Frontend  Frontend Frontend Frontend Frontend Frontend
```

### Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Broadcast Pattern                         │
└─────────────────────────────────────────────────────────────┘

Client 1 (Host)              Server                  Client 2
     │                         │                         │
     │  {action:"start_game"}  │                         │
     ├────────────────────────>│                         │
     │                         │                         │
     │                    ReadPump()                     │
     │                    receives                       │
     │                         │                         │
     │                handleStartGame()                  │
     │                         │                         │
     │                Get questions                      │
     │                from room                          │
     │                         │                         │
     │                broadcastState()                   │
     │                         │                         │
     │          ┌──────────────┼──────────────┐          │
     │          │              │              │          │
     │          ▼              ▼              ▼          │
     │    client1.Send   client2.Send   client3.Send    │
     │    chan<-msg      chan<-msg      chan<-msg       │
     │          │              │              │          │
     │          ▼              ▼              ▼          │
     │    WritePump()    WritePump()    WritePump()     │
     │          │              │              │          │
     │  <───────┤              ├─────────────>│          │
     │  {initial_question}     │  {initial_question}     │
     │                         │                         │
```

### Concurrency Model

```
┌─────────────────────────────────────────────────────────────┐
│                  Goroutines in QWIZ                          │
└─────────────────────────────────────────────────────────────┘

main.go (Main Goroutine)
    │
    ├─> hub.Run() ────────────────────────> [Always Running]
    │   └─> Handles Register/Unregister       Goroutine 1
    │
    ├─> MonitorRoomExpiration() ──────────> [Always Running]
    │   └─> Checks every 1 minute             Goroutine 2
    │
    └─> http.ListenAndServe() ───────────> [Always Running]
        └─> For each request:                Main Server
            │
            ├─> Register/Login ──────────> [Per Request]
            │   └─> goroutine + WaitGroup   Goroutine N
            │       with 10s timeout
            │
            └─> ServeWs (WebSocket) ─────> [Per Client]
                ├─> ReadPump() ──────────> Goroutine N+1
                │   └─> Reads from WS
                │       Calls handlers
                │       Sends to Unregister
                │
                └─> WritePump() ─────────> Goroutine N+2
                    └─> Reads from Send chan
                        Writes to WS

Total Active Goroutines = 2 + (Active HTTP Requests) + (2 × WebSocket Clients)

Example with 10 WebSocket clients: 2 + 0 + (2 × 10) = 22 goroutines
```

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│               JWT Authentication Flow                        │
└─────────────────────────────────────────────────────────────┘

Registration:
  Client                      Server                    Database
    │                           │                           │
    │ POST /api/register        │                           │
    │ {username, password}      │                           │
    ├──────────────────────────>│                           │
    │                           │ bcrypt.GenerateFromPassword()
    │                           │ hashedPassword            │
    │                           │                           │
    │                           │ goroutine+WaitGroup       │
    │                           ├──────────────────────────>│
    │                           │ helper.CreateUser()       │
    │                           │                           │
    │                           │<──────────────────────────┤
    │                           │ InsertOne success         │
    │                           │                           │
    │<──────────────────────────┤                           │
    │ 201 Created               │                           │
    │ {user object}             │                           │

Login:
  Client                      Server                    Database
    │                           │                           │
    │ POST /api/login           │                           │
    │ {username, password}      │                           │
    ├──────────────────────────>│                           │
    │                           │                           │
    │                           │ goroutine+WaitGroup       │
    │                           ├──────────────────────────>│
    │                           │ GetUserByUsername()       │
    │                           │<──────────────────────────┤
    │                           │ user object               │
    │                           │                           │
    │                           │ bcrypt.CompareHashAndPassword()
    │                           │ ✓ Passwords match         │
    │                           │                           │
    │                           │ jwt.NewWithClaims()       │
    │                           │ token.SignedString(jwtKey)│
    │                           │                           │
    │<──────────────────────────┤                           │
    │ 200 OK                    │                           │
    │ {token: "eyJhbG..."}      │                           │
    │ Set-Cookie: token         │                           │

Protected Request:
  Client                   Middleware                Controller
    │                           │                           │
    │ GET /api/users/me         │                           │
    │ Authorization: Bearer ... │                           │
    ├──────────────────────────>│                           │
    │                           │ Extract token             │
    │                           │ jwt.ParseWithClaims()     │
    │                           │ Verify signature          │
    │                           │ Check expiration          │
    │                           │                           │
    │                           │ context.Set(userClaims)   │
    │                           ├──────────────────────────>│
    │                           │                           │
    │                           │                  Get username from claims
    │                           │                  Query database
    │                           │                           │
    │<──────────────────────────────────────────────────────┤
    │ 200 OK                    │                           │
    │ {user object}             │                           │
```

---

## Key Takeaways

### 1. **Authentication**
- JWT-based stateless authentication
- Bcrypt for secure password hashing
- Middleware validates tokens on protected routes
- 24-hour token expiration

### 2. **WebSockets**
- Real-time bidirectional communication
- Hub-Room-Client architecture
- Gorilla WebSocket library
- Separate read/write goroutines per client

### 3. **Concurrency**
- Goroutines for lightweight threading
- Channels for safe communication
- Mutexes for protecting shared data
- WaitGroups for synchronization
- Context for timeouts and cancellation

### 4. **Room Management**
- Dynamic room creation with random IDs
- Host-based game control
- Automatic expiration after 10 minutes
- Thread-safe client management

### 5. **Database**
- MongoDB for flexible schema
- Connection pooling via MongoDB driver
- CRUD operations in helper package
- User authentication and profile storage

### 6. **Scalability**
- Goroutines scale to thousands of connections
- Buffered channels prevent blocking
- Stateless JWT auth enables horizontal scaling
- MongoDB can be sharded for growth

---

## Development and Deployment

### Environment Variables Required

```bash
# .env file
DB_USERNAME=your_mongodb_username
DB_PASSWORD=your_mongodb_password
JWT_KEY=your_secret_jwt_key
PORT=4000  # Optional, defaults to 4000
```

### Running Locally

```bash
# Install dependencies
go mod tidy

# Run server
go run main.go

# Server starts on http://localhost:4000
```

### Production Considerations

1. **CORS Configuration**: Update allowed origins in `main.go`
2. **WebSocket Origin Check**: Implement proper origin validation in upgrader
3. **Rate Limiting**: Add rate limiting middleware for API endpoints
4. **Logging**: Implement structured logging (e.g., logrus, zap)
5. **Monitoring**: Add health check endpoint and metrics
6. **Error Handling**: Improve error responses with detailed messages
7. **Database Indexing**: Add indexes on username for faster lookups
8. **Connection Pooling**: Configure MongoDB connection pool size
9. **Graceful Shutdown**: Handle SIGTERM for clean shutdown
10. **Load Balancing**: Use sticky sessions for WebSocket connections

---

## Conclusion

QWIZ's backend demonstrates a modern, scalable architecture using Go's strengths:
- **Concurrency**: Goroutines and channels enable handling many simultaneous connections
- **Real-time**: WebSockets provide instant game updates
- **Security**: JWT authentication and bcrypt hashing protect user data
- **Performance**: Go's efficiency and MongoDB's speed ensure fast responses
- **Maintainability**: Modular structure with clear separation of concerns

The system efficiently handles authentication, real-time multiplayer gaming, and persistent data storage, making it a robust platform for interactive quiz games.
