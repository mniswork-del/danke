<?php
/**
 * User Session Verification & Profile Restoration
 * GET /api/auth/me.php
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$auth = require_user_auth();
$userId = $auth['user_id'];

$userDb = getUserDb();

if ($userDb) {
    try {
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

        if (!$user) {
            send_error_response('User account not found.', 404);
        }

        if ($user['status'] === 'suspended') {
            send_error_response('Account suspended.', 403);
        }

        $userData = [
            'id' => $user['id'],
            'phone_number' => $user['phone_number'],
            'status' => $user['status'],
            'profile_completed' => (int)$user['profile_completed'],
            'role' => 'student',
            'created_at' => $user['created_at'],
            'profile' => [
                'name' => $user['name'] ?? '',
                'profession' => $user['profession'] ?? '',
                'address' => $user['address'] ?? '',
                'city' => $user['city'] ?? '',
                'email' => $user['email'] ?? '',
                'age' => $user['age'] ? (int)$user['age'] : null
            ]
        ];

        send_json_response(['user' => $userData]);

    } catch (Exception $e) {
        send_error_response('Failed to verify session.', 500);
    }
} else {
    // Standalone fallback
    send_json_response([
        'user' => [
            'id' => $userId,
            'phone_number' => $auth['phone_number'] ?? '',
            'status' => 'active',
            'profile_completed' => 0,
            'role' => 'student',
            'created_at' => date('Y-m-d H:i:s'),
            'profile' => [
                'name' => '',
                'profession' => '',
                'address' => '',
                'city' => '',
                'email' => '',
                'age' => null
            ]
        ]
    ]);
}
