<?php
header('Content-Type: application/xml; charset=UTF-8');

$base = 'https://aiwritinghumanizer.com';
$today = date('Y-m-d');

$posts = [];
$postsFile = __DIR__ . '/api/posts.json';
if (file_exists($postsFile)) {
    $decoded = json_decode(file_get_contents($postsFile), true);
    if (is_array($decoded)) {
        $posts = $decoded;
    }
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

$staticPages = [
    ['loc' => '/',              'changefreq' => 'weekly',  'priority' => '1.0'],
    ['loc' => '/humanizer',     'changefreq' => 'weekly',  'priority' => '0.9'],
    ['loc' => '/ai-detecter',   'changefreq' => 'weekly',  'priority' => '0.9'],
    ['loc' => '/blog',          'changefreq' => 'weekly',  'priority' => '0.8'],
    ['loc' => '/contact',       'changefreq' => 'monthly', 'priority' => '0.6'],
    ['loc' => '/privacy-policy','changefreq' => 'monthly', 'priority' => '0.5'],
    ['loc' => '/terms',         'changefreq' => 'monthly', 'priority' => '0.5'],
    ['loc' => '/disclaimer',    'changefreq' => 'monthly', 'priority' => '0.5'],
];

foreach ($staticPages as $page) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($base . $page['loc']) . "</loc>\n";
    echo "    <lastmod>{$today}</lastmod>\n";
    echo "    <changefreq>{$page['changefreq']}</changefreq>\n";
    echo "    <priority>{$page['priority']}</priority>\n";
    echo "  </url>\n";
}

foreach ($posts as $post) {
    if (empty($post['slug'])) continue;
    $slug = htmlspecialchars($post['slug']);
    echo "  <url>\n";
    echo "    <loc>{$base}/blog/{$slug}</loc>\n";
    echo "    <lastmod>{$today}</lastmod>\n";
    echo "    <changefreq>monthly</changefreq>\n";
    echo "    <priority>0.7</priority>\n";
    echo "  </url>\n";
}

echo '</urlset>';
