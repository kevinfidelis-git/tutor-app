package routes

import (
	"tutor-backend/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterPengumumanRoutes(r *gin.Engine, pengumumanHandler *handlers.PengumumanHandler) {
	api := r.Group("/api")
	{
		api.GET("/pengumuman", pengumumanHandler.Index)
		api.GET("/pengumuman/:id", pengumumanHandler.Index)
		api.POST("/pengumuman", pengumumanHandler.Store)
		api.PUT("/pengumuman/:id", pengumumanHandler.Update)
		api.DELETE("/pengumuman/:id", pengumumanHandler.Destroy)
	}
}
