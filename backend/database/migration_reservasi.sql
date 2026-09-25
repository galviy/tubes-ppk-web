-- Migrasi fitur reservasi (US 1-5, 8-10).
-- Idempotent: aman dijalankan berulang.
--   mysql -uroot -p tubes_ppk_web < backend/database/migration_reservasi.sql

USE tubes_ppk_web;

-- 1 & 2. Penambahan kolom secara idempoten untuk MySQL
DROP PROCEDURE IF EXISTS AddColIfNotExists;
DELIMITER $$
CREATE PROCEDURE AddColIfNotExists(
    IN tbl_name VARCHAR(64),
    IN col_name VARCHAR(64),
    IN col_def  VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = tbl_name
          AND COLUMN_NAME = col_name
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl_name, '` ADD COLUMN `', col_name, '` ', col_def);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

CALL AddColIfNotExists('reservasi', 'alasan_peminjaman', 'varchar(255) DEFAULT NULL');
CALL AddColIfNotExists('reservasi', 'alasan_pembatalan', 'varchar(255) DEFAULT NULL');
CALL AddColIfNotExists('reservasi', 'dibatalkan_oleh', 'int(11) DEFAULT NULL');
CALL AddColIfNotExists('reservasi', 'disetujui_oleh', 'int(11) DEFAULT NULL');
CALL AddColIfNotExists('reservasi', 'waktu_diproses', 'datetime DEFAULT NULL');
CALL AddColIfNotExists('reservasi', 'jumlah_peserta', 'int(11) DEFAULT NULL');
CALL AddColIfNotExists('alat_reservasi', 'jumlah', 'int(11) NOT NULL DEFAULT 1');
DROP PROCEDURE IF EXISTS AddColIfNotExists;

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
