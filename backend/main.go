package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/SahilTyagii/qwiz-backend/router"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Error loading env files: ", err)
	}
	r := router.Router()
	fmt.Println("Server is getting started...")
	log.Fatal(http.ListenAndServe(":4000", r))
	fmt.Println("Listening at port 4000...")
}
