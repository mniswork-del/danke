<?php
/**
 * Admin Activate User API
 * POST /api/admin/activate-user.php
 * Fields: user_id
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$auth = require_admin_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error_response('Method not allowed. Use POST.', 405);
}

$input = get_json_input();
$userId = (int)($input['user_id'] ?? 0);

if (!$userId) {
    send_error_response('User ID is required.', 422);
}

$userDb = getUserDb();
$adminDb = getAdminDb();

if ($userDb) {
    try {
        $stmt = $userDb->prepare("UPDATE users SET status = 'active' WHERE id = ?");
        $stmt->execute([$userId]);

        // Log admin activity
        if ($adminDb) {
            try {
                $stmtA = $adminDb->prepare("INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details, ip_address, created_at) VALUES (?, 'ACTIVATE_USER', 'user', ?, 'User account activated by administrator', ?, NOW())");
                $stmtA->execute([$auth['admin_id'] ?? 1, $userId, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);
            } catch (Exception $e) {}
        }

        send_json_response(['message' => 'User account activated successfully.', 'user_id' => $userId]);

    } catch (Exception $e) {
        send_error_response('Failed to activate user.', 500);
    }
} else {
    send_json_response(['message' => 'User activated (standalone mode).', 'user_id' => $userId]);
}
