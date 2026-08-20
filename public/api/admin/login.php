<?php
/**
 * Admin Login API
 * POST /api/admin/login.php
 * Fields: username, password
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error_response('Method not allowed. Use POST.', 405);
}

$input = get_json_input();
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($username) || empty($password)) {
    send_error_response('Admin username and password are required.', 422);
}

$adminDb = getAdminDb();
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

// Master credentials check
$isMasterMatch = (strtolower($username) === 'admin' && $password === 'Admin98@');

if ($adminDb) {
    try {
        $stmt = $adminDb->prepare("SELECT id, username, email, password_hash, role, status FROM admin_users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        $admin = $stmt->fetch();

        $valid = false;
        if ($admin && password_verify($password, $admin['password_hash'])) {
            $valid = true;
        } else if ($isMasterMatch) {
            $valid = true;
            if (!$admin) {
                // Seed or provision root admin record
                $hash = password_hash('Admin98@', PASSWORD_BCRYPT);
                $stmt = $adminDb->prepare("INSERT INTO admin_users (username, email, password_hash, role, status, created_at) VALUES ('admin', 'admin@universitytree.in', ?, 'superadmin', 'active', NOW())");
                $stmt->execute([$hash]);
                $adminId = $adminDb->lastInsertId();
                $admin = [
                    'id' => $adminId,
                    'username' => 'admin',
                    'email' => 'admin@universitytree.in',
                    'role' => 'superadmin',
                    'status' => 'active'
                ];
            }
        }

        if (!$valid) {
            $stmt = $adminDb->prepare("INSERT INTO admin_login_attempts (username, ip_address, is_success, attempted_at) VALUES (?, ?, 0, NOW())");
            $stmt->execute([$username, $clientIp]);
            send_error_response('Invalid administrator credentials.', 401);
        }

        // Record successful login
        $stmt = $adminDb->prepare("INSERT INTO admin_login_attempts (username, ip_address, is_success, attempted_at) VALUES (?, ?, 1, NOW())");
        $stmt->execute([$username, $clientIp]);

        $token = generate_jwt([
            'admin_id' => $admin['id'] ?? 1,
            'username' => $admin['username'] ?? 'admin',
            'role' => $admin['role'] ?? 'superadmin',
            'is_admin' => true
        ]);

        // Insert into admin_sessions
        $expiresAt = date('Y-m-d H:i:s', time() + (86400 * 7));
        $stmt = $adminDb->prepare("INSERT INTO admin_sessions (admin_id, session_token, ip_address, user_agent, expires_at, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$admin['id'] ?? 1, $token, $clientIp, $_SERVER['HTTP_USER_AGENT'] ?? '', $expiresAt]);

        send_json_response([
            'message' => 'Administrator authenticated successfully.',
            'token' => $token,
            'admin' => [
                'id' => $admin['id'] ?? 1,
                'username' => $admin['username'] ?? 'admin',
                'email' => $admin['email'] ?? 'admin@universitytree.in',
                'role' => $admin['role'] ?? 'superadmin'
            ]
        ]);

    } catch (Exception $e) {
        if ($isMasterMatch) {
            $token = generate_jwt([
                'admin_id' => 1,
                'username' => 'admin',
                'role' => 'superadmin',
                'is_admin' => true
            ]);
            send_json_response([
                'message' => 'Administrator authenticated.',
                'token' => $token,
                'admin' => [
                    'id' => 1,
                    'username' => 'admin',
                    'email' => 'admin@universitytree.in',
                    'role' => 'superadmin'
                ]
            ]);
        }
        send_error_response('Admin authentication service error.', 500);
    }
} else {
    if ($isMasterMatch) {
        $token = generate_jwt([
            'admin_id' => 1,
            'username' => 'admin',
            'role' => 'superadmin',
            'is_admin' => true
        ]);
        send_json_response([
            'message' => 'Administrator authenticated (standalone mode).',
            'token' => $token,
            'admin' => [
                'id' => 1,
                'username' => 'admin',
                'email' => 'admin@universitytree.in',
                'role' => 'superadmin'
            ]
        ]);
    } else {
        send_error_response('Invalid administrator credentials.', 401);
    }
}
