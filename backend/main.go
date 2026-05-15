package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"tutor-backend/handlers"
	"tutor-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

func main() {
	// Connect to PostgreSQL
	dbConnStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)
	db, err := sql.Open("postgres", dbConnStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("Cannot connect to PostgreSQL:", err)
	}
	fmt.Println("Connected to PostgreSQL!")

	// Connect to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_ADDR"),
	})
	fmt.Println("Redis client initialized")

	// JWT Secret from env (or default for dev)
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-dev-secret-change-in-production"
	}

	// Setup Gin
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"db":     "connected",
			"redis":  rdb != nil,
		})
	})

	// Initialize handlers
	guestHandler := handlers.NewGuestHandler(db)
	authHandler := handlers.NewAuthHandler(db, rdb, jwtSecret)
	prodiHandler := handlers.NewProdiHandler(db)
	pengumumanHandler := handlers.NewPengumumanHandler(db)

	// Register routes
	routes.RegisterGuestRoutes(r, guestHandler)
	routes.RegisterAuthRoutes(r, authHandler)
	routes.RegisterProdiRoutes(r, prodiHandler)
	routes.RegisterPengumumanRoutes(r, pengumumanHandler)

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Tutor API is running!"})
	})

	fmt.Println("Server starting on :8080")
	r.Run(":8080")
}
