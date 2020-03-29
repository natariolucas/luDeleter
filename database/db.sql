/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 5.7.17 : Database - tweets_story
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`tweets_story` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `tweets_story`;

/*Table structure for table `Users` */

DROP TABLE IF EXISTS `Users`;

CREATE TABLE `Users` (
  `Id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `Username` varchar(16) NOT NULL,
  `Password` varchar(60) NOT NULL,
  `Fullname` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

/*Table structure for table `UsersTwitterAccounts` */

DROP TABLE IF EXISTS `UsersTwitterAccounts`;

CREATE TABLE `UsersTwitterAccounts` (
  `Id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `IdUser` int(11) unsigned NOT NULL,
  `IdAccountApiTwitter` longtext NOT NULL,
  `Token` longtext,
  `TokenSecret` longtext,
  `Username` varchar(255) NOT NULL,
  `Displayname` varchar(255) NOT NULL,
  `MinutesToDelete` smallint(2) unsigned NOT NULL DEFAULT '1',
  `AllowToListen` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `ReplyTweets` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `IdStatus` smallint(2) unsigned NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `IdUser` (`IdUser`),
  KEY `IdStatus` (`IdStatus`),
  CONSTRAINT `userstwitteraccounts_ibfk_1` FOREIGN KEY (`IdStatus`) REFERENCES `UsersTwitterAccountsStatuses` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

/*Table structure for table `UsersTwitterAccountsStatuses` */

DROP TABLE IF EXISTS `UsersTwitterAccountsStatuses`;

CREATE TABLE `UsersTwitterAccountsStatuses` (
  `Id` smallint(2) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*Table structure for table `UsersTwitterAccountsTweets` */

DROP TABLE IF EXISTS `UsersTwitterAccountsTweets`;

CREATE TABLE `UsersTwitterAccountsTweets` (
  `Id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `IdUserTwitterAccountTweetFather` int(11) unsigned DEFAULT NULL,
  `IdUser` int(11) unsigned NOT NULL,
  `IdUserTwitterAccount` int(11) unsigned NOT NULL,
  `IdTweetApiTwitter` varchar(255) NOT NULL,
  `Text` text NOT NULL,
  `IdStatus` smallint(2) unsigned NOT NULL,
  `MinutesToDelete` smallint(2) unsigned NOT NULL DEFAULT '1',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `IdTweetApiTwitter` (`IdTweetApiTwitter`),
  KEY `IdUser` (`IdUser`,`IdUserTwitterAccount`),
  KEY `IdStatus` (`IdStatus`),
  KEY `IdUserTwitterAccountTweetFather` (`IdUserTwitterAccountTweetFather`),
  CONSTRAINT `userstwitteraccountstweets_ibfk_1` FOREIGN KEY (`IdUser`, `IdUserTwitterAccount`) REFERENCES `UsersTwitterAccounts` (`IdUser`, `Id`),
  CONSTRAINT `userstwitteraccountstweets_ibfk_2` FOREIGN KEY (`IdStatus`) REFERENCES `UsersTwitterAccountsTweetsStatuses` (`Id`),
  CONSTRAINT `userstwitteraccountstweets_ibfk_3` FOREIGN KEY (`IdUserTwitterAccountTweetFather`) REFERENCES `UsersTwitterAccountsTweets` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;

/*Table structure for table `UsersTwitterAccountsTweetsStatuses` */

DROP TABLE IF EXISTS `UsersTwitterAccountsTweetsStatuses`;

CREATE TABLE `UsersTwitterAccountsTweetsStatuses` (
  `Id` smallint(2) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*Table structure for table `sessions` */

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
