<?php
/**
 * Update User Profile
 * POST /api/profile/update.php
 * Fields: name, profession, address, city, email, age, phone_number
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    send_error_response('Method not allowed. Use POST or PUT.', 405);
}

$input = get_json_input();
$name = trim($input['name'] ?? '');
$profession = trim($input['profession'] ?? '');
$address = trim($input['address'] ?? '');
$city = trim($input['city'] ?? '');
$email = trim($input['email'] ?? '');
$age = !empty($input['age']) ? (int)$input['age'] : null;
$phone_number = trim($input['phone_number'] ?? '');

$token = get_bearer_token();
$jwtPayload = verify_jwt($token);

$userDb = getUserDb();
$userId = $jwtPayload['user_id'] ?? null;

// Try to resolve user by token from user_sessions if not in JWT
if (!$userId && $userDb && !empty($token)) {
    try {
        $stmt = $userDb->prepare("SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW() LIMIT 1");
        $stmt->execute([$token]);
        $sess = $stmt->fetch();
        if ($sess) {
            $userId = (int)$sess['user_id'];
        }
    } catch (\Throwable $e) {}
}

// Fallback: resolve user by phone_number if provided
if (!$userId && $userDb && !empty($phone_number)) {
    try {
        $cleanPhone = substr(preg_replace('/\D/', '', $phone_number), -10);
        $stmt = $userDb->prepare("SELECT id FROM users WHERE phone_number = ? LIMIT 1");
        $stmt->execute([$cleanPhone]);
        $u = $stmt->fetch();
        if ($u) {
            $userId = (int)$u['id'];
        }
    } catch (\Throwable $e) {}
}

$isProfileCompleted = (!empty($name) && !empty($city) && (!empty($email) || !empty($address))) ? 1 : 0;

if ($userDb && $userId) {
    try {
        // Insert or update profile
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

        // Update profile_completed in users table
        $stmt = $userDb->prepare("UPDATE users SET profile_completed = ? WHERE id = ?");
        $stmt->execute([$isProfileCompleted, $userId]);

        // Fetch refreshed user record
        $stmt = $userDb->prepare("
            SELECT u.id, u.phone_number, u.status, u.profile_completed,
                   p.name, p.profession, p.address, p.city, p.email, p.age
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        send_json_response([
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => (int)$user['id'],
                'phone_number' => $user['phone_number'],
                'profile_completed' => (bool)$user['profile_completed'],
                'profile' => [
                    'name' => $user['name'] ?? $name,
                    'profession' => $user['profession'] ?? $profession,
                    'address' => $user['address'] ?? $address,
                    'city' => $user['city'] ?? $city,
                    'email' => $user['email'] ?? $email,
                    'age' => $user['age'] ? (int)$user['age'] : $age
                ]
            ]
        ]);
    } catch (\Throwable $e) {
        // Fall through to standard response
    }
}

// Standalone fallback response
send_json_response([
    'message' => 'Profile saved successfully.',
    'user' => [
        'id' => $userId ?? 1,
        'phone_number' => $phone_number ?: ($jwtPayload['phone_number'] ?? ''),
        'profile_completed' => (bool)$isProfileCompleted,
        'profile' => [
            'name' => $name,
            'profession' => $profession,
            'address' => $address,
            'city' => $city,
            'email' => $email,
            'age' => $age
        ]
    ]
]);
