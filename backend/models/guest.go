package models

import (
	"time"
)

type Guest struct {
	ID          int       `json:"id_tamu" db:"id_tamu"`
	WaktuTamu   time.Time `json:"waktu_tamu" db:"waktu_tamu"`
	NamaTamu    string    `json:"nama_tamu" db:"nama_tamu" binding:"required"`
	EmailTamu   string    `json:"email_tamu" db:"email_tamu" binding:"required,email"`
	CatatanTamu string    `json:"catatan_tamu" db:"catatan_tamu" binding:"required"`
}

type GuestCreateRequest struct {
	NamaTamu    string `json:"nama_tamu" binding:"required"`
	EmailTamu   string `json:"email_tamu" binding:"required,email"`
	CatatanTamu string `json:"catatan_tamu" binding:"required"`
}
