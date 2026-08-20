<?php
/**
 * Admin Users List API
 * GET /api/admin/users.php
 * Search, Pagination, name, phone, city, status, profile completed, total uploads
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$auth = require_admin_auth();

$search = trim($_GET['search'] ?? '');
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(50, max(10, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

$userDb = getUserDb();

if ($userDb) {
    try {
        $sql = "
            SELECT u.id, u.phone_number, u.status, u.profile_completed, u.created_at,
                   p.name, p.city, p.email, p.profession
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (u.phone_number LIKE ? OR p.name LIKE ? OR p.city LIKE ? OR p.email LIKE ?)";
            $term = '%' . $search . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        // Count query
        $countSql = preg_replace('/SELECT.*?FROM/s', 'SELECT COUNT(*) as total FROM', $sql);
        $stmt = $userDb->prepare($countSql);
        $stmt->execute($params);
        $totalCount = (int)($stmt->fetch()['total'] ?? 0);

        // Fetch page
        $sql .= " ORDER BY u.created_at DESC LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
        $stmt = $userDb->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Get total uploads from papers db for these users
        $papersDb = getPapersDb();
        $userUploadCounts = [];
        if ($papersDb && !empty($rows)) {
            $userIds = array_column($rows, 'id');
            if (!empty($userIds)) {
                $inClause = implode(',', array_fill(0, count($userIds), '?'));
                $stmtP = $papersDb->prepare("SELECT user_id, COUNT(*) as cnt FROM paper_files WHERE user_id IN ($inClause) GROUP BY user_id");
                $stmtP->execute($userIds);
                foreach ($stmtP->fetchAll() as $uc) {
                    $userUploadCounts[$uc['user_id']] = (int)$uc['cnt'];
                }
            }
        }

        $users = array_map(function($r) use ($userUploadCounts) {
            return [
                'id' => $r['id'],
                'phone' => $r['phone_number'],
                'mobile' => $r['phone_number'],
                'name' => $r['name'] ?: ('Student ' . substr($r['phone_number'], -4)),
                'city' => $r['city'] ?: 'Not Specified',
                'email' => $r['email'] ?: '',
                'profession' => $r['profession'] ?: 'Student',
                'status' => $r['status'],
                'profile_completed' => (bool)$r['profile_completed'],
                'total_uploads' => $userUploadCounts[$r['id']] ?? 0,
                'created_at' => $r['created_at']
            ];
        }, $rows);

        send_json_response([
            'users' => $users,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ]
        ]);

    } catch (Exception $e) {
        send_error_response('Database query failed for users.', 500);
    }
} else {
    send_json_response([
        'users' => [],
        'pagination' => [
            'page' => 1,
            'limit' => 20,
            'total' => 0,
            'totalPages' => 0
        ]
    ]);
}
