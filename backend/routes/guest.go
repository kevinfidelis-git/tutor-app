package routes

import (
	"tutor-backend/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterGuestRoutes(r *gin.Engine, guestHandler *handlers.GuestHandler) {
	api := r.Group("/api")
	{
		api.GET("/tamu", guestHandler.Index)
		api.GET("/tamu/:id", guestHandler.Show)
		api.POST("/tamu", guestHandler.Store)
		api.DELETE("/tamu/:id", guestHandler.Delete)
	}
}
