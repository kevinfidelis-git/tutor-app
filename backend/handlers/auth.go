package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"tutor-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
)

type AuthHandler struct {
	DB        *sql.DB
	RDB       *redis.Client
	JWTSecret string
}

func NewAuthHandler(db *sql.DB, rdb *redis.Client, secret string) *AuthHandler {
	return &AuthHandler{
		DB:        db,
		RDB:       rdb,
		JWTSecret: secret,
	}
}

// POST /api/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username and password must be filled"})
		return
	}

	var username string
	var token string
	var err error
	// Admin login (special case)
	if req.Username == "petrasinergi" || req.Username == "petrasinergi@gmail.com" {
		if req.Password == "admin123" { // Default admin password
			username = "petrasinergi"
			token, err = h.generateToken(username, "admin")
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Fail to generate token"})
				return
			}
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Wrong password"})
			return
		}
	} else {
		// Student login: username = NRP (e.g., 2641xxxx), password = same NRP
		username = strings.ToLower(strings.TrimSpace(req.Username))
		// Remove @petra.ac.id or @gmail.com if present
		username = strings.Split(username, "@")[0]
		// Remove 'm' prefix if present (old Petra format: m2641xxxx → 2641xxxx)
		username = strings.Replace(username, "m", "", 1)

		// Verify: password must equal username (NRP)
		if req.Password != username {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Wrong password"})
			return
		}

		// Check if student exists in database and is active
		var exists bool
		var status int
		err := h.DB.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM mahasiswa WHERE nrp_mahasiswa = $1),
				COALESCE((SELECT status_mahasiswa FROM mahasiswa WHERE nrp_mahasiswa = $1), 0)
		`, username).Scan(&exists, &status)

		if err != nil || !exists || status != 1 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Student not found"})
			return
		}

		// Generate JWT
		token, err = h.generateToken(username, "student")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Fail to generate token"})
			return
		}
	}

	// Store token in Redis with expiry (6 hours = 360 minutes)
	ctx := c.Request.Context()
	h.RDB.Set(ctx, "token:"+username, token, 6*time.Hour)

	c.JSON(http.StatusOK, models.LoginResponse{Token: token})
}

// GET /api/login?token=xxx
func (h *AuthHandler) CheckRole(c *gin.Context) {
	tokenString := c.Query("token")
	if tokenString == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token not found"})
		return
	}

	// Parse and validate token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(h.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token not valid"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Claims not valid"})
		return
	}

	sub, _ := claims["sub"].(string)
	//role, _ := claims["role"].(string)

	// Check Redis if token is still valid (not blacklisted/logged out)
	ctx := c.Request.Context()
	storedToken, err := h.RDB.Get(ctx, "token:"+sub).Result()
	if err != nil || storedToken != tokenString {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token has expired or user has logged out"})
		return
	}

	// Determine role
	if sub == "petrasinergi" {
		c.JSON(http.StatusOK, models.RoleResponse{Role: "admin"})
		return
	}

	// Check if tutor assistant (astor)
	var isAstor bool
	h.DB.QueryRow(`
		SELECT EXISTS(SELECT 1 FROM asisten_tutor WHERE nrp_mahasiswa = $1)
	`, sub).Scan(&isAstor)

	if isAstor {
		c.JSON(http.StatusOK, models.RoleResponse{Role: "astor"})
		return
	}

	// Check if regular new student (maba)
	var isStudent bool
	h.DB.QueryRow(`
		SELECT EXISTS(SELECT 1 FROM mahasiswa WHERE nrp_mahasiswa = $1 AND status_mahasiswa = 1)
	`, sub).Scan(&isStudent)

	if isStudent {
		c.JSON(http.StatusOK, models.RoleResponse{Role: "maba"})
		return
	}

	c.JSON(http.StatusOK, models.RoleResponse{Role: "unknown"})
}

// Generate JWT token
func (h *AuthHandler) generateToken(sub string, role string) (string, error) {
	claims := jwt.MapClaims{
		"sub":  sub,
		"role": role,
		"exp":  time.Now().Add(6 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.JWTSecret))
}

// POST /api/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token tidak ditemukan"})
		return
	}

	// Remove "Bearer " prefix
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	// Parse to get subject
	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(h.JWTSecret), nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		sub, _ := claims["sub"].(string)
		// Delete from Redis (blacklist/logout)
		ctx := c.Request.Context()
		h.RDB.Del(ctx, "token:"+sub)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logout success"})
}
