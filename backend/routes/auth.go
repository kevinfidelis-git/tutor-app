package routes

import (
	"tutor-backend/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(r *gin.Engine, authHandler *handlers.AuthHandler) {
	api := r.Group("/api")
	{
		api.POST("/login", authHandler.Login)
		api.GET("/login", authHandler.CheckRole)
		api.POST("/logout", authHandler.Logout)
	}
}
