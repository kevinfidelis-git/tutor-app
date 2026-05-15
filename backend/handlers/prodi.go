package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProdiHandler struct {
	DB *sql.DB
}

func NewProdiHandler(db *sql.DB) *ProdiHandler {
	return &ProdiHandler{DB: db}
}

// GET /api/prodi — list all or single
func (h *ProdiHandler) Index(c *gin.Context) {
	id := c.Query("id")

	if id != "" {
		// Return single item
		var result struct {
			IDProdi      int    `json:"id_prodi"`
			ProgramStudi string `json:"program_studi"`
		}
		err := h.DB.QueryRow("SELECT id_prodi, program_studi FROM program_studi WHERE id_prodi = $1", id).Scan(&result.IDProdi, &result.ProgramStudi)
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Data not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		c.JSON(http.StatusOK, result)
		return
	}

	// Return all
	rows, err := h.DB.Query("SELECT id_prodi, program_studi FROM program_studi ORDER BY id_prodi ASC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var result []gin.H
	for rows.Next() {
		var id int
		var nama string
		rows.Scan(&id, &nama)
		result = append(result, gin.H{"id_prodi": id, "program_studi": nama})
	}

	c.JSON(http.StatusOK, result)
}

// POST /api/prodi — create
func (h *ProdiHandler) Store(c *gin.Context) {
	var req struct {
		ProgramStudi string `json:"program_studi" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Major name must be filled"})
		return
	}

	// Check duplicate
	var exists bool
	err := h.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM program_studi WHERE program_studi = $1)", req.ProgramStudi).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Major already exist"})
		return
	}

	_, err = h.DB.Exec("INSERT INTO program_studi (program_studi) VALUES ($1)", req.ProgramStudi)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save data"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Data added successfully"})
}

// GET /api/prodi/:id — show single (alternative route)
func (h *ProdiHandler) Show(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var result struct {
		IDProdi      int    `json:"id_prodi"`
		ProgramStudi string `json:"program_studi"`
	}
	err := h.DB.QueryRow("SELECT id_prodi, program_studi FROM program_studi WHERE id_prodi = $1", id).Scan(&result.IDProdi, &result.ProgramStudi)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// POST /api/prodi/:id — update
func (h *ProdiHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		ProgramStudi string `json:"program_studi" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Major name must be filled"})
		return
	}

	// Check duplicate, excluding current ID
	var exists bool
	err := h.DB.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM program_studi WHERE program_studi = $1 AND id_prodi != $2)",
		req.ProgramStudi, id,
	).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Major already exist"})
		return
	}

	_, err = h.DB.Exec("UPDATE program_studi SET program_studi = $1 WHERE id_prodi = $2", req.ProgramStudi, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update the data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data updated successfully"})
}

// DELETE /api/prodi/:id — destroy
func (h *ProdiHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	_, err := h.DB.Exec("DELETE FROM program_studi WHERE id_prodi = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Can't delete the data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data deleted successfully"})
}
