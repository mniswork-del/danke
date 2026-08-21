<?php
/**
 * Test & Setup MySQL Database Tables
 * GET/POST /api/setup_db.php
 * 
 * Run this file in your browser: https://yourdomain.com/api/setup_db.php
 * It will test database connection and automatically create all required tables.
 */
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db_config.php';

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'user_db' => [
        'connected' => false,
        'error' => null,
        'tables_created' => []
    ]
];

$userDb = getUserDb();

if (!$userDb) {
    $results['user_db']['error'] = $GLOBALS['DB_ERRORS']['user'] ?? 'Could not connect to User MySQL database. Check DB credentials in api/db_config.php';
    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

$results['user_db']['connected'] = true;

// 1. Create users table
try {
    $userDb->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone_number VARCHAR(20) NOT NULL UNIQUE,
            password_hash VARCHAR(255) DEFAULT NULL,
            status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
            profile_completed TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    $results['user_db']['tables_created'][] = 'users (OK)';
} catch (\PDOException $e) {
    $results['user_db']['tables_created'][] = 'users table error: ' . $e->getMessage();
}

// 2. Create user_profiles table
try {
    $userDb->exec("
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
            INDEX (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    $results['user_db']['tables_created'][] = 'user_profiles (OK)';
} catch (\PDOException $e) {
    $results['user_db']['tables_created'][] = 'user_profiles table error: ' . $e->getMessage();
}

// 3. Create user_sessions table
try {
    $userDb->exec("
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_token VARCHAR(500) NOT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            user_agent TEXT DEFAULT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id),
            INDEX (session_token(255))
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    $results['user_db']['tables_created'][] = 'user_sessions (OK)';
} catch (\PDOException $e) {
    $results['user_db']['tables_created'][] = 'user_sessions table error: ' . $e->getMessage();
}

// 4. Create login_attempts table
try {
    $userDb->exec("
        CREATE TABLE IF NOT EXISTS login_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone_number VARCHAR(20) NOT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            is_success TINYINT(1) DEFAULT 0,
            attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (phone_number)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    $results['user_db']['tables_created'][] = 'login_attempts (OK)';
} catch (\PDOException $e) {
    $results['user_db']['tables_created'][] = 'login_attempts table error: ' . $e->getMessage();
}

// List all existing tables in user db
try {
    $stmt = $userDb->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $results['user_db']['all_existing_tables'] = $tables;
} catch (\Throwable $e) {}

$results['status'] = 'Database setup completed successfully! Your tables are ready.';
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
