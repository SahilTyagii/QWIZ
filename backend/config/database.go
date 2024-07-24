package config

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var dbUserName string
var dbPassword string

// connection
var Collection *mongo.Collection

func init() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading env files: ", err)
	}

	dbUserName = os.Getenv("DB_USERNAME")
	dbPassword = os.Getenv("DB_PASSWORD")

	if dbUserName == "" || dbPassword == "" {
		log.Fatalf("DB_USERNAME or DB_PASSWORD not set in environment")
	}

	connectionString := fmt.Sprintf("mongodb+srv://%s:%s@cluster0.dfi5ulj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", dbUserName, dbPassword)

	const dbName = "qwiz"
	const colName = "users"

	//client options
	clientOptions := options.Client().ApplyURI(connectionString)

	// connect to mongodb
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatalf("Cannot connect to database: %v", err)
	}

	fmt.Println("MongoDB connection success")

	Collection = client.Database(dbName).Collection(colName)

	fmt.Println("Collection instance is ready")
}
