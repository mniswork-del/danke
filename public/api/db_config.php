<?php
// Hostinger MySQL Databases Configuration
ini_set('display_errors', 0);
error_reporting(E_ALL);

$GLOBALS['DB_ERRORS'] = [
    'user' => null,
    'admin' => null,
    'papers' => null
];

// Helper to auto-load .env file from common server locations
function loadEnvFromDisk() {
    $possiblePaths = [
        __DIR__ . '/../../.env',
        __DIR__ . '/../.env',
        __DIR__ . '/.env',
        isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] . '/.env' : null,
        isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] . '/../.env' : null,
    ];

    foreach ($possiblePaths as $path) {
        if ($path && file_exists($path) && is_readable($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines !== false) {
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line) || $line[0] === '#') continue;
                    $parts = explode('=', $line, 2);
                    if (count($parts) === 2) {
                        $key = trim($parts[0]);
                        $val = trim($parts[1], " \t\n\r\0\x0B\"'");
                        if (!getenv($key) && !isset($_ENV[$key])) {
                            putenv("$key=$val");
                            $_ENV[$key] = $val;
                            $_SERVER[$key] = $val;
                        }
                    }
                }
                break;
            }
        }
    }
}
loadEnvFromDisk();

function getEnvVar($key, $fallback = '') {
    $val = getenv($key);
    if ($val !== false && $val !== '') return $val;
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
    return $fallback;
}

// 1. User Database (u913393473_users)
$USER_DB_HOST = getEnvVar('DB_USER_HOST', getEnvVar('DB_HOST', 'localhost'));
$USER_DB_PORT = getEnvVar('DB_USER_PORT', getEnvVar('DB_PORT', '3306'));
$USER_DB_NAME = getEnvVar('DB_USER_NAME', getEnvVar('DB_NAME', 'u913393473_users'));
$USER_DB_USER = getEnvVar('DB_USER_USER', getEnvVar('DB_USER', 'u913393473_user_admin'));
$USER_DB_PASS = getEnvVar('DB_USER_PASSWORD', getEnvVar('DB_PASSWORD', 'Admin98@'));

// 2. Admin Database (u913393473_admin)
$ADMIN_DB_HOST = getEnvVar('DB_ADMIN_HOST', getEnvVar('DB_HOST', 'localhost'));
$ADMIN_DB_PORT = getEnvVar('DB_ADMIN_PORT', getEnvVar('DB_PORT', '3306'));
$ADMIN_DB_NAME = getEnvVar('DB_ADMIN_NAME', 'u913393473_admin');
$ADMIN_DB_USER = getEnvVar('DB_ADMIN_USER', getEnvVar('DB_USER', 'u913393473_admin_user'));
$ADMIN_DB_PASS = getEnvVar('DB_ADMIN_PASSWORD', getEnvVar('DB_PASSWORD', 'Admin98@'));

// 3. Paper Database (u913393473_papers)
$PAPERS_DB_HOST = getEnvVar('DB_PAPERS_HOST', getEnvVar('DB_HOST', 'localhost'));
$PAPERS_DB_PORT = getEnvVar('DB_PAPERS_PORT', getEnvVar('DB_PORT', '3306'));
$PAPERS_DB_NAME = getEnvVar('DB_PAPERS_NAME', 'u913393473_papers');
$PAPERS_DB_USER = getEnvVar('DB_PAPERS_USER', getEnvVar('DB_USER', 'u913393473_paper_user'));
$PAPERS_DB_PASS = getEnvVar('DB_PAPERS_PASSWORD', getEnvVar('DB_PASSWORD', 'Admin98@'));

function createPdoConnection($host, $port, $dbname, $user, $pass) {
    $hostsToTry = [$host];
    if ($host === 'localhost') $hostsToTry[] = '127.0.0.1';
    if ($host === '127.0.0.1') $hostsToTry[] = 'localhost';

    $lastErr = null;
    foreach ($hostsToTry as $h) {
        try {
            $dsn = "mysql:host=$h;port=$port;dbname=$dbname;charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 5
            ]);
            return $pdo;
        } catch (\Throwable $e) {
            $lastErr = $e->getMessage();
        }
    }
    throw new \Exception($lastErr ?: "Could not connect to database $dbname on $host");
}

function getUserDb() {
    global $USER_DB_HOST, $USER_DB_PORT, $USER_DB_NAME, $USER_DB_USER, $USER_DB_PASS;
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $pdo = createPdoConnection($USER_DB_HOST, $USER_DB_PORT, $USER_DB_NAME, $USER_DB_USER, $USER_DB_PASS);
        ensureUserTables($pdo);
        return $pdo;
    } catch (\Throwable $e) {
        $GLOBALS['DB_ERRORS']['user'] = $e->getMessage();
        return null;
    }
}

function getAdminDb() {
    global $ADMIN_DB_HOST, $ADMIN_DB_PORT, $ADMIN_DB_NAME, $ADMIN_DB_USER, $ADMIN_DB_PASS;
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $pdo = createPdoConnection($ADMIN_DB_HOST, $ADMIN_DB_PORT, $ADMIN_DB_NAME, $ADMIN_DB_USER, $ADMIN_DB_PASS);
        return $pdo;
    } catch (\Throwable $e) {
        $GLOBALS['DB_ERRORS']['admin'] = $e->getMessage();
        return null;
    }
}

function getPapersDb() {
    global $PAPERS_DB_HOST, $PAPERS_DB_PORT, $PAPERS_DB_NAME, $PAPERS_DB_USER, $PAPERS_DB_PASS;
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $pdo = createPdoConnection($PAPERS_DB_HOST, $PAPERS_DB_PORT, $PAPERS_DB_NAME, $PAPERS_DB_USER, $PAPERS_DB_PASS);
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

