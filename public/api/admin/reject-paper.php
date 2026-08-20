<?php
/**
 * Admin Reject Paper API
 * POST /api/admin/reject-paper.php
 * Fields: paper_id, reason (or rejection_reason)
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$auth = require_admin_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error_response('Method not allowed. Use POST.', 405);
}

$input = get_json_input();
$paperId = (int)($input['paper_id'] ?? 0);
$reason = trim($input['reason'] ?? ($input['rejection_reason'] ?? 'Blurry or unreadable document'));

if (!$paperId) {
    send_error_response('Paper ID is required.', 422);
}

$papersDb = getPapersDb();
$adminDb = getAdminDb();

if ($papersDb) {
    try {
        $stmt = $papersDb->prepare("UPDATE paper_files SET status = 'REJECTED', rejection_reason = ? WHERE id = ?");
        $stmt->execute([$reason, $paperId]);

        // Log admin activity
        if ($adminDb) {
            try {
                $stmtA = $adminDb->prepare("INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details, ip_address, created_at) VALUES (?, 'REJECT_PAPER', 'paper', ?, ?, ?, NOW())");
                $stmtA->execute([$auth['admin_id'] ?? 1, $paperId, $reason, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);
            } catch (Exception $e) {}
        }

        send_json_response(['message' => 'Paper rejected successfully.', 'paper_id' => $paperId, 'reason' => $reason]);

    } catch (Exception $e) {
        send_error_response('Failed to reject paper due to database error.', 500);
    }
} else {
    send_json_response(['message' => 'Paper rejected (standalone mode).', 'paper_id' => $paperId]);
}
