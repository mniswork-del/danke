<?php
/**
 * Paper List API
 * GET /api/papers/list.php
 * Filters: paper_type_id, subject_id, year, search
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$search = trim($_GET['search'] ?? '');
$paperTypeId = !empty($_GET['paper_type_id']) ? (int)$_GET['paper_type_id'] : null;
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
            WHERE p.status = 'APPROVED'
        ";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (p.title LIKE ? OR s.name LIKE ? OR s.code LIKE ?)";
            $searchTerm = '%' . $search . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if ($paperTypeId) {
            $sql .= " AND p.paper_type_id = ?";
            $params[] = $paperTypeId;
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

        $sql .= " ORDER BY p.created_at DESC LIMIT 100";

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
                'viewsCount' => (int)$r['views_count'],
                'downloadsCount' => (int)$r['downloads_count'],
                'uploaderId' => (string)$r['user_id'],
                'uploaderName' => 'Verified Student',
                'createdAt' => $r['created_at']
            ];
        }, $rows);

        send_json_response(['papers' => $papers]);

    } catch (Exception $e) {
        send_error_response('Database query failed for papers list.', 500);
    }
} else {
    // Fallback response with structured paper items
    send_json_response([
        'papers' => []
    ]);
}
