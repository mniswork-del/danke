<?php
/**
 * User Registration API
 * POST /api/auth/register.php
 * Fields: phone_number, password
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error_response('Method not allowed. Use POST.', 405);
}

$input = get_json_input();
$phone = trim($input['phone_number'] ?? '');
$password = trim($input['password'] ?? '');

// Validate phone number (10 digits)
if (empty($phone) || !preg_match('/^[6-9]\d{9}$/', $phone)) {
    send_error_response('Invalid mobile number. Please provide a valid 10-digit Indian phone number.', 422);
}

// Validate password (min 6 chars)
if (empty($password) || strlen($password) < 6) {
    send_error_response('Password must be at least 6 characters long.', 422);
}

$userDb = getUserDb();

if ($userDb) {
    try {
        // Check if user already exists
        $stmt = $userDb->prepare("SELECT id FROM users WHERE phone_number = ? LIMIT 1");
        $stmt->execute([$phone]);
        if ($stmt->fetch()) {
            send_error_response('An account with this mobile number already exists. Please login.', 409);
        }

        // Hash password securely with bcrypt
        $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

        // Insert new user record
        $stmt = $userDb->prepare("INSERT INTO users (phone_number, password_hash, status, profile_completed, created_at) VALUES (?, ?, 'active', 0, NOW())");
        $stmt->execute([$phone, $passwordHash]);
        $userId = $userDb->lastInsertId();

        // Create empty profile record in user_profiles
        $defaultName = 'Student ' . substr($phone, -4);
        $stmt = $userDb->prepare("INSERT INTO user_profiles (user_id, name, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$userId, $defaultName]);

        $userData = [
            'id' => $userId,
            'phone_number' => $phone,
            'status' => 'active',
            'profile_completed' => 0,
            'role' => 'student',
            'created_at' => date('Y-m-d H:i:s'),
            'profile' => [
                'name' => $defaultName,
                'profession' => '',
                'address' => '',
                'city' => '',
                'email' => '',
                'age' => null
            ]
        ];

        // Generate session JWT
        $token = generate_jwt([
            'user_id' => $userId,
            'phone_number' => $phone,
            'role' => 'student'
        ]);

        send_json_response([
            'message' => 'Account registered successfully.',
            'token' => $token,
            'user' => $userData
        ], 201);

    } catch (Exception $e) {
        send_error_response('Registration failed due to a database error. Please try again.', 500);
    }
} else {
    // Graceful fallback for environments without live MySQL
    $userId = rand(1000, 9999);
    $defaultName = 'Student ' . substr($phone, -4);
    $userData = [
        'id' => $userId,
        'phone_number' => $phone,
        'status' => 'active',
        'profile_completed' => 0,
        'role' => 'student',
        'created_at' => date('Y-m-d H:i:s'),
        'profile' => [
            'name' => $defaultName,
            'profession' => '',
            'address' => '',
            'city' => '',
            'email' => '',
            'age' => null
        ]
    ];
    $token = generate_jwt([
        'user_id' => $userId,
        'phone_number' => $phone,
        'role' => 'student'
    ]);
    send_json_response([
        'message' => 'Account created successfully (standalone mode).',
        'token' => $token,
        'user' => $userData
    ], 201);
}
