/*
 Navicat Premium Data Transfer
 Date: 25/02/2019 16:10:39
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for client_postgraduate
-- ----------------------------
DROP TABLE IF EXISTS `client_postgraduate`;
CREATE TABLE `client_postgraduate`  (
  `loginname` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `last_login` datetime(6) NULL DEFAULT NULL,
  PRIMARY KEY (`loginname`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for client_staff
-- ----------------------------
DROP TABLE IF EXISTS `client_staff`;
CREATE TABLE `client_staff`  (
  `loginname` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `last_login` datetime(6) NULL DEFAULT NULL,
  `audit_link` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  PRIMARY KEY (`loginname`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for client_student
-- ----------------------------
DROP TABLE IF EXISTS `client_student`;
CREATE TABLE `client_student`  (
  `loginname` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `last_login` datetime(6) NULL DEFAULT NULL,
  `audit_link` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  PRIMARY KEY (`loginname`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for dicts_college
-- ----------------------------
DROP TABLE IF EXISTS `dicts_college`;
CREATE TABLE `dicts_college`  (
  `code` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `short_name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `name_en` varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `code_extra` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for dicts_department
-- ----------------------------
DROP TABLE IF EXISTS `dicts_department`;
CREATE TABLE `dicts_department`  (
  `code` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `short_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `parent` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `level` int(11) NULL DEFAULT NULL,
  `used` tinyint(1) NOT NULL,
  `szdwh` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for discipline_discipline
-- ----------------------------
DROP TABLE IF EXISTS `discipline_discipline`;
CREATE TABLE `discipline_discipline`  (
  `code` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `upcode_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `name` varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `name_en` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `name_formal` varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `is_pro` tinyint(1) NOT NULL,
  PRIMARY KEY (`code`) USING BTREE,
  INDEX `discipline_discipline_8f348ef4`(`upcode_id`) USING BTREE,
  CONSTRAINT `discipline_discipline_ibfk_1` FOREIGN KEY (`upcode_id`) REFERENCES `discipline_discipline` (`code`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for interships_admins
-- ----------------------------
DROP TABLE IF EXISTS `interships_admins`;
CREATE TABLE `interships_admins`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_code` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `staff_jobnum` varchar(12) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `interships_admins_department_id_0c9a4731_fk_dicts_dep`(`department_code`) USING BTREE,
  INDEX `interships_admins_staff_id_19c44c9c_fk_people_staff_jobnum`(`staff_jobnum`) USING BTREE,
  CONSTRAINT `interships_admins_department_id_0c9a4731_fk_dicts_dep` FOREIGN KEY (`department_code`) REFERENCES `dicts_department` (`code`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `interships_admins_staff_id_19c44c9c_fk_people_staff_jobnum` FOREIGN KEY (`staff_jobnum`) REFERENCES `people_staff` (`jobnum`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 65 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for interships_config
-- ----------------------------
DROP TABLE IF EXISTS `interships_config`;
CREATE TABLE `interships_config`  (
  `id` int(11) NOT NULL,
  `semester` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `used` tinyint(1) NOT NULL,
  `position_start` datetime(6) NOT NULL,
  `position_end` datetime(6) NOT NULL,
  `apply_start` datetime(6) NOT NULL,
  `apply_end` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for interships_position
-- ----------------------------
DROP TABLE IF EXISTS `interships_position`;
CREATE TABLE `interships_position`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `semester` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `types` int(11) NOT NULL,
  `need` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `need_num` int(11) NOT NULL,
  `content` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `address` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `work_time_d` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `work_time_l` int(11) NULL DEFAULT NULL,
  `campus` int(11) NOT NULL,
  `way` int(11) NOT NULL,
  `start_t` date NOT NULL,
  `end_t` date NOT NULL,
  `class_type` int(11) NULL DEFAULT NULL,
  `class_num` int(11) NULL DEFAULT NULL,
  `class_time` int(11) NULL DEFAULT NULL,
  `status` int(11) NOT NULL,
  `audit` int(11) NOT NULL,
  `audit_log` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `department_code` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `staff_jobnum` varchar(12) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `cellphone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `interships_position_department_id_005e023c_fk_dicts_dep`(`department_code`) USING BTREE,
  INDEX `interships_position_staff_id`(`staff_jobnum`) USING BTREE,
  CONSTRAINT `interships_position_department_id_005e023c_fk_dicts_dep` FOREIGN KEY (`department_code`) REFERENCES `dicts_department` (`code`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `interships_position_staff_id` FOREIGN KEY (`staff_jobnum`) REFERENCES `people_staff` (`jobnum`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for interships_stuapply
-- ----------------------------
DROP TABLE IF EXISTS `interships_stuapply`;
CREATE TABLE `interships_stuapply`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_number` varchar(12) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `award_level` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `english` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `computer` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `resume` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `award_ex` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `experiments` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `favor` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `other` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `status` int(11) NOT NULL,
  `audit` int(11) NOT NULL,
  `audit_log` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `position_id` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `interships_stuapply_position_id_b20b3d19_fk_intership`(`position_id`) USING BTREE,
  INDEX `interships_stuapply_census`(`student_number`) USING BTREE,
  CONSTRAINT `interships_stuapply_position_id_b20b3d19_fk_intership` FOREIGN KEY (`position_id`) REFERENCES `interships_position` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `interships_stuapply_student_number` FOREIGN KEY (`student_number`) REFERENCES `school_census` (`number`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for people_staff
-- ----------------------------
DROP TABLE IF EXISTS `people_staff`;
CREATE TABLE `people_staff`  (
  `jobnum` varchar(12) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `xmjp` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `gender` varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `certificate_type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `idcard` varchar(18) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `birthday` date NULL DEFAULT NULL,
  `nation` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `nationality` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `faction` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `title_code` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `title` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `headship` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `degree_name` varchar(8) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `degree_date` date NULL DEFAULT NULL,
  `education_name` varchar(8) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `department_code` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `department` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `cellphone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `is_school_staff` tinyint(1) NULL DEFAULT NULL,
  PRIMARY KEY (`jobnum`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for school_census
-- ----------------------------
DROP TABLE IF EXISTS `school_census`;
CREATE TABLE `school_census`  (
  `number` varchar(12) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `student_type` int(11) NULL DEFAULT NULL,
  `sex` int(11) NULL DEFAULT NULL,
  `discipline` varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `school_status` varchar(2) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `country_status` varchar(2) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `teacher_name` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `teacher_code` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `teacher2_name` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `teacher2_code` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `of_year` varchar(4) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `is_qrz` tinyint(1) NOT NULL,
  `college_id` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`number`) USING BTREE,
  INDEX `school_census_school_college_id_721c7f94_fk_dicts_col`(`college_id`) USING BTREE,
  CONSTRAINT `school_census_school_college_id_721c7f94_fk_dicts_col` FOREIGN KEY (`college_id`) REFERENCES `dicts_college` (`code`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
