package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"tutor-backend/models"

	"github.com/gin-gonic/gin"
)

type PengumumanHandler struct {
	DB *sql.DB
}

func NewPengumumanHandler(db *sql.DB) *PengumumanHandler {
	return &PengumumanHandler{DB: db}
}

func (h *PengumumanHandler) Index(c *gin.Context) {
	id := c.Param("id")

	if id == "" {
		// Default: active announcements only (not expired)
		rows, err := h.DB.Query(`
			SELECT id_pengumuman, judul_pengumuman, isi_pengumuman, 
			       tanggal_pengumuman, tanggal_expire 
			FROM pengumuman 
			WHERE tanggal_expire >= CURRENT_DATE 
			ORDER BY id_pengumuman DESC`)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var results []models.Pengumuman
		for rows.Next() {
			var p models.Pengumuman
			if err := rows.Scan(&p.IDPengumuman, &p.JudulPengumuman, &p.IsiPengumuman,
				&p.TanggalPengumuman, &p.TanggalExpire); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			results = append(results, p)
		}
		c.JSON(http.StatusOK, results)
		return
	}

	if id == "all" {
		// Get all announcements
		rows, err := h.DB.Query(`
			SELECT id_pengumuman, judul_pengumuman, isi_pengumuman, 
			       tanggal_pengumuman, tanggal_expire 
			FROM pengumuman 
			ORDER BY id_pengumuman DESC`)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var results []models.Pengumuman
		for rows.Next() {
			var p models.Pengumuman
			if err := rows.Scan(&p.IDPengumuman, &p.JudulPengumuman, &p.IsiPengumuman,
				&p.TanggalPengumuman, &p.TanggalExpire); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			results = append(results, p)
		}
		c.JSON(http.StatusOK, results)
		return
	}

	// Single item
	h.Show(c)
}

// GET /api/pengumuman/:id (single)
func (h *PengumumanHandler) Show(c *gin.Context) {
	id := c.Param("id")

	var p models.Pengumuman
	err := h.DB.QueryRow(`
		SELECT id_pengumuman, judul_pengumuman, isi_pengumuman, 
		       tanggal_pengumuman, tanggal_expire 
		FROM pengumuman 
		WHERE id_pengumuman = $1`, id).Scan(
		&p.IDPengumuman, &p.JudulPengumuman, &p.IsiPengumuman,
		&p.TanggalPengumuman, &p.TanggalExpire)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Announcement not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, p)
}

// POST /api/pengumuman
func (h *PengumumanHandler) Store(c *gin.Context) {
	var req struct {
		JudulPengumuman string `json:"judul_pengumuman" binding:"required"`
		IsiPengumuman   string `json:"isi_pengumuman" binding:"required"`
		TanggalExpire   string `json:"tanggal_expire" binding:"required"` // "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse expire date (handles both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm")
	tgl := strings.Split(req.TanggalExpire, "T")
	expireDate, err := time.Parse("2006-01-02", tgl[0])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}
	expireDate = expireDate.AddDate(0, 0, 1) // Add 1 day (matches Laravel behavior)

	today := time.Now().Truncate(24 * time.Hour)

	var id int
	err = h.DB.QueryRow(`
		INSERT INTO pengumuman (judul_pengumuman, isi_pengumuman, tanggal_pengumuman, tanggal_expire)
		VALUES ($1, $2, $3, $4)
		RETURNING id_pengumuman`,
		req.JudulPengumuman, req.IsiPengumuman, today, expireDate,
	).Scan(&id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id_pengumuman":      id,
		"judul_pengumuman":   req.JudulPengumuman,
		"isi_pengumuman":     req.IsiPengumuman,
		"tanggal_pengumuman": today,
		"tanggal_expire":     expireDate,
	})
}

// PUT /api/pengumuman/:id
func (h *PengumumanHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		JudulPengumuman string `json:"judul_pengumuman" binding:"required"`
		IsiPengumuman   string `json:"isi_pengumuman" binding:"required"`
		TanggalExpire   string `json:"tanggal_expire" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tgl := strings.Split(req.TanggalExpire, "T")
	expireDate, err := time.Parse("2006-01-02", tgl[0])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	today := time.Now().Truncate(24 * time.Hour)

	result, err := h.DB.Exec(`
		UPDATE pengumuman 
		SET judul_pengumuman = $1, isi_pengumuman = $2, 
		    tanggal_pengumuman = $3, tanggal_expire = $4
		WHERE id_pengumuman = $5`,
		req.JudulPengumuman, req.IsiPengumuman, today, expireDate, id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Announcement not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Announcement updated"})
}

// DELETE /api/pengumuman/:id
func (h *PengumumanHandler) Destroy(c *gin.Context) {
	id := c.Param("id")

	_, err := h.DB.Exec("DELETE FROM pengumuman WHERE id_pengumuman = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Announcement deleted"})
}
