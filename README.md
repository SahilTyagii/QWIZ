# QWIZ

![image](https://github.com/user-attachments/assets/d7260f29-e43f-40a7-8356-ed7c3af7feaa)


Welcome to **QWIZ**, an engaging and interactive quiz game where users can challenge themselves and compete on leaderboards. With a sleek design and intuitive user experience, QWIZ offers a fun way to test your trivia knowledge and see how you stack up against other players.

## **Features**

- **Create & Join Rooms**: Easily create a quiz room or join an existing one.
- **Multiplayer Support**: Play with friends and see who knows more.
- **Real-Time Leaderboards**: Track and compare your high scores with other players.
- **Customizable Avatars & User Profiles**: Personalize your profile and avatar.
- **Dynamic Question Fetching**: Fetch questions from the Open Trivia Database API.
- **Variety of categories and difficulty**: Lots of questions categories to chose from.
- **WebSocket Integration**: Real-time communication between clients and server.
- **Efficient Concurrency**: Utilizes Go's Goroutines for fast, scalable performance.
- **Responsive Design**: Beautifully optimized for both desktop and mobile devices.
- **Database Integration**: Utilizes MongoDB for storing user data, game rooms, and leaderboards.

## **Table of Contents**

1. [Installation](#installation)
2. [Usage](#usage)
3. [Tech Stack](#tech-stack)
4. [Screenshots](#screenshots)
   
## **Installation**

### **Frontend**

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/qwiz.git
   cd qwiz
   ```
2. **Navigate to the frontend directory and install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm start
   ```
The frontend application will be available at `http://localhost:5173`.

### **Backend**

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   go mod tidy
   ```
3. **Run the application:**
   ```bash
   go run main.go
   ```
The backend server will be available at `http://localhost:4000`.

## **Usage**
1. **Register and Log In:**
   - Use the provided interface to register a new account or log in with existing credentials.
2. **Play single player or multiplayer by creating or joining room:**
   - Select game settings and start the game.
   - Create a new quiz room by providing a settings for fetching questions.
   - Join an existing room using a unique room ID.
3. **Play and Compete:**
   - Answer questions in the quiz room and see your score update in real-time.
   - Check the leaderboard to compare your performance with other players.

## **Tech Stack**

### **Frontend**

- **React**: A powerful JavaScript library for building dynamic user interfaces.
- **Axios**: A promise-based HTTP client for making requests to the backend API.
- **Tailwind CSS**: A utility-first CSS framework for creating custom designs quickly and efficiently.
- **React Router**: For handling navigation and routing within the application.
- **Material-UI**: A popular React UI framework for implementing pre-designed components.

### **Backend**

- **Go (Golang)**: The primary language used for the backend, known for its performance and simplicity.
- **Goroutines**: Leveraged for concurrent execution, enabling efficient handling of multiple tasks simultaneously.
- **WebSockets**: Used for real-time communication between the client and server, providing instant updates.
- **MongoDB**: A NoSQL database for storing user data, game rooms, and leaderboards. Offers flexible schema design and scalability.
- **Gorilla WebSocket**: A Go package for managing WebSocket connections.

### **APIs & Libraries**

- **Open Trivia Database API**: Provides trivia questions for the quiz game.

### **Development Tools**

- **Visual Studio Code**: The primary code editor used for development.
- **Postman**: For testing and debugging API endpoints.
- **Git**: Version control system for tracking changes in the codebase.
  
## **Screenshots**
![image](https://github.com/user-attachments/assets/1466e692-cf43-4ff6-b063-71b424f93b85)
![image](https://github.com/user-attachments/assets/74fb98a5-38f4-4aa2-8bfa-b5a927a874a5)
![image](https://github.com/user-attachments/assets/7471182e-b23e-47cd-9377-6b7403154e1b)

## **Deployment**
QWIZ is deployed [here](https://qwiz-three.vercel.app/)
