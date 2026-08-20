<?php
/**
 * Test connectivity to all 3 Hostinger MySQL databases
 */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

// Safe file inclusion with error catching
try {
    if (file_exists(__DIR__ . '/config.php')) {
        require_once __DIR__ . '/config.php';
    }
    if (file_exists(__DIR__ . '/db_config.php')) {
        require_once __DIR__ . '/db_config.php';
    }
} catch (\Throwable $err) {
    echo json_encode([
        'status' => 'error',
        'stage' => 'include_files',
        'message' => $err->getMessage(),
        'file' => $err->getFile(),
        'line' => $err->getLine()
    ], JSON_PRETTY_PRINT);
    exit();
}

$results = [
    'user_database' => [
        'database' => $USER_DB_NAME ?? 'u913393473_users',
        'user' => $USER_DB_USER ?? 'u913393473_user_admin',
        'host' => $USER_DB_HOST ?? 'localhost',
        'connected' => false,
        'error' => null
    ],
    'admin_database' => [
        'database' => $ADMIN_DB_NAME ?? 'u913393473_admin',
        'user' => $ADMIN_DB_USER ?? 'u913393473_admin_user',
        'host' => $ADMIN_DB_HOST ?? 'localhost',
        'connected' => false,
        'error' => null
    ],
    'papers_database' => [
        'database' => $PAPERS_DB_NAME ?? 'u913393473_papers',
        'user' => $PAPERS_DB_USER ?? 'u913393473_paper_user',
        'host' => $PAPERS_DB_HOST ?? 'localhost',
        'connected' => false,
        'error' => null
    ],
    'php_version' => PHP_VERSION,
    'pdo_mysql_enabled' => extension_loaded('pdo_mysql'),
    'timestamp' => date('Y-m-d H:i:s')
];

// Test User DB
if (function_exists('getUserDb')) {
    $uDb = getUserDb();
    if ($uDb) {
        $results['user_database']['connected'] = true;
    } else {
        $results['user_database']['error'] = $GLOBALS['DB_ERRORS']['user'] ?? 'Unable to establish PDO connection to User database. Check DB password in db_config.php.';
    }
}

// Test Admin DB
if (function_exists('getAdminDb')) {
    $aDb = getAdminDb();
    if ($aDb) {
        $results['admin_database']['connected'] = true;
    } else {
        $results['admin_database']['error'] = $GLOBALS['DB_ERRORS']['admin'] ?? 'Unable to establish PDO connection to Admin database.';
    }
}

// Test Papers DB
if (function_exists('getPapersDb')) {
    $pDb = getPapersDb();
    if ($pDb) {
        $results['papers_database']['connected'] = true;
    } else {
        $results['papers_database']['error'] = $GLOBALS['DB_ERRORS']['papers'] ?? 'Unable to establish PDO connection to Papers database.';
    }
}

$allConnected = $results['user_database']['connected'];

echo json_encode([
    'success' => $allConnected,
    'status' => $allConnected ? 'healthy' : 'degraded_or_credentials_required',
    'databases' => $results
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
