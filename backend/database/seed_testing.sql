-- Seed data untuk testing backend (idempotent, aman dijalankan berulang).
-- Akun test: password semua akun = Test@123
--   admin@kampus.ac.id    -> admin    (user_role=1)
--   petugas@kampus.ac.id  -> petugas  (user_role=2)
--   mhs@kampus.ac.id      -> pengguna (user_role=3)
--   dosen@kampus.ac.id    -> pengguna (user_role=3)

USE tubes_ppk_web;

-- 0. Selaraskan schema lokal dengan db_schema.sql (kalau belum ada)
ALTER TABLE `alat` ADD COLUMN IF NOT EXISTS `status` tinyint(1) NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nip` varchar(100) NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `user_staff` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_unique` (`nip`),
  UNIQUE KEY `staff_unique_1` (`user_staff`),
  CONSTRAINT `staff_user_FK` FOREIGN KEY (`user_staff`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1. user_tipe yang dibutuhkan create_user/petugas & create_user/admin
INSERT INTO `user_tipe` (`tipe`) VALUES ('Staff'), ('Petugas'), ('Admin')
  ON DUPLICATE KEY UPDATE `tipe` = VALUES(`tipe`);

-- 2. kategori (untuk ruangan & alat)
INSERT INTO `kategori` (`nama_kategori`)
  SELECT 'Ruang Kuliah' WHERE NOT EXISTS (SELECT 1 FROM `kategori` WHERE `nama_kategori`='Ruang Kuliah');
INSERT INTO `kategori` (`nama_kategori`)
  SELECT 'Alat Elektronik' WHERE NOT EXISTS (SELECT 1 FROM `kategori` WHERE `nama_kategori`='Alat Elektronik');
INSERT INTO `kategori` (`nama_kategori`)
  SELECT 'Ruang Rapat' WHERE NOT EXISTS (SELECT 1 FROM `kategori` WHERE `nama_kategori`='Ruang Rapat');

-- 3. ruangan
INSERT INTO `ruangan` (`nama_ruangan`, `status`, `kapasitas`, `lokasi`, `kategori`)
  SELECT 'A101', 'aktif', 40, 'Gedung A Lantai 1',
         (SELECT id FROM `kategori` WHERE `nama_kategori`='Ruang Kuliah')
  WHERE NOT EXISTS (SELECT 1 FROM `ruangan` WHERE `nama_ruangan`='A101');
INSERT INTO `ruangan` (`nama_ruangan`, `status`, `kapasitas`, `lokasi`, `kategori`)
  SELECT 'Ruang Rapat 1', 'aktif', 12, 'Gedung B Lantai 2',
         (SELECT id FROM `kategori` WHERE `nama_kategori`='Ruang Rapat')
  WHERE NOT EXISTS (SELECT 1 FROM `ruangan` WHERE `nama_ruangan`='Ruang Rapat 1');

-- 4. alat
INSERT INTO `alat` (`nama_alat`, `jumlah_tersedia`, `banyak_alat`, `kategori`, `status`)
  SELECT 'Proyektor Epson', 5, 5,
         (SELECT id FROM `kategori` WHERE `nama_kategori`='Alat Elektronik'), 1
  WHERE NOT EXISTS (SELECT 1 FROM `alat` WHERE `nama_alat`='Proyektor Epson');
INSERT INTO `alat` (`nama_alat`, `jumlah_tersedia`, `banyak_alat`, `kategori`, `status`)
  SELECT 'Speaker Portabel', 3, 3,
         (SELECT id FROM `kategori` WHERE `nama_kategori`='Alat Elektronik'), 1
  WHERE NOT EXISTS (SELECT 1 FROM `alat` WHERE `nama_alat`='Speaker Portabel');

-- 5. akun test (isVerified=1 supaya bisa login)
--    hash bcrypt dari 'Test@123'
INSERT INTO `user` (`username`, `email`, `password`, `user_role`, `isVerified`, `tipe_user`)
  SELECT 'adminppk', 'admin@kampus.ac.id',
         '$2a$10$j2C2idIlhYxj8sPp9L7uBuMu4brDqg0qppAZhLUQzp.plt70uw23m', 1, 1,
         (SELECT id FROM `user_tipe` WHERE `tipe`='Admin')
  WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE `email`='admin@kampus.ac.id');

INSERT INTO `user` (`username`, `email`, `password`, `user_role`, `isVerified`, `tipe_user`)
  SELECT 'petugasppk', 'petugas@kampus.ac.id',
         '$2a$10$j2C2idIlhYxj8sPp9L7uBuMu4brDqg0qppAZhLUQzp.plt70uw23m', 2, 1,
         (SELECT id FROM `user_tipe` WHERE `tipe`='Petugas')
  WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE `email`='petugas@kampus.ac.id');

INSERT INTO `user` (`username`, `email`, `password`, `user_role`, `isVerified`, `tipe_user`)
  SELECT 'mhsppk', 'mhs@kampus.ac.id',
         '$2a$10$j2C2idIlhYxj8sPp9L7uBuMu4brDqg0qppAZhLUQzp.plt70uw23m', 3, 1,
         (SELECT id FROM `user_tipe` WHERE `tipe`='mhs')
  WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE `email`='mhs@kampus.ac.id');

INSERT INTO `user` (`username`, `email`, `password`, `user_role`, `isVerified`, `tipe_user`)
  SELECT 'dosenppk', 'dosen@kampus.ac.id',
         '$2a$10$j2C2idIlhYxj8sPp9L7uBuMu4brDqg0qppAZhLUQzp.plt70uw23m', 3, 1,
         (SELECT id FROM `user_tipe` WHERE `tipe`='Dosen')
  WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE `email`='dosen@kampus.ac.id');

-- Ringkasan
SELECT u.id, u.username, u.email, u.isVerified, r.nama_role, ut.tipe
FROM `user` u
JOIN `role` r ON r.id = u.user_role
JOIN `user_tipe` ut ON ut.id = u.tipe_user
ORDER BY u.id;
SELECT id, nama_ruangan, status FROM `ruangan`;
SELECT id, nama_alat, jumlah_tersedia, banyak_alat FROM `alat`;
SELECT id, nama_kategori FROM `kategori`;
