<?php
/**
 * Admin Papers Moderation List API
 * GET /api/admin/papers.php
 * Filters: date_filter (today, week, month), status (live/APPROVED, rejected/REJECTED, pending/PENDING_REVIEW, duplicate/DUPLICATE), subject_id, year, search
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$auth = require_admin_auth();

$search = trim($_GET['search'] ?? '');
$status = trim($_GET['status'] ?? '');
$dateFilter = trim($_GET['date_filter'] ?? ($_GET['date'] ?? ''));
$subjectId = !empty($_GET['subject_id']) ? (int)$_GET['subject_id'] : null;
$year = !empty($_GET['year']) ? (int)$_GET['year'] : (!empty($_GET['year_id']) ? (int)$_GET['year_id'] : null);

$papersDb = getPapersDb();

if ($papersDb) {
    try {
        $sql = "
            SELECT p.id, p.user_id, p.paper_type_id, p.subject_id, p.paper_year_id,
                   p.title, p.file_url, p.original_filename, p.file_size, p.views_count, p.downloads_count,
                   p.status, p.rejection_reason, p.created_at,
                   t.name as paper_type_name,
                   s.name as subject_name, s.code as subject_code, s.category as category,
                   y.year as exam_year
            FROM paper_files p
            LEFT JOIN paper_types t ON p.paper_type_id = t.id
            LEFT JOIN subjects s ON p.subject_id = s.id
            LEFT JOIN paper_years y ON p.paper_year_id = y.id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (p.title LIKE ? OR s.name LIKE ? OR s.code LIKE ?)";
            $term = '%' . $search . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        if (!empty($status)) {
            if (strtolower($status) === 'live') {
                $sql .= " AND p.status = 'APPROVED'";
            } else if (strtolower($status) === 'rejected') {
                $sql .= " AND p.status = 'REJECTED'";
            } else if (strtolower($status) === 'pending') {
                $sql .= " AND (p.status = 'PENDING_REVIEW' OR p.status = 'DUPLICATE')";
            } else {
                $sql .= " AND p.status = ?";
                $params[] = strtoupper($status);
            }
        }

        if (!empty($dateFilter)) {
            if ($dateFilter === 'today') {
                $sql .= " AND DATE(p.created_at) = CURDATE()";
            } else if ($dateFilter === 'week') {
                $sql .= " AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            } else if ($dateFilter === 'month') {
                $sql .= " AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
            }
        }

        if ($subjectId) {
            $sql .= " AND p.subject_id = ?";
            $params[] = $subjectId;
        }

        if ($year) {
            $sql .= " AND (y.year = ? OR p.paper_year_id = ?)";
            $params[] = $year;
            $params[] = $year;
        }

        $sql .= " ORDER BY p.created_at DESC LIMIT 150";

        $stmt = $papersDb->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $papers = array_map(function($r) {
            return [
                'id' => (string)$r['id'],
                'title' => $r['title'],
                'category' => $r['category'] ?: 'university',
                'institution' => 'University / Board',
                'course' => $r['paper_type_name'] ?: 'Undergraduate Course',
                'semester' => 'Semester Examination',
                'subject' => $r['subject_name'] ?: $r['title'],
                'subjectCode' => $r['subject_code'] ?: 'SUB-101',
                'year' => (int)($r['exam_year'] ?: date('Y')),
                'examType' => 'Regular Final',
                'language' => 'English / Hindi',
                'fileUrl' => $r['file_url'],
                'fileName' => $r['original_filename'] ?: 'question_paper.pdf',
                'fileSize' => round((int)$r['file_size'] / (1024 * 1024), 1) . ' MB',
                'pageCount' => 6,
                'hasSolutions' => true,
                'status' => $r['status'],
                'rejectionReason' => $r['rejection_reason'],
                'viewsCount' => (int)$r['views_count'],
                'downloadsCount' => (int)$r['downloads_count'],
                'uploaderId' => (string)$r['user_id'],
                'uploaderName' => 'Student #' . $r['user_id'],
                'createdAt' => $r['created_at']
            ];
        }, $rows);

        send_json_response(['papers' => $papers]);

    } catch (Exception $e) {
        send_error_response('Database query failed for admin papers.', 500);
    }
} else {
    send_json_response(['papers' => []]);
}
