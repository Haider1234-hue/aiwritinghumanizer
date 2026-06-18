<?php
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$adminUsername = getenv('ADMIN_USERNAME') ?: 'admin@aiwritinghumanizer';
$adminPassword = getenv('ADMIN_PASSWORD') ?: 'change-this-password';
$configFile = __DIR__ . '/config.php';

if (file_exists($configFile)) {
    $config = include $configFile;
    if (is_array($config)) {
        $adminUsername = $config['admin_username'] ?? $adminUsername;
        $adminPassword = $config['admin_password'] ?? $adminPassword;
    }
}

$dataFile   = __DIR__ . '/posts.json';
$uploadsDir = __DIR__ . '/uploads';
$uploadsUrl = '/api/uploads';

if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function readPayload() {
    $raw     = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    return is_array($payload) ? $payload : [];
}

function readPosts($dataFile) {
    if (!file_exists($dataFile)) return [];
    $json  = file_get_contents($dataFile);
    $posts = json_decode($json, true);
    return is_array($posts) ? $posts : [];
}

function writePosts($dataFile, $posts) {
    $json = json_encode(array_values($posts), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    return file_put_contents($dataFile, $json, LOCK_EX) !== false;
}

function slugify($value) {
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    return trim($value, '-');
}

function requireAuth() {
    if (empty($_SESSION['admin_logged_in'])) {
        respond(['error' => 'Unauthorized'], 401);
    }
}

/**
 * If $value is a base64 data URI, save it as a real image file and return its URL.
 * If it's already a URL or empty, return as-is.
 */
function saveImageIfBase64($value, $uploadsDir, $uploadsUrl) {
    if (empty($value)) return '';
    if (strpos($value, 'data:') !== 0) return $value; // already a URL

    if (!preg_match('/^data:(image\/(\w+));base64,(.+)$/s', $value, $matches)) return '';

    $extension = strtolower($matches[2]);
    $allowed   = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
    if (!in_array($extension, $allowed)) return '';

    $imageData = base64_decode($matches[3]);
    if ($imageData === false) return '';

    $filename = uniqid('img-', true) . '.' . $extension;
    $filePath = $uploadsDir . '/' . $filename;

    if (file_put_contents($filePath, $imageData, LOCK_EX) === false) return '';

    return $uploadsUrl . '/' . $filename;
}

/**
 * Find all base64 images inside TipTap HTML content,
 * save them as files, and replace src attributes with URLs.
 */
function saveInlineImages($html, $uploadsDir, $uploadsUrl) {
    if (empty($html)) return $html;
    return preg_replace_callback(
        '/src="(data:image\/[^"]+)"/i',
        function ($match) use ($uploadsDir, $uploadsUrl) {
            $url = saveImageIfBase64($match[1], $uploadsDir, $uploadsUrl);
            return $url ? 'src="' . $url . '"' : $match[0];
        },
        $html
    );
}

// ── Serve uploaded images statically ────────────────────────────────────────
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
if (strpos($requestUri, '/api/uploads/') === 0) {
    $filename = basename($requestUri);
    $filepath = $uploadsDir . '/' . $filename;
    if (file_exists($filepath)) {
        // Remove the JSON content-type header set above
        header_remove('Content-Type');
        $mime = mime_content_type($filepath) ?: 'application/octet-stream';
        header('Content-Type: ' . $mime);
        header('Cache-Control: public, max-age=31536000');
        header('Content-Length: ' . filesize($filepath));
        readfile($filepath);
        exit;
    }
    http_response_code(404);
    echo '404 Not Found';
    exit;
}

// ── GET: return all posts ────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond(['posts' => readPosts($dataFile)]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$payload = readPayload();
$action  = $payload['action'] ?? '';

if ($action === 'status') {
    respond(['authenticated' => !empty($_SESSION['admin_logged_in'])]);
}

if ($action === 'login') {
    $username = $payload['username'] ?? '';
    $password = $payload['password'] ?? '';
    if (hash_equals($adminUsername, $username) && hash_equals($adminPassword, $password)) {
        $_SESSION['admin_logged_in'] = true;
        respond(['authenticated' => true]);
    }
    respond(['error' => 'Invalid login credentials.'], 401);
}

if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    respond(['authenticated' => false]);
}

requireAuth();

$posts = readPosts($dataFile);

// ── Save ─────────────────────────────────────────────────────────────────────
if ($action === 'save') {
    $post  = $payload['post'] ?? [];
    $title = trim($post['title'] ?? '');

    if ($title === '') respond(['error' => 'Title is required.'], 400);

    $id   = trim($post['id'] ?? '');
    $slug = slugify($post['slug'] ?? $title);

    if ($slug === '') respond(['error' => 'Slug is required.'], 400);

    // Content: accept HTML string (TipTap) or legacy paragraph array
    $rawContent = $post['content'] ?? '';
    if (is_array($rawContent)) {
        $content = implode('', array_map(
            fn($p) => '<p>' . htmlspecialchars(trim($p), ENT_QUOTES, 'UTF-8') . '</p>',
            array_filter(array_map('trim', $rawContent))
        ));
    } else {
        $content = trim((string) $rawContent);
    }

    // Save any base64 images embedded inline in the HTML content as real files
    $content = saveInlineImages($content, $uploadsDir, $uploadsUrl);

    // Featured image: save base64 as a real file, or keep URL as-is
    $featuredImage    = saveImageIfBase64(trim($post['featuredImage'] ?? ''), $uploadsDir, $uploadsUrl);
    $featuredImageAlt = trim($post['featuredImageAlt'] ?? '');

    // Tags
    $tags = $post['tags'] ?? [];
    if (!is_array($tags)) {
        $tags = array_filter(array_map('trim', explode(',', (string) $tags)));
    }
    $tags = array_values(array_filter(array_map('trim', $tags)));

    // SEO
    $focusKeyword    = trim($post['focusKeyword']    ?? '');
    $metaTitle       = trim($post['metaTitle']       ?? $title);
    $metaDescription = trim($post['metaDescription'] ?? '');

    $savedPost = [
        'id'               => $id !== '' ? $id : uniqid('post-', true),
        'slug'             => $slug,
        'title'            => $title,
        'category'         => trim($post['category'] ?? 'Writing'),
        'date'             => trim($post['date']      ?? date('F Y')),
        'readTime'         => trim($post['readTime']  ?? '4 min read'),
        'excerpt'          => trim($post['excerpt']   ?? ''),
        'content'          => $content,
        'tags'             => $tags,
        'featuredImage'    => $featuredImage,
        'featuredImageAlt' => $featuredImageAlt,
        'focusKeyword'     => $focusKeyword,
        'metaTitle'        => $metaTitle,
        'metaDescription'  => $metaDescription,
    ];

    $updated = false;
    foreach ($posts as $index => $existing) {
        if (($existing['id'] ?? '') === $savedPost['id']) {
            $posts[$index] = $savedPost;
            $updated = true;
            break;
        }
    }
    if (!$updated) $posts[] = $savedPost;

    if (!writePosts($dataFile, $posts)) {
        respond(['error' => 'Unable to write posts file. Check folder permissions.'], 500);
    }

    respond(['posts' => array_values($posts)]);
}

// ── Delete ───────────────────────────────────────────────────────────────────
if ($action === 'delete') {
    $id    = $payload['id'] ?? '';
    $posts = array_values(array_filter($posts, fn($p) => ($p['id'] ?? '') !== $id));
    if (!writePosts($dataFile, $posts)) respond(['error' => 'Unable to write posts file.'], 500);
    respond(['posts' => $posts]);
}

respond(['error' => 'Unknown action.'], 400);