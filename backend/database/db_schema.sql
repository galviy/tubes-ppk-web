/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.20-12.3.3-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: tubes_ppk_web
-- ------------------------------------------------------
-- Server version	12.3.3-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `alat`
--

DROP TABLE IF EXISTS `alat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `alat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_alat` varchar(255) NOT NULL,
  `jumlah_tersedia` int(11) NOT NULL,
  `banyak_alat` int(11) NOT NULL,
  `kategori` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alat_unique` (`nama_alat`),
  KEY `alat_kategori_FK` (`kategori`),
  CONSTRAINT `alat_kategori_FK` FOREIGN KEY (`kategori`) REFERENCES `kategori` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alat`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `alat` WRITE;
/*!40000 ALTER TABLE `alat` DISABLE KEYS */;
/*!40000 ALTER TABLE `alat` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `alat_reservasi`
--

DROP TABLE IF EXISTS `alat_reservasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `alat_reservasi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_alat` int(11) NOT NULL,
  `id_reservasi` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alat_reservasi_unique` (`id_reservasi`),
  KEY `alat_reservasi_alat_FK` (`id_alat`),
  CONSTRAINT `alat_reservasi_alat_FK` FOREIGN KEY (`id_alat`) REFERENCES `alat` (`id`),
  CONSTRAINT `alat_reservasi_reservasi_FK` FOREIGN KEY (`id_reservasi`) REFERENCES `reservasi` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alat_reservasi`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `alat_reservasi` WRITE;
/*!40000 ALTER TABLE `alat_reservasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `alat_reservasi` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `dosen`
--

DROP TABLE IF EXISTS `dosen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dosen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nidn` varchar(50) NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `dosen_user` int(11) NOT NULL,
  `prodi_dosen` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dosen_unique` (`nidn`),
  UNIQUE KEY `dosen_unique_1` (`dosen_user`),
  KEY `dosen_prodi_FK` (`prodi_dosen`),
  CONSTRAINT `dosen_prodi_FK` FOREIGN KEY (`prodi_dosen`) REFERENCES `prodi` (`id`),
  CONSTRAINT `dosen_user_FK` FOREIGN KEY (`dosen_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dosen`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `dosen` WRITE;
/*!40000 ALTER TABLE `dosen` DISABLE KEYS */;
/*!40000 ALTER TABLE `dosen` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `dosen_pending`
--

DROP TABLE IF EXISTS `dosen_pending`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dosen_pending` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nidn` varchar(50) NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `dosen_user` int(11) NOT NULL,
  `prodi_dosen` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dosen_prodi_FK` (`prodi_dosen`),
  KEY `idx_dosen_user` (`dosen_user`),
  CONSTRAINT `dosen_prodi_FK_2` FOREIGN KEY (`prodi_dosen`) REFERENCES `prodi` (`id`),
  CONSTRAINT `dosen_user_FK_2` FOREIGN KEY (`dosen_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dosen_pending`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `dosen_pending` WRITE;
/*!40000 ALTER TABLE `dosen_pending` DISABLE KEYS */;
/*!40000 ALTER TABLE `dosen_pending` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fakultas`
--

DROP TABLE IF EXISTS `fakultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fakultas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_fakultas` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fakultas_unique` (`nama_fakultas`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fakultas`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fakultas` WRITE;
/*!40000 ALTER TABLE `fakultas` DISABLE KEYS */;
INSERT INTO `fakultas` VALUES
(1,'Sekolah Teknik Elektro Komputasi (STEI-K)');
/*!40000 ALTER TABLE `fakultas` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `kategori`
--

DROP TABLE IF EXISTS `kategori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategori` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategori`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `kategori` WRITE;
/*!40000 ALTER TABLE `kategori` DISABLE KEYS */;
/*!40000 ALTER TABLE `kategori` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mahasiswa`
--

DROP TABLE IF EXISTS `mahasiswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mahasiswa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nim` varchar(14) NOT NULL,
  `angkatan` varchar(4) NOT NULL,
  `mhs_user` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `prodi` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `NewTable_UNIQUE` (`nim`),
  UNIQUE KEY `mahasiswa_unique` (`mhs_user`),
  KEY `mahasiswa_prodi_FK` (`prodi`),
  CONSTRAINT `mahasiswa_prodi_FK` FOREIGN KEY (`prodi`) REFERENCES `prodi` (`id`),
  CONSTRAINT `mahasiswa_user_FK` FOREIGN KEY (`mhs_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='mahasiswa';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mahasiswa`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mahasiswa` WRITE;
/*!40000 ALTER TABLE `mahasiswa` DISABLE KEYS */;
/*!40000 ALTER TABLE `mahasiswa` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mahasiswa_pending`
--

DROP TABLE IF EXISTS `mahasiswa_pending`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mahasiswa_pending` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nim` varchar(14) NOT NULL,
  `angkatan` varchar(4) NOT NULL,
  `mhs_user` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `prodi` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mahasiswa_prodi_FK` (`prodi`),
  KEY `idx_mhs_user` (`mhs_user`),
  CONSTRAINT `mahasiswa_prodi_FK_2` FOREIGN KEY (`prodi`) REFERENCES `prodi` (`id`),
  CONSTRAINT `mahasiswa_user_FK_2` FOREIGN KEY (`mhs_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mahasiswa_pending`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mahasiswa_pending` WRITE;
/*!40000 ALTER TABLE `mahasiswa_pending` DISABLE KEYS */;
/*!40000 ALTER TABLE `mahasiswa_pending` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `prodi`
--

DROP TABLE IF EXISTS `prodi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `prodi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_prodi` varchar(255) NOT NULL,
  `fakultas_prodi` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prodi_unique` (`nama_prodi`),
  KEY `prodi_fakultas_FK` (`fakultas_prodi`),
  CONSTRAINT `prodi_fakultas_FK` FOREIGN KEY (`fakultas_prodi`) REFERENCES `fakultas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prodi`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `prodi` WRITE;
/*!40000 ALTER TABLE `prodi` DISABLE KEYS */;
INSERT INTO `prodi` VALUES
(1,'Informatika',1),
(2,'Sistem dan Teknologi Informasi (STI)',1);
/*!40000 ALTER TABLE `prodi` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `foto` varchar(50) DEFAULT NULL,
  `user_report` int(11) NOT NULL,
  `alasan` varchar(255) NOT NULL,
  `status_laporan` varchar(20) NOT NULL,
  `report_ruangan` int(11) DEFAULT NULL,
  `report_alat` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_unique` (`foto`),
  KEY `report_user_FK` (`user_report`),
  CONSTRAINT `report_user_FK` FOREIGN KEY (`user_report`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `report_message`
--

DROP TABLE IF EXISTS `report_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_report` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `pesan` varchar(4000) NOT NULL,
  `created_at` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_message_user_FK` (`id_user`),
  KEY `report_message_report_FK` (`id_report`),
  CONSTRAINT `report_message_report_FK` FOREIGN KEY (`id_report`) REFERENCES `report` (`id`),
  CONSTRAINT `report_message_user_FK` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_message`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `report_message` WRITE;
/*!40000 ALTER TABLE `report_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_message` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `reservasi`
--

DROP TABLE IF EXISTS `reservasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservasi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `waktu_reservasi_dibuat` datetime NOT NULL,
  `ruangan_reservasi` int(11) DEFAULT NULL,
  `user_reservasi` int(11) NOT NULL,
  `waktu_peminjaman` datetime NOT NULL,
  `waktu_peminjaman_selesai` datetime NOT NULL,
  `status_reservasi` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservasi_user_FK` (`user_reservasi`),
  KEY `reservasi_ruangan_FK` (`ruangan_reservasi`),
  CONSTRAINT `reservasi_ruangan_FK` FOREIGN KEY (`ruangan_reservasi`) REFERENCES `ruangan` (`id`),
  CONSTRAINT `reservasi_user_FK` FOREIGN KEY (`user_reservasi`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservasi`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `reservasi` WRITE;
/*!40000 ALTER TABLE `reservasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservasi` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_role` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_unique` (`nama_role`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES
(1,'admin'),
(3,'pengguna'),
(2,'petugas');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ruangan`
--

DROP TABLE IF EXISTS `ruangan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ruangan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_ruangan` varchar(255) NOT NULL,
  `status` varchar(15) NOT NULL,
  `kapasitas` int(11) NOT NULL,
  `lokasi` varchar(255) NOT NULL,
  `kategori` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ruangan_unique` (`nama_ruangan`),
  KEY `ruangan_kategori_FK` (`kategori`),
  CONSTRAINT `ruangan_kategori_FK` FOREIGN KEY (`kategori`) REFERENCES `kategori` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ruangan`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ruangan` WRITE;
/*!40000 ALTER TABLE `ruangan` DISABLE KEYS */;
/*!40000 ALTER TABLE `ruangan` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tolak_reservasi`
--

DROP TABLE IF EXISTS `tolak_reservasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tolak_reservasi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alasan_penolakan` varchar(255) NOT NULL,
  `id_reservasi` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tolak_reservasi_reservasi_FK` (`id_reservasi`),
  CONSTRAINT `tolak_reservasi_reservasi_FK` FOREIGN KEY (`id_reservasi`) REFERENCES `reservasi` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tolak_reservasi`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tolak_reservasi` WRITE;
/*!40000 ALTER TABLE `tolak_reservasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `tolak_reservasi` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(32) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_role` int(11) NOT NULL,
  `isVerified` tinyint(4) NOT NULL,
  `tipe_user` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_unique` (`username`),
  UNIQUE KEY `user_unique_1` (`email`),
  KEY `user_role_FK` (`user_role`),
  KEY `user_user_tipe_FK` (`tipe_user`),
  CONSTRAINT `user_role_FK` FOREIGN KEY (`user_role`) REFERENCES `role` (`id`),
  CONSTRAINT `user_user_tipe_FK` FOREIGN KEY (`tipe_user`) REFERENCES `user_tipe` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(15,'galvin2','galvindoser2@gmail.com','$2a$10$buqgyjWd4k8Am2nyMzaABeneJJD410dqwpkUQDWtolgzXgRBmiGNC',3,0,2),
(16,'galvin','galvindoser@gmail.com','$2a$10$hrgjF5wYVjlCwpwTCBO0nOZDdtLjo4XmQ31U375jrug0twlB.YYNC',3,0,1),
(21,'gawdalvin','galvidawndoser@gmail.com','$2a$10$SHhSkPa8ZdWSGlPcCmlc/uJkNM8dEMHzU1aS78b9pHobjWQOnY5y6',3,0,1),
(23,'gawdalvidawn','galvidawndawdoser@gmail.com','$2a$10$rNHeXblMcdt06E4lJ4Rqp.VAXUPxzx60RHtFU6ywA54sOk0VDlrrO',3,0,1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `user_tipe`
--

DROP TABLE IF EXISTS `user_tipe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tipe` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipe` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_tipe_unique` (`tipe`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_tipe`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `user_tipe` WRITE;
/*!40000 ALTER TABLE `user_tipe` DISABLE KEYS */;
INSERT INTO `user_tipe` VALUES
(2,'Dosen'),
(1,'mhs');
/*!40000 ALTER TABLE `user_tipe` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-15 18:52:43
