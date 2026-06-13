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

$dataFile = __DIR__ . '/posts.json';

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function readPayload() {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    return is_array($payload) ? $payload : [];
}

function readPosts($dataFile) {
    if (!file_exists($dataFile)) {
        return [];
    }

    $json = file_get_contents($dataFile);
    $posts = json_decode($json, true);

    return is_array($posts) ? $posts : [];
}

function writePosts($dataFile, $posts) {
    $json = json_encode(array_values($posts), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond(['posts' => readPosts($dataFile)]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$payload = readPayload();
$action = $payload['action'] ?? '';

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

if ($action === 'save') {
    $post = $payload['post'] ?? [];
    $title = trim($post['title'] ?? '');

    if ($title === '') {
        respond(['error' => 'Title is required.'], 400);
    }

    $id = trim($post['id'] ?? '');
    $slug = slugify($post['slug'] ?? $title);

    if ($slug === '') {
        respond(['error' => 'Slug is required.'], 400);
    }

    $content = $post['content'] ?? [];
    if (!is_array($content)) {
        $content = preg_split('/\n{2,}/', (string) $content);
    }
    $content = array_values(array_filter(array_map('trim', $content)));

    $savedPost = [
        'id' => $id !== '' ? $id : uniqid('post-', true),
        'slug' => $slug,
        'title' => $title,
        'category' => trim($post['category'] ?? 'Writing'),
        'date' => trim($post['date'] ?? date('F Y')),
        'readTime' => trim($post['readTime'] ?? '4 min read'),
        'excerpt' => trim($post['excerpt'] ?? ''),
        'content' => $content,
    ];

    $updated = false;
    foreach ($posts as $index => $existingPost) {
        if (($existingPost['id'] ?? '') === $savedPost['id']) {
            $posts[$index] = $savedPost;
            $updated = true;
            break;
        }
    }

    if (!$updated) {
        $posts[] = $savedPost;
    }

    if (!writePosts($dataFile, $posts)) {
        respond(['error' => 'Unable to write posts file.'], 500);
    }

    respond(['posts' => array_values($posts)]);
}

if ($action === 'delete') {
    $id = $payload['id'] ?? '';
    $posts = array_values(array_filter($posts, function ($post) use ($id) {
        return ($post['id'] ?? '') !== $id;
    }));

    if (!writePosts($dataFile, $posts)) {
        respond(['error' => 'Unable to write posts file.'], 500);
    }

    respond(['posts' => $posts]);
}

respond(['error' => 'Unknown action.'], 400);
