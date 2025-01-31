package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/SahilTyagii/qwiz-backend/router"
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
		handlers.AllowedOrigins([]string{"http://localhost:5173", "https://qwiz-three.vercel.app"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(r)

	fmt.Println("Server is getting started...")
	fmt.Println("Listening at port 4000...")
	log.Fatal(http.ListenAndServe(":4000", corsHandler))
}
