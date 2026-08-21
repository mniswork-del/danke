<?php
/**
 * UniversityTree Live Database Write & Read Verification Test
 * Path: public/api/verify-save.php (Accessible at https://yourdomain.com/api/verify-save.php)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Load configuration
require_once __DIR__ . '/db_config.php';

$response = [
    'status' => 'PENDING',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_environment' => [
        'php_version' => PHP_VERSION,
        'db_user_host' => $USER_DB_HOST,
        'db_user_name' => $USER_DB_NAME,
        'db_user_user' => $USER_DB_USER,
    ],
    'tests' => []
];

try {
    // TEST 1: Database Connection
    $pdo = getUserDb();
    if (!$pdo) {
        throw new Exception("Database connection failed. Check db_config.php credentials or Hostinger Remote MySQL settings.");
    }
    
    $response['tests']['1_connection'] = [
        'status' => 'SUCCESS',
        'message' => 'Successfully connected to Hostinger MySQL Database!'
    ];

    // TEST 2: Ensure Tables Exist
    ensureUserTables($pdo);
    $response['tests']['2_tables'] = [
        'status' => 'SUCCESS',
        'message' => 'Tables `users` and `user_profiles` are verified and exist.'
    ];

    // TEST 3: Perform a LIVE WRITE into `users` table
    $testMobile = '99999' . rand(10000, 99999);
    $testName = 'Test Student ' . rand(100, 999);
    
    $stmtUser = $pdo->prepare("
        INSERT INTO users (phone_number, password_hash, status, profile_completed, created_at)
        VALUES (?, ?, 'active', 1, NOW())
    ");
    $stmtUser->execute([$testMobile, password_hash('test1234', PASSWORD_BCRYPT)]);
    $newUserId = (int)$pdo->lastInsertId();

    $response['tests']['3_insert_user'] = [
        'status' => 'SUCCESS',
        'message' => "Successfully INSERTED new user row into `users` table!",
        'inserted_user_id' => $newUserId,
        'phone_number' => $testMobile
    ];

    // TEST 4: Perform a LIVE WRITE into `user_profiles` table
    $stmtProfile = $pdo->prepare("
        INSERT INTO user_profiles (user_id, full_name, email, university, college, course, semester, year, city, state, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), updated_at = NOW()
    ");
    $testEmail = 'test_' . $newUserId . '@universitytree.in';
    $stmtProfile->execute([
        $newUserId,
        $testName,
        $testEmail,
        'Dr. A.P.J. Abdul Kalam Technical University (AKTU)',
        'Test Engineering College',
        'B.Tech CSE',
        'Semester 4',
        '2nd Year',
        'Lucknow',
        'Uttar Pradesh'
    ]);

    $response['tests']['4_insert_profile'] = [
        'status' => 'SUCCESS',
        'message' => "Successfully INSERTED / UPDATED student profile row into `user_profiles` table!",
        'full_name' => $testName,
        'email' => $testEmail
    ];

    // TEST 5: READ back the saved record from Hostinger database to 100% verify
    $readStmt = $pdo->prepare("
        SELECT u.id, u.phone_number, u.status, u.profile_completed, p.full_name, p.email, p.university, p.course, p.created_at
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.id = ?
        LIMIT 1
    ");
    $readStmt->execute([$newUserId]);
    $savedRecord = $readStmt->fetch();

    if ($savedRecord && $savedRecord['phone_number'] === $testMobile) {
        $response['tests']['5_read_back_verification'] = [
            'status' => 'SUCCESS',
            'message' => 'Verified: Data was read back from the Hostinger MySQL database successfully!',
            'live_database_record' => $savedRecord
        ];
    } else {
        throw new Exception("Write succeeded but immediate read-back failed.");
    }

    // TEST 6: Count total registered users in Hostinger database
    $countStmt = $pdo->query("SELECT COUNT(*) as total_users FROM users");
    $totalCount = $countStmt->fetchColumn();

    $response['tests']['6_total_db_records'] = [
        'status' => 'SUCCESS',
        'total_registered_users_in_db' => (int)$totalCount
    ];

    $response['status'] = 'ALL_DATABASE_WRITES_WORKING_PERFECTLY';
    $response['final_verdict'] = '✅ DATABASE SAVE KAAM KAR RAHA HAI! Hostinger database me direct insert, update aur read 100% successful hai.';

    http_response_code(200);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    $response['status'] = 'DATABASE_ERROR';
    $response['error_message'] = $e->getMessage();
    $response['final_verdict'] = '❌ DATABASE SAVE FAILED: ' . $e->getMessage();
    
    http_response_code(500);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}
