package router

import (
	"github.com/SahilTyagii/qwiz-backend/controllers"
	"github.com/SahilTyagii/qwiz-backend/middleware"
	"github.com/gorilla/mux"
)

func Router() *mux.Router {
	router := mux.NewRouter()

	router.HandleFunc("/api/register", controllers.Register).Methods("POST")
	router.HandleFunc("/api/login", controllers.Login).Methods("POST")

	protected := router.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	protected.HandleFunc("/users/me", controllers.GetCurrentUser).Methods("GET")
	router.HandleFunc("/api/users", controllers.GetAllUsers).Methods("GET")
	protected.HandleFunc("/users/{id}", controllers.GetUserByID).Methods("GET")
	protected.HandleFunc("/users/{id}/avatar", controllers.UpdateAvatar).Methods("PUT")
	protected.HandleFunc("/users/{id}/username", controllers.UpdateUsername).Methods("PUT")
	protected.HandleFunc("/users/{id}/highscore", controllers.UpdateHighscore).Methods("PUT")
	protected.HandleFunc("/users/{id}/average", controllers.UpdateAverage).Methods("PUT")
	protected.HandleFunc("/users", controllers.DeleteAllUsers).Methods("DELETE")
	protected.HandleFunc("/users/{id}", controllers.DeleteUser).Methods("DELETE")

	return router
}
