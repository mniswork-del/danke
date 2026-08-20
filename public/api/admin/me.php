<?php
/**
 * Admin Me API
 * GET /api/admin/me.php
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

$auth = require_admin_auth();

send_json_response([
    'admin' => [
        'id' => $auth['admin_id'] ?? 1,
        'username' => $auth['username'] ?? 'admin',
        'role' => $auth['role'] ?? 'superadmin',
        'email' => 'admin@universitytree.in'
    ]
]);
