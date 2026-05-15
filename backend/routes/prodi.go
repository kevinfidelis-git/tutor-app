package routes

import (
	"tutor-backend/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterProdiRoutes(r *gin.Engine, h *handlers.ProdiHandler) {
	api := r.Group("/api")
	{
		api.GET("/prodi", h.Index)
		api.POST("/prodi", h.Store)
		api.GET("/prodi/:id", h.Show)
		api.POST("/prodi/:id", h.Update)
		api.DELETE("/prodi/:id", h.Delete)
	}
}
