/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.20-12.3.3-MariaDB, for Linux (x86_64)
--
-- Host: centerbeam.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

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
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_alat` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jumlah_tersedia` int NOT NULL,
  `banyak_alat` int NOT NULL,
  `kategori` int NOT NULL,
  `status` tinyint(1) NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `kelengkapan` text COLLATE utf8mb4_unicode_ci,
  `foto` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alat_unique` (`nama_alat`),
  KEY `alat_kategori_FK` (`kategori`),
  CONSTRAINT `alat_kategori_FK` FOREIGN KEY (`kategori`) REFERENCES `kategori` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alat`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `alat` WRITE;
/*!40000 ALTER TABLE `alat` DISABLE KEYS */;
INSERT INTO `alat` VALUES
(1,'Sapu',50,50,6,1,'Sapu lantai standar operasional kebersihan gedung dan ruang kelas.','Gagang ergonomis, Ijuk standar kebersihan','https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1200&q=80');
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
  `id` int NOT NULL AUTO_INCREMENT,
  `id_alat` int NOT NULL,
  `id_reservasi` int NOT NULL,
  `jumlah` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `alat_reservasi_alat_FK` (`id_alat`),
  KEY `alat_reservasi_reservasi_idx` (`id_reservasi`),
  CONSTRAINT `alat_reservasi_alat_FK` FOREIGN KEY (`id_alat`) REFERENCES `alat` (`id`),
  CONSTRAINT `alat_reservasi_reservasi_FK` FOREIGN KEY (`id_reservasi`) REFERENCES `reservasi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alat_reservasi`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `alat_reservasi` WRITE;
/*!40000 ALTER TABLE `alat_reservasi` DISABLE KEYS */;
INSERT INTO `alat_reservasi` VALUES
(1,1,6,1),
(2,1,7,1),
(3,1,21,4),
(4,1,22,1);
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
  `id` int NOT NULL AUTO_INCREMENT,
  `nidn` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_lengkap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosen_user` int NOT NULL,
  `prodi_dosen` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dosen_unique` (`nidn`),
  UNIQUE KEY `dosen_unique_1` (`dosen_user`),
  KEY `dosen_prodi_FK` (`prodi_dosen`),
  CONSTRAINT `dosen_prodi_FK` FOREIGN KEY (`prodi_dosen`) REFERENCES `prodi` (`id`),
  CONSTRAINT `dosen_user_FK` FOREIGN KEY (`dosen_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dosen`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `dosen` WRITE;
/*!40000 ALTER TABLE `dosen` DISABLE KEYS */;
INSERT INTO `dosen` VALUES
(1,'0012345678','Dr. Budi Santoso',25,1),
(2,'24060124140162','Galvin keren gacor',30,1),
(3,'0098765432','Dr. Budi Santoso, M.Kom.',38,1);
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
  `id` int NOT NULL AUTO_INCREMENT,
  `nidn` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_lengkap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosen_user` int NOT NULL,
  `prodi_dosen` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dosen_prodi_FK` (`prodi_dosen`),
  KEY `idx_dosen_user` (`dosen_user`),
  CONSTRAINT `dosen_prodi_FK_2` FOREIGN KEY (`prodi_dosen`) REFERENCES `prodi` (`id`),
  CONSTRAINT `dosen_user_FK_2` FOREIGN KEY (`dosen_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_fakultas` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fakultas_unique` (`nama_fakultas`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fakultas`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fakultas` WRITE;
/*!40000 ALTER TABLE `fakultas` DISABLE KEYS */;
INSERT INTO `fakultas` VALUES
(7,'Fakultas Ekonomika dan Bisnis (FEB)'),
(6,'Fakultas Hukum (FH)'),
(10,'Fakultas Ilmu Budaya (FIB)'),
(8,'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)'),
(4,'Fakultas Kedokteran (FK)'),
(5,'Fakultas Kesehatan Masyarakat (FKM)'),
(11,'Fakultas Perikanan dan Ilmu Kelautan (FPIK)'),
(12,'Fakultas Peternakan dan Pertanian (FPP)'),
(9,'Fakultas Psikologi (FPsi)'),
(2,'Fakultas Sains dan Matematika (FSM)'),
(3,'Fakultas Teknik (FT)'),
(14,'Sekolah Pascasarjana'),
(1,'Sekolah Teknik Elektro Komputasi (STEI-K)'),
(13,'Sekolah Vokasi (SV)');
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
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategori`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `kategori` WRITE;
/*!40000 ALTER TABLE `kategori` DISABLE KEYS */;
INSERT INTO `kategori` VALUES
(1,'Ruang meeting'),
(2,'Ruang Serbaguna'),
(3,'Alat Elektronik'),
(4,'Alat Olahraga'),
(5,'Ruang Olahraga'),
(6,'Alat Pembersih'),
(7,'Ruang Kelas'),
(8,'Lapangan');
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
  `id` int NOT NULL AUTO_INCREMENT,
  `nim` varchar(14) COLLATE utf8mb4_unicode_ci NOT NULL,
  `angkatan` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mhs_user` int NOT NULL,
  `nama_lengkap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prodi` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `NewTable_UNIQUE` (`nim`),
  UNIQUE KEY `mahasiswa_unique` (`mhs_user`),
  KEY `mahasiswa_prodi_FK` (`prodi`),
  CONSTRAINT `mahasiswa_prodi_FK` FOREIGN KEY (`prodi`) REFERENCES `prodi` (`id`),
  CONSTRAINT `mahasiswa_user_FK` FOREIGN KEY (`mhs_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='mahasiswa';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mahasiswa`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mahasiswa` WRITE;
/*!40000 ALTER TABLE `mahasiswa` DISABLE KEYS */;
INSERT INTO `mahasiswa` VALUES
(2,'24060124140162','2024',27,'Galvin keren gacor',1),
(3,'24060124140165','2024',35,'galvin shalahudin m',1),
(4,'24060128180045','2024',37,'Galvin Mumtaz',1),
(5,'24060124130067','2024',40,'Haikal Rafli',1),
(6,'240601241412','2024',41,'muhammad yesus sidhrata',1);
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
  `id` int NOT NULL AUTO_INCREMENT,
  `nim` varchar(14) COLLATE utf8mb4_unicode_ci NOT NULL,
  `angkatan` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mhs_user` int NOT NULL,
  `nama_lengkap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prodi` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mahasiswa_prodi_FK` (`prodi`),
  KEY `idx_mhs_user` (`mhs_user`),
  CONSTRAINT `mahasiswa_prodi_FK_2` FOREIGN KEY (`prodi`) REFERENCES `prodi` (`id`),
  CONSTRAINT `mahasiswa_user_FK_2` FOREIGN KEY (`mhs_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_prodi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fakultas_prodi` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prodi_unique` (`nama_prodi`),
  KEY `prodi_fakultas_FK` (`fakultas_prodi`),
  CONSTRAINT `prodi_fakultas_FK` FOREIGN KEY (`fakultas_prodi`) REFERENCES `fakultas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prodi`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `prodi` WRITE;
/*!40000 ALTER TABLE `prodi` DISABLE KEYS */;
INSERT INTO `prodi` VALUES
(1,'Informatika',1),
(2,'Sistem dan Teknologi Informasi (STI)',1),
(5,'Sistem Informasi',1),
(6,'Teknik Komputer',1),
(7,'Teknik Elektro',1),
(8,'Matematika',2),
(9,'Biologi',2),
(10,'Kimia',2),
(11,'Fisika',2),
(12,'Statistika',2),
(13,'Bioteknologi',2),
(14,'Teknik Mesin',3),
(15,'Teknik Sipil',3),
(16,'Arsitektur',3),
(17,'Teknik Kimia',3),
(18,'Teknik Industri',3),
(19,'Teknik Lingkungan',3),
(20,'Teknik Geologi',3),
(21,'Teknik Geodesi',3),
(22,'Teknik Perkapalan',3),
(34,'Teknik Perencanaan Wilayah dan Kota',3),
(44,'Kedokteran',4),
(45,'Farmasi',4),
(46,'Keperawatan',4),
(47,'Gizi',4),
(48,'Kesehatan Masyarakat',5),
(49,'Ilmu Hukum',6),
(50,'Manajemen',7),
(51,'Akuntansi',7),
(52,'Ekonomi Pembangunan',7),
(53,'Ekonomi Islam',7),
(54,'Ilmu Komunikasi',8),
(55,'Hubungan Internasional',8),
(56,'Administrasi Publik',8),
(57,'Administrasi Bisnis',8),
(58,'Psikologi',9),
(59,'Sastra Indonesia',10),
(60,'Sastra Inggris',10),
(61,'Sejarah',10),
(62,'Ilmu Perpustakaan',10),
(63,'Akuakultur',11),
(64,'Ilmu Kelautan',11),
(65,'Oseanografi',11),
(66,'Peternakan',12),
(67,'Agroteknologi',12),
(68,'Agribisnis',12);
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
  `id` int NOT NULL AUTO_INCREMENT,
  `waktu_dibuat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `foto` mediumtext COLLATE utf8mb4_unicode_ci,
  `user_report` int NOT NULL,
  `alasan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori_laporan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_laporan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'baru',
  `catatan_resolusi` text COLLATE utf8mb4_unicode_ci,
  `resolved_at` datetime DEFAULT NULL,
  `report_ruangan` int DEFAULT NULL,
  `report_alat` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `report_user_FK` (`user_report`),
  KEY `report_alat_FK` (`report_alat`),
  KEY `report_ruangan_FK` (`report_ruangan`),
  CONSTRAINT `report_alat_FK` FOREIGN KEY (`report_alat`) REFERENCES `alat` (`id`),
  CONSTRAINT `report_ruangan_FK` FOREIGN KEY (`report_ruangan`) REFERENCES `ruangan` (`id`),
  CONSTRAINT `report_user_FK` FOREIGN KEY (`user_report`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
INSERT INTO `report` VALUES
(1,'2026-09-25 04:07:02','uploads/reports/7167b26e-ff92-4a19-9db0-6d5ce8682739.png',35,'asdaf','AC/Pendingin','ditolak','as','2026-09-25 06:22:11',2,NULL),
(2,'2026-09-25 06:11:11',NULL,35,'ada','AC/Pendingin','selesai','Kerusakan telah diperbaiki.','2026-09-25 06:21:46',2,NULL),
(3,'2026-09-25 06:56:35',NULL,35,'adadsa','Elektronik','selesai','Kerusakan telah diperbaiki.','2026-09-25 06:58:00',2,NULL),
(4,'2026-10-01 00:54:38','uploads/reports/8e7c588c-f519-46f8-b980-5a36ebe66f2b.jpg',40,'kotor bgt nih','Kebersihan','selesai','udah dibersihin yaa, julit amat','2026-10-01 00:56:58',2,NULL),
(5,'2026-10-01 03:28:21','uploads/reports/aabcfe78-1205-487b-a52e-04e319c5f9d6.jpeg',41,'<script>alert(1)</script>','Lainnya','diproses',NULL,NULL,2,NULL),
(6,'2026-10-01 08:46:25','uploads/reports/9a6577d7-62a8-46db-9324-9d216f86252d.jpeg',35,'sapunya bisa dibuat terbang','Lainnya','baru',NULL,NULL,NULL,1);
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
  `id` int NOT NULL AUTO_INCREMENT,
  `id_report` int NOT NULL,
  `id_user` int NOT NULL,
  `pesan` varchar(4000) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `id` int NOT NULL AUTO_INCREMENT,
  `waktu_reservasi_dibuat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ruangan_reservasi` int DEFAULT NULL,
  `user_reservasi` int NOT NULL,
  `waktu_peminjaman` datetime NOT NULL,
  `waktu_peminjaman_selesai` datetime NOT NULL,
  `status_reservasi` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alasan_peminjaman` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alasan_pembatalan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dibatalkan_oleh` int DEFAULT NULL,
  `disetujui_oleh` int DEFAULT NULL,
  `waktu_diproses` datetime DEFAULT NULL,
  `jumlah_peserta` int DEFAULT NULL,
  `waktu_dibatalkan` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reservasi_user_FK` (`user_reservasi`),
  KEY `reservasi_ruangan_FK` (`ruangan_reservasi`),
  CONSTRAINT `reservasi_ruangan_FK` FOREIGN KEY (`ruangan_reservasi`) REFERENCES `ruangan` (`id`),
  CONSTRAINT `reservasi_user_FK` FOREIGN KEY (`user_reservasi`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservasi`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `reservasi` WRITE;
/*!40000 ALTER TABLE `reservasi` DISABLE KEYS */;
INSERT INTO `reservasi` VALUES
(4,'2026-09-23 06:57:44',1,24,'2026-09-22 14:00:00','2026-09-22 15:00:00','CANCELLED','Fasilitasi Pengajaran IRICH',NULL,NULL,NULL,NULL,NULL,NULL),
(5,'2026-09-23 06:57:50',1,24,'2026-09-22 14:00:00','2026-09-22 15:00:00','CANCELLED','Fasilitasi Pengajaran IRICH',NULL,NULL,NULL,NULL,NULL,NULL),
(6,'2026-09-23 08:23:52',NULL,24,'2026-09-22 14:00:00','2026-09-22 15:00:00','CANCELLED','Praktikum Basis data',NULL,NULL,NULL,NULL,NULL,NULL),
(7,'2026-09-23 08:31:55',NULL,24,'2026-09-22 14:00:00','2026-09-22 15:00:00','CANCELLED','Praktikum Basis data',NULL,NULL,NULL,NULL,NULL,NULL),
(8,'2026-09-25 00:56:03',2,35,'2026-09-18 10:00:00','2026-09-18 12:00:00','CANCELLED','Belajar CP',NULL,NULL,NULL,NULL,NULL,NULL),
(9,'2026-09-25 03:13:43',2,35,'2026-09-27 07:00:00','2026-09-27 08:00:00','CANCELLED','cccd','Jadwal sudah terpakai oleh peminjam lain.',36,NULL,NULL,NULL,'2026-09-25 06:53:20'),
(10,'2026-09-25 03:18:40',2,35,'2026-09-27 07:00:00','2026-09-27 08:30:00','CANCELLED','asad','Jadwal sudah terpakai (disetujui untuk peminjam lain).',36,NULL,NULL,NULL,'2026-09-25 06:54:10'),
(11,'2026-09-25 03:20:44',2,35,'2026-09-27 07:00:00','2026-09-27 14:00:00','DONE','ada',NULL,NULL,36,'2026-09-25 04:24:12',NULL,NULL),
(12,'2026-09-25 03:21:34',2,35,'2026-09-27 16:30:00','2026-09-27 17:30:00','CANCELLED','ada','adda',35,NULL,NULL,NULL,'2026-09-25 04:14:11'),
(13,'2026-09-25 03:33:22',2,35,'2026-09-27 07:00:00','2026-09-27 08:00:00','CANCELLED','ada','Jadwal sudah terpakai (disetujui untuk peminjam lain).',36,NULL,NULL,NULL,'2026-09-25 06:54:03'),
(14,'2026-09-25 03:38:07',2,35,'2026-09-27 19:00:00','2026-09-27 20:00:00','CANCELLED','yayaya','ajg',35,NULL,NULL,NULL,'2026-09-25 04:13:49'),
(15,'2026-09-25 06:10:41',2,35,'2026-09-27 14:00:00','2026-09-27 15:00:00','DONE','q',NULL,NULL,36,'2026-09-25 06:21:29',1,NULL),
(16,'2026-09-25 06:47:52',2,35,'2026-09-27 15:00:00','2026-09-27 16:00:00','CANCELLED','uda','Jadwal sudah terpakai (disetujui untuk peminjam lain).',36,NULL,NULL,1,'2026-09-25 06:53:58'),
(17,'2026-09-25 06:48:31',2,38,'2026-09-27 15:00:00','2026-09-27 16:00:00','DONE','sa',NULL,NULL,36,'2026-09-25 06:49:17',1,NULL),
(18,'2026-09-25 13:46:51',2,35,'2026-09-28 16:00:00','2026-09-28 17:00:00','CANCELLED','ada','Jadwal sudah terpakai (disetujui untuk peminjam lain).',36,NULL,NULL,5,'2026-09-25 13:50:59'),
(19,'2026-09-25 13:50:08',2,38,'2026-09-28 16:00:00','2026-09-28 17:00:00','DONE','a',NULL,NULL,36,'2026-09-25 13:50:49',1,NULL),
(20,'2026-09-25 14:08:43',2,35,'2026-09-27 19:00:00','2026-09-27 20:00:00','REJECTED','ada',NULL,NULL,NULL,'2026-09-26 01:29:37',1,NULL),
(21,'2026-09-25 15:52:38',2,35,'2026-09-27 16:30:00','2026-09-27 17:00:00','CANCELLED','ada',NULL,NULL,NULL,NULL,1,NULL),
(22,'2026-09-26 00:53:29',2,35,'2026-09-28 11:00:00','2026-09-28 11:30:00','CANCELLED','y','ada',35,36,'2026-09-26 00:54:49',1,'2026-09-26 01:30:10'),
(23,'2026-09-30 03:08:40',2,35,'2026-10-02 07:00:00','2026-10-02 09:30:00','CANCELLED','ada turnamen mobil lejen','salah ruangan cik',35,36,'2026-09-30 03:24:45',1,'2026-09-30 03:26:03'),
(24,'2026-09-30 03:29:07',2,40,'2026-10-02 07:00:00','2026-10-02 10:00:00','CANCELLED','ada deh','mmmm',36,36,'2026-09-30 03:31:32',1,NULL),
(25,'2026-09-30 03:29:23',2,35,'2026-10-02 07:30:00','2026-10-02 12:00:00','CANCELLED','ada deh juga','Jadwal sudah terpakai (disetujui untuk peminjam lain).',36,NULL,NULL,1,'2026-09-30 03:31:38'),
(26,'2026-10-01 01:01:22',2,40,'2026-10-03 07:00:00','2026-10-03 10:00:00','CANCELLED','ada lomba dcpc minn','pengen batalin aja',40,36,'2026-10-01 01:05:46',1,'2026-10-01 01:05:46'),
(27,'2026-10-01 01:06:44',2,40,'2026-10-03 07:00:00','2026-10-03 09:00:00','APPROVED','ada deh',NULL,NULL,36,'2026-10-01 01:07:34',1,NULL),
(28,'2026-10-01 03:17:45',1,40,'2026-10-03 07:00:00','2026-10-03 09:30:00','REJECTED','tes',NULL,NULL,NULL,'2026-10-01 03:20:25',1,NULL),
(29,'2026-10-01 03:24:56',8,41,'2026-10-03 07:00:00','2026-10-03 08:00:00','REJECTED','hackering nasa-ing',NULL,NULL,NULL,'2026-10-01 03:27:21',30,NULL),
(30,'2026-10-01 06:55:16',9,35,'2026-10-03 07:00:00','2026-10-03 08:30:00','APPROVED','tes',NULL,NULL,36,'2026-10-01 07:40:20',1,NULL);
/*!40000 ALTER TABLE `reservasi` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `reservasi_riwayat`
--

DROP TABLE IF EXISTS `reservasi_riwayat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservasi_riwayat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_reservasi` int NOT NULL,
  `status_reservasi` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `diubah_oleh` int DEFAULT NULL,
  `keterangan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `waktu` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservasi_riwayat_reservasi_FK` (`id_reservasi`),
  CONSTRAINT `reservasi_riwayat_reservasi_FK` FOREIGN KEY (`id_reservasi`) REFERENCES `reservasi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservasi_riwayat`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `reservasi_riwayat` WRITE;
/*!40000 ALTER TABLE `reservasi_riwayat` DISABLE KEYS */;
INSERT INTO `reservasi_riwayat` VALUES
(1,14,'CANCELLED',35,'ajg','2026-09-25 04:13:49'),
(2,12,'CANCELLED',35,'adda','2026-09-25 04:14:11'),
(3,11,'APPROVED',36,NULL,'2026-09-25 04:24:12'),
(4,15,'PENDING',35,NULL,'2026-09-25 06:10:42'),
(5,15,'APPROVED',36,NULL,'2026-09-25 06:21:30'),
(6,16,'PENDING',35,NULL,'2026-09-25 06:47:53'),
(7,17,'PENDING',38,NULL,'2026-09-25 06:48:31'),
(8,17,'APPROVED',36,NULL,'2026-09-25 06:49:19'),
(9,9,'CANCELLED',36,'Jadwal sudah terpakai oleh peminjam lain.','2026-09-25 06:53:20'),
(10,16,'CANCELLED',36,'Jadwal sudah terpakai (disetujui untuk peminjam lain).','2026-09-25 06:53:58'),
(11,13,'CANCELLED',36,'Jadwal sudah terpakai (disetujui untuk peminjam lain).','2026-09-25 06:54:03'),
(12,10,'CANCELLED',36,'Jadwal sudah terpakai (disetujui untuk peminjam lain).','2026-09-25 06:54:10'),
(13,18,'PENDING',35,NULL,'2026-09-25 13:46:52'),
(14,19,'PENDING',38,NULL,'2026-09-25 13:50:08'),
(15,19,'APPROVED',36,NULL,'2026-09-25 13:50:50'),
(16,18,'CANCELLED',36,'Jadwal sudah terpakai (disetujui untuk peminjam lain).','2026-09-25 13:50:56'),
(17,18,'CANCELLED',36,'Jadwal sudah terpakai (disetujui untuk peminjam lain).','2026-09-25 13:50:59'),
(18,20,'PENDING',35,NULL,'2026-09-25 14:08:44'),
(19,21,'PENDING',35,NULL,'2026-09-25 15:52:40'),
(20,22,'PENDING',35,NULL,'2026-09-26 00:53:30'),
(21,22,'APPROVED',36,NULL,'2026-09-26 00:54:50'),
(22,20,'REJECTED',36,'a','2026-09-26 01:29:38'),
(23,22,'CANCELLED',35,'ada','2026-09-26 01:30:10'),
(24,23,'PENDING',35,NULL,'2026-09-30 03:08:41'),
(25,11,'DONE',NULL,'Reservasi selesai','2026-09-30 03:16:46'),
(26,15,'DONE',NULL,'Reservasi selesai','2026-09-30 03:16:47'),
(27,17,'DONE',NULL,'Reservasi selesai','2026-09-30 03:16:49'),
(28,19,'DONE',NULL,'Reservasi selesai','2026-09-30 03:16:50'),
(29,23,'APPROVED',36,NULL,'2026-09-30 03:24:46'),
(30,23,'CANCELLED',35,'salah ruangan cik','2026-09-30 03:26:03'),
(31,24,'PENDING',40,NULL,'2026-09-30 03:29:07'),
(32,25,'PENDING',35,NULL,'2026-09-30 03:29:23'),
(33,24,'APPROVED',36,NULL,'2026-09-30 03:31:33'),
(34,25,'CANCELLED',36,'Jadwal sudah terpakai (disetujui untuk peminjam lain).','2026-09-30 03:31:38'),
(35,24,'CANCELLED',36,'mmmm','2026-09-30 06:55:48'),
(36,26,'PENDING',40,NULL,'2026-10-01 01:01:22'),
(37,26,'APPROVED',36,NULL,'2026-10-01 01:02:06'),
(38,26,'CANCELLED',40,'pengen batalin aja','2026-10-01 01:05:46'),
(39,27,'PENDING',40,NULL,'2026-10-01 01:06:44'),
(40,27,'APPROVED',36,NULL,'2026-10-01 01:07:35'),
(41,28,'PENDING',40,NULL,'2026-10-01 03:17:46'),
(42,28,'REJECTED',36,'lagi perbaikan','2026-10-01 03:20:26'),
(43,29,'PENDING',41,NULL,'2026-10-01 03:24:57'),
(44,29,'REJECTED',36,'ruang tidak available jam segitu','2026-10-01 03:27:22'),
(45,30,'PENDING',35,NULL,'2026-10-01 06:55:16'),
(46,30,'APPROVED',36,NULL,'2026-10-01 07:40:20');
/*!40000 ALTER TABLE `reservasi_riwayat` ENABLE KEYS */;
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
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_role` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_ruangan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kapasitas` int NOT NULL,
  `lokasi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` int NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `kelengkapan` text COLLATE utf8mb4_unicode_ci,
  `foto` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ruangan_unique` (`nama_ruangan`),
  KEY `ruangan_kategori_FK` (`kategori`),
  CONSTRAINT `ruangan_kategori_FK` FOREIGN KEY (`kategori`) REFERENCES `kategori` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ruangan`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ruangan` WRITE;
/*!40000 ALTER TABLE `ruangan` DISABLE KEYS */;
INSERT INTO `ruangan` VALUES
(1,'Ruang AP','dalam_perbaikan',100,'Jl. Prof. Jacub Rais, Tembalang, Kec. Tembalang, Kota Semarang, Jawa Tengah 5025',1,'Ruang rapat dan seminar fakultas berkapasitas 100 orang, cocok untuk kegiatan dinas, sidang, dan lokakarya.','AC Sentral, Proyektor HD, Whiteboard, Sound System, Mikrofon Nirkabel, WiFi Dedicated','https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80'),
(2,'A303 Lantai 1','aktif',50,'FSM Undip',2,'ruang perkuliahan','AC Sentral, Proyektor HD, Whiteboard, Sound System, Kabel HDMI & Converter','https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80'),
(7,'Ruang Kuliah A303','1',70,'Gedung A',7,'Ruang kuliah modern berkapasitas 70 orang dilengkapi proyektor definisi tinggi, pendingin udara, dan sistem tata suara nirkabel.','AC Sentral, Proyektor HD, Whiteboard, Sound System, Mikrofon Nirkabel, WiFi Dedicated, Smart TV Interaktif','https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'),
(8,'Ruang Kuliah A302','1',70,'Gedung A',7,'Ruang kelas perkuliahan reguler dengan pencahayaan optimal, sound system, dan proyektor presentasi.','AC Sentral, Proyektor HD, Whiteboard, Sound System, WiFi Dedicated, Kabel HDMI & Converter','https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80'),
(9,'Gedung Dekanat Lama Lantai 3','aktif',500,'Dekanat Lama',2,'Aula utama berkapasitas besar (500 orang) untuk wisuda, seminar nasional, pameran ilmiah, dan acara akbar kampus.','AC Sentral, Sound System Konser, Proyektor Dual HD, Panggung Acara, Mikrofon Nirkabel, Ruang Transit VIP','https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'),
(10,'Ruang Kuliah A304','1',70,'Gedung A',7,'Ruang kelas perkuliahan berkapasitas 70 orang dengan pendingin ruangan ganda dan fasilitas presentasi modern.','AC Sentral, Proyektor HD, Whiteboard, Sound System, WiFi Dedicated','https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80'),
(11,'Lapangan Futsal','1',100,'Teknik Industri',8,'','','data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBiRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAITAAMAAAABAAEAAAAAAAAAAABIAAAAAQAAAEgAAAAB/9sAQwAGBAUGBQQGBgUGBwcGCAoQCgoJCQoUDg8MEBcUGBgXFBYWGh0lHxobIxwWFiAsICMmJykqKRkfLTAtKDAlKCko/9sAQwEHBwcKCAoTCgoTKBoWGigoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgo/8IAEQgBngLgAwEiAAIRAQMRAf/EABsAAAEFAQEAAAAAAAAAAAAAAAIAAQMEBQYH/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/2gAMAwEAAhADEAAAAe4bLk4Z0FSMtPVJZ1AiYQkAC2cucGnMY0mmBWlJkJA4aBKbgg1EiVxUpOKDeNyRhaCZ0CxGRKVyBWHWq1pis1lrKysMQKVESlcheVyJ5URuQiSQk6BYhGaRyFp2IHlVkSlYjRCMk9gpxR0z0yd5RYhEzNYTMwSjFJVCNCchyxuRAoyliUiI0TCIHJLtOzKQoZUJHZAjCxnjNHTOqcXDKM5TcSldkoZ09OnUqIUG4odkIhZkdkw7M1JMw6FBuDkzA8OycZ2QkypRmA7gVEyUJkNhIXGEkgIg0dkyJIbCQtBsLqmcVSTCFxZYXVWnIsaBSvLE8jAEnBCRiNzVGgUE4EJRsTANeisYp6muneBRvAo1KBpK6FwyB4kTKVhQ0TxJJWBlJAkdmGiQIJMw6ZBOMg6TwkyCZmp2FocE1O4PYTihMmsdCrCQsEozGZ0CnaxkkjJ0MkhkkCxNYzOJecX5dCQipMLUbxIlYEEzCE2M1bEXLc7qek5GBprnV5anTGlsc7uZ32roeGjZMMkyOmYdM4kmDZmVCmRJhokKHZkJMwSFBoUEUbkqjcNCgkxwKNyEZoqBE4CNWCkw7miFpWsjRqq08MyMxMJndBGYlrqdiFpQsFiZBUhEA3BCdFjYNI0sbRUa0lmOaVehORx6Lrwlbqea6zVwOv56C63k+tl5rH2cfpzk6zkusmtyyEfDd0aU8GgayZRGEnQ7uUCxMrMSAE3SJSMA5IBGiJpQoBNgSRDumHSQbxqWZRIlEWCERsIRGnIZENJpRdnsNPmyzz45azrKRZ0JIhnShmcaNmUJ1HUgwpHjMqxx121nKPRGWvcRZoInUSJQCJGHyfW8l1nSc+Bq2jh6GpNia+PrFje53pl2LccHHeiFC3Ek0YxM0MoZiYTs0rsmHZIZOKEhcdiFWYhsZkyJnSsjQLEImSEyanQpCQpUmSJ0gpIjU0mhnTWS056lQxPW3no0IctxV6ufvO3f5/ezTcXzUmCpWjSEmSkIxo7G2sqQSmnSPNBGgEQ0yFzE5HseO6SO2AWwb2HvUGHoY++c3S8108uu07cdKJyI7JQy2o61kO1EEW1XmldwcMVCSNl27LKZoenaw9OgbNuQSSsZ0klauE1YVC9TjIoiUqAUyIXNEalRFXoY25pz5OprG2TNy6EKQFO5X1mrn6mR0z0gs/LeRnamVvN3ouc0860BydfNATYATGwUlYzOxZaVpQRjDkzBC7KkzCAmOf5HruR6y9VtVqfewduWhka2R05l1fL9XnXQqZcNRtYaWoUyRQlGqnCOrkdGQtyUefs66DKuxiWcu/0nQwZfHJ6NyuPobzpbfMbuWmWdo40kR5uNFaj05w4w7c+s0MfU4dJXZpZGBg8vSztQGIdZx4LVfcW5z+omvazdHj0IHEaKaLUqZenndOe+4lz3mZOxi1f1MnUzqtqZOqhO5SxDKiNjYBJrLCzkaRZxy6ARPLKwoNmEkeM5eX4PtOe74p2Ggq5tc10i0sfWqaxD1fLyL6WXCdlw1aasebJGnsJMlAJXSMZIjF5ncz+/Ien5m0qt1Z87Y4LDGVYpXdo7edell7Dg+95bkIB56yYDg6YxI5Ye2OmPkamb6pH5h3nPWnVl5qWxTyKvo5dXf4zrsWhXs1ZRuwWLNLSydbltieTOoq9qOzOo24+mNbj7tSa6DC3sE0Z2gll1sfVymcAllBBYSJwBlA89qRrfLUWNZjWWKV1sLCDWusXLide3KAadKhBqadGELLM+R0y5Q6FOxSg6dDJzMsdBr8hezr0JuYl5b6JsNk3GyXNZs1S5OZdod+J2K06lPXnztpq2fZLLFW0nt0LMQ9nxHRR0mXjVsW1Fma28551JNoqdyLWavf8AE9pz0+feqcumPRsVfTwl6zkeqzaST40dyjdkG/jx56dDnHi5vQ5t3MrSidtc8hxHTp8Lc5vN6GvPUzqXVy9WJ6tvFlpzifXluAm59GZJPKozW+UctJzTmymtuK/GsGL7K2enjI+2Ytnlrb2NuRNLBZLu4+uQRXYLIZxkrOW9m5tV6oVpqtezRKzZlzS2c0haGGzQVeuaUuPFW8+CMvThzrnRnzkp0MvMku/a5uWTdLElW3pYcyMbnVt68szPbzbkDXynu2i1d/WVLfoefpksA9cTW8ycOWpexqIaNk0qlyAkijfWMxpA26Tnt/Dw14JIZbFzNuSa3N9JzLVp4LG+eoxrGgJ1HklclvEbTz6tWtKCT9FzpL69a4zs+PVVbVaPOxn3Ok4mlq53XnPfr2rWqzwJHdo367DM0szmxBuP0lQ5oiabAc66zGfHeTjbWD2x1+RrY+cPTs0NtutE2Omdp5PTbzzsG5gKzvKt3G63mIsj0EuLyq3dQ4ldHHpiS2msCWUc6KXCM35udUvWWeIKXqi5ic25Me2a9vCuc9NJWhsPT5vpNZz72boy59opIsVwpy61ZqxrpVU6fnd3n7ipp5d7c6FZOZz6dM3Llc8CTDcS2LM9uJZKes2C9WTa9I4jtMdLtd+axcjpebeq2P0uD2xoR2Fbnw7UdzjXpLZ0OVp0MMp5j6SmF0DA0h2jUrkuO8zB6LmeuOwydTIZLMu85q9AfIT53q9RxnYXNTndvDskmglt6Ll+j5vM6mavNjdbRy9EzxUelN4n3jQtU58sezSsaW79HpOXStDsrl05uCyfXGRFvSnJv005yti1T1mPo8S/BXcbOmurtcTazeqrZdqXWrJRpAVbKSuNXrynlqrUqyQSc+45OrlbxllNW58jKN6twwRrcs09G3uZ/PavPXbcbLHc3qMgy19LMVzuHhavS3sPp4K5ptJVmD11FOek0ollsgiOu9qqWro0spua6LnNzrs28eZysUGbOswQCsvRcvqWdWql+4zKvU1JYud6GprN+eCbNq3j0s65yHqqdco2mG8xzNoy8na6Hazrn9a1h89bs1a1z1i5vTc/2wDq8kGnWt40PO9nzGpC08W8XLGdXmuiylWzc+juSbzz67HPMmyUBdvRQ5uvnUJEYbcbpDk7OTc5EVilObyV3LQVzLBQxmjNUlxbd7NsZ1OBBZUp61DWa+q2vteNHLnUb+fLYgGvpZXOmdDBm6hIYFZ0Gbbrwuc6ebUo6dcMa4bM2ce7ZJWPvYnTqc1iPfKA7Klh6XAv5t+Co+Lrz89azrXzs+O6v8doZ+s09lqVzv6nAbs1vZ21nCaVrm48AZtoYBW1fyyzdzPjqRDFFB25S2asi28rVGXFbZbeck9aeM6pvTS48uu0uBe0IkzYdEC3CMCcnndXPlxK3LV1zD9ERgj106ctctW4rXL4y476leqe1RS3joV16FsqBLMYx2tRKtc2FVmssFXiNGzisdHFzzG7d5VGxo8oB2HnfS6s15+tCtuWuw5S1jXYWcjpM4qSWHlieVyMZ3iqNxFSls8fbzN+KnuqOnPYGljSSexOM/OxqRETmKJ0hnJKDSsA0jICJgUSQHcR2JyNSuRKViNpUQjYEgawFnm0HSNtinsCYxbMkuG2/Kc9Y6W/HGrtIjlIupBeSHqHOYHqWrFi6JJy5dLIc2uqlOMXbvHFF2rnFl2QnJTdLIYUuzCuTDr4daMVIuiSnDDqR6JRR1FzzTpOV6hZ9/AnZ1YkoQmKNwnd8Dq89UebasTPUZM56fv8T2vOJOEqTOMmIdM46ZI7JgUQ2MQuOyQzs8EQJZELBMzISFghZqpRyK5hM2pneaUHM4UgFK4lXGjAqjAIqsFVEujBITyZ8xckpzlhweCScSSHSrrUjqN2TULVOudniyI6apmS2a8hZ2bS6HnOt3mSTErnppZmh59GgHNlCEqPL0gOP531jLa8qbtH6Z5GH0bTTm+1Fc66ZhC7I7i9hOByuzJEJNSZCEzITOhOKgyBw2ZDsyEzqgTgVwkG5gRmRmaBNpZopGOGFwK+dqQ1lVtB6zbFoSJ54CRjthJTCMVErE4nTqsm3zW1OXKDtnTHMLI8uernVsJjKKnq2dHmyZe5uRtrpZ63jez46TG3PUcc4kMl3azarWqWN4eP0ef1zlTQv1xrZ5nlorC3MhSBDUZkhAcJCghZUhQhoHCZCO7IN4yg2ZhJlYTCh2ZhkhR0zDuxKxhMqSUNDIAFS2NZz3a9VzmEcTIeStIWjiKJHIFlSdGdozP4zoeO7yns5O0tKKNs2NHJFuGapR0NPLJGcdTpdGlq1k97w3R4m0yXHbaGdv5tmFo+fQce7j9INKWv0xoZ3Uc1K13PubxjdLzuxFxnjyJxSG4EEmQwmiFpoxkTjC7jEzBkzw7OIkLUbAyGLIEZCSF5ERmTqyNCSGV4ZxKqEKco2o3hkEcZDO0w5pwxcoJxQWfby93nOZ18fpOlz+74DnaehVWlfQqahXrWKaW8nVyldKyt/oM/Z1Mq7RbWO+dh8vSToef18asV2z86pZJQ98mhuWbXObOJmlEod5F8+ynTCQYhEDhOzjkLjCQCQpCFJXQIkZhJXjIkFmRJMMLsJxYMoZEI43CeGYTsSpxeV45GIILkZXaWvo7RkTKkZaQCWTjlDdhg3FzO4ja4zsLrOQ6+Xc8/3sCDiYRS1rAKGWoIXaV9bJsHpGXHy1ztU8+30z6cKLy7k2MvUx0yeY1sHVmlp2umbe3jb2WPTUWo0IBqZWlmEneNlavOMkgwTjuDhCmBYhQkzDskqIWDIWCFCkiiewwZQbAqdkaCRvLG8jguzhPGlkeIVkFIiimErOaoHZwmCSDImDdnE4kczw3pnm/WRdBz9hrQx5zlleSijRSpYWksFJOw8kRV3fC+g+fSPdpa+p6YmXGy62Vpc+nJ1djH6otO3osrGajKwKj0y8YQamPUkhjp+08q9OxJSFZOQoNC4mZg40kSTjMTKkzidnQXIQgTDsL2MgcE4p7HIXlkUTxOo3DQsrvEQmeFZwhMeGV0heaMFkiSSGYZ2SyuDhcB31XTyohbdO/UtkMGnjwTMlczcqp2FJH05e47vOCQ/SuF9NkJmbCbUxdTHTFz7MXRpHn6uWHXtU+maNy1HvFKjuc9qc2nbnt+x420nqLguZzjcMWEkQoSFIQs4mdghZBuD0bAhjFhM7IoJRsYgKpXFSuRPAuIxI8US2BggLwwwVcelMJ0iZ60hI0Yk7wmEcRhJjhGCrhOf9Z5TV5I5NK6xRtwpEjFWToFS2Q9ELGsc/HY087t9vSuZyTxFk1urdm8jOKPpNxtfT5a5ae6VnMxJd+bZGpW1nls/dwM7NxLN7vc8/7/ABHIGiRRodJkTi1JxQQkh0KCQMG0TFka52OmAOuo7Lb32zYCkSxKRgSTQkzAxysVSnaqssrlIrhFGS261SsuUpbMZDEWcWwws3Trm4ll7h+HRbPOi00qVZknAFLYCEav28m8akte3Gd1GPHm9NLzuozqPDZzTu1Jc65rT04Lb0+CMu/ji6ZbX63XFOOxFvOVz/ZRHJB09JcTs+ZHLtT5XWy2JK1uHaQohGw9VinYrvOiB5WQHJEaNETyIhitopxaSs//xAAxEAABBAECBAUEAgIDAQEAAAABAAIDEQQSIQUQEzEUICIyMyMwNEEVQCRCBkRQQ2D/2gAIAQEAAQUC81q1atWrWpalaBQ//GD7NoFWmnlX9alSr/w7/pgc6+xaad+RRCr/APF0q8lKlSryMG/kCcOWoX/5g/u0q89IbfZb7v6Nq1f9w/8Ai3zJRKDgpJQEJJVDkPfMqVf+kO/9e1fnc7SvEMCc/Us/KdGn5WRq8bNpdlzLhmY+SU/dvy3/AHa8rPk/uHYPzY2gZsbhm5IkaO+P1JF4Qp4LQntAXBXRtf8A+MeVfapUm11/JSpaVW+laVXMNJWgrposH2n5EUaOa0ozZDxMHMlaLPhmmOtD8Z1IbjOaBN+vXXDQDCdbAyQO52r81ealSpUqVKlX9wH6ypV9muQKcUfKSE7Iian50errZD1oynLwjCmwRtVKlns9Dffi7xZoqTFFphaBxH8j9SA6uGdPQnNDlb2oODhzv+3atWrVq1atX9nJjMxkiasUdH7jvJS8aNXWyXt6WS8twgm42O1D0rvypUq5cQ+GL36tIz7DoTTMDJc+biJ+v+i9YMHo1PYmSB3ItBOotWx/8ceUcipO/ImgZ2heNYU3Jt3mPktCgtWxu1SrzfviHwxe+R2rJ4j7gfp8OH+VxD5/0CFw17tKMYKD3sTXhyBWla6++fPSr7485O8hWrlJ7H98Pdv+/ltWrVq1a/f6/f2eI/DH3jB6vEW05o9HCmDrcR0nJcGhtC+HyNfHRCD+RjBWt7E2QFWtNIPpX9zKl6bAj5j56VKlSrlSnsN6zlHK4+Yjd7fRSB2f7HdsNH3favl+v39i1n/jDvjWJeIPJyI708OWf+Qd1pcDwreNVaEZCBpUnQhW5ia4Hlo0oP8ALK/QzxgUcrZPJm+p+C68Zzqb5DI0HqsQyWEgg8q+xss5zmSukJWP6pR5Sj3d2tN9rvb/AKYvZ3ebVqZr6v2K5fr9/r9+U8s8/wCKPfD83EPnh9nD1nfkr/bg7BopUg1UtFK6WyMTVbmJrwV3VUg8WrUu7S8ufh117RnjCbMxye/18PP+RkfG3cc5R9VOPqa8hYT3Pi8x78skXPpCxvzNKheT5T3vc92ew9mrE7v7PPqLiD9r9fv9cv35eID/ABh3g+fiH5EXx4Jp2af8m1qJdwcO0chyKtFovU4JrwUWBW9ibLalkaxkmewCDOikUxAYKGRifmZ2WIQobZLOaPD3Vl5Eg14j7aqQap9pQU/3Lh5rHLq8x7orJ/JUX5rjtidvIe/7k98XxkhMHqxfnd7H7mT4x2+xfMdl+v35KXENsV+q8SxkZx/yIT6MJZ35CNauDSfTQ5WiVfNzQV6wg8FOjBWcfoaN4WlsnUjkB9GdE5wmoF5Gluq8mbtA7RIQ6sdxblIcsl4E+pOPqXDvxpCfJkTNgjPFGan8QbcOUJB+sr8gKNpGXP8AFhe3lSpP7qUXIyum1pdkNFLH2ynMHTMlo7xM9nO1fKlS6wXiIwRPGmzxkdRq1Ch7v1atAq1lv6kbmxxhs8DXTzRSuh0VgrLc108TQWlml0cukxPkJ60S68aaWuVKvKRa0kCZ3p5YT9MrzefE2p4nU+U3E38mbsxWtREoVq1kH6xKf7iAnvexutxTMmaJ/D5n5GNI8Rx5mUzJhdAA3SmW1MP0ckhzwmfNLvHgu9CC1bp3JwWW8hRGsgpn5jviZfSGoxR/Gm7hAtcaVcrT5chdeVj25TnNOW8JuTrd4qohm085Vs8f6/H+n+RFDiYCyZuug1siJianOAf4jSmySvRZpEUssberM8tfIFgGmr9cNI6vl/a/U/x8sSupMP8APjcWyt2cYwV2yZDbWcnH14mR1kTSObHeRljX4glvUDkaWQUEe/BfwXPc4Zft13HZQULf8f8A+ab8rvbiSW3xcQXi4wP5RmvxikznhRuL2ZNiLKJ0xn60m4/7jjsx1Qtf6IviTHgLPc4v4X3tXzjq3C0GFjjKABLIUyUp8rmSdW2if1iXYytX0yiQv1+yN9KwsYOietNNLlRTXuaBKmyqCbTOM23eOQzNvHGxmLxgTcsF0ubG1SyAx2i4LGLerL+bGSJZN1blXrc1Q20l3qf7uGH687nukZ7cxNpRe2gpGhwDWAyRlcF2w1lC4+Q7tdWN/wDK9x8rvbi0FPG3XGA9ksQZNEzWzPbRhPpyvx8r2QfNuVv41gsRJnbH+BNk+tkflcP9L7V82x63dU0177LtTdOlrWGROha17sEuUvCMpiljkjcBIreFrcuq5dUrqoSbxPeQ/UU29GkaWHQnStvqhdVCXcT0uuhMCOouoV1CuoVrXWKEyE2wySD17f1RfWYjKxB7US0pp0lz9SyR1BiSGGTqWmEacsW1qYNJRKD1awyfEOyKM07iwHU2KPqSR4MdTxNZC34f2PeVBssgaSyepczaTDa7RxM7M3jyHDoZQGiH5P0B/nxE3F7oysInpWgazJ/ysMVLyrk5mgsdpDnlrmuNslpNkLSzKlncyXw8sDG9HwuPXh4a4hgRvXFMZmPJ0yuns1u+hQbIpvtVah/FqXCMaewBVsIY9EOA6eP+LnjZjcIkmUvBNIdwqVSYUsa8PJTsHJYDDOunOvqX9Rp1uC6pXVXWQyPT1ghMF1l1k2d1iddbYZAWuK/pk20lDc4z9Mxc9f74sQdJ0YceNsoKnk1QtPotFyjkLlEVmewLLTJD0eIkdKOYCOb1DIc16j2LnKneLiFtZ741g3yO2bkS/wCRhG3+TWaBo6zE9oc+bIjMMv6gnMQwJm5M0LmUqWQLj40yp8jGMUenZg9QCjARpV6bWPTp1kAF5x42u0xL0oEtQz52lvFsgLD1GMfTZmgNLysj4uUA155Zpnymak72jE1CWERv0R6dAXTFZmEyGIso+BfXg5lJDPGjHkBapF1SuuhkbtyQhlLxJXiUMgX4mwzJbQna6Me1O3UbXuIjLW5nxtCyTZe8hZxvGa703uWlz+k1odI1rS5rmue1inkEK6bo4+HvLypKE0p1P4f7vJHXSBFSFrwwMZj5G819ORwjefZLwFkjhyn9nGfyMhnUxaUY9WkhMRKv0rF/IU3zvNS6lrdTy7p6imlznBvSieLbngp6yPi5Ri89n5WWfqv9sNiHPJ0O7hHtxL8V3eP2M7Z3xsOzvlRpBjLZBG4y4jA3QEISV0pANMoWp4XVchOUMohNy03KQnCln6rG6U+kTJeWB4ZqKD9L5vbN8MX4s3fiPxzAHHeBhytdbcjdx3OE7TNPkEGWR+QyOd7Bi5emVoJDmPjLB1DNI9+NJ6Q6GIB40rVSws6XFhxfx1N7OMfO0XHPH03wj6kjE1FfpY35Cm/Id8wQ7P8AjXDmOM7iruTiNWVP8XL/ALrXBuRlfK72x2Ys/wCH9hHtxH8R3eP2N7ZvxM9rvlR7hQn1SH6bVHs73oY0hZHjfRfgeg40el2NGn4tCTGcx1OC6jwhKbdMWJ0msSZGrDEg6YmaVdyOO01dEADFlquI/DN+NxPvivpSu+qon9OSxePWv9P+TXsXkjhbWeL41jCGRkdQOkOh1SStj1y4mBK4RN6ZlcI48nPtcQIlcOI0pXsme1ha/d0YculI4HGl0jEmUGNI2XZSMLpjC/qiFyEL6dA8s8HIsKNsEetltoniHYnef4k5wa2SUySOB1Rue1dUFRmosyuj+wj24j+M7vH8be2Z8Ufsk+VP2cFD3cfpgpmomG9ZTu0/xWv3MmNZIo2N08SgayB2PpUrN+kF/rksc+MNnC6z2pmY4JuYEyZhYZA5Zn1IHU7Gy39ZR7Jx9QKtBRfN/rJ8jQj23tOls60xmpYtRzw5sRk8bGX8VzR0IN3PkDVJSgnc1xlpRy6XQEuOW1z4j1AtT0ZCuqV1F1KTJ6fHnEI5gKMrE3UmNe4gfQzvid3n+EtOiUGQyBkberuHp7rdgZdRPYcqL+Pj6ZxtnAgZ/wCK5RH6be2X8UZ9Eh+qnbpqi9z/AGBRMc9zMVzB/q/s5ZvpfEC5+RfSwD9KP2cS+DJi1RztRaKLTpxa0dRjZhDEVJiRSMlwqQxZCwsnYvEPYmZj6GZajyA1Qy47jktColFM+b9S++QtKtakD6LpFwqA0cWZscsu51kAnqwsbSnbcsraTqCDy58rvqYR1F4+lp+jX04wmRs6UjWscWtcY2DS3SVNWmrbG70sHoHwZ3xuWR8EELdGfIRP1N/2eWALkjd0mjJITc6cKWZ0rZnMdE7AlIYx4a0FPwp52MwZgG8NPUPDpdU2FkROgxTIHMax+PEwqTSWYmPjwJzw9oka1zCHY9xuZkwsmc8iNUXMxMWSNrMd7BxInw0e7M5paW9i46cVxrPLtZc9sZmZTJCxsH1EY3ubl8NMr/4ubQOE5GqTBkAlwJWpmJkNb0ckA403TbG8S6HqSOTXrBBKBV7ByNJuyJpa7Thpii+Nzmgub65nGyPT2fP8vDnHW7eFg/xdF4taR1zodIJX642lpaI+pEXOe1AsCaxrgwekfBnH6Va3P+o1rmsGdXiPJihrFqbWptdRq1I2VDtHk0WEeqCWVgc+V6MswRly3smmyIsWaV5f6tTZy0NzXZDtQD3PjqQQF8eTHEBNEXPymtXimleJ26oKErCeJA+Eg+HijPpBPFiBoLZIMfV08MtfDA1PbGGt06NcLXNLOjkua2ePLbHHjTGSctmYn5cjHwSzy4xy5Q4Z8od/ICKI8YC9zHcv0mu3L1aj3T70xlrmuGtz3o0WEJkWp2iNz8YNaidULPx/+o94YGSsqaSKRELRTMeURvdPG5wliKMpjb1HBR7xT6Glgj0NaWJzCRxOPp5HNoUBaGP6MrhHHqc2Eim01rUJWgs0Jsjk5z6je9gc6Ys6RcpXRhdJ1nRCckhd1w9xmldikt/j3J2CaGK8AQuanQWi2k9z3J51M1u6UU7gst8sjNOSV0Mq24+SF4XIKbjzdM4b3RDAcv4+So8BzXeDsHEJe3EYAMYNTcbSDigp2GCz+PYV/Gxp+A1w/i4k69FFG75UU0ErTuHNY17Q9kGMChEzUWlyAeulMTDiPjb4RzlFi9MlrdBrp9J9PhqIY5bGMQlHCcV4Irw1DoN1MhDXT1K3r0hLpaemX+IbpPeJrXibCM0Msbo3Kljx6m4Re1CR/V1layg5y1FWVurKsq3L1lZUj2R5QvIhc5i6nUmeC5zz6uFP05vTC0NWgLQ1UFQVKlX9GuVKlSpUntYHzvxtLo2OjixIYlkQ4+jYMxnPcHOIkOEzVi4kcjm40NaIAXCAMa+BzxVPfAoum5vqevRZLQ8viajLEWeI38YF41eMteNC8WF4teKteLXirXiinZRXiyvErE15L8xuPI2aENXZQPpdUFcJbqVBUFQVKgqCpUq5Z8wdM5/ozHnW07zuslMcWugk6sPkv+2974UyU2JHU0S1/kEnquUzJSenNeiWxBkOXhsmnY+RbIshrBBKQ6CQgwO1CI3JBJKTjSUcG14EBeEXhkcUEeAaV4AL+OC/jmr+NC/jWocNYhwyNN4ZjL+Mxk/BxWrwuKF6Y2l8ZRijcn4bXJ3DysVzsYQOhkH2s4hk0klx9+TBqdy4LIH4P37/AKBx10l0HIRFCLfpLp0umo2UgzbSixGNOFLYosQYtJulS07hqDQgxq0hUFSpUEUAgETSD7L5BUuzo3pwjKkihCiZFI4QNCmd0xrfG7FzJiPFw2Nx5+Oiso7IAGMpjtLkV/x1x/u2rVrcgh1aStJWhUgxBlIDyH1KgiiBp0haVSpAKtq2H2LUj/qvK/UuzXZZcTkuagIpmT4/SYGPax1Na6QvfAD4SKOGFnD8v63mtZmKMkDgxWZiHGlpUuhICWur/jo/p2Fav7YcHJxK9XIboe4ncdkETSeQQ2QkaypJaRlDkBTrt10Q6gHoLUUNXn2UhU7/AKg+V53duJNkRTmkta6XqNikdpyBH0oxqflyjGhxdRWMTWDP1otSsKwi4IOCtEhD1HOwPEv/AI2O/wCPhRjJjiEb2NDWix/Yvzbo6wSTyaSE4ajVLVabuFsjS7p8YWgxufDt2JlQLwt0wrqO0slKBsUVTwRemlSrnkv2fL9RmS3R4jUup6QnH6cjdLcdvVcZJAozSw2tdkSyeIyZH1iFhXCnaZe6rkVpBRa1Rx6jjw9ES7iWFwB1tVlNKa/Z08mNL5N+Q+/v5L53y0gp1UAEWigAtITWgICuZRRdRc7d4CshVpADiezb3rSGikLC3vuqQW3OaXQMjJBWyl2wId2usiR9B3vye2Ifp5W5AIDsr6ANKMdR3TYwYH5flhxuomMbG0lPcnSxqZzXc2FZEfXx+F5Jkh/r35TytWu6JWpWrQXZWiv0U0p9BamAaiu6AN7XqKtA8u/kuhMs5yBWWNONjn0TSpo0th3kyViGlk9+fDBbXepQv0zMIe3nixB61LUCnqZyLjT1HBrhPaMoOpH6PEGu1C1fMeQ8jaC28leY+Xdd1sVe/cGlXKlfLUUXgJpbTWtt0S0tLv161uTuvWhsQTTQbK7eR52yX7T2TFXVyx1TOd4WanTG3Yo9U24j9LphY/e2lcKYTBM0iN4AHDH6ot1ut1DtCpHNCkcE9/qlfacsfbGlNn2pm64mwtigdYVq/sbKhypEcwq85C78qo9l6SqWlVy3PIqyC7dO0Iih6kHUbDlRVFFtLQ26IQBVG1bUOczts0inkXwLG6k2S18JZqkkcdMdWohUb/b+9unzjg6OXpMaebbgSaJ+fYKQbTyNBLkN0VOdGO7d2T6Xxn1ZLtWLwt9w78hzseQ87pavt2i4LUK1BC1SoLstvLpFhb2dnmPUA1esAOKKqzVAU1A7DkFsr5O9s11lGMu7uxIxh4WZIZXY9sa7dUmtoSGyVs2DlANU2fZ4y4bS+mPGNvQTB9SbtG625c4aHuaeQUDNc+Y65b3lNod8t1RY/wBPLIK0kct+e3IqkVurRPK0eQ8lHlvy2W3LtytUOdIc6VOqig2l1FrWthJK1Ipzg0B4Wrf988h+h+Xk+IcQFwbCa9cUcRFM5oeD6P11XLqyPRL6sgPeXc+Fhpzs7Hi1iaOUZbvTA/SRZFuUJ+tLuxkhBmnIkBQTQsJoY2Y8n8sw+uTaGwr8l+e/Jv5LRryWrVoOagVaFqr8o5HkaRARACIcS6gg5NtU9MDkAUDfKzz4k83y/wCPvfr4lN1cyTQ1f6D2D3A7OTq8kDtEvHWvfFAYwXSl5icKZvHQUPyHtJLb88HUzZBR+ozERRE6inn1E7ZJGpudE2LhUvVw651v5L8u/K1fkq+dBUOemkWlDZG1ZC1FalfO+XdFaaBjBWikKRaCrBICbybQQJW63VLi7K58FdonlqJoBcZIumDBbB3tE35W9+JB7eEcou42G6h+X/bLbUsjjIxgpQ4/UcxrMRuTJZX7tE7Zpsxjfgk2mZXyvy15whzA3X635b8r5bctiq8vZUrQJV7K0RRNLYrcIupNO2xRVoHnxGPqY8gIcsdxa+Zmk49hSva5rrqI0hSbRdK9hZ5M2TXwXlhY78iS65Q/M/ZZg+p2biYoyI6GKwyEn9uKMzbBUjw0Oe4uv1MeY5Y5RLGOdKvNavn++RPOlsqCoIjl+wrKu+d+T9mkQF3QWkXW/TWmlQQYE0Ua5i+XZXtxeAxSJvu3e4el0UdqUBrgiU00Xm/I1pcXxyxcEQXDIeji3yh2ll7ZXukG3Cn/AEciO0ezjQIMhbG2nRAqZkbGn3orgc/p5bebflstkUOYPK0VXK+WyNJq1cu4ocxzHewjV+lDdatK1NKAAW4Tq5EOIbsdjzCsq1lRCeDlGdJduo3hqJso94WgyZAa2Tnwo9CXjMzDhrh8fVzBty3V06U1kz+p0rv8bEd05832OIDdBc4NDQO5WU7qvkHr/SxpTBO12pqA57891v5OxKA5789+Vo7rZDlsqCJpWgqFppCC1WpOw7Pab9VEPJ1Falqta1YPIlagu6IQ2VjlxfG6M6/RedF8ygjueUMIIujId1wOMnJvm7YcSNKciydToMbrQOLnJuO6/CuqQoJ27GsF5bEOfB5teN5aXbmRa35WOV8hyCKtWECFa1FbK0FQQR35bLuiNyRb5XNTXggupBxoO3LgFbVYRegQhapDZWdWptX5HsEgzuGNZG5tIMGiSItfo20qlRVFBhKbBa9iLUW+vDwHZCx8ePHZy3RBes9v+PdtxRvw38XQCjiSa5GNhhefVyAWS24+fDZejk87V8rVoq1avkDfIlblWQrK1rVyPJx2DHoMKo1uqKohUtltyIBRY0hrN6smMlaEYUWOWh9U+qcUGELTKmghEtRlYEcqILxsK8djrx8C8fAvHY9TdLqiSMJ0katocSE1W1W1Nc1Mc1CigpISZIJIIYRkQoSMKBHKIlsk56gfjT6MXGDY4HxRRjJjUmWNMxLm9Nyoqk4bSROLTiTLw0q6LwtDgsfNb0hkQlCUFFxK3W60rSUWFaSqctJWkoBypb8iFSpUtKLCtDkYnf2CnKQKQJ/lKPnamJiCPJijTUEObkeQ5OTkeZTk9OQUZUZTEP6v/8QAIxEAAgIBBAMBAQEBAAAAAAAAAAEQEQISICExMEBQQSITQv/aAAgBAwEBPwHUWWWXvsv3qKK+VZfo0V8td+xRRWyiioo07K2MxH2Lv5TH0Yj7F7TLixb1tZ+GI+/I/GxSxiGLyM/DEfYu97ZcPKi7G+BcoqVLhwmXGQhi33tZfAouiy9rZi9uOzULK4bYhwuiiirGPfZZZcXKU0YrbTF3NQi9mHYxildD6H0KMtn/AFvorw8xZqNRZZZwcFIo0mliRZpsoqFH4Y4w9n74a2udThjMe4Ut7NRqNRqNRa2IxKloyP0rcizUfo5cqGMxQ1Dh7HOKs0qEijksTNWxzlts/RrfZcMSsSqGcHBUUzSNMxwb4P8AMqizIXYjJQhnBR/RQ1cZFFFeZoWMtfzFC4jUjhjhZUPJlssssviExvfbKKKKKZTKmix7bmx5ce1ZZfp39RV8dypShr5OMLY18BbVtxhw/lYyhv3148Yo6h/JwGXx8JD4Lm9uJkJGkcY9eeiivN2UUUVtRU6SjovyUUf/xAAlEQACAgEEAwEBAAMBAAAAAAAAAQIREBIgITEwQEEDMhNQUSL/2gAIAQIBAT8B0lFFFYsvZRXu3vvY8X/oa/3SiVRSH17Fll7LLLxZq3x5Ivk/Qj0T69pFF+aHQuGSI9EusV468qKxpGt72w6PpLoj0S68NYSKzRW5IayhYXRLyQ6PpIj0S/ksvZQoNlUNEfzvs0UxrkeaH3iiOESGViIxdD3UVthwiuSSF0NWhxorbDgkr2MnlH+O+SX56RKxQiSVCxLssR0JEfvi0o0mkSw+NkuSmUViPQ+srkZNcCiUksI/X+SPYieX2JIXePhDY/52UUUazWJ34LRaxRRRRRQ7zZYzSP8ASuC3l9lci/obPhHKPmVsfGE6S2xxQ4LEeiOESF1iPWL4xpKNJpRoNJyU8PtEhsoQiI+iitssfBPgWYllknxiPREssbF1iIz5l4nKjW8NmpHY0OKZoKaF2R7Esx2Xj4IoReFiisR6Lo7wh38LkJ0MckKaFJEpJD/XgvUURfwb4ob5IP5iuRHIpf8AT/ycC4xEra0IiVt5ypUNiwnyWWS5xQlQsaSNHBSOChLk4OBOjUjWa0azUakcHJZeODgVeCsUMSZRpGWWXhepebLLLzZZZZZZZzhYY4/8KrYtj99FFHWOzoqxqtmp3l+/BYbyuM/p3lyxF4or3UJeD9FiWIoRF84fuxQ2XuQ1xiWIoZH31whiW6OZEViQlhr3V0PciOZC6HISwsS9xPwIm8MQ1TFsfupi53WPDIjlyaxCJYflssvx0UULgvZZWWamaRKjUWdlDRW6y8WWWf/EAD8QAAEDAgMGAwUGBgEDBQAAAAEAAhEhMQMQEiIyQVFhcSCBkRMwM0KhI1BSYnKCBECSsdHhwWCi8BQkQ4Cy/9oACAEBAAY/Av8A6UX/AOnJ+9j9xDM1C3Cgz2bo4n71d9w7TmjzQ085Wzp/utYeYKI+abozUdE1r/ZgW6/euJ/O1U656BUfHcKGPMhTMoNlVGuUGn5aIog6gUZG26x+9cS/D+Qv7vaxGr7NmI/sFAwWN/UZREj9qqVsk+ScKoEXUmypZOVTwQBr05LZ2hyK68vvN3Yfy1XtUMDndl9n/Dx+pbeM1g/KF9o/EeepWzhtCrk4iMoPBWQlFrawvJFUqsM/PGVV+IfVU+8Bt6Wj6qOkI11B38jpa0lbGFCGrEDUdeK4qmHPeqhoA7ePEyY0aRqTeykp7XV1VCHZFHhRMdqvwhVqF1ymx5hbdRzCkfeUo9pR0tNEwFu97yn0zKHuMTIQaAwEztkOxXkijRNaRTgcuVUNVl15ZS06StsR14fdxzK/ajeqwT198Mh7jERKaOqZ2QTnHgEbWR7o1TWGsLZNORQDtk9cqUW1b/ziuvLLYMdOC2xp96Dev8sCOByqePjOZTD0IQ7rD/V78oe4xEUwuFeS8lZYiK80dnzXnlVbB8itvZypRbS68jlsHyUOofCXLcMqkTynwUNAE0TUUU+GCVdRZUM+6uFRxAhVf9Vzp7g5BFRyKP6k3unV7LDM04+9KCPjf3yC8kFiJy80brVxnwVWyY/stsR14ZUoq2XLLYPkVDtk+CoRtMZVxG+q2XtPYqnNEcxkD4CrfXKWlS4yZ906VZR+XJwPjKb2RT+6xO6b3yZHvTkfG/uigvJBO6p0rzXBXET45FD0VRI6KipRdFWinE3V9gTfimioceC2gYWnjEpx4aIWhnxP7ZNIoQU2E3rIUTZFvLwHI5OPXxnN2X7UZsvLxlN7ZO8liBDuiuyHvj4390Z9UD/yjMZPTl5o0Wnr7mt+a/EuR6rki1te2TfwzPNBuG7yNkZpFKlYmkxsyqCeMqTZO5UyDomCr1TO/gNcjliUmqbwjwa3zHRUYYVMM+qkjTkTkDwhP7Ifp8dOKA6LDj8SJWIj6qQLomE3t7kSH16LTNeUKdS+I1Dab6o1HjLRz5onEeCDyqVqcX9ICmvmiBvIl1k6P7ratKInzW9CGlwNrL4jfVfEatkg+OqOk+RVaZinSidyWJBj7NGeSd2TvJHsvPId/AfBsvcBxAKufVfZ4jgg/E3pRc6wXsxSs3UySrFUomk8kHCxGTU7smfpzjI5UMJkLC75PCPQQhCqRZN7eAgOBI8MukInXXoqE+dk2vop0tnjIRBZTgp9mKi0r4eIRqvrRpjQBYJu1iA/pmUftO0tQ2mnnSyO4BdQajpRVbVq7qWAAquI6EdJUN0/0o6sQytrEJCdiHdiM8QT7ysJ0J0/gQgxKuapwhHt4HSIhVVA4oOOHdfDUqhQz/cVtQfJCgvyT+iucmn8qwv05MRTY5KrgqKDhuW6VucYKlzdKoYqhX5ysH9WTu6f2TRBMqNDrJnbLSEGyb2WJ4ak0RNYWnaVY6LVqqtJjpIQ2cLZtREaMOpnstXsm2iJTR7N0gzOpYmziAOtVD4lbq+TuqFELqTXzR4KeRW63uho+q0wuPqt5yDi7jN0PtDQ9FvTzot5tuS+XorN9VUN/qUEDycjsu5Kx9MuSOqE7TbmnT+Ao6LoQXdUETRGfrm4cwnhzzE2QTcj3yEuhXc7spaxyIN9RzxM2fpWF+nJiKF0D5qq7oF6aUAfJOX71g987q/NCvApnbLTChYnhb7J4LjwsrwQjCjTUpocW1upZoieJUvE90CNI1dV8OR3UPBaqalxV1/pWCsEKBAAkZHkr17LgrmFvLeHortX/wAasxWarfVf7XzKarj6K/0V1vBcJUwJUwqtVJV1dE0TbUK2brUeAW1e8oVV7IJ465CQ30V/RV1fVMRGlcE4prAblaSyOqc4ONBQLC7ZNjITTomHmh+CyYtZN7BMTeyeDdGPx/8ACwe4z7rzQ812OXmvJYnbwmAacU5cQUaTRSVOGbIy1mIePBFulzf+E2R61Ueww/Rbkdk1zRpPFMA1GR4RkVE0WnnRXCd0W8DlJxHSeAatWCHTMGVqcG04J0lrQPNS3Hb2hbL2lCSKreHqpP8A+lZys5RWeygtM8tKqPorBW+qsVHPplvLe+q2T3yqAv8AKqz0yoVvoRXzRomk0A6KsyjEwtOINmKrXhsrM1UhOtuoDlyyBqgDxyw8sIJlQ0RxTKcU0FR9UQ0EVm6wu4RWqDExK7Feab5pwy/cE6lqI/p8JBNCqiiDo1TzErQBLnWWkqiOm/ND27nDEn4hNOy0tc2nLwYUfhTHTvDxFWqmA88tPTKzvVbn1RcxoBC+Xh8q+T0WsmrqraKbBKHdHOJTTqkqeQybEaTeigtRodXDLig9rnGvFXW+1UI9Vtf3W670VW/RbuXFXK3lvBVC3FBsquTgItmENAJhbQKZ3U6lglRwhMQnhkYlNnEt0RLjKa5znkXUDXVNdpdfmtb9MCq1UjIuP4k5xNZR7eE/iVVXeuSsFxa/UXXIRUPA2eCa8H9QWmmnvRe2dGiNLfBhxyUcQJzrmVdYffL9q/yqQPJbydU2VzwQFaoNZqMc0Rp7JnZBHOOaHmh+k5Cp9EOFfAO+Te2Te6HZYv6s91HZRLdQjKhX+18yr/ZWViruVwuHkuKAkUVSfJbGG9VFOFUBq5LplpDBXqpXkmJqb3W1tRwlNOGKRaUDzTu+XeiHsi3qiNYpyUe2kLE9ti04KFDhCAAk9E1rz8IwByTRMmJomkOLm0kgceSFbKnFEYYBn6JkvLzFznh9kOyLeWWoeHD75ftyCCd2K9E1ws26ialAzAsmVV0fAJI4pscjk3hshN7+Adxk3tkO6HZYvfI5eSdXhlJQa26MwO5W0G6+6c5zmjopOlUn1VCfRQ4tC4+S4qoCgkqJCAMalcQVwQKuh2QDa1Qm6HdHsEzsngzdO5ZNceCKxJ/Dk5QEJ4Ian6PJB2HiahiXqgQ2OZJWkGGgckftC7qUMNpuYC0A/Ddc2QwwXERxMovNgtgw1YTuia0t6IluTq7pmMpDUdkeqsI/UmlwEA81cLUIiOanZ9V8vqvl9URLbc18nD5kdenWTzV2LhHBNyORLrJzm0UIKCmWsus+BvfJvbId03ssXvkcinduebe6/cv3LETh1yZNtSxDx5o903SPmVRVNVkUzTwW64qq4qsLSKBAEqG1Kj8qbAIgJyM+B/ZWTlWhUhBbSNI6Kihl1ujEb2TGtbpm6Ok0i6Aw3VKkohA2PVRw4oDmnc06RwWFpNV8/oq6l8y4rjlNaJsz9F8NfCPqjOHPmjsRCweyZkVRv1WngFroQaIk3QnlGWh9YX2dO6k4rtfGiljp8lUFN/8AOGTe2Xmm2ssTvkehzd2yhjS7sEHuBEdF3Mo/qTqTVQABTllwWKn91h/rC1C4TO6FVZQ+3VaAwQeic/FbqA4FHThAHotkO81rbZV1BRK3lUIag5S66DsMB/nkU7tk5bMxxCoq50VCprXknUvx5INCYGmwrRd1ellOmvJAiFJToR/SsNOKlTAW630UFrbLgqKtEYVUQYRWD2Kw8ih7QB8otbsgcPCZ5LZygHjwCIxHOI5StDgaIOppIkFNGk8lZbLI6miaJZ6oue8EHgEdJbHdEnDlvNtUS7ZCgI6m6ynf+2jCtrAsiWYmqRzTm6WhEPbpctT3AlGHNLkNt3UgJ+HhzXjCawtrwWJIieZTtYF1+4IIDqoThyyw4PDmi1/8RhdVvujujqMtdQSnMDmaU0e0ZHRasNzes8UQC0yhOkBFoh0UBVNJkcCjsV/Uvh16oEsU+zMaVuH0R2HeiMzKGcKiqEIKqVqQ5uPDggDEq0AWCKHDJ3dPHDSmLFQFtvKOGRDitXBDQaotKhw8lQbqdRYPYrDUBezANeSYCdPQrErx8JqhLoR2gt5eSjiSmB80H4Fsz5NC47w4JwB48Wyoe54H5GQth7o6sWl7oBvEAr7TFP8A51VDporq8dQmYOI5rQ0U5FVxGaY/Eq4zZWr23o1Q1+IQVIYf6kDggHn0VHj+lScQoO1Pc0XAKtHclHuExNd+bJ5b0Q1l0flU+2xAOSdrftH5iVs4st5qA80TwHmE2X1FxCJ1dlf5B/ZENcZPMINZiO3YgrQ7+JIdfeumzjYmnugRiQZ3nI/bU7BadbZ7BMLxLnibrcb/AFImB7iIQrRVNuC1OhFRCADlZ7tNXdlUcVLGgUKwysRfvQkFOp1VRpN5V1q1jsqtlyJ0g9ENDYRj5rotEQsDzTQ51+apBRLcVlfxhSMbDBRqHA1keFhPn1TYaGgc02TQcuKMNiVSnZVxD/Sh9kD/AMpxc3R+lhXw7GbIxh/3VGQTei+EL20oFzHjoKItNAEJG8mgiZUjshDqppDQ57eHNfBDf3BbTD5ELToN53gqADzCdzPUJ0iSeoQ+yLv3rZwdP70yGlscAtDw947qNDg1aQ17u63FRv1Wy2PNbrfMog4eEg1wYKzRfKo1s9FqLsNx6tUH2X9K1FzTSN1VZh+i2QxvYK47wq6fRadVOyq6fJbyYDiHZst8otmg8Vp8suZQ0yQgDKs68KNN+MLSMMx2XwqSn/a4Y1CN5DU/BpTeVX4VvxJo1Mp+ZYjQ5lbbS+Jh/wBSH2rKdVifaMlw/Eg4YuGJ6qv8Rheqrj4cIfb4f1U+0/uvii82USB1jJg5LW6XGqjRClrjebL4g1JzSWnqtLhBzqvZ6IaLLSeXJf68d1cLeCo6SU0LF9od2iDjwTRzyw+TqZ2Vlb+chpAbeq2MKWdBVHfD52eXmgf4rU8mzWWPmnFh0OFm3+qBGBhARxElN9liaH/hAhaaa7mApdjaGni5l1A/iB0ll1X+I/7EQce35Cg4YzjPJijU7uRCGy89YojBPkjrLv2hTg4dJgAmq0FmKMXstOnzlbTg08lcarQoY0PPJbgCs30QmPRf6VvFf6q/1V1DTDG3Kh4cXAQCBVbGs925VsthydiOrwGdlbxlltP1TX02Qm9ROQ6ZNcOBTHj5h9wHXibX4RVDUSW3hODNkHorUilU0uYQ0cltPInhCEGewXMd1Rr/AFR0AtCG91kodLJ873y1UuJlQ4ntKpu5D7RUxe55r4hW+VvkqhLey4qzlxXH1X+1Y+q3St0rdW59VuKuEvgtUMAa3oquHqqH/uVzHdbDh5rTjfwwcPxC61YMdfd42k1IWkWlTlGbRxbT7gsFSFuocEV/hD/CC3T38P8AjKw8v5LoFtQiOC0lbUKRPkiGvcHclVxUMme61h5B5rbdhk8jdQXwVSo9w3q1QvzTlOeIzhf7h6r/AHny8dlZWypK4+/iaJreeXZQxi+1g+SG05e1biOkLW7+IdpU8OangLJzoq43Q9ttPPApwdRptHD3DdRq1GXhFhMxmZYRFSpIpZYpg/yFvfXyohQqkEc1BCpTK6vnaiOh6qLXUD/KGq3QIRKr9EenVaQSruHcK9OgQglyv5K8+57Jqst1acMVUOUglBpe6/FNkzyTvZ/iqOAQaOKa1u8sbHxaw1Hg35nKeWV1xW8rqpV0IuV7R0taBfmruXzHzQZqOkWCDcXDZI6IBo0jl9wfLCoNS2aHmo1V7KxXFTYqr0JOX+VBAhQG07KAb8IXxKKauQH0VR5QqtIRmUYJVXEDkFQLZEdlcQq1VTnbIxQoz+BDEM8sinYnG3ZCbko7XbqiDwCjU7L2sQxolanWlEcXuhBgrp5cEW8wreCoVJ9VABUmrlB0qjAeqrTyVcolNGOQ/BdZ8W7/AM/b6KCCqAhbRJyuVbK2VVwyG8p1ujoFA9p9FOme5W60dltH6qRTyUNNFEj0UVIUmFZXVvBsjU7koxmHDPA3Ce6RABWCpUNstDLlAcqZEcUCrURY0QbZYTLmJUBNCt4LKSNLVDBleFV5J6K0eB2GeNu69nib7NnKysuPuL+G3vrqOKggKyt9FYefgqEVEK8KNRhfEkKiiXKrmyuHmFVoVVeVRcPBxyJRRCwG9FU3NFDVqPkm98j4XG7jTsEYowJr28Cg4WPg1HdGXFXVFwy18fBLIDMYfVA+7v4b+9ucui2XLmVwVFfKyILSr1VqI6UIhbjSrQvy9VW/RXUV9FLonkpMea3lfxHJuoSE2N0JvBSbZasxl1yfap5rTk5vLK+TctoqihRwyb2XmgqFMxuOG6fJGLX8Flb3V1f3FlZcVyyqrlclQ50Vc62UwFV62YK2gJ6FRp+qvAW+r+q4KpQgVUlbNMuvh2nwOQVEcV+6ynmsTDJs5Aby0hTkMp5eBuHjtuOBUAkt6pybyNPABnfMJrekIBOAsFCxGnig07zTpy4LhlRX8Nvf3VFdXVYy3fBbLiqHK/qp1LdHk5bp9UKO7oS7I8Oy3vVcMrePaxNXRihoQa64EuRcbynHnTMKlsj1zYPzBVpUKqKZ3zb3zLQarZzaOqPJqlE80E4dVHDEbPmMt7+Uvnw8VVZWC4K0eG6uoMHyVGt8kKKsKIk9FshWCuAqlBWJy45klQXw3kryh/EPMgHZCDB81+yOgyEFqByoqlCSKqueFrtK/wDUvMFnPith1eShB3IqRk2iKLeMUUG3gfinhTwvCZii+GQVI93b+Rt6K30Vvqrqs5cfHb1VIVT9VFe622uOW7Kq0IzKqqeHFHLPEZ8gEx1T2A7LWwqCTlCCFMhEGnga78JlYWKDOEicSekKqqmmeGTcqUIKa+1cwG3KGH+Gp7+GTxC0EOdITObdnwX8FvFf31M+HquHrnx8VbLZaCgSLdVIhWHqqzK3lVw9VQz3KkCpXBWHg1ixEZ4ruAwyU513uyZz4rUTBhM9xhgWpqzCAGTEET1QaeC0uUNqVzxTZR4QEZ5J2EbOt46eG/i453y4Ky4K/gpnw8X/AAqjKBCo0Ky4r5Z5FbIatsU5wq0C/wAq49Fw8B5t2lXIgfMNORemzwVHyEeaJcq2VL+HVNwMwGeZ5Zt7oElHqEUX6o5KCQXFFxyqqHKSiqoPbcGU3EbZwyr/ACV1c+LguC5+a5ePpneM6FWb6qwC6q2Ux4qoQScPh0yvChaOEKq0jI5bseCGgk9FiDGEGaDlmJ3nVObO6d0KBRPBOw+RlFzjn0UKrQVqi3PwOwSeo95Xx1y/3nTwWVoz/wBK/hvlVbLlWc+ikD1UzlfLhn0yew56kHJ83UnMarKGWHgDncUWh4kuFssNptcqmXFDui0/OMtP5k3kdkoDquZW14NIsjmzEHAoEWOdPf8A+VXw8cueVlwVKq0K3gpK2oV1/gq65FTqp0XEK6uuPkvmzGfPK61tH2b/AO+Yb7kOKhRk7E4NCtkcsPE4gokKAi6ei0Ym81WUy2nXwz1jwaDdn9sreGi5ZUK4+7oVfK2X+1bKiqFbK0IQK9VBoqrl0V6d1WY5yt+Qt7ZVCFQSuCqVb6qoXRdFf6Khz4KHtBCL8EupcKihbPjqU0ZOCJ1aWjitOHaZV1SuQAuVHReSkqOqMgVX2bho6otmXlHI5O7+Bs7rqFdMr5XyuqZWyvnTKmW8qkK7cr52W77mqrVcvNbQlXhQ1bo8lSAqhVaqt9VZVgrahVy3voqv+i3/AKLe+i3/AKLf+i2HamLeV04aqcMhKvlfwSE1gf8ARUP0VM2mKKAiGtr3X2jtJWnVx5LeUYdSqVJVs6KIW59Vu/VWyb7R0O40W9lSFbw0ytnx8W7lwVgrD/p3/8QAKhABAAICAQMEAgIDAQEBAAAAAQARITFBUWFxEIGRoSCxwdHh8PEwQFD/2gAIAQEAAT8h/C5f4Bhllhg9cP8A479Lly//ANQQuB6H4DD1bJKImOJcfS5cuLOPWvWpX4VK9APRUr1WXL/K5cuEqJ61+Fwf/C4xfo69Bly5cYv4vox9APQivyv04PosV4mHEv8A+Aw9a/A/E/Bj+D636npcX8mMuD+F/nfoy5f/AJPoThKhK/AvqPQXLjLqKc3oOgF9PyJcGXLl+p63Bl+ixfRZf4sv0GXL/Nj+J9L/APS5f5voEr1Ar0PRInoNofgy5slTYgtrP4EqHoMuX6kI+l/gLl+ty5f/AKPoxfUZfqv0uXLg5yvP/wALCEr1x+d+i4yr3QRyxXMpJYd4wxw7ondmnRKluktKlSpUr1IQixly5cv0uXFly/yIfhfosuXFly5fpcfy6zn0f/d9bly5fqXF9Fly4ItuKqdclwweoLXhgot1livH4Kx8TFs1N5RxIZvGapgOUNwfSpUPzv0LF/BcuXLl/kety/wqP4nrXofwp3LP1+PMr/w59WXL9F9bly/WqKA6sx8d1THzQIFxW9kg3NnFf3CYOtAt1MNC8EXR1mcd+SdVMfw1yYgM1lIYTt6MHEWX6XLly5cv0Y/nXpn1uXLly5cv0H0r0ET0VK9Ll5geiSvUxIBrhiV61LzjCGSmLuPq1hM0pWYGblSpURlMr8NVXpdxxMbhplSo/wCwimw7pi5R3PmUW+XYuPQLljKxRuHEFjluK65F1EhkRawp4jf5Lajb+4ZPDMGOG1hJcX1Bv016V+KvR/8AAASVK9CBKlSoEv1ZUdeixfQIa/APQaLNm5UzmECUer61KXmIEG4PEWI3cPSy+8EWoeWE37bMyAeyZFvc6i07GuZuciwj7T9HlsyuDWUjBMtEEK65e6ILYslSyvMQpp2wNNpSVv7QGjHiGuPNv01DJpNk5vmNP7lyYnqKQkb9D0fxv81jH1JcuXL/ADPfSYuEqEYwnEMRWLCK1V5mMzdHPHqE5j6LLly/TP1qFpY0n7hdq+5/ca+O8NzIPdsSpQf+24wUXsioysCnG4GOERmVkgfYJkpRuba74hs72YZ8GWb8x7U1XRHHG2cy3Pa1cS3h10whVN2rX+ePeYca6HcubA92/wAylhk1/sggII8nqQYMuMv1WX+L+dy/S5cuXLly5cX8MJfqxZl4ibc+kOSEJ1oglBagASaXMcNq3qXDM49Ll+oI+i1gHhNlESGZUDglJUD8GW66JsqO3AuxFb4u0wc7lUBvXp2l94smH+dxlPGzFkd46yiTLLtKFn1L/P8AccxjqYZ0JS/YOnyS1TxP+qne4GIGJX58+h+BPzEjKlf+VTKBOPSpzLla8zAoO4OIvjjpGW3EDeT9y7zMfyjuEuLL/EGWCPrKIBhj0TrOCV6X6czwcEVdlHG24RBYu+DzMD2nE6svvMkdHEYuaTDm/SUFrCmX9tv9WFYGzUGEgZu6cf74hor7n/XzMCNdTcMM6mS/9pxL1WLobw+8IuPoelR9Lly5hyycRCCNk0/AhF+NSvx+so9Fm6yPcqd/7lRkoSpqMYmYq/M8zU8pgeJ9eNeo+pMLHWMxq4/lOfV9WXLi+gM9/mPVOFy8RzBzOnokT1MsxbR9waemY7GF0imzRiR4TamHE+mcwIrLhNwfwlFriaz7zAAE6MoNPkJgAtXOvmae0TxV3XH+ILrI7/3/AHHSrF5IF71BjUdev8QhBe/p8PqenNlcdYakOleI4Cw25E9KlVHdTgy0Bl9kJk4/GpEekS5PtD1ts3CcXgyvRUqB6VMdSY6nzD/shm8cWbVTvCOAEA0AeIy8xlxTZMw6xwj+CZeCVhySPDeofy/3FTGFfKbE4GMYx9WV6CVFYSqgegeJwy5c+0TM4Hh+5VQdINPHSU+KD44eXaDB2IjVViupzWHpLXPKbm3vDIiUYjhQxUdydu/hLL4TP+ELGESOH4uPicFtWWz5/uVl5Oh58dY0EQToy/Se1/iYQe5p8Ms9GmdYxKzrcQM8H06u+2J0r0CB2HSu8M56RI62sVZpL/AOea6vImVZEBI9orpFLly/S4suDLz6P8wKS9Q0Ugbmtqgw4uMouvVfTZHJ5mAd59JPrSmAcH6lemw8vTpmbxMYMumXL9EZUqV+DUVhUrROkrEcI6ZzMxuN3AfE/cwzGozhlDsrKezKvFZrNEe/hLm1e0uVyeOZi5qvMV1OPaW46Qi0t6/L2j8tP6wHK40ehrj4jif2P7INOTrp94/buxcrVvgLP8QVHDWOfMvCLGic0+BUFkzsXGCitzWcRkLsKgcncRHUkRMO7y8ePQTOpKac6HoiE9oz+CALYj+BPvemkGjoQ3/mYiuVAGcdLp9F9Km6O0FeWZeNKiKX5nQM2+pxVzn7koupBzq4N+CUVOPx1LgfBLJecxW7nJ6HCJQysypW/QzLbR+5ZgIcOZhrzD5mhATXGLlrrvCRltcH6ljWOEG5sgZiqTbPE7oNe0/jBpm0v0y48GGPBQ+GMV7Iplk7VlP6mSckrh8f1L5XvvLNQBsn6QYtsyT/AMSgsQpkv3hg1Xh58QeASWXmGwYHE0l0wLgy1q/ueOxn7kuJTpNhAz6Ll0i6MQ13XhhbJeowuA4+0erA6JeLjXpRhWqDAfzVplp82OatW7j8IE6gJyJzHOZYuU+uiegmLNzBzEWkXQgHPIBe57QV1EhALguJS3GMxnVbziNUQpzNzsjkYOCXH0N+i5DSWhnMgZ1lKGOuWNkT3grEso+SbHrFpeZg5mpNsTLmGbPRNqctCHdIkFJ5UFCY02x2mCBsgVi63H1FAGIH5cT0i5I8UwwD6mSoWUFnLXpDyvmC406MYpc6fgBoCd42TqnkJol+xMOfuUmmZZa9IJxweIvIxqseItLyyZNwHCJyiiXtfyii/tFALpFmUjB180Sk2U9Zu5IiEBi6CchvKly7DdnxCKCwwVcZIA5audCFakq6TNhzyjhlnSLFBsqMeZ9JhpnVM08mLHKFhxc23K/D0ZTIxF1YLzTs6S5nNfqYWZDEHmMGHqQEtDe/EbMDpIr8aZjplTcSCnUrAEWMB0DWB/iKD1L4RHsWvNPlcoYjCV12GNSqvCoxdiNTtBK9YzHiLvr8C7sFR3l+JC1t7HPeIN8pIPLa4O5QUM8yL+0SkEY9oOVPSDZwKkSu+vmPZTrFyjO0LLti/E+RJmMeomMW95h7iAIKdX+LL053L/mO3iD7SujTLf8AkFw1jT5lY/ZnIq5l4iFpkMy4uzaom60Dgq4Iyr/tNHrcu1ld66MQ01XTACugyrCVJ6kGQXC7zBxHd8sXYIMScLGKcMWtenu6wBFTdNoLv9glga1KmfOjrHnMDIf+Ida7Mqm6ai+6fRZjCqpmXTcxFhsz7EwDdfBHc94YUInQNx2EQMj3gLEvUnwSBGuKjWa7wmMP9VM4S2iXaC2UmbdkuVWHLDhW0yxMPGRhXSX6UHCx94VS2rjmKbCjJuXIJ4aqUIG2evmN5ziDKBwJ+5m9uYfpAyAa6B+5TXMZU22gC9PfrBYFE7VLJTswWRqpwNx6Oe6AtbBWGNnANxkTS3hDaAonM6EwN4LNLlwhjdRhJV9Ynbm4G3FTeXcBRoyRSNodxCpYaHBNpoyzyliA4csy3PK8tdYWlCy4SUVcC/EDFjelSsHVinR+IxEoUTcErmHNWuOUqYvSzzMHQuvaJBrIbcytjlDNu5lJpxnM00JHIKz5joZKxmCd1xwm4yxuGrmEL3y8wYFTPDrujkxKh69twJ7EVH6t1zL2Q0nxDW5kThJdVnPtNcesWsH+7vMLEY+WOsvEKAsBs3AiaFad4QQFY1B/JnUABk13hmYVzF66RW11iV0eV/Ed2dP6jhziDaPK5lLaXmN1oOHtOaHv7lVYCDtDe4MeFLAhSsHoVLhF3GFtjMRVWHHWKzmy6C5gS4mOVjI8e8HLApgEjp6NwhZVYHB48xJqgWIYLdVdLKxRe0VIpTiV8/idWmOuvtLzTiOxGLxwYlVzflhpvInAXQQmygzmIdAnVXD/AIJX3LgkV7xLRhUrkiGqwwHQ4py47yy8OSpGeTtHL1ZLgNFLu+8vZmGWu5qETtoup2B0VnkhzuNpouiQqrjRDnPuMAQ95ZuBaCwh3opLl7R0H2gC44PGSbkWgJv4jhyGqRuagvpANxop31LdUvDhkznDOJkOT/MewPmP4JZFSzjMUBXN8sUQYa3HpVWdxiWsXVBEAA71lwBcCVMqr/7lBks3xZeWLDQ1GYCflBIN3mKNyDJ2PWZjsywV9Qmiq76Q+yS4pQuWO173G7Jw+ySxYvbED7TBX1Qq8YUxzg9GPrLXcG1TUbdH79KnlAqXYVqt0lxD9X/yPrLWeJSGo48d5hZjm5ievZZuGrArm3t4mQctgH07VK06JdPl3i9lO9ZYwI7kluwYRmyWkN9rMWphFkArUroL3mHcx6Ny+rbi43BjQpL1iuuv+Ictl88E0PgMqkr3qVwn+xYPWAwal5zTK40vnRL1uJtn0yQ29peFxELexNQSjpAn9DEP6o1u8EKwBcqTgH0mTMBhUDO1O1xBUa2wzMvJ7TD/ALQL/CDhUJkpuUGbnIp1zOKoO/uQdNbbzLRYZlA06agFJU5zmSHd9D+4FzuZdMRiuUq4iNdiCr8S/gseEKxIIcmBgORgHsWirirkAeEqXVX8ymxt3myBC05BupUzZ/xNK5mLU2DL6GVuGIl/wlmF1iiGzA60l0vku2ip7DPBjqVKo3ggVmX+WPXvi59f0j7Dfpi3LMHvZYev8vxs48FZpg7rRvmVOCE1K1KoSVZ1HBlUPtG9ntCAFvfXSaBGNB3eIw2GALiVNJhe8oQr/KKYOTxHrEyIMDSViXXRNumF8V7rm69kSEwdV3fePbu8aqGGnVOB/ECtl/LeagoaKIOxnNGRkzI1qtYyzMvpuKjWYuAWRb8sx5Ok+4TxGHZoZ/UuCgJu4z7+UBgYCRWy2I4FXDEasgpxUt6kc6/lFYjSgQ6CBgmTPMx5viRRxHU5JbnlEr8TcBcPbEH0fmBlQ8QN4WYN/eCOz3IJyD7EFYAvNwzJ7HMoCmuKjRcW6uDDFtt5jisMAr9YpCJzxKKJlbNf4SqrzOCprxG5gnQySxdz9S4aYfMb5dtwuO2ULDMsjZD5kfhY4K/mPZdAGUgC14SPk18v8ZaIT1YyFGcS5yqB+5syaGosd/7fRIvoqWrU53C7iyuse6P3EpjcuI7/AMQIqvgzBAg7cGIyBdGDx2imSN6bWrtCtA0MP/JcuU31cYilr+cO1VAfEa3jMS8cEI1ecQlGCVLioiGN7dJQpOPp+l+4qlDg0uDx0WjCll7eZ333L3n+WQ5qbHWUK4HJzHYs7t1gHAG/Ms0TST9CMZX9atdor7NftmDgvrCGPi+HtFFpTDFPs+os49XT+p+uL4E/Y/uLm5c9p8W5jf8AO6RcZqWLYfB/UXZPwy/uPFxaql5neYhQRus12h2SnfMcb7RQ5HzCfwM3geZaZbzD1R8qibtN+8EfvKg5XmlhjKZJkVKgakrGDBMYMQq0XTcoovQ94fcQqlO8RbYVpk7RI2d1MUQ7sEhStQZ0HXSWp7FeEJ+ilwU+M794bG+YFGWsWF+6UQjN0mMRFF8QM6ZtLvjC6TTLNtNbMvSZEZMpQW8TzBG8wq1widEMAZOzLFww6XDa/N5eOY3lgeZlx/aJf9W5kPPV2mRoDaY+pmaatqBzibX8zNkxzM3HXsfuIv4J/BP1P3P9t1j2gGy1XdVK0o4JdSqtes4Fp4lbKEf0S/Q2pTv7RbNnZ7xCisdUX1i2FOSZJ2RYfn7m+M2f8I/pGPhR/Z/cX+rpFe/Sf8HtLf8Abjfei1C5HwhuNtySl95QsniU0Nt1riC1u/JFKFvRLDsG6ZlhdvgHE6fioUW0XChkHLUzwtXVAf8AKP8A2EwQe8O9IGVeO+IQrqNRwpr0Gc6+YeP6QJS3w7RpKHKX5BQoPRHk736n20oNXHmfQJdkAQopYzjKzAeCHw8T7kvfkKSGuWhGPW0KN/xMjQm+65lvjevPSukPjYMW94cKGnVXXEpzW0iu7yFI5CUAC13PmWCI21AZgnK7O0Bjx/cbzpHSHAS/uu0xBjBKsDfiAeA9Wo4ix6iUaewpAi7msv8AyJ04HTrFLVjjMG3hxgKX8PWEO1QT3/aQxzjrxxNlwazqXFXtfKYWVetTAwb6T9COIqVCWUX6SzorHKLqcSGsM2rImZUarTGNuJ+iJo4RfwT9Uv7Kfvf3M8H+iK/AnI6enSeD6gwtORojjbDp1l2V2eXpaG2u8ydapiK7houKh7+sO8KQvE5mPCQrMGiMcIPqlNzF/iXKFMCbR2w6SI00UkYqnlUy4A6ZgyhnxUwj/KL5ONVNOvVZqCgFFGZYBbNE3alA50/6QSEKszqTOoz3GZwR2iBb3Ht5nu4TsNyp8CniYoCrqHmdOkxY5U47y8UFYHEVWSCVCehYLxKtqObY79oZKvdlnsoPlPbI+kz9EdU4x3lxYKQEkwE2xULBKWN8zGBUNdd3mXU+cNmEEcQ/9EHkftM2brzKDmdZQjQ2ZXEcdWcR2XRsBmMjXnriWAtjm58i/ccf2RbO03SY2xnaiXyzAlh5MUh21h+PJAZNQmNGZXSaiyJQwgWA1NxH/XEWU/JHdfU/SfxnxOLLPLGUs/0QDhU6QOHTntCv9qKg61TaJFnjvLGTa6+izC3sqLaFaRhscA4liAWYBwgKX9EPKbAvLqDBVrsbl3sxLkrOFUrUQHUZ8Sm1QJCwnxE20qUUDsjXp1YpX0WHSlLIlSkFctqxAypPU3MYWxnESlwN2RTQN4wzVqm0mFi3I4qHMxVRiELlFeWJATG7mbwzW5h5pow5HErQlo6SoXbzBcq8kuBcmcsRxW5ubMxm9SxylhFlmG2V33F5Ux9zdK2UcvKN6hdJ5ZqJkogrp7wqVtW1AQDmKDiX1jlCgWYZlvO/eXwNX7TfZc7gOx5gTd4bYcWFOIgwMZohbAu+czID5ViZg1RWIrpKlWyCCmdahAeZTk9LYOesdPfBAZCYy4x2gHKrAwVFzWri3Yiy+gqSVwj1Pec5iF10hFk8CVtvaosYCxntKpjPF+0Zd2PdAmXlagMq3dsaWBUcuxXHHWY0eIu/1FNtyUmMg67faFWLoG0gxPpHHxKnv36pu5XlhNiJROzm4oyzGbnOCGjbC/qpw6hXY9QqZEVVouK+8UEOuk0SpwaVm5XZ1Bj+EiyO3xLKxyc9ZmTjL4v7iuVpt1gSxZTnxF0EtvGPiiaDS+ZiCbLeo4qW1l1Blny+yUcMFLD7Uy2ytuHBuFqPZBqHbxUggzSe4MCnz3GXcypaaZje/D+b744URxsExLt6TXSVBaeQ6wJ17xJclG51k8TPmZWB7FdJS9NJYeDVXcbe6wc95wG3ll1wrviVVTzL25zD+tWfNv7mK7kBzhH1O4c1C+KThQhossNECjGuYOsc7/ibqUyHWZkrmpllrFtywU6NeIyl0LbJjZAkKN/xPenxFcy6UyzZWct6qXsJfxKsXF2do0AYQ/jKG/jvcpw7jJAuAVCZ3ryKvzLW9eDYt1KVoYMNVFZA7f3ocnGXI/cwguFTfvAgG1YDzLHRHoWnhDVvJT+4GQUI2+LjTzKMTOs6+ZaB+w3MCZZMxilV6si/OtwAS/hed/0RLuBEB13Lyh71i8R8IfxG4OcznpNSX6hI6w1D6koeZAX2i1EMUP2qUxQ8ssAEdpI1HCHhI/EewLrulixycNx1FuGcX2ijWiuDiZIVZpGFozYixwstuO3SZQ9Dq1EANwRoP9IjWvTbEy76KZqXeKKVC+3WbaoYXA1QhK/alYVFozzBmluGdYip5QZRK6oqHUXK91pOsArxbCBce1OZelkYeZXlri4U5Xh6SuxBM3kIoUhYjXVFy69pc8mrFZelZvWOZn7cU68rntEjO5MzYWuEXBfkIwq4eIUbpdYZha0HeybzXQyxEN1YcS9N4FoOeKXk3BTGsRdngoAeJeZiUuP6nRlcbUoAzfaXrxkx9bMxCavIqHUR8luWS0KTDygWWETpT5itMF3h9S0PW0WmILSNjBfAMFBi6thQtywZ88QwQDo39xGDXZhnsVkaEfsUTPMVdBz8RAxVblDqN40rGF+IKGMsK8pvM6DQe6XSPRivgpTvlhllOq3V8TIgDdX8S66GqBAqcVyMxgdVV0+eZZe1u3KDlUwYtJQ1LedVN5+9TMwi5uCdjrWWBUrN2sBkjm9w0gbDuCdh65mQAFvditQ78agUNVWLrca9BKYny/7l0uOLjSGUvg9tyqyVPVWuoazc6sN2KeCI2hrAln9ZAuox3Y0/qAZYlwF49IfHs2lqWRPSoZxAsh5vNy+YpzxHqwpU/TMrZ1IpMIoqduoJRDMalysr4oUhMubFg1Kj9slVrbqRojpqkMqIq70xM05KrZu5j2Ft6fU1A939SjHytP1Csop4P6RbBxybfUBpToHLp1EaLMAa2XzCIu709blONAcclREZlUI/EsUd00plS1bRKqFwNltMRrHr6WgpJXE71dwjpDOpLI7n1Ga/Uw5ndly9ao9FL3EL0RZUYFEYPA1LVkxD/EWJxX6lttr95Qi9MyNyfeHfhxE7adjK/wDGHQJToSnT0VKlSpUpmZmZmZnpPaZlPSfEB7fMtzA8TxI19OU+Mwo3IZDvDinU4F7uoNIjoUO6AAYptdyL/nYR+cVoud3kgCCPCh1Y9yhstvha4xL9VpEV2FRaRi7B7IJoFPKlxJ1WCdSAI1VLf7lA67/SwvAb7KWRZM4X+4Wb+zoe8t2w6psQEr4qtX+pn444AWWgA5Zv3Ihq5ha4vAzNLsm/BfM6PekrAFdJaMkKZEX2i+j8EenrxL6r3xFu3FeJl3Xez+oAvNh5Ww2c+OWZ81Klx/mEyCTuHtEvgKQyzY94LR5GyXqVdZK/mUG9R+5ZwTpBDiHxK9E7R6VehKSnoZOq90UMLkSMvbpVczAJSB9kU3tEkLQrJfZ9Mx9A361+Dj0al+mZbD1r0r5mea9PaV0qcd5ntNOGIUbdYjkYs4mI+0xRuYoP2lDSKKE2wuoZQkE1p95SC6DWku+4sHiPEwYVy/5j3j0OOkGo442kPMULtNrEd4DxW5YzDSUwTAnXMK88YtfuWzWs1ncYLrrJuGOQOANQtfogORYseYh1wdtzAjWsSxiXYvBe+BtX7+hB1n3izNvmc3HzKQt/dANGNAmehj5gvK+W4VOBQUTF2/bNQe0Yn7SH3OwnaBQMVIvwqk8kr8uJ39GO2SD8xdBmqUp2CacRfScQhPI/LcKhXpXT0rvH0ueEvHp7MvOmX59c+vvM9fS6j2jBYx4l9CDOYHNQeR74gFXKB/1BDFjmr3lKtHVuEYE34nTlC3TByozCLgHzM/Z5Yi3U1Cp0wvepkIXQqV8zoCduvSpK9vidiDz7Re8p4nIjs63MthUeJij1EsNnT02E+DBhVyZu15YLP+lLLpqcwIEu18iHz9ajBUJpIevHoxL3EpahbJGgP9EFG4xDc5mDNr0KTTzGMvrOOPw+ZnpOPzuX+GZcWXL6S41/7BRkANZ/c0lP6TONHjSZs/BEb1ChwuvocSr6zXcolRUvmKmcJ33vKZ2OLIjS4CZ2jRODzPO+9S61X+ZvPuHUgzFqdNfU3NcTjUzz6Yvn0obllqKcQTParfEwZW5jGeBftMMHS9zhTWtxhhV4hPYFGKgmxoW6uX7SpAnVMIf/AEaqUIp2BbLOj3p6vmU32jZG+jHDm/EeOgS2lXLPTkc+hrEVVbEwEFeZZd5RZmCmuJjpmY7zxH/cSq1+pbyQ8S5c1L8T4nsfMrtDxFztM96l9YQwyQgzA6sqI3uX5m4jKxuF3yiTHL4nBd7YlqCOUVv5ZipbkB3lXA8ymjSIhfx4ivNNTlrqekUqHreJm88l/cRbcPUjN37oXA59DLKUwvIB+4UFNeSoHCx2tlBoc1DMqLtooiGwzsup1QHFIOVi8YjZszLDG2Ylnb0ofRUWJiFV6C66M8rFTGMs9Y7BVc5ILuZ55+Yi2FblI6sYjLo2BghTog04pikvbsaOkXJFVK3uk6d4lS2aXvFVpznHaBYu8c7TrAW3xOrCxhgHKnrNK8DESZQUkuggBS0RCKzHEB2eSOKb2aqIiJdoy9fMFuOgY9KxjRHsw7MuXLly5fox9T2nHETEq+YgwK9Ud5fmLiW8xZbF6iZA93ccPnSlKt3VxqwezKURkOrVzsd/MQqWGC4n9BCkyPaGW2MDaEFBSXSMsF8dU4q8ilxGg6k/bsRGwx2VDKwMcS1OEEqYHY9GYBqF1GbnyZhnqMiu4JvTz/lCg/kQ4AriKdVQrMjKM1ilsuhxmEtg7uZ3LLHhgwKCiIzOsLLyzqr0kWbyW5f8ASnMWB5DzHLEmNzqGuYitYy6xVyLA7RtEOh0I1Sbq0hmFqWkNt17TPIVzAON+GIw0c3U6E8QrIrDXJ/UsuM8VHPkFn1cbUCFm1whlmYXycRzg1hK6Rr/ABMcjUo3Tczqp5Q8sHEYS4xjB7zXrUF16D6Li1FYRcv0WbmpR8wUKDtqAx0jEKX3qbIIVxDZa95hqY5YiarPSaDKXUfsgOLeMTtlY3CbrniKNBrDGlvkW5Dmil2kK1adFEgckph6pag2y5D/ADMdUPEDS6iip1A/ucv3mT1eYAM2qDviYhR0n3KKhy28lnvDJG+wNTyCrARYAx5YV51KlEeqQb/31lgNH6mk1xLIq3MG7IWe0VCOY4g3N8F8s0G101Pen+Id6HmeJvpPiJ0D1i0H1HbMCh15fT/vrhXwrKDo2d8scMOZ++Duwy6cICVutcfDG3lMu15mbqvKXfZg97nmeZcUnvGnYnFWSpTwSo439pxO1SsQ8zMzeT7mTV1OfTmE+kL3cKtKWd6MK2qdakwN4tsBi1ZMzhcV7pTk+JUsZuKblLwZIClsDGcRs+W4jEtdSVlD2F/cE9x0qX9AhLAvslizHwFSlxA8kMK9zUs0xAtVIeGPaEoKlf6Y7FytIWy5HWKHAz3sygFWDunZpYbn/TBSgY9pYM/ZLl4hA4ILoEobOoOZnRUKx0LzLu7qpVaJec/qL12murEuKp6TOGkpxCcpxUHpl58ylytbDUZoyGrPErW2Cl47mRNxW7Yu9vxLxMsRMT2xMXmpR8QO/wBwWyKnU6mU8TFZYnRHpqEEly+IjmvTj0cxo4qYoodo4qUzG23ulkJ42gd5ej+Uptwgrgs8NRWsRQ9iNYhGaRxAWWZsQ6LZKtJG7cywzQ2f1EcEeBAF4bcUgWhXVFVwq+ZaFKI9oAJgEPFtSk+VTLcYy1C3UbmazCinm6EyOjpc6pNITAmHjpMQGBg6Q+Jzw8y+BiKnzP5EMBHCnIPh6U+6Z+0rMAaFjGsUkuly7PDK5Ynk95dshDW7XNscMd8Skl9SwgYqppFg+Zt9TcJz6Cw0xdUjXluXKisPEvGAqBZTpBR6YOZv2m5zqXUalUlC5Y6Klu/zENqU6Iqor/xO4xNaojNc58x11lsL3QatLeZm2KHec4irQvvFyVDxqAGBEx6+5baq9YZDnHVl5vJYdiQMNHuTCr6xxhiuS7vDTReMy82tLHnELnLXJCOyxiqgGkHiWObjuEVa+9xTDx0xEAR6rhsBbvMsug9b3NstcUiLz8TXEWi2oY4r9qGWGdd4B68Q6qMgLgt44gDOHNcQakAxK5Nwi+Y/khylprfpGczKMljqGI+KArqJDk3VzbvEYZoHeKhXTCoy2zWOsYgfbMTYsttDkSrdo9BibA1MzqipcCvuJvgX8RO2474MvwxXOWYFpDyO0vMzu5Xdgrq9pmsU8wXVLOtMnUL6Ss3LDpLvSzUHpU3v5uMz2lvMru5yaTYWPmU7A95dsfMt/RG7+I5bMFJ16TrR8EM8TtgShyMcysO+JTWLpUeJs6MtQWvbwnMjfMeqsgmXZepoCk6EZbaXoxoXT1yw/cIad5oSwq/eJb6cWTGLSzMyEaPf03jcdLMFlGNqtBHdNOC/ucyy0HMNDa+8zfJMVJp5CWG7mZAsahqYCbVKunPD1NYsQ+4aNtF9p3zvCeTKM8iIK5bOkEv8b0qbrLbHOozjR5l5qCdK/QwPKuJc2rmKTInD9ytLWP2RBhpmValuOnmbcTjNPvMBAGTcxzBiGWZY4uD2EIsi25qX1TXaIDfzLK48RY49p3slY3Kb0jRYkzWyLaoxyFzHpfiZOKlF+ekrgPzBR6Ij/iHF+qY1Ub7HWK4og8SurKLGXymUz7Fsw29pmi0ngwuKwRrpHpnPeH8ACUYQf95nsoqtGd5lhnpKBKzw3CtD2Ez1hPeMct+gsMBGvZa4ME0HuIcZ7gnLFK2u3RBpbruJ5mN3oA1iBJdNN5iLgHQlg5ekFgNiyU48HT1J/wDL4lEM3KiuveXRTuRjuMbo0xh0JeZQ5T4m75y8Fl6T90NAXw9ZqTUUsIRulPMz1yts4xOBL1EeOFxP6p3mXUmHUT1i9JzzLlhyzZmV3lV/ye1xrUWnH2lK18S+0u2qmbouJ2fEt6EMugg3rHiYOWOliS2pd9Jd6nSOfMtyXGxjDMNOzlA4TiOxXA5CFmS9pR1TxEvB9oWS+r8S2m41HRdN9oUF17MxZw6RrP8AaP0gPsiBDDQiBYjuUfCTjH08FR7g7ko0dgS/flV6ipwhdZyzgalpxAuZFr0MTavxCPNqu3mLD3npFU5tYqz03dTLzQNCMdtS4uoBHfq5bSEUKgz2XU4FHuTNTXBMSJS6UjBjieaUKjmZI7QlODMVQwskw1xxHDULwUTEKh5YdWLmZGdeiRYC0WEVtCHiWR6q+2o2z/EwcFw308TkYa7Rq52IxhsljeLqWE5je54JxWJ8PebVdzvUD3iFd5Tul5q/qV4I8/7ieamFwURwf1DJSIotfeX2M94h0EOV9oLOPm50WSrGOLuEp1zHmi5dsjUIjJKqHS5XncMuETIvNsUTMA6QoDWVYoeyI2w6/ollZGy5mavNMR+25bTVQsr+o25SYa3bMSvS9XKMzKJ1HVjissIF0rtu2BykMODlYMTtLkRPwrtNR4Ph6DFfnh0ACiLnnEV+Qi13CURFFqKXAMcMDIwvGMQHE3W+V7xlw2t6y5Tstc6ZLV5malN+RMhWZ3bl1yfub8/E11fMvuVM8Ig6/cw5WY6Sl2leJnor1c6MT/RMG6TzHNcvMdcwLLZEbxh2IXyjd6I30fM6PhG+ATuqDTUFPHswrMUHDKaoiVBvFfEzwxE5Li2zdMpdy93ruZl/TEqGjyTsUd3BFCDs3Fsqj21KBxbtiUdV1oA+D7RhXjMZjU77WYADXikCNFEVAP2i6/U5a3Mn+Ym8YVG4qCj6coMvDObuAQMGJxkUdnhbhvAwwzIDBiodhXMpRcvwNy4wV/e9ehBKoEeAS3DtPJH4YZgFNfcv9ii9/GZVrCDeaDXSbXuI52hgqxHV70wx37J1js4b+IKirY/tVk5iZE7QhzhfaW6snsJtipi7cxpld78zxUt6fe5gZZ2UEU6yzjMy8J7S88BEOMS2tzhg3uqaUr7w7nzEYC8LxcccL7w0HLpKmqeCFWmFqcu+Zn/swbRYLmfqOdRQ4uFmB4wHLGX1jgQ7qXzN9vxU1IUcajUsZu82i8i90JU6iw0Kl2U10uKu2PmAL267hefrEwaLhZpXxMjKk4kUxdZW3+R6XBVnWAS9r1gs7AiWL1HSXW2Y281MwrmcZfUuoAE+W/wLvegXDD0Vdiz0EEoK/wCqKrdTmri2HSZD3Y0tacEop9Ec51TwwoXRN98TO/ZBYiwhVAEV79BXE2Xa5ju5vFdM/wA8tva+04z8T2fMK64nvKvSxwafiB0r4hk6rxLLmXMpaEyN47QVm2b175lDtfaXYrEMYmF6Si9XzDHXzacIblTn6i8r6ml18x2uj2ip0TsL7w1n5oBRiNvSW3tjRmEBvE8Td19yxZH5g2Akqyp7m4lrSvSAWl6VOPFxWYhyp7TSBesEaTCqAtAWMmXsDcI3iBye0mTxEzjKXTT/AHLORqYMwDZrxOlSp2fQaR9OZc2oejgX5jPscwrrN0PN0f6jPn8CoQbKajM+A5HoWXX9glOB7VqbOZtVfCFijVP3OEWHyRYOlwLnbd9iWN1/JAHMYB1EuowibWYOfM6Ktyjzzfo7wN3JssVj2j4t6zB07S+MpSTasVNSjpcS2Li9lwa3R7zXMfHvCCU1ibMEEL/iODBZ5hYxZBZsexN5PuWOPiK3O2dSEwsgzu3iGLldmdEFSxh7Jg59xiHs8wS+McS7UqZAOuGHDYSmBJ1gDD7TMWWnME2PlEzNdQl+7IGa0d7lrtQd4jS0pxY5pNg7KeIJh5Mbncr3iCMvXpCuqW4LrzAar9pnMlw7Ydp3zOtcj0DKYYoOa3FO25jxCbRU3Gou/VeXOagOsTUS+1MJ0gd8spFr0l2ZTZLaSPW0GdVefmU/F+2OBQ0Ospr9V9SPw97GwadqnEk1ZnV0qDw3KMeLJ0+uXc9RfMvjCGOG5vvKe0bGRzNDCJfMVe6fEpUh4ZQwq8zAmPiZcSuagDrGkql9o6OsVu3J0JS+T3ixPBlQ/ZKWQxRaV8zBmkytzLFG/hKu8GWYarxNM8dI6FzU30EoNgqzkPmlSW2pZNTFwzCZHipfHI2iXK+bOFG73JWsw6OSKXf4RdtBzmmZboQNCXokoW19iK6/3R8zzMxgPKCUoOqZFDxF3QEzUXJDPHynbkbEyNlziVA5R1xZVTkTpBobMxZLTtTtenN/AgmGt4xHq7cy5m7jrDGabjgC2Rc6g9PtE5HyqXbUyGsnd0/SZXeGv3JgFw5tADMNkujjHcclrgl3UIbjYQIYmIEnoQVYehL4jp0gPeAuFE3Up1RsZNxtbIN/pNOSC/wl56+JwsTMUbxLJ07x2VZnsXuRrszMxRN5x5Jbih4lBlbeLgHRDcA8znm+twKlfLKXEOWrlDCvaUTI/MOxJ7mL4iA5wkGhq4mxhpMotEO5LnQS9VKlaK5mS7/KPlE5AY1ChWvXE1LTuMQrUfMoNDgHUK/ROsMxY0e8E4++B/25SY++P/ahRv8AKLo1St4RpDY0kNzl4iHH1YBFt1X1OK3EXoxTP9hC1z9T/hTqPqOAemIRPZmGEaMtssZ1fKbR9R3MRdX5uZvQ5hbSxhegw0iS4aAq7m1rZ2gX+jAUHqMW5bTKDOcS4iuZUySYtm3MG/0Sgz9E533htH3GGQlCz7ygTLwk01yirSHQPeV0V7x7IBcRxAug9JuyHvGQLuba90rqldsz3feNjIQZx7Q6qTPj7lu6XmNOP0RXW8//AAn/AID6kIy/xH8H8Xp6KzDBD6xH1T8hYn468+pL0n/yf//aAAwDAQACAAMAAAAQGLphJQOezfMkyu21PDT/ALvhaDSaeZRadNBodbr6yaknWj8MmOpmuvdDSL2iueW7BLReXUzJPHGyz7GEOlbO8E4QyVJBysctq38H6x3jAM9/nRx2rxKsIdT2G02bim5YgdTeqLcl69VcxsLHfPDdSdEpBxq90u5KHb5+dVZSq1ekdYOtB+n3MnF6EaKikz9rN6F+POvcHC0kP/449Wq5FWvJqYK5PUk3jP1JsDmgSo4hilut9yaEGf1dNOK/0pAxkXW0KSp5Qp6uKONNnqAWl34Mu6MEptFYZi3lTSHOJ66Eos6cEN0acSFKTDoOp/GqkrQnJoQEAMhejdutqw6JHhnFlQSf7U93BYNlAakUJURxrYeGuleXAEDofyKwPQTSCW9BWFwUNrOXrWlmW8mk6uT3uKIrmRxrcafnXaRyMJ/eSHdWskraPArGO+KglswaD7OVO8+ZGjEkBiO4IZnV1xxBqmS0qXwsXF21ByLXk08kOaOPp0FceCM0aOU5vECCvQ77OtCSA0ulA7V+UAoG51bcvm8JCLhyfc7qlYWFd281PwmE1uPEqupCCphAKRH9P4g+rh2OdNedJQ7Epmbw5MqY/cAPJSEyLjH+cQHWPYfNPSif+QY/XCw9Q11axkyzSwsxDlI0MFsvKJ4P/Rdv5GVmt3MXvV+SP0/7ae9Opt6l8IRbOf2ZwDPdh1uxLKGyVguCVGWdL21Wr4tJPzIM55tjij9w0y19lXgPnh1fLtIFPdzwaXl2XRun6PlzU/bYRKOFJRsaQWxj666BtaC1ix9RUWQSeXUqZLPkxhAfmBhlU9vLjam8VzeQzywsvpPWXl29+913gU1aGlU7HQeB5XCMRxx6yuSQ63d0n0Sq7U3/APewjdc3lXVE/Zm9ctic5Wkpsg1J0tqe2y123tYKoe/rxnOLOxmgnukG1TF0VqHSzw8nhT1QU9srHOO/dmEhkp765m14q4l0F5O9g00zkfWnAx6MAcbNFfQvqCdssutuky9fo6p/FMl1oOl0igqihaJ98lVaMpLcr3sCAQk+WLBv8sMJsPr7odYk5mxdVAm5rtPu/aZz9XNqre4V+GcVSJqjeccrYq+ct+EyHbtg5W8JdVnuP+2lek3ZN77qsVlsQvrqh4DrLp7t2vN99Wlpeci2OMPUF0yyQ4mJJHMdBgJKl4obQe/0PCu3SpiQgUJmHaH/xAAgEQADAAMBAAMBAQEAAAAAAAAAAREQITEgMEFRYXFA/9oACAEDAQE/EFX16BKkmKXJSiZfM/4Xo6QngQgkQhMLmIh6zRPxPFL8/Cj0IJClGzuJmYp3DI2yZEoJ5pS+9Fy8tlKW4eGUrLSzNKXEY6VtF3MDXq/8gjWJi3KxZRcTCYehKqJ8ATw/ho8zLK6REJmFZMJwr8MbCqIOiiZ3yyZZROk830xphumM3mmhshHnoY6wLTxGbNiwsWkGiLqjEUTXpvoZpzwdKDU6QteH4hM3HQ/wdCDYQmaUSukNCey7Q5EtR9hWLGcYo2OhNLpoGGc4/Qc2JMhMUQb8dkaIfZ1mwSvpH0UpWVjW9juIWFwQmsN7GN0oco9YD0TY+m4QaD4kcFiIchSkY0OihFCiDabGMZYxyjoiNExNDoK1hIONiWqPsex14fRZscvD94grQpUj7EN9l2cFjHto4isN+ExPZB/I9OPFx9nBMVfCDmEfoheEFb6EkGwk/wBDBiaGv4LuROYNJG6LUz7ooiRi1C4N7RXB+M1hOPZ1UQ6o+4Yjgomf0x0dHAfDorTExlgmTZTQTYplimET+xQ4mM9nDEspzQ1pjeoZzQhxaUguDUEi/s1cYkTdG1wQU+xqJE0LvZUd4NbqwJNPZ0I7ELuEjFwXROxqGl9FC+lQTDUhJ9lT4PjG9YruNBvZsrYnBNCN7ZLhoehOlCruOyxkEWFUF+h/gbPghWGw9GMYEye2Vyh/g/QmjE0zTRobQjHTg3mjQq2DNkoMXQko6NSUWkJjdolsgl01+Dk4RQ0d1CWQa2SQ+6x3EGjF+5r7EjULwPyjg3gcUGFn+xfpjRwbIKCGhpsS/WT+in6TfRv+j+gXQmYx/IuSNULQlENXcK4V0ZsYy4oTj4VQgS0SEqQhCCWx4aJieGhzxCYaJ4NEbK3ijZV6gkhjEpsQTvhODfwNjfmjxRiWJm+J6RSw7jSQnXRucF4WHSoTzrFfyXF8rD9NibYqLCVCWsc5axJIUTD93y15S+JZb3BiUQmUQkNGmsLWSDY39GjD2P2vhXyoMbnonvCYcXRh+2UvjRPw1i4Xx9JBY4PDGNNPHA3BifeCnfLwvDY/Ezfi68vDw9lORsVMb4R/owuT4t4mG5hZRfiQxY+8NwkzxgqDcG28fXi+mIbh0ZRb+ZtwkpCoqGiLR1qjyb6NA0OhjWPk7hiTCCEJmYmYQgxORoJDeoTDzRD6cHsaDUX4w6QhCEIQhCEEH//EACARAAMAAwADAQEBAQAAAAAAAAABERAhMSAwQVFhcUD/2gAIAQIBAT8Q/wBeMWGhtiEyQhCeNKX2rZwW8NwQpS4pcKhPwaCfg/C4uF6lhZTETEwmEsMpcLWITCIUbLhrwhMzxmUspEJheEIQmIQmUihLbExcFVvznpmaJlL4EFWKQQRiERlUhoqGgZSGOImMxMUubi4RfCCRBDeUr2PSoopcItIiwqGxvDeOgrQKmm2cz8iJjyfgvDYanhCY+YeOii0wklEKYhMJehfJqwupLrFKhoeGIbLuFNjhwQ1g2XcUuKPexEky4to0dD4JBeFKPEzI8vDrkXEw5BbQgiWhJJYqRwbghI0SmyTHCEbaF2ILFDsLpEUG0UpKMMRkIx3EVXDUajXDxS6hJEIRGjRJX0fD7B6aOzWPCWjg3bDFpZvg5tF2jgtaNA2Gd2J9Dkmymh1E0NCRUJv4Npsa3rFNkkjEtCoy6JUJaGvokTFRRHRkg1DEqQx3BDoTKyASDJIa6DRBYfGH0VMuOMVOGNbIU0xLRw6fESIPfMiZCZdEt2dCET9xdCd5htJVk9icJVUSPg1JZpg3tokQjHYf2iCGhLpitXRMe2UjZoISM4EGJ0vKL6NaYvR6zTejvcSoWphoFncOiYfShxvDyPjEaaNUobUxpCXYbGyoW8J4xhk0ZQ0i0h0TZ1piJB2NqQqVOkNVPou3T5CZuF/DRVYNxzEkHtEhb26VBQbUOtkDT9E8EaNzwNEJLSyzLrB8CEhNjQzRG/vRN/RqIOGglw2A26jkEiUTQVWRcHgui0JM1HW9GlAiQ6dG/RQWqjUajJo4Wi41Cjb2wmyOgvohSbEIJTjIKmbAQqg277hZQLViiw30V2DqWKVSnGDr6MklKoMqKBogl+k2bNi2sRtC0o2KwSaembb3hxU50Ugt6OMQg2Eo/KFVpDdvR0M1O6Gj6R3ivxJ8IaVND1Yv6G60xTCWNPwh8H9JEv4fwK6E/wADj4JnwVokm2LfeyHBz4yfjEl+kXKJIS30n6xoREfTYoLLTbY8fgKbPPwetYuL6rlXhQM3hSlYLLsoVEaEomQ1GNbDbpYeOzmV370Wmy+U8bhKxaGxeBtDuhwkNVaYxoQgtbNAVG2lRq76Z6KaGPCxSl8fqzRDh/uHoouizOHCtsfx4ew4fqnoeU4d80rJIXNlrzwomWVw0R0oJNjWyGJr1dJ/wN5pITNnfHmiGyeNhKsghoqLqi4NazMT0rzT8WsoD6IIsOi3m5sqeh6OiOyQa6RBCWB69sHsZcwnhMQ5oehLrLz0fQ3FRibOR8F0faxYN1ibvueJl+F8ZMvk6Pds+GF2K4lgVotYemJV5wSJiUkFh6HvEO4+kITCIQTIz8iMmEqJaITHruOkLqm4V8OLh0IWMuYLxWEWWUXNKUpcIhkkjRENmUpYWNG6NY6pRQaN0QE70Jx/ogUzQeKUuFDdwos//8QAJxABAAICAgICAgMBAQEBAAAAAQARITFBUWFxgZGhsRDB0fDh8SD/2gAIAQEAAT8Q/m/5URETB/gOF/I2R3DAgSpUqV/+SEGDLixYv8L/AJGFixYsWXLly5cv+CEP4v8Ai5f8LFixYsZf8X/+WXL/AJuX/wDhj/FfxX8JRS/cFKibLh7nSDmLL/iwyu9RCZqA51CxwfUzEC4a5JXiK9JFYMl9S8VqOUfwFtQFeYkDHiaTFuoTZAVh2jeZPiVywxAujMH1CKjj+SysUily4b/gQXYIlcSkiSqhBiVFjGKXLizH8XFxHKUQCy++ZjhiKztmUP4FMEvMbv8Ah/E5XE/ha5R1H6gYqXEMblSpTKg1iDIKtxMG1g/wELaYNF55IIeY2YqGZzGEuXANxDqEAogIkQ/gZlXA7gENH8mox5ildxaZf8LizCXB/gOI9JZ/BLKlz5msWoQjLjmL/AYtuImYg7jhxFr+FD4gpJTuaVBi3HqM8y58Rq/cb7zNI7xLzMtoS1wMFdQDG0XEIjKqBWolF4hj5jhEQgL7lHtuaIsecNsnj/8AB/G5CmH+A/kUMC4MSs/wU/h2iytALHnqWRf4cosWLmLFUIH+AtD+FRP4qv4eP43HFlyncXqPlB5uLcSJuO64lVhihpi4JdZYqm6ls1qA5i2RuoXHEXfiP1/CqidQyzCzCLVxIDrMrMCskPjbC/uZVJQMS4suotZ5hhuZoWODmC3Ck0to1bK/jiC4o4gxL8RLOocP4EHUX8MNRY0mEIYZZuLUYf4bi4iy4OIGYDKgy4Z3KDFi6mKL/FBiWYOYs4gqzFhSZz3hNH9DBiYuLceMfMcX/DucyrjOIOPMXqLxG4lwCaQo5gGEIYmIxjMsCKcRqXmXmY8z2hnmICXVeEkBUi8LmJVUfOIWJxd79ReJS40XO7f8gsZqCMXSYfiKGkqDmFA6UxMM0/wI2jFUwai8xR9sBI6jDB/AsY2n2Rh4Qf54/gM84OZcUlIMs/g/wHpMIK4RoxX4i0bly/4GtSwVGy0cYN/UqbT1Ej1E/hyyv4YkqVO4isy8QIP8PaPVmPMMtzIhAdxSUai4TWReCEyBQNp3GKukQgcfMPLuwbdUhr7hSgiEldQkgOG5QswFHn7mGKilMavx+Ib9ZCLXHEGiBcDF1EIiowP4cw8kTMqDUJYsmSLfMuoxeMe8ekyZcuDiXCoC7hUX+FrmZbDUXuFGLHLCJTA9TMqzzDLMTWIKlfxUQMKsvmLqLf8AHEw5R5TNylaqJTXUqpUY5lii8m/4S7hz/sO/8LljiLcX+BFpllMY1RlKCIkHsDV7eJ0KogvqWQcOa5BRbCQ7rFSuuX6lMTy8A94imEDFW2NDW6iCBL1RgoOGVxWuu5dZRihTMQVtDhau7iirN7JYFlEYuMbxHcIp/AgywMRiMRuVE/lTcqFYOcwFRxh/CKENoOMzoIF5qEBxLW5kwS26l+o45iVHKmGCEjAq4S6iXEfOCrJCgoa1Ww6eZcYudSlaqX6gheIqrFTJkxHtVhEP0wGxREF/UqscymI6DlYmBCu4Z/1zZN+4Y/xVjGptJHolpXiHuDQq0G1aloEuF30RPhkgF9vEVYSpk/DEWZQ2xukUQLnKHOhbDWqJYBfAAMepf5oHVw7DuZF9uD6g5iD4DmcNmgplgQBbyB4FldQzKFeg6xcVRwQMI/J6fuIrDXflH9mI44mWKh3g6RL9xFV/AmCgV/AXGkSJL3Lw/nL4iuf4cYxU4SyOUMoWYBCBJtmnn+AqLqBTOGOWXM4o4IrcP4KL8EskdxHbApYidmYDJhAlpmapQGYVUycQLiET1ALA8TLIQaFK8R2+JbgfmXfwCHJCoNC1KkruiV0jy7eIMt1m/PUrVk1VfTUEE2X4BcsXs7RuqQ1W3nqdsbsmCiXICj8sOgBoReMu4z6mKINUlq8AS/UYOR3jMEBl5Wj0QggGLVl8+4VPI/nUFlZvhfJFdri3ni/MYRLbcVl138S8VcADMCik8JkgZo30AHuNfCnxGBU01w9Jw+44mVxELl0PaVbDX8KUTEZcyikXxB/galy6Umn8AQkrG8P5xVzKTCZkrLOYjMyTaZwymBFipSpvDGEGLwa3apRZMMq0GUrdc8qqxxUolTIYidIiWBAjX+S7qW5NQAIly2ohzAabrbT4H9xJaFWQGfL+o8lLQ/woqLss5xKX8sUCnKeXwlNZ0AVmNGo8E6QvuM93nmFbB1FKQzAFRjqDUxIYAuA3BYEDtq++3Aw7CcA2ZKIKtB3brj7gB3qRV6LPVV9QaqNnv3ErKBDhuNRYBZT5V1HarkibWmb/AKqPgr3Q8dvSx5lEhNHXw7PJcBnW5Ujf6fR6eGVQOBcQO9h7LJoJElj6YkrMVZJcQSoWj6lqlwYE2gxYniLFuLc+f4S5WZeJY4/gsVLxm7Ly/cKGZ7TLhgu5aTe4sMQOIRtuLEDCU0iAeURXLii4ZUpk2TOXg0W1GC0qdhLnyq8ZGqiorYV2V1GbKY4R1AQjIlZmTMIRpE8osV6OotzWeZ4RaIZJc3KNChPUIu7ZSeOiHDAVolBRjMSrrES7vEVpUJ7oGDZFuOaP/YvhNL0HRBCVmI7bjVrXGr2S7AJzHiIuFDKlHDolLKwaa5mMIQoXlqtTLe1gSXgOfcxDgmVxwJcQFt7rh8lMMFmQt66r+B8w4JTNNB65PJKKW7i4U13W/wAY+8Mvh42rf338vuBdCw5Hsl0c6Ycxxv8Alv8AhB3E4QHv+F4joPZAszKs3HX8hbBypOiCLuKCViU9ympT3Ke5SVEzCVbqC81KZiJKNwYpdRpuInSXvEAALUMl4BmAoq6/MxPROcgLDib4lwRIq4AIDsdf9Za/uNN6hWYmOf8AEsyvEakJIzAWs+8wFdct8TyRWjUyNBnf/s4NvMzaZ4Kx1EF8NfM5o+o5b3F88f8AEAB4M+ImpTVeXJEwAZnR5lSKM+0fC7nRcLhtHCCVDIHK/wAJfB0Z8Hn5l49E5ouKWLDo+4e1u8xi6SJHmndeDY+bikDYY7c6dMbkYtsmGJilLv6490hGjBHB8f0B7jdwS3APjn2XMoypVOZmXjSotf09lRcuLC3r4emo2swuSkrphOYhGLEGm5rmY8/xB+oabAbWCSQsTkjjl/hZi5jAh8RZuMRdRUG8QX8asDWYhmoypo+pfS6CuRZLTYKi4oFWtucV6zN0hQCppArfE3CNqAK37gOV5PiNVQKOo3xv1GtO769QkXSDXliMbldR3CXBkp8EtWruOItx4xGNupbuK7j3YPf8MlApeXL/AAhcFaOOWCHic5YUs3b5Za6oxtrO+Y0I0/mYptgJXPRzFBzfb/UFDz/5AWWYDExA2RXwgBIugiXQ8w4umojABgON4+4+iabUuNSDVuGcuoESm8rTrqXEA4/Nx6YYGoxIFlFawYiwXqxKuiWwuB4wurfgdkpNosq2+NPuoNpsda2f3AVxS0u/g/pUGAqoLs+K/gfMPEJdFU/v4uAEorYmIURIXKt/fw+pgSIzyfQ/hlqpLYklsv8AHpb8I4FC3A03dQAjAh7NRGsRcttzKJTGDeW7ycy4wlF5o4fzK0QTL5ai1D+VwjvlP1gUz2mnTL0F3ZC/P8MYZRYjxLZhl/dGu/rS15PSKoMdBtji7FSIxBapxd1krH3AtEs0rmLLHBMNsRUsan5URh7KRrXae5kez+pge0S9gKZRopGXUzVgNEzJVNT5pC1IUj0b+NRizvk0qYbiLxMJpMIriO4IAbjnBamzOsEQLKZ0RsDjGuYUJjK+5yMbx8QSldBzGr1qWnA3lh0wcRwB71My3b/Ixi6JXYHAt6giljZXNQhcG1fBjDG834qsMvQRMIqvSsfuHcsvyjjzH0iwPaWGAAXtvv6is/mF0lHGo5Su0wAZtSXE0FL3FTZVWyxPMtZSC7n9PiouCWcZyu3fy+4TKDpsZazM43fvo+SphCIAcR43Ph8ygeCJ8mvhC11sLPqXBpNu1enf5HiCCDVDyfQ/uZsOYiXVM04X9QvOQpa6xC7BS2LRSrqbZ4mFb6f9IvFC1JjApMJYI8vzDsuD6wn+QjQGofGf6goBEH4lSv4baDTdY0QqtNHQgnecZOJxsdZOo7hG7qiW7ggzLvM1r+G6kq979yjUFJ6fGSZyhgrdFe5ZT4miIG8ZSUn3ESYMfMZHdYrn+G0iAwbfMwt7jBDBVXSJmnf6I8b2mZqtw7jCFAXXv/IVdbV4ckdVNOazHq9wJRdnNQSXe8y/Mpc1PEliH8KU3F6l5bB9QNYCeAK27lsKrvLEpv5hlOVcBFTlawQWDnPERycUahgOL4GOjZan9QABtgIOTUv2izy+mCMragt3fEKLPp8PE+RGSJtgAe81EISzXWIxSUFi/caz2NZXxmGzxcXKs56g9Pj1MKnFiPh4FjonGPiEZ6KJYN4t5l4VbwHtoxkOK5j2tfFy1GTdbPZuU5EqwC/Lp8lMuqYoDbX7/wBCBW7AUPoGH8MqXGi2TrEMHC2cl8XmxxqObkaw/VKbgDkS2tWTDS9DolojOmhkORMZ6gjUpbA9+fESpAq7JjWO4B/+wApbt0kY1LkXYsB1UMHbzHDZz5J/2FzQQquSFVKN8YIIF88N3/c7tt8/EBYKmT+o9aZ73AZYigV5gsJiW1LeYzaC/Y/f8HY7P3MiE5znDGLzxn/jK3Lei61K0hG1XErV0cctiVjESzcAPNz8qZ+2Uc8q9xWv+qhCNDRS2XVqMgzDTfi79LHlwDN35gycJDHUmgXf1cZbyH8RKAAVKOYgkQiDcds3H2jALwTE0ikpV2rUFOD1GvhYlKdsQKMtShDau/7lEHiUwv1AUmAG3LDBDJLfKY5IxYUvTCbYmbMHi05l2zTvPUs4I9m4gqQWTORyRgb+EtgBmO/3HEqF4wVEWGiwInuGR2psZS3g68MpFY5Rp+RHUaQv/Y3etl+ZpW74g3nb+4yVCYen5IVt2apqv3p/ELu/+oc/ECLe7Jzej8kOxhQsVDlafavExkKVXoRGeoSgc8H1HzRbUObs/KvEaNYp2VekYhXNVWgudK/+xghKYzhnFsMcqUbeos5NJH3yXXcUeq4rLdNRSgmbNXeHPzF33OFRC9RWmoRwlftuXViQDiFYWEKbW48Q3t7dX2Tdh7xHJDfH6lJAOWRwlEnkRJ1/kzOwm40Y3HccmJqLbdSyn8BR4JaXK2Vn6JdkVBaMdvEY2E0bgiEw053LKijd3xKDCDd3TXMAVsaPMN2b/wApkxK8Q3gi1iicD6l2Vw9xjYUP1LGBn06DEYJUuV4Zf1LRqCA3iKVDQIBvuGzJCEqq1KNOknYSxS7Vapr9RWzb+iYLxC+KJ5gDuNtQvZjcwxZhEjm7ItqXe4sgZyBnqoqhjdggVu2sTNSE146iAaNUgVZl0IKAW/5JcnlfME3Kpa57mlxK29Ch3KjVODgLvqLRCg+YmDiMBCgeTyLiWrLVRuuYkQtlFMvxN0VCyD/US0MpJg7jwkq25X+RAKiwsHVzFp4M3FP9wjarQInLEBcLV4YYiop6cxc8sE1ffU2LYIX4mYVkR9wBOitPU9/MHHeH5li4eT4m6lYFkMwWMurh2Rs2GRcmOyJmYeBYxDSOM1j8aYFpRRZea433qEbaCn8ES4xV0YGjw69VLEwNnRz7I89qg4cRqXv9iWvnAb8IQH/xsgy2u2DEt+hhMVkgF2Icyxww2Q3qRrUJbDA8T8QgIlmzXMMujezDuNzFaDRS9/8AkedZdoiO8Uti+1hjW4lqA01HnAaD0F8xOxdTSq4lasF136jiFNXeY9tj0PsmEFrK1rMLlomszmUUK19ROc38mIm0YG/EC7zYrPUBqJYVZLhOMhqb1dQgdFiV+IaiMgWU5BbIj9i4T2PuJzB+ymFrChurySqylg5xS1EvuBMBdf8AyJXUvBfwlh+yhyspuXkzf6pp7iqEcph6YtyofMrgJUnLuHd/AEY/gqyAd9Abpbbwxe1ml1rhs9agiwvLPbZ3KJoXeKpVWEDoC4lawA6ZaTr1ssNNZqVYK7LQeS5fuEWY0SI3QsJcV/Ijc2jeMktRpvDC86GYVymrC4VTzFJIIjKa29wfNXCceq8XBmgAwFYrIdkO0lgEa8//AGKJ3B2MxJSacKHJkgbFCihg6Kl3+goXMCKGNjPlGZxAUmgdBRK/NtACfIy80imWxzj5IVFqlYxVC0gTfFIQKFH3cRFHdY/yd7w/UMVjd44ZWM/f+zApMV9T8Bbslgz8upVtb/8AEwc4BEYu2YiltDronxGBDApHI4Y9KAFLLMd7iRk1ZMk5P2kThnQbzdjreIWwBSoWVyaZhgrQlpmo2IGQtJ6OZSgtWJ9QdAKWm98x8e04HmiF1vNw3/8AIfUyhQBFwO4AB+8zUKJwBivzBBuEjA71qK04pREvN/uJKu967iogi55lrZtTHYwXRmAX4frJQwMBAey5i9C1AH4JaNq6YYijyHZyjpsq9zYAvD7QU6P9Ei6Fjll+S8cMalbqs1HqY83GrGvFxIis0L31MfKWBtggIszQw8Yg9OVhdOo3Ewtx4r7mYJOlcMzjR0mqYjcCrW9GMf8AkG7v8wwwGUh7yQoKFi43Comr1fMC0ormrGf3LEgtYCrY6IqTjAwUsoOVtgOVUaVD9xfA/wAsSsDH8otjbqIoVdL2ucQYaLpo30Hb5izsmXG6tP8AIlXQaVUx/wC3LrbRRzwFOfXqJCaZu9xtwlDBHpy+5zJoNOV1lg4iNjZY94tf4gGUKxxuq0eyMDQDSrLux5Q6xBcy6bz1db4uPuGBwVVdymkdk4fcq0HCiaI3j5jgpFUbrcpdo1UJbUGQN7DawQi0B3XzF1VAa4cyvVnYN+5Ygpsn4izIJad+tzWaMDZvxuXwAAMg5NbIW2SgLSZykv8AYWa8DFShYKjc8VnHdRbVMq3D4w6gjlA2At4xZK9isAqUbGOOpiZY5pnGU54lRAwEquRw1FxWKN0pux1EV18FDnXMzgA8Wur/AFMMQqCvFxgNDxWtncve1lqCjRd8y20oF0cM1/8AYhRTjaVvYojxSAwrK8dQcOz5tOW3PxHpcrTyXBTSyjt7NShLBtdU55NQUZFMsXWvcAjZS+Ef7lOFRaDAqGlBql+YUy0cOvENgNmuogWuHA/fqL0PzFQfg2fIj7VMN78LcpLSraobGiIOEiFNI4iN6VzExGc2+QhUmLYJllh4izHLDdqzHzG3guPHlErStYcTOBYgr1L4ARIvrqNnYHYK68ywtbu+H6gpfQU/+xYpIiqGHliCwqC6GmE22WF3VQjWRUlcamgaWL7uMquzG7Q5lOo5B82qNw3TohGVQCzTmUEzQuUrmBboALUZUvxrUWjyYYK+5V6Bslf7HaRRV+iGPshirLYo0zsbm0VxML24DDA+M+oHNkk3VqXGN8xYSC7Zb2dQ3KocP45WWsCE9MluFhA4I9PC5q9xAiow7LtS85Kxhi7UKyOgBnbULegHzvO/EVC9gX68xjHXWExkeZQiSkaN55SkyZ3Yx+IlnGVHP+J/2UCytvB4gHzaUCJklBXhQWc+oJhtYCcfmOcnsM/MfHUBNHzHdsNqD5lpzBbfPhhicWS+XeolW7uqC/rUAyql2Lw+OoacA6aW+87OIbMFapQ+W2XDU3kqK+Y0bCk273B7NrpRWjUpxtigpG6S9NNeY56zaLlX9zUFCwig5mSoVazHgfzGOUiy6KLHHMaqktQY/wDMQVZtABTnGmXnjNOCfT3+JXoVKVgrycOJZ3/Y+t/JBhIsqjW++seyUk1NiNnd8VEIq2Jg08vMSmmwTQzzKX0eHJ0D5dkAu8UatlzX7lIpo1Y7YE0qELexWPuWYGh+ouRNoFXXz5l0qJ1TFEBuriCXhUxW4wBu/CVLIbsq+yKufRZZTuyWZz3ejVyhMheG/u5lClr9zHFxQHfiXBEqAba5d8x+ZuIB0VqaegWnzmsnjcwKAqBKgt6o/MJRjpa9xoZZzbfiECWrkH/xGLnC3zkySv6PNoefnMSii2vpBXsUs/qIaB0NpZTXuXkdjgAUagpei6vOIXRKArxcpN6JJxuJKJarPIxAcGkPhiRLSvN9RmXAZ0UYlysToM2VyLdVGegl8YJXCXQeMsRFi5Z3FAJexUMFWRvu4Gzqu8Bw15dQEdKwKbNvOpYmyUkRwvuInbmzsq/fuEL8G2rMt4clzK3CGClYbdeuYq2FvLzVe2DcC9Vn5sjyi9a+DuiwmrBJWqpx8Qh6rVXc25TMRKoqfKYxqOYAHytRSrxLISz6nPsyxWhWSVqwheNQcM8kEZq9oxiDFDBMPcuDaWwzMPdFBLo4cF/EWKurc3xEAzW15FcepX/VjUu6SyHWZi9tCbu05xi91cMJkIFJTfyRiahfhtqviWBd7oS/TxA8eMCxl2xic5VOIXRi1k3dHHMY2BVi1eoGL/ShMP5XBjpVe0VhZkuwk9VF4DrJaUrau8JaYgMVDqUUkbGhJVdYVc087IXkoclsz8ShSjecis3iFYNjjJe+zEGlANisI4qq0Yhhot5MG958ytFOw4I9xLYEuqQ5x48QSFRt0/mCujf8vNlMXFokoNfE2IYpQcGOLiFjLlVisVjcRWZlWT1y3LsRS4MnIvMr8aIXmKSeA8vw8yvrECvBAuxbR4XUfwcAPxf3Gkm42z/US3DS6KuOIUAPZtfRiC6kbrAv1FrgGhsflmQ3DbfqXEaFNXCa5WKo7YxUyrW80XE2I2gyY/7uMXDa93BehVFwe5h22txTr1Lr2HorY9XuCwva+YRiYCW7jfFolTuXCVG/NpYLUnF7lwk3X+EEK54F6dfqVmWdRXAPYxLhRt21mMeJU0+8RJUSpxiOMKU+wvcAGFLz5C/+QPmoXqO3VwhRZVJ/VVGPakuix+Y0E6qqLqEt22AqjSx9yzfmmCvotsV5YqzafcNV2eYZ1dRYmyozAtBi0v3UZJexd5hiIGu1XXmXBQE+oK14jBLUTcZIkBrL4je7i8XcAC2cswK1qG8fGoFBsEzCq0URQyEGim2/xD224KurfLKdIDOw1xGmihP6o1uWtH9SgZXkiKnMbmEt4mPZ6w5DXESQnjdt2sDPE19uJioT3XZLzuHdXZFxf2ZioDabcxixhL6tzDFKJ2Cvm9RwkCwJus7jSUVyEzP4cWeDmZl/YmEdRh0MfJfNy42epf7YCgXGUP4huiOspN4Io4A3R+pRnABXL4gYbBQsNY5jtKqQW3qAU5MqfLEdCYSzM9MslFxyg1Webov+52yXlx1h/MIupky1cwMzV5G/qX0QOHZ8RnLt1Y16iLDJDFuKYAK/9MNQmt6fuWiq6jsbzX9SoDdAErgCEGKhbZXPHcAVR53NYXFYeCE2JMUA91buWVKHSHT5LKynTLiQCvN0QwodMEq/+zGJqzTFY1SF7CuJsdVbwxp8wjwsK2OVErCXlNbLzmA71VtAFmIToYka7tnKkoiZ9Pcs/KJQWl2/KKyWsrhDx5ITDYrYlBgu4zF0WUMRKYUoaRbwaQeqS7aImKMxNYlqZslqKzRdB46OJWLLJ4pkTPdR6VtU42xfTh1uePUwOQXCAYe4KXdNTOjLxf4j0WpKaHlNnqVAHgLctAbwjjKKpv4Lle/6l4T7Cpead5cPcyY4R0WSm6legMqdoUBBNolD+otBcc1ZAAVqVucgGEE+etq5i3xtzUtbpe7lM72KNvriWg6wJF3nkj10+btEIKgsBngrcu1XV4V34jracIADKOIoVjedwlabzVudxHeVBZzxFYyhRgpbR7Y5WvAopr+o4rtg879xKXnCe54m/wBpg+esRmKSVQ1sZVfSLbtd3oCNkY4JhejAwoCI2pydxnYakLcOcQV0GcOog48u34h6Csa6gO1Vqkbc0U/Uss/4CYlv6DlCEPKp/SKMK+R0dEVYrvmHMLP/AGyAx4Ov8IuTWZtP6IesbChX5jbBaCxrzLMgFc1Clo8tlzMoT7YWoNGh5TEit3S/1Cr9ERFRBeG+KVW9IAfB4QoTlyuOGB2BW3Vo0/YWwdVmLGjvCqdVdwJEmxiZt/UbrPIbZ1e/MPzqoL4lgxRU0VubQCmH6TKlauE/NMeZWrOSkfMFQGO2mfmETkD1j5mMp4NutYhj48UOvUecZ1EaZFmj9RuzuEtx9RVXGt6slU06p1QYNqymkgVqqdbsf6gacWWij4zGyzTeONtNpBjEa2Vd7TOMSsw56EeuMQSOF5Kv1E5NDtKaSuyJQ7sAEF/P/kx8kkE9hilazmzELC0q7OoKsrmr2S+/hARlU3VZYCUalZW7KtTncMObBsYeOoaoSrXvQbVW5bEYwymXFcajxuU4VfJLjghqWFXlCTRrEMCx+Yj+SeeOIyqDJ55hVFS6avI0/GSBxGG3MUWwp3HKSs0gqo0TkatNQhrGl9SlPwyxX/pRh4XJrt8sVLpwPXliebBp7x0O3mhZvT96hPDpNDYQbiJwzov+4iNSC892nxFdLAsLszArwqfuM3GNMxoZcXGwYnJGwbg/eCpHLzAEZErGYvfT1M5EgAZxuOx3mazpmYlxHtfmFi4qISq1Y46Rc9Ye9RCw/wCRK61afuTCF7d9oa0XUOcEdViNc2z9o5MN7jOG8u/9glsH1/bAMo5Wjn1AcXiE4gQc5FZxCIUb3yexGDLDqSD9JRT1QQrrDFdo0Un4vNTD9ME0VzjMtaqoEV1rzArimbP9RKL8w26Jcyhd1egy/Ms0dObyYE5cCV6w82GMi+0w0a/+wIg3tKfuVPiLL7NVqCOAIybjgagXD9xAFjK0HrgjRWc5T9XxAQ0LeHJxxMEUrRdpCUypStfNsGVxR58PmEfCB5hAlYf3QaTBVwCteJSwuCDyg3UKlXLL1UAtxxF+N7FXh0Qt9sQAs5lEOcBWhmVFqy+zVw0gUiYVhsW3PlhINwFrFC7dMb0sJY1djr3eSKUmoymqTIqzO5YhoxbvC7s3fcfqJkFlkZq81OehFBboa3n8SgDbIWKSZuxpiHq3lquLcFQ0awbVDXPgRQNjpuDaC5tvlV+4MEIgaUMCXHvNhqralQ6sFm4KGHAF4dt/EYzB4CFkuiq3wwkhL/8Arg1ZG3GfZcL8SwyV+40ZLXCOVdd8l2YA28A7afv7guNrRxLcFJcA+K36leGonay3NR+FuMw75xN/y3FQ8hAnB3zLEX46Hqy+dzVyBBX/ALiLVTR0O5rZ+UW2hyQQobf6gUVsCzWtw2UtZOdxDGXQdI41KqegIiytYDmjx7lVpJVOeYx8pjSsucf7HkcEAJhD7Uzy6fqZI05z1GqoPm7QPBX4e3mIkC3iOjtgKgXkx/ZObC76f7C3itAw+/MpqqD2f5LUXpaz9EMa7yHDyEUwNXlbhMIhddIlRVl8MfuOAWtD8RyG2m94lnUXPiYrrKPdkwAfY3qXOIOTi845h7BCks3bmEaNlJbkx6gybT24RxEQJZFqmpZmLbvMLoULKI2rZN81DlyrrZYEEVAiivmD6Y7SgdqLurB+YbRCmjbXsmfIDXZ8IwosFCL9rpgJXLudOdyuBHlLSuIYVRHPUOatRQeQqPFbKL0EcDJxqNQW15WGgaN1RqFVhopiLRKVeeLmAGj2+IjuQ3Bhq2ABuYisnbD5TAjgr/aZ1kiEDereJvJGThHYRkpnCyXj6gaXIWmGzTftB3CUMRDb3733AUEBahRY8bgCYLdqKYRhudG7G0v1BIt0uILqHdQdnPBWoVaXhBdncVrekEe2UktKeLDmGhWUukMmpQphtphQqCoLKIsNc71DFwTdV+LmVHxS1/ctA8OR/sEozOn+ws1fChFKHkBGYSyeiwK8+YZsFxztOj1MKa16Jp3rd+5y9+lgppw90wVpg2T1R33LrjNplw5XL6fa2tte402zRmdpVWfkjjkLBQ7wPcLH1BowHbmGtJnIAY9JuM+YbrYD+CvmKqnPRveJibwCXGdw75InMAlMZVTVXx7glcdEWs0rfzNM0VtXfAUZUU1lcD8S0ChxPMLWV1YQ2cfoIuDlfmYmOO67Ssng3wlXNFwMfSJLSX7/AMxmt/ALnjuJpd38woodE/1GFb+g8sVGasNMpyNIRDVtcRYiUqqqgybiX5whLGOuIUgHDC+IplAKixK1XMPUqaAtvfuJJKLCDzeCPyqoC0dEZNV1LeGL6AUX8P8AcclRF14YTlUhTnt8TDkXyPEzIlrlcjEIeq6hY00VsP8AsoxagqlbHBUFvc3tW6qpn2IgTn3UMzqq4b8VcDLOXIgobWDUPmYhLDEJnj6iDKSjV4LihMKOWW4meRG3D4IIFRmgXQ+cQ9sh0tHFRvXKIBziCxpu6q+ahs3aUr37mYGrpnMTSsT+kQcgpe/YyqyGuF+/cEyaaTdP/YiC6BaDNv8A8mALuBdfHcI3oxsTzN7HGWwnU4QkVd59zF3gxfMDzvMDJri7u3EzBGVqG7w7Y6QoAisunq+G9wGKRsKioxeruMWhCZAFW8QOYsrr/YwsQYNFwtRUJYbikBSzmzcoQMVA8IJfUStbJiG9GGHjUulcswurIt7RC5i01zB3zKoFnRzLVGPAwt0wqYiwotnTjEwmVTDCcTIii3vmPZQK2BhbmPppw14lSoqqr3BTG6pp8EYJbI3GUw7PJKXrBTHlul2RfqEFZ5LzkqYKk4aDv9y9S7dvcuZbXmDC0jogf+xcuXTabdVdwptMMXdygCsCPDWI+aFIF3WphirlG6BnrBiDctXkOEGbSMeV0YaaHVwGCW2Mu3qXYjEglJiy+eop2SVLNB4iliC9KKY7XEu+baU8wrLUfxAyfUYIFZgp4/1GLihsO9+fqWQ/VpQ5ztBQZUlpSjMvzFq1FuINmDmG2bgFE1nQsAWBep+auovLUHKBShVVDBqKwXjGNpVy8ylLn2PiH1MbAVz/ANzD9Vltr0upfNkt5HV9wtyekUY1BXWE+6ZlSiaS98RC1VR8ql21cTwhi6FG82lyxthbuaTVSiC61egtyqNg28NWrDHmmGUPwS8N6Du2OJYSxgAXecEFUcESpWC4DwikU9KF5TcC1lwA2ZcQuaSA1HLVRUawbPVp1NBKxeNTYbifc1YN5Nzk0pkG+7gpQcggfINytoDwPgngmhn/AJHMppWjXqOoRdK2Q8gVZxStRiyabaruopAA2HPqUJBNdPPuFzKlcC/EwyaKGh8wy6CBgHnjmLsW86e5WYqqPS/7mErmjFUN35ZmYgom7ycQLcoaDvLe71LDbUL7vBVeIbd0a/gm4NCtBKxzEtAm2EopYxSolRq+f6E8Q/2iHGmJuqyld1lUP5ggL9heGzPEzQp2vhg5BsuU1j6zC4jVWLH5b+I0Be2AdjO/cKqLh2ruuqlfRrSVjAONO8+NRE1JsXbarlQdIGMGfmUXkV+swZ12tsy0lwMtBd48ohIQWECtecQHVaggmC8biADZbrb/AORg/wABaEZyaC9hrxmIRBTN5fiY0lUXfZCC8Fa4XqWAXtQhd03BQSTJXFVAtGzgGMJzqVtgOM7GVrRrVZmoN4hyA9duyJ7Kik8ANMdQbZA0OcWtgg7zrX6WmPnhicL5WFfcDl0iqZpszfHxFwqjZvOaRtjhgUc5zLb1Bm5XDkihRgCd8fhxAC9Wmw9Nw7dOG2OaQilSDYWq7iCJae0F5T4lCcrDV5aJai0FYnha8+oOCW4Xv2sGbEXRq80kJs8XDcaL1e6g4w906Yrb34iPSrXrMALtTL7zKHK/7gFgBBdzaIa/kCAjOUo8F2YqM0gaKXq1geChxBtKWN4zLjegAp4YNhLRFvAA9Xt8QiWLQt05QSwr1TKYeczMGn5KBNdZjyYYO6wBPmpaO7RaYU7eSM1DkaMN2+c3L8iU0FUJ0qUC/QWYUd7zDLU1sIVvCWsbK6ri8DfJeZxgtkVsUOYuGrbh1Va2cSwJWZFqesEKc0aDpxzuLRVdN3iCvMZc7gbiHMEq0o9mCKaWMUOWWWALxbOdKbBmnHkhdYKgoG6u5cGFgJatXqDeQOTDxCVIIROh/wC4hRVlnq3Fxhv2on3xfglvZBwGn9sxFBQBaVdJfGIti0bBKbTn9RAhbEIGjAJaq8AodxgRtQKCYzc9QwFN2kybDc3rwL3FE04rD5P0yoCrQtcyhbFg8bpNcR7F6MCvx4I08baSx/UHQuEIJcFwjO4R9mGEGzyXIzk3H5QK6w8wgipwGGArbeINNJsJeTBtCXysqT1ea+IdDTS7dhxziUIVCVWdnu4Dhv8AkgrRiPJqq3pQZ61LS0LmFUGzA5gwF62Ts3OYTZaXDfJumYPXxtDFcsEVRKqdR4F5vmLgDd+reWxpzxES1g+EujGm4IeyT6q6j6E8EzN7C+YFaFMt1tL5WqStadn4iRYn4MU3MwVI8svFH/Zi7wv0Ink7Gwsp/MeHtYOWn/5BXq4OrbJZJwTPTlLWKVavhx4uImoRrk7teJYCwBttw31iUtmC8Rec9wkJaIqgjWG9514lPBCVRqs1keqgOFHFjHCHmKS1BheCEo4sUAwX205ltfDzPNPi4vxTQAVj2xSdACsOSt+plhRxVMI2xiIHgqX6gVECXuvjmLMSKIE6ajh6C7Mqq3F9a6iTZUMNAvW8RAjBWSf1GiLFkWarPmFpxHDzzS7mJl0L19qOfmX8oVUooN9QA1qrgOkZomnZuEJrgapemB4lPRabV+YMdSzoFK1cRCOihadNMan6P/cWmUlsLcSZtNpYzFU9CbKF/BEChtahEFWkqCSgUZjD5QsvA7IQbxhU/QiOIb0xBIFE1fiBMovPZ0PGY8KX9jRk/MuyR3vtHkjjky1pEsrbtraeeomhAXSPawlyRF2ulvB5jR36EKO03Gq8olLghERbeECx7jKStwYg+fMWYhdblKU/2AiqCIpoxTCehA0nJXiE4Ahhv2adTeolPKRcA6FKtOvT+4opLOX4YVgcMFB1AZpGFqN5gYYYthn4hawlkCcRMskFYeDFYKgXTQ/7iFFmQSVyTlqHOQpXGqeyAarsDzF6lIhosgLEahFsFBw5H1UqDGCEosW5TzrFsLS3fuFLRXAbovMLilQY6Ndza3owwCrV1VQWxedGI5jB7jNlaoTMr4GvO/xLy0VymJWoDxLgyqFV5haJwZ23SxFqlyHaFu6hrALU45UfJM0jXtxZjcyBSIatKDmmPzUoti9ktZU4slSh9EQrI+o4gY2wvZLm/wAUpLpc9CpvoieA+41aGL8S3NPiPAGPMUlYo8xywXM9n5gVsIW/9zOb+jMOKvtmUPi3G+afMW8vUAWID2xSi6ebgl4T3LWA+Ljld/mo0ZK+bgM2sAVbMqmKCbfEsDlWHlnialdQgUo0pk+Jx7A2GyzXojhOwaR7GoJbKJkG2rv4NwgZKCrvADj3F4IFdyaLNwy11DebIzKLaj5soUT2/W4Unqx18hdp5huhPgBQ5gQfn5oiGpg3DQsuAN2/MRbzIIDyguYA2JIuBxp+41CRIwRW1YYFJhCBhYLC0bis+hjbFTcLMG2C4/Mbq4C3KXRYR3OlBEe1DTwmIFjAVEOWtISmmoYFf5mLRgcJr+5QhWQrz9+Iir3tA/7DRVtQL/M6RKqOKMqC4gtPhH+IeyOK5fiXgr4AiyceiqP6iAAOrxrGa5NUDjkqUNUF7Q/ulYeRlLsxvKM+alcDwyRqFoouviVF3CLgrRhgTEXeQvLSrvYRrAx6lRQjeSGbsPUXqPwEqprb1WSFmq9TCVA105OoAIFeiIAuKPETnAsjdGD0EVPkZmVwX7ICbTWzy/mIkLt13Dz0KvtMp53Gcr3ENxEbKX2ZIs8nkl3m/iNHWIsXUaBY+MS1iz2QFN/mBg01DC5VGDcA+YhBw/UUqIOyUuxKlO+I0Lp+pm6+KisltGMe4XWQF6hpVMTspit0PaFe7iorTgt7ZWLB9wZeDxc1wIb6Q37gQqUAUrctXvuLVgAF8NweJkzR8i5v3H5pwNbfJ3iBDrtK1kv/AFiABSiIHTWr6gQCwpUNZFjC+IVg2s1XMqLyCc8woXGIG/tPh6TXSLQU0KuDAG+vEyQF5IWCN/mWB0hQm8q8Q6tBV2euP3K82wI8WaxAGgobZ99SkDV6Iz32xAzO4MDsdMthulz5K4iSlVkPQlzMuCy/MCFWUACmrriUVgBKEPC8yogcLkh8xqrwYS8wpoO2lbqZlByyjCLFrMQYuymqFcs1YfKeuYKlrMjlX+xiNXyVyo8vbDZNgavvh6lu9oU+DExFS/0xMzY7SJfKb7f9mJ/AH8xdUeKj9kEk60YHN3sjgjgeu4IANFjqYrUfiGQ0SuKiZsheSASrHSO46M1SZgQAQrdjJ5m9qcnRR+2GeKIq66i5sGABlRfx/Atrlm+0XjNx1oSDvCtR3n8RcpefUMYuOFQcvqBY2yjWZWqUTNYhXaL6l6dp4i1w6yygNj8Qwqz8QVtj9S0bZdY+SY0/BCzVfSCwGjMDO1r1KXKxsit4Fz0J6hfH6irX+on2Y1xnbjEUD4ALV40RNjHbOnzBRYWg5+Y1r6pFouVqFqZvY+JlxsxaEPIxd3ASkVYQ8uNafhAgx4uIwydCKVFXtfPPzGok2KtEPp4yX8RCX3dM9ZZZXRSxLeYM0B6KzAGK5WtS+xafVytltGsAL3Lb+DvxMUWh4CvUQ3cD1CpgBsIYE45gmUsdwVVhWoBgLcUWUBT5RsOmxgXPaFLGvsevUZUUlm7gWLkN6nMRy112RSifLQxq2O8n51MlVWsp2cMJaUykApn5IPUbQTlAl/cHCgotHnAPxMOqNFA9WYmXeCLH5mxcG3zKE3AClr1mUGcjxmGg0zSGHcpRRqxtFhtxCC+GADqNtXTiHpLcFMRq4Zx5YLC8XHXaD04uDUJ9Ijp+oqtqr7lquhXN4gjbLyM7wwbMEutTZZ8JfZXiD0x7i/XiHpioI4ZYnNxXtqXyQSbqNmC3gg+bILXn3LpggqIoh+Zibz5gqWj8Qfh+Y1rA8wgaM/cow75JthlmaO0YBMwFn6QxydZFfHcUsl8DXllAORw5v/YFgkEwLPRCThs3e4aVDwQUTFPiA/5LF7Xh6hqQAYqXtjmb34hRdSYKOJkub8tMJKRfFY+CGLnNCtfghVUZGm2IugO6tpERAEw3VvUQsCnXL7gNwD5d+IAxLr5YqUWxd4QwOuPMEwAtfUvDA8EBCJg5rJAWSvcLs9wQFAeWXKAnhzKfSYeBEU1lYutR+iOtefCZel5Lb1KoC6XByBb4mJKLK1T6lBmFbFcbjTxkKSLq3xmLvmC7JTZEV48vmZXUtEtOBCwFLqctHBDN6YqY01xZuC3hX5hg5PUHf7T/AOpCog1FfQepRQfJqQNIl4021vxGoFJ6FwnkhT3iFQHIy7tjaMyLtGULG9U2V3cNEPMOl19S9bAuqbN063EtdqdTBr9MRoeHeIWl2dUjaow5ApDkAixjB7YAXBia3j7g5cXDLfyjd39tRFKVzqHDIG+GChRXrcT9jDDIggUGPJBPJe2sRAbHHUBB0PDLYDZ9xgD0Yi72rBK2hxAI04dkbDT81GGMeaGCOQ7SoKM/DUvxlPLDHJq7DX6ihCjwUfi4gLIGwQ8F5uXhCmgFDWpgLLqkD9c+5m3HSEpfUIjJ7x/UGrVja1mGS2HcWY5KG2pW8hbQPMDgmsf2qMS00gCujphlwWGkPS3K+INrCnxn/YGXrgCj+jzCQJVk23rLcu7OaVngdwgEAruPdYg4PFZC9xC8YFF2osRfBFqPK1libsFK8pyNw7aAU5K3VSrSJcZzXdSqJ8IKfcLaSuoWOV4jZVa5iW6v4xHYos4i0pdE8xty7wHgr7icAu9msyqyoroXK61EtqiLtFhAo8sX0CRVbZFt3FACRdzFB7LN+oLcUo1ouh0oH1LUpbrj08queqxBwQwe2Wj63Vj0Rxn3C4Y8RpwB4bde1eDLUHAKy5UMLy5mIMeW5i4auxLhzLO6lbg6EwLall8QeUDzKKo8EUXLANfMXoIwunV8upa95oj+iXHnMB9ED7kWCDTfXmPBYQBt0gO84IB6Ji3d/Mo4v3FZarxcRdrXVxO0eUWDW7xPaAurzzCzimKvUri7vojVXKO9wXsmdB4eoYzj6iVXD4jegr7JwkE41KUtWauIXa8SgFn1ApKH4il5XHPU6nhhi2sKU2/UOwREo7ix/wCRjVfitREIUqqU+4wVEytH8NEx67SwfbUuBd5qfjCkRyyHAvCpR5crEW3zcNoJSDB6eZSLK0jnzVRrqxtR0sWUE6BqIQjzp8xawJsJ6idX7U6Yy3cbxN+NQ7vioSXz1Rzsrn3MuM+CsE4sEp8RJOqlq7e0ywdc5WCd3z8wt0baZ9MVGskWojXq7ilDEAUF6QICmPEtfiqIZIPYj8NzMPdtRzmn+krwN1C2+4MCroVGjNbvfrcPMac1gaPuCMUMgF+4BcdhVHzUFiK9MHBwhjfh/wBgoaM1tt/6Z8+MQh9z2Au3OfiCA0m3PMeSOUXQtfbcQe4bdYP3Frt082HPqClgiFFaH5izKAWKj5AWEDVyysSvLTZGyckZA8Q6YEKq1FTfFjf8+L8uZeTESryZMfcE0CnF1+YNQUMluYONEYsV9MKqAu1AfuIDbPShgopzf/cqBJsHHu4QAOr4PUfj2E/g5lKxw6fbKOKZ1T9xvCL8Q2+cXGdBFC0+RMTGXdcGPmNK0d3DYVEOcfMggR9sxs9ngg2Ke4FUsrxBnmvUV567lCsmdxDziUrv4la3n1H5L8SkXR8F2zI3RG3JFU/VwDbR1KHnMTFfl3B5OeKZettxwUKstdG5sH8zMzWemJCgu48a+kimmYUUQMMq03ilS+osJhpc39RgwOsB+CKTHkC4lZxCq0PRKVrsCWsFgFWgl5qrw3NQcyopA+UGES74cLfNOZQoVWSi/wCokEC0Uq35pJSaphieMst6GxLX5/uAgCCts+CW8m6VKGPcCc59VVAXmKilHatSiEbMwXjlR1Rl0Uf9zAk9yCnzmBU6CqKw9VcAaCDyqi3sWxioSsB2Lf5gylD1LRdFcMVzYe6ZfCvqk/KzgNcUempZSz6d4CnuMSunfj+pTBa8eY6WEp5HnP8AUIWUo6Hj33NmWDznP5uUGKQX8oFYwVrLBVbG83LRuCiMHSUQfVVI6jlgQloTbysoZoDUUbLYrl8Y/cSJwJrdWxHWnSLaKGMDrcsFKliUGj5YmgnQYVtyAPoP7h8F9vI7WGDm4FoU84PmNwhw2+51mZ/MjXOTj1MclAyfGZcPsf8AfcPTfTiyvuCwIS9lNF/r4hS1SuYioL6qVYDT/mmUQMmqQqb+xxMV28rl2Vt5iXkc4m9A0ctZnZB8yy8Vl5LXCNQAYYPmABptykGCg83FIBm/dxW/JF2WqvFdwUpIefMMlX3bEgYXEGRL5i6D3ALwXQ5irYce5bbefiC4aeu5hui+IBLp7WSwsB8OJecria+IO0BHbQHqHgHG/wBwgABzatfBcxqI4RRURs06YVgjYou4k5MYz+YUCU5xqYkDXLYgqGYqgqvEFeoByYfkgWXBYL7rMYJVLsiK6eZaccWVB8xDmpwufBYjQzsraEcZP1G+hMbtdHu8MbCjF5B4jRQYqp0y5gAvzdH4gpXuJ9MRt6mOL+1mIJwr/UIlBNYmvcq8ocKy/g31cchXvBIpBxEAFiAzmUwa0QGOAv4lU0IH85/uBW1bvDNQkoAYsigOIv8Az4i114fuX2OUfmZFpsT+4VF6FXggqoWruoWUWZlohS12nd9eI7EstQP+SIQpnLS0ymkV8n1FDIpqrlkZA/EUUtjlD+ogxgNKv6ItnHXCUrYbsjyEWFUDfOcMIwBSlAcsAAbyF2jP6g02gVsqv3LVd1VedTANXX5IHOyZXM1lu1WWhxdle4dosZLNxVCz4YCjm4jHkfEKCijfBcstoB+YW3Sd25g3ihCK49hisvA5JQXenqNoOF0yytD6H+RbrbfUSlDYdiR5Qvi6l+AOtyl1l8i3B6tPmXDJReLZYxu48hcbItGn2aiUasdQS93zggirTPExwfFQWyY8sVgF8twR7af+E2D5GHL5uZpSHKBPxCzALrLVfHMWnXAsDzKUAcNLP3BgQOE/UoG1mrMS6LXDiWRmdYwymBXYUAhUaC2pYYpopzKGmayTzmFkbAqdh4l14yaz3aVgm6N1+AYeqkqgNxDiyGit5ol4WZKVh+I4S2igPviGp1UCsX+pcWPRsPgRLBsegTwcSlBF2nH6hUu124P/AGKhHoZYGc9VDkHW4JlnN33FtXk0QsQX4zV8S0EcrIp8RDUfRMAXMjgx7EdEqny9R0q6aPHESwNNPbG0btNnzhGgTp7hoDYNXDAjKlfuOrNyurVYBoMq3L9d4SpQmhDjEpU/7J7/AHATS3BK2oDWFMbCjqj/ANjDYXB7bmhbviWqg4HMyCVa9QaUZXnzMwzoxncoC+ftcI0YWV4pWECAZAO2F2u0H8xjb9VUaal4MoAx8QkKAnl1+IqyrwjOCg5HUTKXf9zJE+TKKNBzljd+h5g02j6g4Z13UQAbPJcbPUGsgJuo0Ab2MVAkTQYuUI2PgzIAF45jtAHNkFZWmolLFNZQFfQeIGP5EoF7vi4PZbuGOguBgHXGKqIvK4vqPxFmRyO4Q2RbCrxwGWDD+8AT0Qqldmbb5iV3DIF3zUqRrDbA/RUL7TxwqWoz51/iNrFDUBhbjDmAdx5JlLDQpN7zLzUGwvPxGwIHCe/uCsaQ64fARBBBlAvirgYaINhRDrNFpWzzjMKKRez54/uJvFBsV8JKMRVDl5vcADss/ojqom6LkxmJeAU7z/kuw6rpjYk7DVc4lWopwq3/AHGj7jlb/UqMHl2i5UN1XEVQWLqoBK6znbDFh5LLImq+28PmG1xE/Bf2QMuwoctPFVDLI3bAGVb6jwc5G3tiFQFneiUq4Vty/wDVLmrTz8EQWO8bilVsof8AvM23y5iGHUpahl4jAyWwJUqznshNU6uH7iE8IH3CSqP7NP2EytOmy22IUHiZ1BRR5YDuAh8EA+oQbjaqrxEGrC64eITEPLeQ1HvvWW5YTN4z5KhOKqXszNJwtOfJGhLJ9CSsSUBOruWAKsrsBFTBTV2bfVQAWkF03/kqtLBvVzsGM0t1DLDLawUlB3f/ALK6A4VAnAa6uVsw+Ytyv4v/AMjhS5NA/bA3q7QzbK5UAlCojcBD1cVLsniopODXiIG7fGYAFB4OIOmF5uLRggoaWQyG3XfEUFFPKyhy+pls88OGAyIOLi2QG3ZiTKtYDKHNNsCN6MXGKVc/aU2Dt0ktJAc0w+oKNKr2O4UFq/NDAtX5lkrAEOLu4c0QbNXklKYI0/SDRlss+xlwG7FTwpImBBWuhOs3E1pCwpR71iXFtyANfimDMfyIfOLlaqBeNx8EXjKhdjwXiGuqhWVafi4AtrRYX9Yl8DheX4lscUwS5YsJKPH1EsG88vxEK64Ro1Rk5f6jYXvigqGcwO2MpKYB7C6i45gfutH7jgwEptLoh1BhTbyl/QS71IzrP+VK4A0bEP8Aql8hbiw38TVq3BALEAXr3DSyw/2Z1U1uK+0mvKHEKZcEIOxFzAAq8FagpEiqIYGy6Q8KBv3KsREy0xHdL7uIdOrLjMatFBss4jWMjEa4VIeqbYgtO6G2dy1uDevuVdbU/ccy1ZPQZYZ7xUV3FvwWP6liH6hUiTGmy/uIxRvrwGUaUUmsR+EYgI8lyylAaqn7hckXk3v9SiUSVebal2KI7LMBAic4/wBiWmnNrETSPKYuH3X3FLCjuBOB1TUfQgHO7jUlicZqKECnxiEFAmc//YW2Bc6fcXNMwLUA8Jma5JjLEbvA4pYJpl3KU4OmYg67L+YKvY8wCoObzBQvbINx0X0XSXZNDalf1C0Lny/8QCPsWhrB8ePoiSml+TGOCnNWihal1i8rC3uuQGC2bgrMZoXJzUoXYGvEWAjXzMg7blx6lgbYUWP3qFY8rYqrpSJj1sl/lAN6ybTfiVlqqpoHvVTI9TIFR3bVS+kGa2VBmqPJbUfB1L64LUH1Ng75r9VDt2tQJ951La/cjf8AJSatDFNQtcc/BUqxeDAeYFJVX5gkM5Lwzr49bu2pUzHb/cRVIFHi8NOiUs8mqDJa9XUURVjot2HiKZWkczXouxW/8iZqilZ7g5phXg+2EsHojREVWWOLfqHgIUAohDEtnsPwf2qIxmtbLI/QgxBLxWexjs1djfUHlP4Fua90adlzgNeilxHDKcjYYYaVpDEuDuyqKf7GYkUrCzDK1C2M98R0H19agC1dV/krYZN+39fc27+dsE+rLEUWFpcxrYvFXHsJTnsGbjA/UP038QuEmKvCORhVvQzRMt5XxV1LaOXdZJUOBetxUpQ85ZTbQHmUe3dylqrPYYiFOzqiJIgae2UeTsjAF+lqIqkC6LuLQL2RXYAN4plC2wuLtG41fER7Kg1CS4DnaAMV6iPYChiQ7C+yGy8Nk3WA6cQ4P2w9TBeAcZjWxAEEcKItis1WhRhlsMUjHmrmR+81GUDG6KHy8zFgj9vcQUX3eEuuS/KrBrkSsguUAox9TBjIpvcDMTxTPjMGanKlP/sbWB+AjU7anQ+4aLOQ+yVoCs4x45ZQ5MZtzxzFkZfhdZY8VWwgHtaxNDu1lHqplGBRNZ8XipQ5+wHyTcPEq5M/qVBIuG26gthS6LwV/cA/1gJbR7vUYFIW2ZSpd5ZtuKhm2OEaE9l36lyFapgOfya+Jhj2tfCURWX3S8QgQttegJQSCUsmLgtuOcssLh4IyhN8CYz+bm7+CUtBfNNx1zShKSKrzr4j+NL/ANyZgNbNEANH8wDrDMTSFd2n3dSgiXi94YrvbnADtnszL2wXYG//AGJsLcteOJRt3dREx/yIW3JF4TiOdyq/mU7GLKNbmN4K/EoVZqZ/hB2mD9kJg08AuiWzZnP5PZ9J9Q8QF8QtRV6QOInM7QGiR4BiWby5ZYGy9YcVGqRGvMtRhfvUcltdrqZg4FqQx9F8GIItEZTVAXFjrzG19G2CoCg+5ZKxTrKWAEtFv9Qu3A+Ztul0EBrYzqNxdOHNRpcTos/mAAxd8RxZtXhZnY5Wd1KuNoaKmONtaOUyCqgq5z6Yhet0oP8AyV0otVBbJhgbkMH5xFC4NUlP49xVsL6FvUzsWco3AGG224KFX7JxyLvxMyVA0iVFVkZ07l8G6JYQqplm+flnHrip9se20Rtj5NQt31w05Og4+JnRDTJW+4nLb2WzpbigzXFW77TEcqeu3g949ysDzmwf6nJJtOj5juA4tVC/3CFyaMr/AOQJowN23XqJA0XtGpWtsO7v7ithlXZ/5LkSIaho0uqTHOZaF0pVuxfUJrbHtg3RBqbD/JYEdJLNS3sBCsdSwdXrHcS9+JiG/n+SerieKLhqlnxdS4gicQyO0H5jv0sE6AiLIdNVMMG5Vb/mqlOEqiH3DdGpZyjthsT9fwwRzTwB28TLROxPn/cZA1b2lC0tlN/qNqeZdHkv5mIe4iXZ+oQxUC23hUsrgy9f3Vf1BoC3bc2oXpergi1ybf6Qbuk3VZmtNmapEo3YNG7ghKU2xByHlNINK/KgC6A8O4ovti0QJVcyVmNIU38yqEur7LmxB8DqBBS/oQlXhZErZ9VD6l3M34vMYG7jmVI4coA/bK02u92ZlWWOVlr8xXrR3+k5NF+T+5lynIlyrqla5mBYo5ePcqSvFpkPUvbMpsFJZDg4YIAcDSS4NAOdMQJZ9K4iEffRiIFssJoqFgWKuIU2pgusepWVywBX5ItXJjBxKA8em/sja2GaxyfUsdt21OoKCsoH+FxWFbFZz7iuGBkGPbUwC60NPuosBfFAD0Dz7YRhwxT9qI+S8rAj0y9GMuAB7gdIG81CG1q+lkbS9ueJe4UHYlmKqFlAyfn8QCgeSomYkQK54Gl/EYhq0f7BkPMaigrxEOfNe4Y7k57rqnc5xhTcLcOEcRy0CsMtHEyJI2aP4YR0IZLwWtgD+DKzMHuMfQHkZffRKwKaKKwW78o9yh7cGzcSuKX42ggRqxcKHEpdFBU7pP8AINBnBYWtv6ikbu6tER9Xg9CyxLa/8g9wVatBiCryKsUUdXuDyA3uMhgKDl0RzAcKC/C41ojlW5SsL2nEC+wEpw8nw4mQYpslHBZpuXBXQF4VZs05N1O4i8t6hXYdtzIpoc4jTLV4ECksA3W4iAYbKygdA/O5SiwNu2CacElNUV2cShU1ra6jhpS6vZcA4UMLcWC1NIjc7mziqhSiq5s1GsI6Bqc6BjZ/Mxz4Uo6Z26W4IA4BNwtbQccIgsXKiiemAbrZNDAhLPFAIKBR8U/tMSxBCk/rC25VDon/AHEtd4/aYHpy5+oBWz8MwivJf7KTKXg2EPyoaQqIAj2RF8DFXUbw+iFxUVlUh1CrXl7GIqEqMl7uUqIbda8scvm5Vz9MICxeLrfzH5FU7fnMNeHk6PZLtnllaC+RS1YDXxzKlYHatrCBYJm2D7lIecpz9QJawpE2PCVBn3Y2+b4xXiOSXBstDZLvHUK4h3wUrq3t+YPuiIOnua20oF31cNVTJRKNA2mbsErYHUDllsdvv/8ADYCpRPwRcncMjZ5vNef4sQC1mbSxzkw+D9xQwDjEUusOOIKgA3HmApW/qpceLKDg1mVo9U8C2/0xiNM+o/ZCGKAFXLnUrSOq/cE2pYVynPlvSOW1TJC3RYpPk8Sx2puQPgl58h+UdAdxXfxGQDcnrgfh+5U66AUlIrZ+UVUoB3SJVdspVVqNFUq9wvW313BgFeYByCmKYeVYHH6Nyy1o6q6l5gLUt7RzMi9HaVi6Oi9eoFDIV2hQ0q0OKmgPLzFTZOqf6gkBTjM2LyAUhKtXdolJZQgd0S1lW7tTwPkP/MEZB5jNFzwy/NzXVdWXXzuXEL/ek3ocGsYhAjm0cwgC1V0N/wDsDoCHsRHQPgIB5Odwq7yfLuLTAPAKzEjKGfCO5hx/4w2RYUqi8RwLqo8eaqOTIudLirmPAmjg2gKG4HYCUcn3DZ7ou/Evcq8G48y6wfwlCh7svXmb3DgECDcBe9SolCy4YBAtff8A8R2gHTT+ElQGI7JcfYqk08rdZEaSGBHZEE2Nky4ELGttmoAxsnK4f8nEgt6cfqKtbqfMxbjTZWIHdefuICHU5viGW0BLd7M4/lLTTOI8V9fMdtQNaWU9aYOYKuSFXYWkWBIGTSkFIAVwf5NgBMmx+5uatSrMI+IPPsEbKWmHzU42JuapD8sErROg4L6alIr5XAOWVYEdHAZj7kaD/uI6Q13X/ajeYpp8P/sy6NV/8Rz39o5YxEQUnqLVXG5dhHAyCPgT6gKajEMiyLkBaFFRELXJFNzfSd+JvIA6EqotiQapvMDax2NRoCzOmULUPq4C7QeU3KAZXUYF3XQPMdhSrVIrBWtnLLMoRRbj3LMKe+4wxDohN7t1/WLAhqqTOt1dFH5i2WFSgsfmUsgNNrmMLqudRA5eNxBLAqqMfqVKTjSDOiDdgx8QFlCGzTXUTL0YVcH3Mlc88fUoLnVVgfbB7El1ZcNRStRlNVpJq4M4prBT7zxKl7av/COPl7u7HwEa1mYtt/qAdCbaXL1k2ND8xLQQpDz7jRwMRD6i9Tsr14l+NzTm+NyjFjn/AN+4IUIwLmViPhOQlVFXkEIBP+DU0NeViz8S8LGVWB5iYpzz2MGoeb/mo5THmge4Jcw2GiBExbeEXHlQFDqDjn7lRkOIAAuNKPy5g4LTBcb6tfcwYrHkP1EMNRQ1WVf5YUcGpB73Fps0xSlDBbeJhUD4X270h8WwFywew/cub3w6uaADzRHRZI01dwdKAE9ReSDXnC/qXkuh9kOIaqMo23xBDck7ufMNZ/IB43DotjUaD+yMXMrWDvcN7slj5i2Ait1eoaT2U7l1pzfZZEq6XDGPP8GlmoFbtr+yVrDGedwCB+GpYKBwTD8RWgtukzAShprP9w0oeDAxyo7zGRT80G5W1w1g0eZQVPW78xCDSqKRo1Uc6fMEV2/IwQ2F85ijX0IrBSboFS2q6aNsQlprMEpwFHTAuR+Y3U+giQB99ShvHOIQCnUF+1cZGYERzaYhSrAf8HUFgwWSyoMa6yGHxcAHU3GEAaL0G4aowvN1iAbKxi31cLVkNBckenuyI17MMIjuSdP9xLOxwrev8gd8aiH9XAbLwAy4xqGbNlUW9KMBxglYF70TYGc1h9rE5BlU8UFOYWK4v3qKFZMJ/ZCWm2FJRR64eDAa1m21n5xMQrCgJb8spze88dQVChwR/UvYAbzqFgut1w/MfCg+sTLfNvG4Upxy2CifpYl1dkA5U7x5la3IPmULgCJzKiKLYOPELPgS7bGuoulHE8mNmFNCB7YoaOhAKM6U1XLLkMCjq5T2hLQTEtU8Bq67iFlhdTQy/EBbH02lCDfFQSFMNqRW2GBcIKecOxf9TBDS9Xw4/uKvrLfR/wDJ2AR+aY0VLLGUvUVWzJbeWvM1TSNGiCQcyfOEioPFf+zFGrE+owbUGJe8jb1VxU3HxFFB+Fg6X01KVKCnWafUpQjOiJa2h3RiWFtaZxOPtlpBlGnX+xAWiu3cDYXwVPySMYrIMX/6l0Ve8hAI0QxQleYkyI1ADgeTD+ooSxngiPJp21ccwWKsiRimL6smdbdHX4ZUAjlBPqDxDllbi5VLXk/MCLxmkXN4F0ksg3TRe/fEsB8yF/DBtE2xscZxcl0XVhXNkqY0c3cGlPQnX5jtdVQQ5BVbuNGk8iwaQ0cDeIdDTzf/AMizGqEtencNevsSvbEBrigq+yUNgLWKfGWohQmLoe5gpA4sPnM8fM+a4xOnA3I93EgO9h+YlA4K0HxEFcKliCWm0L4XElh7N+mAKZ3dN0RNR30rmR2BykIAz8f4jQWdlN/iWOdaba/Epbu/74iV2AXu98RHToNPDZeJlA+3H4gx5+f8oEhcRVbvS5UbrdFfuWYYpNx9L2ggSF2NoGgF+VLBV/lBCqUcYmQbOLhhqoa6eGZUBbt21UEbPQL/ABFXVu7F/iAFNPBAcUu+SMsZcpYJVzLACfClcwnbkI8d5YGDwHCyqeY4V1KBuvHiCKSf9cS+EeAP9gykhZq/HqUVFHdmYdTTFbI7XLubgNahAE6jGIgwq8f/AHlNWf8AHceF/H/ZSYU8Ja5XmNYyMZJYGjNEmIxPz/kUDHtSmWAFA4f5BaaLxCoHPK3HclGkwHxANHoc1FgFGavEMltHW/7iRZdMV+ZU5Xw/3CkAXTi4tGRrKin8ylcq6aZZLsDzOYF+xKsUdQBxrjCWaOiJHBdTxaOAAcUYBGtinD9zLrLd2lxZcWLFixjGMSP8n8CEGEIw2QkYWYJcoWPMFBi/wcX8ET+HMGYdQUH8Gkyg7IOJQH8FHHiKLM3mkdRbnL+BhQEG4NzBYpL4iUR6IlCKEuH8X/8Ai4v83/8Am4T/2Q==');
/*!40000 ALTER TABLE `ruangan` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nip` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_lengkap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_staff` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_unique` (`nip`),
  UNIQUE KEY `staff_unique_1` (`user_staff`),
  CONSTRAINT `staff_user_FK` FOREIGN KEY (`user_staff`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES
(2,'199001012015011001','Ahmad Staf, S.Kom.',39);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
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
  `id` int NOT NULL AUTO_INCREMENT,
  `alasan_penolakan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_reservasi` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tolak_reservasi_reservasi_FK` (`id_reservasi`),
  CONSTRAINT `tolak_reservasi_reservasi_FK` FOREIGN KEY (`id_reservasi`) REFERENCES `reservasi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tolak_reservasi`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tolak_reservasi` WRITE;
/*!40000 ALTER TABLE `tolak_reservasi` DISABLE KEYS */;
INSERT INTO `tolak_reservasi` VALUES
(1,'a',20),
(2,'lagi perbaikan',28),
(3,'ruang tidak available jam segitu',29);
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
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_role` int NOT NULL,
  `isVerified` tinyint NOT NULL,
  `tipe_user` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_unique` (`username`),
  UNIQUE KEY `user_unique_1` (`email`),
  KEY `user_role_FK` (`user_role`),
  KEY `user_user_tipe_FK` (`tipe_user`),
  CONSTRAINT `user_role_FK` FOREIGN KEY (`user_role`) REFERENCES `role` (`id`),
  CONSTRAINT `user_user_tipe_FK` FOREIGN KEY (`tipe_user`) REFERENCES `user_tipe` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(24,'galvin','galvindoser@gmail.com','$2a$10$tElUBFVxfFyycyEnsBA8nuHJ2233DBYUO6qO0ULIN9DACe8G0jQf6',1,1,4),
(25,'dosen01','dosen01@example.com','$2a$10$o9tJlvVxXLCw8eFh.C3nluTX34xN9bIlGCn6RvkVoJf.mjq/WLcoC',3,1,2),
(27,'galvin2daw','hacker@gmail.com','$2a$10$83d7hBR/SPto0k.EleoRhOx7m77NRNK18Fczkte.y.zQTwWpVnOmu',3,1,1),
(30,'jajadw','lmafo@daw.com','$2a$10$Ww6BMi6tDc.xRdMmOGdeLOjteIUHyW4FwsUcrbWmrhTpmwflni2cC',3,1,2),
(35,'galvingalvin','galvin@gmail.com','$2a$10$rvtiEtg3alkMH72QWWMageq328do1gk5/4Kb9nO4tq4juZAgtKDpW',3,1,1),
(36,'petugas_sarpras','petugas@sipinjam.ac.id','$2a$10$dYl6GYJAmpupYCqF9IMWdeReDCvwVP/mpie33.utrBmNjujgpFecO',2,1,5),
(37,'galvin27','galvin97653@students.undip.ac.id','$2a$10$LMs2iTZRJbOrEHNY3ERm.OP/AeuQovCxN/3hqKakq3EdI4K.I1/gO',3,1,1),
(38,'dosen_demo','dosen@sipinjam.ac.id','$2a$10$NfcYstHTSdLUnB4xtnPAwOtuvT7H2QFSbFm2oRxwWxgb7Ez41JXym',3,1,2),
(39,'staf_demo','staf@sipinjam.ac.id','$2a$10$lL9bGbZ1zu2/6ojBwanxceOCXgikiC.9vziMJcXarETpkDMS0BDjW',3,1,3),
(40,'haikal@kampus.ac.id','haikal@students.undip.ac.id','$2a$10$LOasppiT8N8ExJVt63Q0pucGVhKxZOT4rmcEvN9ii4JQlT2VE12N2',3,1,1),
(41,'muyesa','muyesa@gmail.com','$2a$10$Tut5ITBm4lKa.yBf9ohJaurmS0cWCp8NbyItRH3qz1RHQuJnc/NjO',3,1,1);
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
  `id` int NOT NULL AUTO_INCREMENT,
  `tipe` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_tipe_unique` (`tipe`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_tipe`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `user_tipe` WRITE;
/*!40000 ALTER TABLE `user_tipe` DISABLE KEYS */;
INSERT INTO `user_tipe` VALUES
(4,'Admin'),
(2,'Dosen'),
(1,'mhs'),
(5,'Petugas'),
(3,'Staff');
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

-- Dump completed on 2026-10-01 16:34:23
