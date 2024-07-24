package controllers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/SahilTyagii/qwiz-backend/helper"
	"github.com/SahilTyagii/qwiz-backend/models"
	"github.com/golang-jwt/jwt"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	var wg sync.WaitGroup
	wg.Add(1)

	var registerErr error

	go func() {
		defer wg.Done()
		registerErr = helper.CreateUser(user)
	}()

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		if registerErr != nil {
			http.Error(w, registerErr.Error(), http.StatusBadRequest)
			return
		}
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(user)

	case <-ctx.Done():
		http.Error(w, "Request timed out", http.StatusGatewayTimeout)
	}

}

type Claims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

func Login(w http.ResponseWriter, r *http.Request) {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading env files: ", err)
	}

	jwtKey := os.Getenv("JWT_KEY")
	if jwtKey == "" {
		log.Fatalf("JWT_KEY not set in environment")
	}
	w.Header().Set("Content-Type", "application/json")
	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	var wg sync.WaitGroup
	wg.Add(1)

	var user models.User
	var fetchErr error
	go func() {
		defer wg.Done()
		user, fetchErr = helper.GetUserByUsername(creds.Username)
	}()

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		if fetchErr != nil {
			http.Error(w, "Internal server error: "+fetchErr.Error(), http.StatusInternalServerError)
			return
		}
		if user.Username == "" || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(creds.Password)) != nil {
			http.Error(w, "Invalid username or password", http.StatusUnauthorized)
			return
		}

		expirationTime := time.Now().Add(24 * time.Hour)
		claims := &Claims{
			Username: user.Username,
			StandardClaims: jwt.StandardClaims{
				ExpiresAt: expirationTime.Unix(),
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString([]byte(jwtKey)) // Ensure jwtKey is a byte slice
		if err != nil {
			http.Error(w, "Error generating token", http.StatusInternalServerError)
			log.Printf("Error signing token: %v\n", err) // Log error for debugging
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:    "token",
			Value:   tokenString,
			Expires: expirationTime,
		})

		json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
	case <-ctx.Done():
		http.Error(w, "Request timed out", http.StatusGatewayTimeout)
	}
}
