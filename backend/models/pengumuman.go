package models

import "time"

type Pengumuman struct {
	IDPengumuman      int       `json:"id_pengumuman" db:"id_pengumuman"`
	JudulPengumuman   string    `json:"judul_pengumuman" db:"judul_pengumuman"`
	IsiPengumuman     string    `json:"isi_pengumuman" db:"isi_pengumuman"`
	TanggalPengumuman time.Time `json:"tanggal_pengumuman" db:"tanggal_pengumuman"`
	TanggalExpire     time.Time `json:"tanggal_expire" db:"tanggal_expire"`
}
