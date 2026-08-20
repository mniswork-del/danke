<?php
/**
 * User Logout API
 * POST /api/auth/logout.php
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$token = get_bearer_token();
if ($token) {
    $userDb = getUserDb();
    if ($userDb) {
        try {
            $stmt = $userDb->prepare("DELETE FROM user_sessions WHERE session_token = ?");
            $stmt->execute([$token]);
        } catch (Exception $e) {}
    }
}

send_json_response(['message' => 'Logged out successfully.']);
