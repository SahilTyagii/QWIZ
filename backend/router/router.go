package router

import (
	"github.com/SahilTyagii/qwiz-backend/controllers"
	"github.com/gorilla/mux"
)

func Router() *mux.Router {
	router := mux.NewRouter()

	router.HandleFunc("/api/users", controllers.GetAllUsers).Methods("GET")
	router.HandleFunc("/api/user/{id}", controllers.GetUserByID).Methods("GET")
	router.HandleFunc("/api/user", controllers.CreateUser).Methods("POST")
	router.HandleFunc("/api/avatar/{id}", controllers.UpdateAvatar).Methods("PUT")
	router.HandleFunc("/api/username/{id}", controllers.UpdateUsername).Methods("PUT")
	router.HandleFunc("/api/highscore/{id}", controllers.UpdateHighscore).Methods("PUT")
	router.HandleFunc("/api/average/{id}", controllers.UpdateAverage).Methods("PUT")
	router.HandleFunc("/api/users", controllers.DeleteAllUsers).Methods("DELETE")
	router.HandleFunc("/api/user/{id}", controllers.DeleteUser).Methods("DELETE")

	return router
}
