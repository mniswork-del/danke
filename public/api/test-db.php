<?php
/**
 * Test connectivity to all 3 Hostinger MySQL databases
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db_config.php';

$results = [
    'user_database' => [
        'database' => $USER_DB_NAME,
        'user' => $USER_DB_USER,
        'host' => $USER_DB_HOST,
        'connected' => false,
        'error' => null
    ],
    'admin_database' => [
        'database' => $ADMIN_DB_NAME,
        'user' => $ADMIN_DB_USER,
        'host' => $ADMIN_DB_HOST,
        'connected' => false,
        'error' => null
    ],
    'papers_database' => [
        'database' => $PAPERS_DB_NAME,
        'user' => $PAPERS_DB_USER,
        'host' => $PAPERS_DB_HOST,
        'connected' => false,
        'error' => null
    ],
    'php_version' => PHP_VERSION,
    'pdo_mysql_enabled' => extension_loaded('pdo_mysql'),
    'timestamp' => date('Y-m-d H:i:s')
];

// Test User DB
$uDb = getUserDb();
if ($uDb) {
    $results['user_database']['connected'] = true;
} else {
    $results['user_database']['error'] = $GLOBALS['DB_ERRORS']['user'] ?: 'Unable to establish PDO connection to User database. Check DB_USER_PASSWORD or user permissions.';
}

// Test Admin DB
$aDb = getAdminDb();
if ($aDb) {
    $results['admin_database']['connected'] = true;
} else {
    $results['admin_database']['error'] = $GLOBALS['DB_ERRORS']['admin'] ?: 'Unable to establish PDO connection to Admin database.';
}

// Test Papers DB
$pDb = getPapersDb();
if ($pDb) {
    $results['papers_database']['connected'] = true;
} else {
    $results['papers_database']['error'] = $GLOBALS['DB_ERRORS']['papers'] ?: 'Unable to establish PDO connection to Papers database.';
}

send_json_response([
    'status' => ($results['user_database']['connected'] && $results['admin_database']['connected'] && $results['papers_database']['connected']) ? 'healthy' : 'partial_or_offline',
    'databases' => $results
]);

