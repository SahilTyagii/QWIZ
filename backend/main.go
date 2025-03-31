package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/SahilTyagii/qwiz/backend/router"
	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Error loading env files: ", err)
	}
	r := router.Router()

	// Apply CORS middleware
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"*", "http://localhost:5173", "https://qwiz-three.vercel.app"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000" // Fallback to 4000 for local development
	}

	fmt.Println("Server is getting started...")
	fmt.Println("Listening at port 4000...")
	log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}
