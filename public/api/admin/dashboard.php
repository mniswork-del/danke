<?php
/**
 * Admin Dashboard Stats API
 * GET /api/admin/dashboard.php
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$auth = require_admin_auth();

$userDb = getUserDb();
$papersDb = getPapersDb();

$stats = [
    'totalUsers' => 0,
    'activeUsers' => 0,
    'suspendedUsers' => 0,
    'totalPapers' => 0,
    'livePapers' => 0,
    'rejectedPapers' => 0,
    'pendingPapers' => 0,
    'todayUploads' => 0,
    'weekUploads' => 0,
    'monthUploads' => 0
];

$recentUploads = [];
$topUploaders = [];

// 1. Fetch User Stats
if ($userDb) {
    try {
        $stmt = $userDb->query("SELECT COUNT(*) as total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active, SUM(CASE WHEN status='suspended' THEN 1 ELSE 0 END) as suspended FROM users");
        $userRow = $stmt->fetch();
        if ($userRow) {
            $stats['totalUsers'] = (int)$userRow['total'];
            $stats['activeUsers'] = (int)$userRow['active'];
            $stats['suspendedUsers'] = (int)$userRow['suspended'];
        }
    } catch (Exception $e) {}
}

// 2. Fetch Paper Stats
if ($papersDb) {
    try {
        $stmt = $papersDb->query("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status='APPROVED' THEN 1 ELSE 0 END) as live,
                SUM(CASE WHEN status='REJECTED' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status='PENDING_REVIEW' OR status='DUPLICATE' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as week,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as month
            FROM paper_files
        ");
        $paperRow = $stmt->fetch();
        if ($paperRow) {
            $stats['totalPapers'] = (int)$paperRow['total'];
            $stats['livePapers'] = (int)$paperRow['live'];
            $stats['rejectedPapers'] = (int)$paperRow['rejected'];
            $stats['pendingPapers'] = (int)$paperRow['pending'];
            $stats['todayUploads'] = (int)$paperRow['today'];
            $stats['weekUploads'] = (int)$paperRow['week'];
            $stats['monthUploads'] = (int)$paperRow['month'];
        }

        // Recent Uploads
        $stmt = $papersDb->query("
            SELECT p.id, p.title, p.file_size, p.status, p.created_at, p.user_id,
                   s.name as subject_name
            FROM paper_files p
            LEFT JOIN subjects s ON p.subject_id = s.id
            ORDER BY p.created_at DESC
            LIMIT 10
        ");
        $recentUploads = $stmt->fetchAll() ?: [];

        // Top uploaders
        $stmt = $papersDb->query("
            SELECT user_id, COUNT(*) as count
            FROM paper_files
            GROUP BY user_id
            ORDER BY count DESC
            LIMIT 5
        ");
        $topUploaders = $stmt->fetchAll() ?: [];

    } catch (Exception $e) {}
}

send_json_response([
    'stats' => $stats,
    'recentUploads' => $recentUploads,
    'topUploaders' => $topUploaders
]);
