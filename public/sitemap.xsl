<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>

<xsl:template match="/">
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>XML Sitemap — AI Writing Humanizer</title>
<style>
  :root {
    --bg: #0A0A0C;
    --card: #121A21;
    --card-alt: #0b1015;
    --border: #1f2937;
    --text: #F3F4F6;
    --text-muted: #9CA3AF;
    --accent: #60A5FA;
    --accent-strong: #3B82F6;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  header {
    padding: 40px 24px 24px;
    text-align: center;
    border-bottom: 1px solid var(--border);
  }
  header h1 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
  }
  header h1 span {
    color: var(--accent);
  }
  header p {
    margin: 0;
    color: var(--text-muted);
    font-size: 14px;
  }
  .wrap {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px 64px;
  }
  .count {
    margin: 0 0 16px;
    color: var(--text-muted);
    font-size: 13px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
  }
  thead th {
    text-align: left;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 14px 18px;
    background: var(--card-alt);
    border-bottom: 1px solid var(--border);
  }
  tbody tr {
    border-bottom: 1px solid var(--border);
  }
  tbody tr:last-child {
    border-bottom: none;
  }
  tbody tr:hover {
    background: rgba(96, 165, 250, 0.06);
  }
  td {
    padding: 14px 18px;
    font-size: 14px;
    vertical-align: middle;
  }
  td.loc a {
    color: var(--accent);
    text-decoration: none;
    word-break: break-all;
  }
  td.loc a:hover {
    text-decoration: underline;
    color: var(--accent-strong);
  }
  td.muted {
    color: var(--text-muted);
    white-space: nowrap;
  }
  .badge {
    display: inline-block;
    min-width: 36px;
    text-align: center;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(96, 165, 250, 0.12);
    color: var(--accent);
    font-size: 12px;
    font-weight: 600;
  }
  footer {
    text-align: center;
    padding: 24px;
    color: var(--text-muted);
    font-size: 12px;
  }
  @media (max-width: 640px) {
    td.muted:nth-of-type(3) { display: none; }
    thead th:nth-of-type(3) { display: none; }
  }
</style>
</head>
<body>
  <header>
    <h1>XML <span>Sitemap</span></h1>
    <p>AI Writing Humanizer — <xsl:value-of select="count(sm:urlset/sm:url)"/> URLs</p>
  </header>
  <div class="wrap">
    <p class="count">This file is auto-generated for search engines. Click any URL below to visit the page.</p>
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Priority</th>
          <th>Change Frequency</th>
          <th>Last Modified</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="sm:urlset/sm:url">
          <xsl:sort select="sm:priority" order="descending"/>
          <tr>
            <td class="loc">
              <a href="{sm:loc}">
                <xsl:value-of select="sm:loc"/>
              </a>
            </td>
            <td class="muted">
              <span class="badge"><xsl:value-of select="sm:priority"/></span>
            </td>
            <td class="muted"><xsl:value-of select="sm:changefreq"/></td>
            <td class="muted"><xsl:value-of select="sm:lastmod"/></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </div>
  <footer>
    Generated for aiwritinghumanizer.com
  </footer>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
