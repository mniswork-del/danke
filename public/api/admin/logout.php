<?php
/**
 * Admin Logout API
 * POST /api/admin/logout.php
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$token = get_bearer_token();
if ($token) {
    $adminDb = getAdminDb();
    if ($adminDb) {
        try {
            $stmt = $adminDb->prepare("DELETE FROM admin_sessions WHERE session_token = ?");
            $stmt->execute([$token]);
        } catch (Exception $e) {}
    }
}

send_json_response(['message' => 'Admin session ended successfully.']);
