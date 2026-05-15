package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"tutor-backend/models"

	"github.com/gin-gonic/gin"
)

type GuestHandler struct {
	DB *sql.DB
}

func NewGuestHandler(db *sql.DB) *GuestHandler {
	return &GuestHandler{DB: db}
}

// GET /api/tamu — list all guests
func (h *GuestHandler) Index(c *gin.Context) {

	rows, err := h.DB.Query(`
		SELECT id_tamu, waktu_tamu, nama_tamu, email_tamu, catatan_tamu 
		FROM buku_tamu 
		ORDER BY id_tamu DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch guests"})
		return
	}
	defer rows.Close()

	var guests []models.Guest
	for rows.Next() {
		var g models.Guest
		err := rows.Scan(&g.ID, &g.WaktuTamu, &g.NamaTamu, &g.EmailTamu, &g.CatatanTamu)
		if err != nil {
			continue
		}
		guests = append(guests, g)
	}

	c.JSON(http.StatusOK, guests)
}

// GET /api/tamu/:id — single guest
func (h *GuestHandler) Show(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID not valid"})
		return
	}

	var g models.Guest
	err = h.DB.QueryRow(`
		SELECT id_tamu, waktu_tamu, nama_tamu, email_tamu, catatan_tamu 
		FROM buku_tamu 
		WHERE id_tamu = $1
	`, id).Scan(&g.ID, &g.WaktuTamu, &g.NamaTamu, &g.EmailTamu, &g.CatatanTamu)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guest not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, g)
}

// POST /api/tamu — create guest
func (h *GuestHandler) Store(c *gin.Context) {
	var req models.GuestCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	waktu := time.Now().In(time.FixedZone("Asia/Jakarta", 7*60*60))

	var id int
	err := h.DB.QueryRow(`
		INSERT INTO buku_tamu (waktu_tamu, nama_tamu, email_tamu, catatan_tamu)
		VALUES ($1, $2, $3, $4)
		RETURNING id_tamu
	`, waktu, req.NamaTamu, req.EmailTamu, req.CatatanTamu).Scan(&id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create guest"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Input data berhasil",
		"id_tamu":    id,
		"waktu_tamu": waktu,
	})
}

// DELETE /api/tamu/:id — delete guest
func (h *GuestHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID not valid"})
		return
	}

	_, err = h.DB.Exec("DELETE FROM buku_tamu WHERE id_tamu = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data deleted successfully"})
}
