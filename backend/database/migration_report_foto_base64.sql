-- Migrasi kolom report.foto dari varchar(255) (path uploads/...)
-- ke MEDIUMTEXT agar bisa menyimpan data-URL base64 langsung di database.
-- Base64 foto 2MB ~= 2.8MB teks, jadi varchar tidak cukup.
-- Aman diulang (idempotent) dan mempertahankan data lama.
ALTER TABLE `report` MODIFY COLUMN `foto` MEDIUMTEXT COLLATE utf8mb4_unicode_ci NULL;
