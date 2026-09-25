-- ========================================================================
-- Scheduler Pembatalan Otomatis Reservasi (Belum Diapprove Petugas)
-- ========================================================================
-- Logika:
-- Jika pengguna sudah reservasi tapi status masih 'PENDING' (belum di-approve petugas)
-- hingga 2 jam sebelum waktu reservasi dia (waktu_peminjaman <= NOW() + INTERVAL 2 HOUR),
-- maka sistem akan membatalkan reservasi tersebut secara otomatis (status -> 'CANCELLED').
-- ========================================================================

-- 1. Mengaktifkan Event Scheduler di MySQL / MariaDB (jika belum aktif)
SET GLOBAL event_scheduler = ON;

-- 2. Hapus event lama jika sudah ada
DROP EVENT IF EXISTS `auto_cancel_unapproved_reservasi`;

-- 3. Membuat Event Scheduler yang berjalan setiap 1 menit
DELIMITER $$

CREATE EVENT `auto_cancel_unapproved_reservasi`
ON SCHEDULE EVERY 1 MINUTE
STARTS CURRENT_TIMESTAMP
COMMENT 'Membatalkan otomatis reservasi PENDING 2 jam sebelum waktu mulai reservasi'
DO
BEGIN
    UPDATE `reservasi`
    SET `status_reservasi` = 'CANCELLED'
    WHERE `status_reservasi` = 'PENDING'
      AND `waktu_peminjaman` <= NOW() + INTERVAL 2 HOUR;
END $$

DELIMITER ;

-- ========================================================================
-- Perintah untuk Verifikasi Event Scheduler:
-- 1. Cek apakah event sudah terdaftar:
--    SHOW EVENTS FROM `railway`;
--
-- 2. Cek status detail event:
--    SELECT EVENT_NAME, STATUS, INTERVAL_VALUE, INTERVAL_FIELD, LAST_EXECUTED 
--    FROM information_schema.EVENTS 
--    WHERE EVENT_NAME = 'auto_cancel_unapproved_reservasi';
--
-- 3. Cek apakah ada reservasi yang terpengaruh:
--    SELECT id, waktu_peminjaman, status_reservasi 
--    FROM reservasi 
--    WHERE status_reservasi = 'CANCELLED';
-- ========================================================================
