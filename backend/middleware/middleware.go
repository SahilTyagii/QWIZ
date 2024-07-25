package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/SahilTyagii/qwiz-backend/controllers"
	"github.com/golang-jwt/jwt"
	"github.com/gorilla/context"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")
		claims := &controllers.Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_KEY")), nil
		})

		if err != nil || !token.Valid {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		context.Set(r, "userClaims", claims)
		next.ServeHTTP(w, r)
	})
}
