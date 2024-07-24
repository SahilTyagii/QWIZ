package helper

import (
	"context"
	"fmt"

	"github.com/SahilTyagii/qwiz-backend/config"
	"github.com/SahilTyagii/qwiz-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateUser(user models.User) error {
	if user.ID == primitive.NilObjectID {
		user.ID = primitive.NewObjectID()
	}

	inserted, err := config.Collection.InsertOne(context.Background(), user)
	if err != nil {
		return fmt.Errorf("cannot create user: %w", err)
	}

	fmt.Println("Inserted 1 user in db with id:", inserted.InsertedID)
	return nil
}

func UpdateAvatar(userId string, newAvatar int) error {
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}

	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"avatar": newAvatar}}
	result, err := config.Collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("cannot update avatar: %w", err)
	}

	fmt.Println("Changed avatar:", result.ModifiedCount)
	return nil
}

func UpdateUsername(userId string, newUsername string) error {
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}

	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"username": newUsername}}
	result, err := config.Collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("cannot update username: %w", err)
	}

	fmt.Println("Changed username:", result.ModifiedCount)
	return nil
}

func UpdateHighscore(userId string, newHighscore int) error {
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}

	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"highscore": newHighscore}}
	result, err := config.Collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("cannot update highscore: %w", err)
	}

	fmt.Println("Changed highscore:", result.ModifiedCount)
	return nil
}

func UpdateAverage(userId string, newAverage float64) error {
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}

	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"average": newAverage}}
	result, err := config.Collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return fmt.Errorf("cannot update average: %w", err)
	}

	fmt.Println("Changed average:", result.ModifiedCount)
	return nil
}

func DeleteUser(userId string) error {
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return fmt.Errorf("invalid user ID: %w", err)
	}

	filter := bson.M{"_id": id}
	deleteCount, err := config.Collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return fmt.Errorf("cannot delete user: %w", err)
	}

	fmt.Println("User got deleted with delete count:", deleteCount)
	return nil
}

func DeleteAllUsers() (int64, error) {
	deleteResult, err := config.Collection.DeleteMany(context.Background(), bson.D{{}}, nil)
	if err != nil {
		return 0, fmt.Errorf("cannot delete users: %w", err)
	}

	fmt.Println("Users got deleted with delete count:", deleteResult.DeletedCount)
	return deleteResult.DeletedCount, nil
}

func GetAllUsers() ([]primitive.M, error) {
	cursor, err := config.Collection.Find(context.Background(), bson.D{{}})
	if err != nil {
		return nil, fmt.Errorf("cannot get all users: %w", err)
	}
	defer cursor.Close(context.Background())

	var users []primitive.M
	for cursor.Next(context.Background()) {
		var user bson.M
		if err := cursor.Decode(&user); err != nil {
			return nil, fmt.Errorf("cannot decode user: %w", err)
		}
		users = append(users, user)
	}

	return users, nil
}

func GetUserByID(userId string) (models.User, error) {
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return models.User{}, fmt.Errorf("invalid user ID: %w", err)
	}

	filter := bson.M{"_id": id}

	var user models.User
	err = config.Collection.FindOne(context.Background(), filter).Decode(&user)
	if err != nil {
		return models.User{}, fmt.Errorf("cannot find user: %w", err)
	}
	return user, nil
}
