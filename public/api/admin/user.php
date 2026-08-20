<?php
/**
 * Single User Details for Admin
 * GET /api/admin/user.php?id=USER_ID
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$auth = require_admin_auth();
$userId = (int)($_GET['id'] ?? 0);

if (!$userId) {
    send_error_response('User ID parameter is required.', 422);
}

$userDb = getUserDb();
$papersDb = getPapersDb();

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
            send_error_response('User not found.', 404);
        }

        // Get last login
        $stmt = $userDb->prepare("SELECT attempted_at, ip_address FROM login_attempts WHERE phone_number = ? AND is_success = 1 ORDER BY attempted_at DESC LIMIT 1");
        $stmt->execute([$user['phone_number']]);
        $lastLogin = $stmt->fetch();

        // Get user papers
        $papers = [];
        if ($papersDb) {
            $stmt = $papersDb->prepare("
                SELECT p.id, p.title, p.file_size, p.status, p.created_at, p.views_count, p.downloads_count,
                       s.name as subject_name, y.year as exam_year
                FROM paper_files p
                LEFT JOIN subjects s ON p.subject_id = s.id
                LEFT JOIN paper_years y ON p.paper_year_id = y.id
                WHERE p.user_id = ?
                ORDER BY p.created_at DESC
            ");
            $stmt->execute([$userId]);
            $papers = $stmt->fetchAll() ?: [];
        }

        send_json_response([
            'user' => [
                'id' => $user['id'],
                'phone' => $user['phone_number'],
                'name' => $user['name'] ?: ('Student ' . substr($user['phone_number'], -4)),
                'status' => $user['status'],
                'profile_completed' => (bool)$user['profile_completed'],
                'created_at' => $user['created_at'],
                'last_login' => $lastLogin ? $lastLogin['attempted_at'] : null,
                'last_login_ip' => $lastLogin ? $lastLogin['ip_address'] : null,
                'profile' => [
                    'name' => $user['name'] ?: '',
                    'profession' => $user['profession'] ?: '',
                    'address' => $user['address'] ?: '',
                    'city' => $user['city'] ?: '',
                    'email' => $user['email'] ?: '',
                    'age' => $user['age'] ? (int)$user['age'] : null
                ],
                'papers' => $papers
            ]
        ]);

    } catch (Exception $e) {
        send_error_response('Database query failed for user details.', 500);
    }
} else {
    send_error_response('User database service unavailable.', 503);
}
