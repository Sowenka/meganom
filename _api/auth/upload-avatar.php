<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$payload = require_auth();
$userId  = $payload['sub'];

if (empty($_FILES['avatar']) || $_FILES['avatar']['error'] === UPLOAD_ERR_NO_FILE) {
    json_error('Файл не передан');
}

$file = $_FILES['avatar'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    json_error('Ошибка при загрузке файла');
}

// Max 5 MB
if ($file['size'] > 5 * 1024 * 1024) {
    json_error('Файл слишком большой. Максимум 5 МБ.');
}

// Detect real MIME type (not from user input)
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mime, $allowed, true)) {
    json_error('Разрешены только изображения: JPEG, PNG, WebP');
}

// Ensure GD is available
if (!function_exists('imagecreatefromjpeg')) {
    json_error('Обработка изображений недоступна на сервере', 500);
}

// Upload directory
$uploadDir = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/uploads/avatars/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
    // Block PHP execution in uploads
    file_put_contents($uploadDir . '../.htaccess',
        "php_flag engine off\nAddType text/plain .php .phtml .php3 .php4 .php5\n"
    );
}

// One file per user (auto-replaces previous avatar)
$safeId  = preg_replace('/[^a-zA-Z0-9\-]/', '', $userId);
$filename = $safeId . '.jpg';
$filepath = $uploadDir . $filename;

if (!avatar_resize($file['tmp_name'], $mime, $filepath)) {
    json_error('Не удалось обработать изображение', 500);
}

$avatarUrl = '/uploads/avatars/' . $filename;

try {
    $pdo  = db();
    $stmt = $pdo->prepare('UPDATE users SET avatar_url = :url WHERE id = :id');
    $stmt->execute([':url' => $avatarUrl, ':id' => $userId]);

    json_response(['ok' => true, 'avatar_url' => $avatarUrl]);

} catch (\Exception $e) {
    json_error('Ошибка сохранения', 500);
}

// ── Image processing ──────────────────────────────────────────────────────────

function avatar_resize(string $source, string $mime, string $dest, int $size = 200): bool
{
    if ($mime === 'image/jpeg') {
        $src = imagecreatefromjpeg($source);
    } elseif ($mime === 'image/png') {
        $src = imagecreatefrompng($source);
    } elseif ($mime === 'image/webp') {
        $src = imagecreatefromwebp($source);
    } elseif ($mime === 'image/gif') {
        $src = imagecreatefromgif($source);
    } else {
        return false;
    }

    if (!$src) return false;

    $w   = imagesx($src);
    $h   = imagesy($src);
    $min = min($w, $h);
    $x   = (int)(($w - $min) / 2);
    $y   = (int)(($h - $min) / 2);

    $dst   = imagecreatetruecolor($size, $size);
    $white = imagecolorallocate($dst, 255, 255, 255);
    imagefill($dst, 0, 0, $white);
    imagecopyresampled($dst, $src, 0, 0, $x, $y, $size, $size, $min, $min);

    $result = imagejpeg($dst, $dest, 88);

    imagedestroy($src);
    imagedestroy($dst);

    return $result;
}
