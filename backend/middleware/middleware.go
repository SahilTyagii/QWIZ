package middleware

import (
	"log"
	"net/http"
	"os"

	"github.com/SahilTyagii/qwiz-backend/controllers" // Import the controllers package to use the Claims struct
	"github.com/golang-jwt/jwt"
	"github.com/joho/godotenv"
)

func AuthMiddleware(next http.Handler) http.Handler {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	jwtKey := os.Getenv("JWT_KEY")
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie("token")
		if err != nil {
			if err == http.ErrNoCookie {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		tknStr := c.Value
		claims := &controllers.Claims{} // Correctly initialize the claims variable

		tkn, err := jwt.ParseWithClaims(tknStr, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtKey), nil // Correctly convert jwtKey to []byte
		})

		if err != nil {
			if err == jwt.ErrSignatureInvalid {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if !tkn.Valid {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}
