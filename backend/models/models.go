package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Username  string             `json:"username,omitempty"`
	Password  string             `json:"password,omitempty"`
	Avatar    int                `json:"avatar,omitempty"`
	Highscore int                `json:"highscore,omitempty"`
	Accuracy  float64            `json:"accuracy,omitempty"`
}
