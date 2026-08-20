<?php
// Hostinger MySQL Databases Configuration
ini_set('display_errors', 0);
error_reporting(E_ALL);

$GLOBALS['DB_ERRORS'] = [
    'user' => null,
    'admin' => null,
    'papers' => null
];

// 1. User Database (u913393473_users)
$USER_DB_HOST = getenv('DB_USER_HOST') ?: (getenv('DB_HOST') ?: 'localhost');
$USER_DB_NAME = getenv('DB_USER_NAME') ?: 'u913393473_users';
$USER_DB_USER = getenv('DB_USER_USER') ?: (getenv('DB_USER') ?: 'u913393473_user_admin');
$USER_DB_PASS = getenv('DB_USER_PASSWORD') ?: (getenv('DB_PASSWORD') ?: 'Admin98@');

// 2. Admin Database (u913393473_admin)
$ADMIN_DB_HOST = getenv('DB_ADMIN_HOST') ?: (getenv('DB_HOST') ?: 'localhost');
$ADMIN_DB_NAME = getenv('DB_ADMIN_NAME') ?: 'u913393473_admin';
$ADMIN_DB_USER = getenv('DB_ADMIN_USER') ?: (getenv('DB_USER') ?: 'u913393473_admin_user');
$ADMIN_DB_PASS = getenv('DB_ADMIN_PASSWORD') ?: (getenv('DB_PASSWORD') ?: 'Admin98@');

// 3. Paper Database (u913393473_papers)
$PAPERS_DB_HOST = getenv('DB_PAPERS_HOST') ?: (getenv('DB_HOST') ?: 'localhost');
$PAPERS_DB_NAME = getenv('DB_PAPERS_NAME') ?: 'u913393473_papers';
$PAPERS_DB_USER = getenv('DB_PAPERS_USER') ?: (getenv('DB_USER') ?: 'u913393473_paper_user');
$PAPERS_DB_PASS = getenv('DB_PAPERS_PASSWORD') ?: (getenv('DB_PASSWORD') ?: 'Admin98@');

function getUserDb() {
    global $USER_DB_HOST, $USER_DB_NAME, $USER_DB_USER, $USER_DB_PASS;
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $pdo = new PDO("mysql:host=$USER_DB_HOST;dbname=$USER_DB_NAME;charset=utf8mb4", $USER_DB_USER, $USER_DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5
        ]);
        ensureUserTables($pdo);
        return $pdo;
    } catch (\Throwable $e) {
        $GLOBALS['DB_ERRORS']['user'] = $e->getMessage();
        return null;
    }
}

function getAdminDb() {
    global $ADMIN_DB_HOST, $ADMIN_DB_NAME, $ADMIN_DB_USER, $ADMIN_DB_PASS;
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $pdo = new PDO("mysql:host=$ADMIN_DB_HOST;dbname=$ADMIN_DB_NAME;charset=utf8mb4", $ADMIN_DB_USER, $ADMIN_DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5
        ]);
        return $pdo;
    } catch (\Throwable $e) {
        $GLOBALS['DB_ERRORS']['admin'] = $e->getMessage();
        return null;
    }
}

function getPapersDb() {
    global $PAPERS_DB_HOST, $PAPERS_DB_NAME, $PAPERS_DB_USER, $PAPERS_DB_PASS;
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $pdo = new PDO("mysql:host=$PAPERS_DB_HOST;dbname=$PAPERS_DB_NAME;charset=utf8mb4", $PAPERS_DB_USER, $PAPERS_DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5
        ]);
        return $pdo;
    } catch (\Throwable $e) {
        $GLOBALS['DB_ERRORS']['papers'] = $e->getMessage();
        return null;
    }
}

function ensureUserTables($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone_number VARCHAR(20) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
                profile_completed TINYINT(1) DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS user_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                name VARCHAR(100) DEFAULT '',
                profession VARCHAR(100) DEFAULT '',
                address TEXT DEFAULT NULL,
                city VARCHAR(100) DEFAULT '',
                email VARCHAR(150) DEFAULT '',
                age INT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                session_token VARCHAR(500) NOT NULL,
                ip_address VARCHAR(45) DEFAULT NULL,
                user_agent TEXT DEFAULT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS login_attempts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone_number VARCHAR(20) NOT NULL,
                ip_address VARCHAR(45) DEFAULT NULL,
                is_success TINYINT(1) DEFAULT 0,
                attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
    } catch (\Throwable $t) {
        // Tables might already exist or partial permissions
    }
}

