<?php
/**
 * Paper View API
 * GET /api/papers/view.php?id=ID
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$paperId = !empty($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$paperId) {
    send_error_response('Valid paper ID is required.', 422);
}

$papersDb = getPapersDb();

if ($papersDb) {
    try {
        // Increment view count
        $stmt = $papersDb->prepare("UPDATE paper_files SET views_count = views_count + 1 WHERE id = ?");
        $stmt->execute([$paperId]);

        $stmt = $papersDb->prepare("
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
            WHERE p.id = ?
            LIMIT 1
        ");
        $stmt->execute([$paperId]);
        $r = $stmt->fetch();

        if (!$r) {
            send_error_response('Paper document not found.', 404);
        }

        $paper = [
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

        send_json_response(['paper' => $paper]);

    } catch (Exception $e) {
        send_error_response('Failed to retrieve paper details.', 500);
    }
} else {
    send_error_response('Paper details service unavailable.', 503);
}
