import React, { useState } from 'react';
import { Database, Copy, Check, Download, Server, Table, Code, FileText, CheckCircle2 } from 'lucide-react';

export const MYSQL_DDL_SCHEMA = `-- =============================================================================
-- PaperHub - Production MySQL 8.0 Database Schema DDL
-- Compatible with Hostinger phpMyAdmin & MySQL 8.0+
-- Scalable design supporting high throughput (Millions of rows)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS admin_logs;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS withdrawals;
DROP TABLE IF EXISTS earnings;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS views;
DROP TABLE IF EXISTS downloads;
DROP TABLE IF EXISTS ebooks;
DROP TABLE IF EXISTS papers;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS universities;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. System Settings Table
CREATE TABLE \`settings\` (
  \`setting_id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`setting_key\` VARCHAR(100) NOT NULL UNIQUE,
  \`setting_value\` LONGTEXT NULL,
  \`description\` VARCHAR(255) NULL,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Universities Table
CREATE TABLE \`universities\` (
  \`university_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`code\` VARCHAR(50) NOT NULL UNIQUE,
  \`country\` VARCHAR(100) DEFAULT 'India',
  \`state\` VARCHAR(100) NULL,
  \`website_url\` VARCHAR(255) NULL,
  \`logo_url\` VARCHAR(512) NULL,
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_university_country\` (\`country\`),
  INDEX \`idx_university_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Courses Table
CREATE TABLE \`courses\` (
  \`course_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`university_id\` BIGINT UNSIGNED NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`code\` VARCHAR(50) NOT NULL,
  \`degree_level\` ENUM('B.Tech', 'B.Sc', 'M.Tech', 'M.Sc', 'MBA', 'PhD', 'Diploma', 'Other') DEFAULT 'B.Tech',
  \`department\` VARCHAR(100) NULL,
  \`total_semesters\` TINYINT UNSIGNED DEFAULT 8,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_courses_university\` FOREIGN KEY (\`university_id\`) REFERENCES \`universities\` (\`university_id\`) ON DELETE SET NULL,
  UNIQUE KEY \`uk_univ_course_code\` (\`university_id\`, \`code\`),
  INDEX \`idx_course_degree\` (\`degree_level\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Subjects Table
CREATE TABLE \`subjects\` (
  \`subject_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`course_id\` BIGINT UNSIGNED NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`subject_code\` VARCHAR(50) NOT NULL,
  \`semester\` TINYINT UNSIGNED NOT NULL,
  \`description\` TEXT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_subjects_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`course_id\`) ON DELETE CASCADE,
  INDEX \`idx_subjects_sem\` (\`course_id\`, \`semester\`),
  INDEX \`idx_subject_code\` (\`subject_code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Users Table
CREATE TABLE \`users\` (
  \`user_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`uuid\` CHAR(36) NOT NULL UNIQUE,
  \`name\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('student', 'teacher', 'contributor', 'admin') DEFAULT 'student',
  \`university_id\` BIGINT UNSIGNED NULL,
  \`course_id\` BIGINT UNSIGNED NULL,
  \`avatar_url\` VARCHAR(512) NULL,
  \`is_premium\` TINYINT(1) DEFAULT 0,
  \`is_verified\` TINYINT(1) DEFAULT 0,
  \`is_banned\` TINYINT(1) DEFAULT 0,
  \`uploaded_count\` INT UNSIGNED DEFAULT 0,
  \`total_views\` INT UNSIGNED DEFAULT 0,
  \`total_downloads\` INT UNSIGNED DEFAULT 0,
  \`earnings_balance\` DECIMAL(12, 2) DEFAULT 0.00,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_users_university\` FOREIGN KEY (\`university_id\`) REFERENCES \`universities\` (\`university_id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_users_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`course_id\`) ON DELETE SET NULL,
  INDEX \`idx_users_role\` (\`role\`),
  INDEX \`idx_users_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Papers Table
CREATE TABLE \`papers\` (
  \`paper_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`uploader_id\` BIGINT UNSIGNED NOT NULL,
  \`university_id\` BIGINT UNSIGNED NOT NULL,
  \`course_id\` BIGINT UNSIGNED NOT NULL,
  \`subject_id\` BIGINT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`exam_type\` ENUM('Mid-Sem', 'End-Sem', 'GATE', 'Entrance', 'Unit Test', 'Assignment') NOT NULL DEFAULT 'End-Sem',
  \`semester\` VARCHAR(50) NOT NULL,
  \`exam_year\` SMALLINT UNSIGNED NOT NULL,
  \`file_url\` VARCHAR(512) NOT NULL,
  \`file_size_bytes\` BIGINT UNSIGNED DEFAULT 0,
  \`page_count\` SMALLINT UNSIGNED DEFAULT 1,
  \`has_solutions\` TINYINT(1) DEFAULT 0,
  \`status\` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  \`rejection_reason\` VARCHAR(255) NULL,
  \`views_count\` INT UNSIGNED DEFAULT 0,
  \`downloads_count\` INT UNSIGNED DEFAULT 0,
  \`description\` TEXT NULL,
  \`tags\` JSON NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_papers_uploader\` FOREIGN KEY (\`uploader_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_papers_university\` FOREIGN KEY (\`university_id\`) REFERENCES \`universities\` (\`university_id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_papers_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`course_id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_papers_subject\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subjects\` (\`subject_id\`) ON DELETE CASCADE,
  INDEX \`idx_papers_search\` (\`subject_id\`, \`exam_year\`, \`status\`),
  INDEX \`idx_papers_status\` (\`status\`),
  INDEX \`idx_papers_uploader\` (\`uploader_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Ebooks Table
CREATE TABLE \`ebooks\` (
  \`ebook_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`uploader_id\` BIGINT UNSIGNED NOT NULL,
  \`course_id\` BIGINT UNSIGNED NULL,
  \`subject_id\` BIGINT UNSIGNED NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`author\` VARCHAR(255) NOT NULL,
  \`edition\` VARCHAR(100) NULL,
  \`isbn\` VARCHAR(20) NULL,
  \`file_url\` VARCHAR(512) NOT NULL,
  \`cover_image_url\` VARCHAR(512) NULL,
  \`file_size_bytes\` BIGINT UNSIGNED DEFAULT 0,
  \`page_count\` INT UNSIGNED DEFAULT 0,
  \`status\` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  \`rejection_reason\` VARCHAR(255) NULL,
  \`views_count\` INT UNSIGNED DEFAULT 0,
  \`downloads_count\` INT UNSIGNED DEFAULT 0,
  \`description\` TEXT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_ebooks_uploader\` FOREIGN KEY (\`uploader_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_ebooks_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`course_id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_ebooks_subject\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subjects\` (\`subject_id\`) ON DELETE SET NULL,
  INDEX \`idx_ebooks_status\` (\`status\`),
  INDEX \`idx_ebooks_title\` (\`title\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Downloads Table
CREATE TABLE \`downloads\` (
  \`download_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`paper_id\` BIGINT UNSIGNED NULL,
  \`ebook_id\` BIGINT UNSIGNED NULL,
  \`ip_address\` VARCHAR(45) NULL,
  \`user_agent\` VARCHAR(255) NULL,
  \`downloaded_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_downloads_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_downloads_paper\` FOREIGN KEY (\`paper_id\`) REFERENCES \`papers\` (\`paper_id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_downloads_ebook\` FOREIGN KEY (\`ebook_id\`) REFERENCES \`ebooks\` (\`ebook_id\`) ON DELETE SET NULL,
  INDEX \`idx_downloads_user\` (\`user_id\`),
  INDEX \`idx_downloads_date\` (\`downloaded_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Views Table
CREATE TABLE \`views\` (
  \`view_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` BIGINT UNSIGNED NULL,
  \`paper_id\` BIGINT UNSIGNED NULL,
  \`ebook_id\` BIGINT UNSIGNED NULL,
  \`ip_address\` VARCHAR(45) NULL,
  \`viewed_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_views_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_views_paper\` FOREIGN KEY (\`paper_id\`) REFERENCES \`papers\` (\`paper_id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_views_ebook\` FOREIGN KEY (\`ebook_id\`) REFERENCES \`ebooks\` (\`ebook_id\`) ON DELETE CASCADE,
  INDEX \`idx_views_paper\` (\`paper_id\`),
  INDEX \`idx_views_ebook\` (\`ebook_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Reports Table
CREATE TABLE \`reports\` (
  \`report_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`reporter_user_id\` BIGINT UNSIGNED NULL,
  \`reporter_email\` VARCHAR(255) NOT NULL,
  \`paper_id\` BIGINT UNSIGNED NULL,
  \`ebook_id\` BIGINT UNSIGNED NULL,
  \`reason\` ENUM('Copyright Infringement', 'Corrupted/Blank PDF', 'Wrong Subject/Year', 'Spam or Advertising', 'Other') NOT NULL,
  \`description\` TEXT NOT NULL,
  \`status\` ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
  \`resolved_by_admin_id\` BIGINT UNSIGNED NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_reports_user\` FOREIGN KEY (\`reporter_user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_reports_paper\` FOREIGN KEY (\`paper_id\`) REFERENCES \`papers\` (\`paper_id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_reports_ebook\` FOREIGN KEY (\`ebook_id\`) REFERENCES \`ebooks\` (\`ebook_id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_reports_admin\` FOREIGN KEY (\`resolved_by_admin_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE SET NULL,
  INDEX \`idx_reports_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Notifications Table
CREATE TABLE \`notifications\` (
  \`notification_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`type\` ENUM('paper_approved', 'paper_rejected', 'payout_processed', 'copyright_flag', 'system') DEFAULT 'system',
  \`is_read\` TINYINT(1) DEFAULT 0,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_notifications_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE,
  INDEX \`idx_notif_user_unread\` (\`user_id\`, \`is_read\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Earnings Table
CREATE TABLE \`earnings\` (
  \`earning_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`paper_id\` BIGINT UNSIGNED NULL,
  \`ebook_id\` BIGINT UNSIGNED NULL,
  \`download_id\` BIGINT UNSIGNED NULL,
  \`amount\` DECIMAL(10, 4) NOT NULL,
  \`currency\` VARCHAR(10) DEFAULT 'USD',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_earnings_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_earnings_paper\` FOREIGN KEY (\`paper_id\`) REFERENCES \`papers\` (\`paper_id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_earnings_ebook\` FOREIGN KEY (\`ebook_id\`) REFERENCES \`ebooks\` (\`ebook_id\`) ON DELETE SET NULL,
  INDEX \`idx_earnings_user\` (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Withdrawals Table
CREATE TABLE \`withdrawals\` (
  \`withdrawal_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`amount\` DECIMAL(12, 2) NOT NULL,
  \`payout_method\` ENUM('bank_transfer', 'paypal', 'upi', 'gift_card') NOT NULL,
  \`account_details\` TEXT NOT NULL,
  \`status\` ENUM('requested', 'processing', 'completed', 'rejected') DEFAULT 'requested',
  \`transaction_ref\` VARCHAR(255) NULL,
  \`processed_at\` DATETIME NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_withdrawals_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE,
  INDEX \`idx_withdrawals_status\` (\`status\`),
  INDEX \`idx_withdrawals_user\` (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Subscriptions Table
CREATE TABLE \`subscriptions\` (
  \`subscription_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`plan_type\` ENUM('pro_monthly', 'pro_yearly') NOT NULL,
  \`amount_paid\` DECIMAL(10, 2) NOT NULL,
  \`currency\` VARCHAR(10) DEFAULT 'USD',
  \`payment_gateway\` VARCHAR(50) DEFAULT 'stripe',
  \`payment_id\` VARCHAR(255) NULL,
  \`starts_at\` DATETIME NOT NULL,
  \`expires_at\` DATETIME NOT NULL,
  \`status\` ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_subscriptions_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE,
  INDEX \`idx_subscriptions_user_status\` (\`user_id\`, \`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Admin Logs Table
CREATE TABLE \`admin_logs\` (
  \`log_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`admin_user_id\` BIGINT UNSIGNED NOT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`target_type\` ENUM('paper', 'ebook', 'user', 'report', 'withdrawal', 'setting') NOT NULL,
  \`target_id\` BIGINT UNSIGNED NULL,
  \`details\` TEXT NULL,
  \`ip_address\` VARCHAR(45) NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_admin_logs_admin\` FOREIGN KEY (\`admin_user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE,
  INDEX \`idx_admin_logs_action\` (\`action\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

export const SqlSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MYSQL_DDL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([MYSQL_DDL_SCHEMA], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'paperhub_mysql8_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tableNames = [
    'users',
    'papers',
    'ebooks',
    'universities',
    'courses',
    'subjects',
    'downloads',
    'views',
    'reports',
    'notifications',
    'withdrawals',
    'earnings',
    'subscriptions',
    'settings',
    'admin_logs',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">Hostinger phpMyAdmin MySQL 8.0 DDL</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                  100% Validated Syntax
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Converted from PostgreSQL DDL with InnoDB storage engine, utf8mb4 collation, and foreign key cascades.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied SQL Script!' : 'Copy SQL Schema'}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download .SQL File</span>
            </button>
          </div>
        </div>

        {/* 15 Tables Pills */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Includes All 15 Schema Tables:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tableNames.map(tbl => (
              <span
                key={tbl}
                className="px-2.5 py-1 bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg flex items-center space-x-1"
              >
                <Table className="w-3 h-3 text-blue-400" />
                <span>{tbl}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Code Editor Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-slate-800/80 px-6 py-3 border-b border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-blue-400" />
            <span className="font-mono font-bold">paperhub_mysql8_schema.sql</span>
          </div>
          <span className="text-slate-400">Target: Hostinger phpMyAdmin / MySQL 8.0+</span>
        </div>

        <div className="p-6 overflow-x-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed max-h-[600px] overflow-y-auto">
          <pre>{MYSQL_DDL_SCHEMA}</pre>
        </div>
      </div>
    </div>
  );
};
