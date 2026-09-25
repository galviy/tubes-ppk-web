-- Migrasi fitur reservasi (US 1-5, 8-10).
-- Idempotent: aman dijalankan berulang.
--   mysql -uroot -p tubes_ppk_web < backend/database/migration_reservasi.sql

USE tubes_ppk_web;

-- 1. Reservasi: kolom yang dipakai kode tapi belum ada di schema.
ALTER TABLE `reservasi`
  ADD COLUMN IF NOT EXISTS `alasan_peminjaman` varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `alasan_pembatalan` varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `dibatalkan_oleh` int(11) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `disetujui_oleh` int(11) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `waktu_diproses` datetime DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `jumlah_peserta` int(11) DEFAULT NULL;

-- 2. Satu reservasi boleh punya banyak alat + jumlah per alat.
ALTER TABLE `alat_reservasi`
  ADD COLUMN IF NOT EXISTS `jumlah` int(11) NOT NULL DEFAULT 1;

-- Unique (id_reservasi) menghalangi banyak alat per reservasi.
-- Index unik itu dipakai FK, jadi: lepas FK -> drop unique -> index biasa -> pasang FK lagi.
SET @punya_unique := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'alat_reservasi'
    AND INDEX_NAME = 'alat_reservasi_unique'
);

SET @sql := IF(@punya_unique > 0,
  'ALTER TABLE `alat_reservasi` DROP FOREIGN KEY `alat_reservasi_reservasi_FK`',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(@punya_unique > 0,
  'ALTER TABLE `alat_reservasi` DROP INDEX `alat_reservasi_unique`',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(@punya_unique > 0,
  'ALTER TABLE `alat_reservasi` ADD INDEX `alat_reservasi_reservasi_idx` (`id_reservasi`)',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(@punya_unique > 0,
  'ALTER TABLE `alat_reservasi` ADD CONSTRAINT `alat_reservasi_reservasi_FK` FOREIGN KEY (`id_reservasi`) REFERENCES `reservasi` (`id`)',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Riwayat lengkap perubahan status.
CREATE TABLE IF NOT EXISTS `reservasi_riwayat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_reservasi` int(11) NOT NULL,
  `status_reservasi` varchar(10) NOT NULL,
  `diubah_oleh` int(11) DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `waktu` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservasi_riwayat_reservasi_FK` (`id_reservasi`),
  CONSTRAINT `reservasi_riwayat_reservasi_FK` FOREIGN KEY (`id_reservasi`) REFERENCES `reservasi` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
