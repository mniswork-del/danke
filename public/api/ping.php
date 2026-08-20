<?php
// Simple single-file test with no includes or external dependencies
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$response = [
    'status' => 'online',
    'message' => 'PHP is executing properly on Hostinger!',
    'php_version' => PHP_VERSION,
    'loaded_extensions' => [
        'pdo' => extension_loaded('pdo'),
        'pdo_mysql' => extension_loaded('pdo_mysql'),
        'mysqli' => extension_loaded('mysqli'),
        'json' => extension_loaded('json')
    ],
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? '',
    'time' => date('Y-m-d H:i:s')
];

// Test MySQL connectivity if credentials provided or check localhost default
$db_host = 'localhost';
$db_name = 'u913393473_users';
$db_user = 'u913393473_user_admin';
$db_pass = 'Admin98@'; // Default or change to your Hostinger MySQL password

try {
    $dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5
    ]);
    $response['database_test'] = [
        'connected' => true,
        'database' => $db_name,
        'message' => 'MySQL connected successfully!'
    ];
} catch (\Throwable $e) {
    $response['database_test'] = [
        'connected' => false,
        'database' => $db_name,
        'error_message' => $e->getMessage()
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
