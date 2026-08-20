<?php
/**
 * Update User Profile
 * POST /api/profile/update.php
 * Fields: name, profession, address, city, email, age
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$auth = require_user_auth();
$userId = $auth['user_id'];

$input = get_json_input();
$name = trim($input['name'] ?? '');
$profession = trim($input['profession'] ?? '');
$address = trim($input['address'] ?? '');
$city = trim($input['city'] ?? '');
$email = trim($input['email'] ?? '');
$age = !empty($input['age']) ? (int)$input['age'] : null;

$userDb = getUserDb();

// Profile is considered completed if name, city and email/address are provided
$isProfileCompleted = (!empty($name) && !empty($city) && (!empty($email) || !empty($address))) ? 1 : 0;

if ($userDb) {
    try {
        // Update user_profiles table
        $stmt = $userDb->prepare("
            INSERT INTO user_profiles (user_id, name, profession, address, city, email, age, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                profession = VALUES(profession),
                address = VALUES(address),
                city = VALUES(city),
                email = VALUES(email),
                age = VALUES(age),
                updated_at = NOW()
        ");
        $stmt->execute([$userId, $name, $profession, $address, $city, $email, $age]);

        // Update users table profile_completed flag
        $stmt = $userDb->prepare("UPDATE users SET profile_completed = ? WHERE id = ?");
        $stmt->execute([$isProfileCompleted, $userId]);

        // Fetch refreshed user record
        $stmt = $userDb->prepare("
            SELECT u.id, u.phone_number, u.status, u.profile_completed, u.created_at,
                   p.name, p.profession, p.address, p.city, p.email, p.age
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        $userData = [
            'id' => $user['id'],
            'phone_number' => $user['phone_number'],
            'status' => $user['status'],
            'profile_completed' => (int)$user['profile_completed'],
            'role' => 'student',
            'created_at' => $user['created_at'],
            'profile' => [
                'name' => $user['name'] ?: '',
                'profession' => $user['profession'] ?: '',
                'address' => $user['address'] ?: '',
                'city' => $user['city'] ?: '',
                'email' => $user['email'] ?: '',
                'age' => $user['age'] ? (int)$user['age'] : null
            ]
        ];

        send_json_response([
            'message' => 'Profile updated successfully.',
            'user' => $userData
        ]);

    } catch (\Throwable $e) {
        send_error_response('Profile update failed: ' . $e->getMessage(), 500);
    }
} else {
    // Standalone fallback
    $userData = [
        'id' => $userId,
        'phone_number' => $auth['phone_number'] ?? '9876543210',
        'status' => 'active',
        'profile_completed' => $isProfileCompleted,
        'role' => 'student',
        'created_at' => date('Y-m-d H:i:s'),
        'profile' => [
            'name' => $name,
            'profession' => $profession,
            'address' => $address,
            'city' => $city,
            'email' => $email,
            'age' => $age
        ]
    ];
    send_json_response([
        'message' => 'Profile updated successfully (standalone mode).',
        'user' => $userData
    ]);
}
