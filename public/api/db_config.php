<?php
// Hostinger MySQL Databases Configuration
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. User Database (u913393473_users)
$USER_DB_HOST = getenv('DB_USER_HOST') ?: 'localhost';
$USER_DB_NAME = getenv('DB_USER_NAME') ?: 'u913393473_users';
$USER_DB_USER = getenv('DB_USER_USER') ?: 'u913393473_user_admin';
$USER_DB_PASS = getenv('DB_USER_PASSWORD') ?: '';

// 2. Admin Database (u913393473_admin)
$ADMIN_DB_HOST = getenv('DB_ADMIN_HOST') ?: 'localhost';
$ADMIN_DB_NAME = getenv('DB_ADMIN_NAME') ?: 'u913393473_admin';
$ADMIN_DB_USER = getenv('DB_ADMIN_USER') ?: 'u913393473_admin_user';
$ADMIN_DB_PASS = getenv('DB_ADMIN_PASSWORD') ?: '';

// 3. Paper Database (u913393473_papers)
$PAPERS_DB_HOST = getenv('DB_PAPERS_HOST') ?: 'localhost';
$PAPERS_DB_NAME = getenv('DB_PAPERS_NAME') ?: 'u913393473_papers';
$PAPERS_DB_USER = getenv('DB_PAPERS_USER') ?: 'u913393473_paper_user';
$PAPERS_DB_PASS = getenv('DB_PAPERS_PASSWORD') ?: '';

function getUserDb() {
    global $USER_DB_HOST, $USER_DB_NAME, $USER_DB_USER, $USER_DB_PASS;
    try {
        $pdo = new PDO("mysql:host=$USER_DB_HOST;dbname=$USER_DB_NAME;charset=utf8mb4", $USER_DB_USER, $USER_DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (Exception $e) {
        return null;
    }
}

function getAdminDb() {
    global $ADMIN_DB_HOST, $ADMIN_DB_NAME, $ADMIN_DB_USER, $ADMIN_DB_PASS;
    try {
        $pdo = new PDO("mysql:host=$ADMIN_DB_HOST;dbname=$ADMIN_DB_NAME;charset=utf8mb4", $ADMIN_DB_USER, $ADMIN_DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (Exception $e) {
        return null;
    }
}

function getPapersDb() {
    global $PAPERS_DB_HOST, $PAPERS_DB_NAME, $PAPERS_DB_USER, $PAPERS_DB_PASS;
    try {
        $pdo = new PDO("mysql:host=$PAPERS_DB_HOST;dbname=$PAPERS_DB_NAME;charset=utf8mb4", $PAPERS_DB_USER, $PAPERS_DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (Exception $e) {
        return null;
    }
}
