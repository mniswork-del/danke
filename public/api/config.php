<?php
/**
 * Global Configuration & Security Headers for University Tree API
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Secret key for JWT simulation / token validation
define('JWT_SECRET', 'UniversityTree_Secured_Token_Key_2026_Hostinger_9918');

/**
 * Send JSON success response
 */
function send_json_response($data, $status = 200) {
    http_response_code($status);
    echo json_encode(array_merge(['success' => true], $data), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Send JSON error response
 */
function send_error_response($message, $status = 400) {
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'message' => $message
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Read JSON input body
 */
function get_json_input() {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return $_POST;
    }
    $data = json_decode($raw, true);
    return is_array($data) ? array_merge($_POST, $data) : $_POST;
}

/**
 * Get Bearer Token from Authorization Header
 */
function get_bearer_token() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["REDIRECT_HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
        return $headers;
    }

    // Fallback to token parameter in query or body
    if (!empty($_GET['token'])) {
        return trim($_GET['token']);
    }
    if (!empty($_POST['token'])) {
        return trim($_POST['token']);
    }
    $rawInput = json_decode(file_get_contents('php://input'), true);
    if (!empty($rawInput['token'])) {
        return trim($rawInput['token']);
    }

    return null;
}

/**
 * Simple Base64URL encode
 */
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Simple Base64URL decode
 */
function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

/**
 * Generate lightweight JWT
 */
function generate_jwt($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + (86400 * 30); // 30 days valid
    
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode(json_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64url_encode($signature);
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Verify JWT and return payload
 */
function verify_jwt($token) {
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    list($header, $payload, $signature) = $parts;
    $expectedSignature = base64url_encode(hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true));
    
    if (!hash_equals($signature, $expectedSignature)) {
        return null;
    }
    
    $data = json_decode(base64url_decode($payload), true);
    if (!$data || (isset($data['exp']) && $data['exp'] < time())) {
        return null;
    }
    return $data;
}

/**
 * Authenticate user request helper
 */
function require_user_auth() {
    $token = get_bearer_token();
    if (!$token) {
        send_error_response('Authentication token is missing. Please log in.', 401);
    }
    $payload = verify_jwt($token);
    if (!$payload || !isset($payload['user_id'])) {
        send_error_response('Invalid or expired token. Please log in again.', 401);
    }
    return $payload;
}

/**
 * Authenticate admin request helper
 */
function require_admin_auth() {
    $token = get_bearer_token();
    if (!$token) {
        send_error_response('Admin token is missing. Access denied.', 401);
    }
    $payload = verify_jwt($token);
    if (!$payload || empty($payload['is_admin'])) {
        send_error_response('Admin privileges required. Access denied.', 403);
    }
    return $payload;
}
