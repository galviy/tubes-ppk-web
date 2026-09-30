-- Migrasi fitur reservasi (US 1-5, 8-10).
-- Idempotent: aman dijalankan berulang.
-- Pilih database tujuan saat menjalankan, misalnya:
--   mysql -h "$DB_IPADDRESS" -P "$DB_PORT" -u "$DB_USERNAME" -p "$DB_NAME" < backend/database/migration_reservasi.sql

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
CALL AddColIfNotExists('reservasi', 'waktu_dibatalkan', 'datetime DEFAULT NULL');
CALL AddColIfNotExists('reservasi', 'dibatalkan_oleh', 'int(11) DEFAULT NULL');
CALL AddColIfNotExists('reservasi', 'disetujui_oleh', 'int(11) DEFAULT NULL');
CALL AddColIfNotExists('reservasi', 'waktu_diproses', 'datetime DEFAULT NULL');
CALL AddColIfNotExists('reservasi', 'jumlah_peserta', 'int(11) DEFAULT NULL');
CALL AddColIfNotExists('alat_reservasi', 'jumlah', 'int(11) NOT NULL DEFAULT 1');
DROP PROCEDURE IF EXISTS AddColIfNotExists;

-- Status DONE dipakai untuk reservasi APPROVED yang waktunya telah lewat.
-- Database lama mungkin masih memakai ENUM yang tidak memuat DONE; ubah ke
-- VARCHAR agar sinkronisasi status otomatis tidak menggagalkan GET reservasi.
SET @status_data_type := (
  SELECT DATA_TYPE
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'reservasi'
    AND COLUMN_NAME = 'status_reservasi'
  LIMIT 1
);
SET @sql := IF(@status_data_type = 'enum',
  'ALTER TABLE `reservasi` MODIFY COLUMN `status_reservasi` varchar(10) NOT NULL',
  'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

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

-- Isi timestamp pembatalan lama dari riwayat status bila sebelumnya tersedia.
UPDATE `reservasi` r
JOIN (
  SELECT `id_reservasi`, MAX(`waktu`) AS `waktu_dibatalkan`
  FROM `reservasi_riwayat`
  WHERE `status_reservasi` = 'CANCELLED'
  GROUP BY `id_reservasi`
) riwayat ON riwayat.id_reservasi = r.id
SET r.waktu_dibatalkan = riwayat.waktu_dibatalkan
WHERE r.status_reservasi = 'CANCELLED'
  AND r.waktu_dibatalkan IS NULL;
