-- MySQL dump 10.16  Distrib 10.1.38-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: bjtu_papms
-- ------------------------------------------------------
-- Server version	10.1.38-MariaDB-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `client_postgraduate`
--

DROP TABLE IF EXISTS `client_postgraduate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_postgraduate` (
  `loginname` varchar(50) NOT NULL,
  `password` varchar(128) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `audit_link` longtext,
  PRIMARY KEY (`loginname`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client_staff`
--

DROP TABLE IF EXISTS `client_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_staff` (
  `loginname` varchar(50) NOT NULL,
  `password` varchar(128) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `audit_link` longtext,
  PRIMARY KEY (`loginname`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client_student`
--

DROP TABLE IF EXISTS `client_student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_student` (
  `loginname` varchar(50) NOT NULL,
  `password` varchar(128) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `audit_link` longtext,
  PRIMARY KEY (`loginname`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dicts_college`
--

DROP TABLE IF EXISTS `dicts_college`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dicts_college` (
  `code` varchar(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `short_name` varchar(20) DEFAULT NULL,
  `name_en` varchar(80) DEFAULT NULL,
  `code_extra` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dicts_college_bachelar`
--

DROP TABLE IF EXISTS `dicts_college_bachelar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dicts_college_bachelar` (
  `xsh` varchar(10) NOT NULL,
  `xsm` varchar(100) DEFAULT NULL,
  `xsjc` varchar(100) DEFAULT NULL,
  `ywxsm` varchar(100) DEFAULT NULL,
  `sfjxdw` varchar(2) DEFAULT NULL,
  `bz` varchar(500) DEFAULT NULL,
  `xspy` varchar(18) DEFAULT NULL,
  `xszxsm` varchar(100) DEFAULT NULL,
  `sfxsxy` varchar(255) DEFAULT NULL,
  `code_extra` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`xsh`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dicts_department`
--

DROP TABLE IF EXISTS `dicts_department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dicts_department` (
  `code` varchar(30) NOT NULL,
  `name` varchar(50) NOT NULL,
  `short_name` varchar(50) NOT NULL,
  `parent` varchar(30) NOT NULL,
  `level` int(11) DEFAULT NULL,
  `used` tinyint(1) NOT NULL,
  `szdwh` varchar(30) DEFAULT NULL,
  `affairs_used` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `discipline_discipline`
--

DROP TABLE IF EXISTS `discipline_discipline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discipline_discipline` (
  `code` varchar(20) NOT NULL,
  `upcode_id` varchar(20) DEFAULT NULL,
  `name` varchar(80) DEFAULT NULL,
  `name_en` varchar(200) DEFAULT NULL,
  `name_formal` varchar(80) DEFAULT NULL,
  `is_pro` tinyint(1) NOT NULL,
  PRIMARY KEY (`code`) USING BTREE,
  KEY `discipline_discipline_8f348ef4` (`upcode_id`) USING BTREE,
  CONSTRAINT `discipline_discipline_ibfk_1` FOREIGN KEY (`upcode_id`) REFERENCES `discipline_discipline` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interships_admins`
--

DROP TABLE IF EXISTS `interships_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interships_admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_code` varchar(30) NOT NULL,
  `staff_jobnum` varchar(12) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `interships_admins_department_id_0c9a4731_fk_dicts_dep` (`department_code`) USING BTREE,
  KEY `interships_admins_staff_id_19c44c9c_fk_people_staff_jobnum` (`staff_jobnum`) USING BTREE,
  CONSTRAINT `interships_admins_department_id_0c9a4731_fk_dicts_dep` FOREIGN KEY (`department_code`) REFERENCES `dicts_department` (`code`),
  CONSTRAINT `interships_admins_staff_id_19c44c9c_fk_people_staff_jobnum` FOREIGN KEY (`staff_jobnum`) REFERENCES `people_staff` (`jobnum`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interships_config`
--

DROP TABLE IF EXISTS `interships_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interships_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `used` tinyint(1) NOT NULL,
  `position_start` int(11) NOT NULL,
  `position_end` int(11) NOT NULL,
  `apply_start` int(11) NOT NULL,
  `apply_end` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interships_position`
--

DROP TABLE IF EXISTS `interships_position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interships_position` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `semester` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `types` int(11) NOT NULL,
  `need` longtext NOT NULL,
  `need_num` int(11) NOT NULL,
  `content` longtext NOT NULL,
  `address` longtext NOT NULL,
  `work_time_d` longtext,
  `work_time_l` int(11) DEFAULT NULL,
  `campus` int(11) NOT NULL,
  `way` int(11) NOT NULL,
  `start_t` date NOT NULL,
  `end_t` date NOT NULL,
  `status` int(11) NOT NULL,
  `audit` int(11) NOT NULL,
  `audit_log` longtext,
  `department_code` varchar(30) NOT NULL,
  `staff_jobnum` varchar(12) NOT NULL,
  `cellphone` varchar(20) NOT NULL,
  `task_teaching_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `interships_position_department_id_005e023c_fk_dicts_dep` (`department_code`) USING BTREE,
  KEY `interships_position_staff_id` (`staff_jobnum`) USING BTREE,
  KEY `interships_position_task_teaching_id` (`task_teaching_id`),
  CONSTRAINT `interships_position_department_id_005e023c_fk_dicts_dep` FOREIGN KEY (`department_code`) REFERENCES `dicts_department` (`code`),
  CONSTRAINT `interships_position_staff_id` FOREIGN KEY (`staff_jobnum`) REFERENCES `people_staff` (`jobnum`),
  CONSTRAINT `interships_position_task_teaching_id` FOREIGN KEY (`task_teaching_id`) REFERENCES `task_teaching` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1013 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interships_stuapply`
--

DROP TABLE IF EXISTS `interships_stuapply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interships_stuapply` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_number` varchar(12) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `award_level` varchar(255) NOT NULL,
  `english` varchar(255) NOT NULL,
  `computer` varchar(255) NOT NULL,
  `resume` longtext NOT NULL,
  `award_ex` longtext,
  `experiments` longtext NOT NULL,
  `favor` longtext,
  `other` longtext,
  `status` int(11) NOT NULL,
  `audit` int(11) NOT NULL,
  `audit_log` longtext,
  `position_id` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `interships_stuapply_position_id_b20b3d19_fk_intership` (`position_id`) USING BTREE,
  KEY `interships_stuapply_census` (`student_number`) USING BTREE,
  CONSTRAINT `interships_stuapply_census` FOREIGN KEY (`student_number`) REFERENCES `school_census` (`number`),
  CONSTRAINT `interships_stuapply_position_id_b20b3d19_fk_intership` FOREIGN KEY (`position_id`) REFERENCES `interships_position` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1428 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interships_workload`
--

DROP TABLE IF EXISTS `interships_workload`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interships_workload` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(50) NOT NULL,
  `time` varchar(6) NOT NULL,
  `amount` int(11) NOT NULL,
  `stuapply_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `interships_stuapply_id` (`stuapply_id`),
  CONSTRAINT `interships_stuapply_id` FOREIGN KEY (`stuapply_id`) REFERENCES `interships_stuapply` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1210 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `people_staff`
--

DROP TABLE IF EXISTS `people_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `people_staff` (
  `jobnum` varchar(12) NOT NULL,
  `name` varchar(20) NOT NULL,
  `xmjp` varchar(30) DEFAULT NULL,
  `gender` varchar(1) DEFAULT NULL,
  `certificate_type` varchar(20) DEFAULT NULL,
  `idcard` varchar(18) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `nation` varchar(20) DEFAULT NULL,
  `nationality` varchar(20) DEFAULT NULL,
  `faction` varchar(50) DEFAULT NULL,
  `title_code` varchar(20) DEFAULT NULL,
  `title` varchar(20) DEFAULT NULL,
  `headship` varchar(20) DEFAULT NULL,
  `degree_name` varchar(8) DEFAULT NULL,
  `degree_date` date DEFAULT NULL,
  `education_name` varchar(8) DEFAULT NULL,
  `department_code` varchar(10) DEFAULT NULL,
  `department` varchar(40) DEFAULT NULL,
  `cellphone` varchar(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `is_school_staff` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`jobnum`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `school_census`
--

DROP TABLE IF EXISTS `school_census`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `school_census` (
  `number` varchar(12) NOT NULL,
  `name` varchar(50) NOT NULL,
  `student_type` int(11) DEFAULT NULL,
  `sex` int(11) DEFAULT NULL,
  `discipline` varchar(80) DEFAULT NULL,
  `school_status` varchar(2) DEFAULT NULL,
  `country_status` varchar(2) DEFAULT NULL,
  `teacher_name` varchar(30) DEFAULT NULL,
  `teacher_code` varchar(10) DEFAULT NULL,
  `teacher2_name` varchar(30) DEFAULT NULL,
  `teacher2_code` varchar(10) DEFAULT NULL,
  `of_year` varchar(4) DEFAULT NULL,
  `is_qrz` tinyint(1) NOT NULL,
  `college_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`number`) USING BTREE,
  KEY `school_census_school_college_id_721c7f94_fk_dicts_col` (`college_id`) USING BTREE,
  CONSTRAINT `school_census_school_college_id_721c7f94_fk_dicts_col` FOREIGN KEY (`college_id`) REFERENCES `dicts_college` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_teacher`
--

DROP TABLE IF EXISTS `task_teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_teacher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jsh` varchar(15) NOT NULL,
  `task_teaching_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `task_teacher_fk_task_teaching` (`task_teaching_id`),
  CONSTRAINT `task_teacher_fk_task_teaching` FOREIGN KEY (`task_teaching_id`) REFERENCES `task_teaching` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3454 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_teaching`
--

DROP TABLE IF EXISTS `task_teaching`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_teaching` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zxjxjhh` varchar(20) NOT NULL,
  `kch` varchar(10) NOT NULL,
  `kcm` varchar(100) DEFAULT NULL,
  `kxh` varchar(3) NOT NULL,
  `jkzxs` decimal(4,0) DEFAULT NULL,
  `student_type` int(11) DEFAULT NULL,
  `krl` int(11) DEFAULT NULL,
  `college_code` varchar(10) DEFAULT NULL,
  `department_code` varchar(30) DEFAULT NULL,
  `zxs` decimal(4,1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3056 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-04-21 11:57:29
