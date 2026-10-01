-- Migrasi penambahan kolom deskripsi, kelengkapan, dan foto pada tabel ruangan dan alat.
-- Idempotent: aman dijalankan berulang kali.
--   mysql -uroot -p tubes_ppk_web < backend/database/migration_fasilitas_detail.sql

USE tubes_ppk_web;

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

CALL AddColIfNotExists('ruangan', 'deskripsi', 'TEXT DEFAULT NULL');
CALL AddColIfNotExists('ruangan', 'kelengkapan', 'TEXT DEFAULT NULL');
CALL AddColIfNotExists('ruangan', 'foto', 'LONGTEXT DEFAULT NULL');

CALL AddColIfNotExists('alat', 'deskripsi', 'TEXT DEFAULT NULL');
CALL AddColIfNotExists('alat', 'kelengkapan', 'TEXT DEFAULT NULL');
CALL AddColIfNotExists('alat', 'foto', 'LONGTEXT DEFAULT NULL');

DROP PROCEDURE IF EXISTS AddColIfNotExists;
