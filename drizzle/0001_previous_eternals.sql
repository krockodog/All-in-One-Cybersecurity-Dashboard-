CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`resource` varchar(255),
	`details` json DEFAULT ('{}'),
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`clientId` int NOT NULL,
	`pentesterId` int NOT NULL,
	`description` text,
	`status` enum('planning','active','paused','completed','archived') DEFAULT 'planning',
	`startDate` timestamp,
	`endDate` timestamp,
	`authorizationDocument` text,
	`authorizationExpires` timestamp,
	`scope` json,
	`budget` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engagements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `executionJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`phase` enum('osint','recon','pentest','post_exploitation','reporting') NOT NULL,
	`tool` varchar(255) NOT NULL,
	`target` varchar(255) NOT NULL,
	`parameters` json DEFAULT ('{}'),
	`status` enum('queued','running','success','error','cancelled') DEFAULT 'queued',
	`output` text,
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`durationMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `executionJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `findings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`engagementId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`severity` enum('critical','high','medium','low','info') NOT NULL,
	`cvss` decimal(3,1),
	`cve` varchar(50),
	`evidence` text,
	`remediation` text,
	`status` enum('open','in_progress','resolved','false_positive') DEFAULT 'open',
	`aiAnalysis` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `findings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`engagementId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`executiveSummary` text,
	`findings` json DEFAULT ('[]'),
	`recommendations` text,
	`reportFormat` enum('pdf','html','json','docx') DEFAULT 'pdf',
	`generatedAt` timestamp,
	`generatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `toolCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tool` varchar(255) NOT NULL,
	`credentialType` varchar(255) NOT NULL,
	`encryptedValue` text NOT NULL,
	`isActive` boolean DEFAULT true,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `toolCredentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `engagementIdx` ON `auditLog` (`engagementId`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `auditLog` (`userId`);--> statement-breakpoint
CREATE INDEX `actionIdx` ON `auditLog` (`action`);--> statement-breakpoint
CREATE INDEX `clientIdx` ON `engagements` (`clientId`);--> statement-breakpoint
CREATE INDEX `pentesterIdx` ON `engagements` (`pentesterId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `engagements` (`status`);--> statement-breakpoint
CREATE INDEX `engagementIdx` ON `executionJobs` (`engagementId`);--> statement-breakpoint
CREATE INDEX `phaseIdx` ON `executionJobs` (`phase`);--> statement-breakpoint
CREATE INDEX `toolIdx` ON `executionJobs` (`tool`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `executionJobs` (`status`);--> statement-breakpoint
CREATE INDEX `jobIdx` ON `findings` (`jobId`);--> statement-breakpoint
CREATE INDEX `engagementIdx` ON `findings` (`engagementId`);--> statement-breakpoint
CREATE INDEX `severityIdx` ON `findings` (`severity`);--> statement-breakpoint
CREATE INDEX `cveIdx` ON `findings` (`cve`);--> statement-breakpoint
CREATE INDEX `engagementIdx` ON `reports` (`engagementId`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `toolCredentials` (`userId`);--> statement-breakpoint
CREATE INDEX `toolIdx` ON `toolCredentials` (`tool`);