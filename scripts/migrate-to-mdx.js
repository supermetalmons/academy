#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const pages = [
  {src: 'index.html', id: 'index', slug: '/', theme: 'um-theme-light', bg: 'um-bg-grass'},
  {src: 'academy.html', id: 'academy', slug: '/academy', theme: 'um-theme-dark', bg: 'um-bg-library'},
  {src: 'openings.html', id: 'openings', slug: '/openings', theme: 'um-theme-dark', bg: 'um-bg-library'},
  {src: 'techniques.html', id: 'techniques', slug: '/techniques', theme: 'um-theme-dark', bg: 'um-bg-library'},
  {src: 'puzzles.html', id: 'puzzles', slug: '/puzzles', theme: 'um-theme-light', bg: 'um-bg-grass'},
  {src: 'puzzle1.html', id: 'puzzle1', slug: '/puzzle1', theme: 'um-theme-light', bg: 'um-bg-grass'},
  {src: 'puzzle2.html', id: 'puzzle2', slug: '/puzzle2', theme: 'um-theme-light', bg: 'um-bg-grass'},
  {src: 'puzzle3.html', id: 'puzzle3', slug: '/puzzle3', theme: 'um-theme-light', bg: 'um-bg-grass'},
  {src: 'puzzle4.html', id: 'puzzle4', slug: '/puzzle4', theme: 'um-theme-light', bg: 'um-bg-grass'},
  {src: 'resources.html', id: 'resources', slug: '/resources', theme: 'um-theme-light', bg: 'um-bg-grass'},
  {src: 'faq.html', id: 'faq', slug: '/faq', theme: 'um-theme-light', bg: 'um-bg-grass'},
];

function extractBetween(str, start, end){
  const s = str.indexOf(start);
  const e = str.lastIndexOf(end);
  if (s === -1 || e === -1 || e <= s) return str;
  return str.slice(s + start.length, e);
}

function replaceLinks(html){
  // Rewrite image sources (quoted or unquoted)
  html = html.replace(/src\s*=\s*(\"?)images\//g, 'src=$1/img/ultrametal/');
  html = html.replace(/src\s*=\s*(\"?)cursornavi\.png\1/g, 'src=$1/img/ultrametal/cursornavi.png$1');

  const map = new Map(Object.entries({
    'index.html': '/',
    'academy.html': '/academy',
    'openings.html': '/openings',
    'techniques.html': '/techniques',
    'puzzles.html': '/puzzles',
    'resources.html': '/resources',
    'faq.html': '/faq',
    'puzzle1.html': '/puzzle1',
    'puzzle2.html': '/puzzle2',
    'puzzle3.html': '/puzzle3',
    'puzzle4.html': '/puzzle4',
  }));

  // Quoted href
  html = html.replace(/href=\"([^\"]+)\"/g, (m, p1) => {
    if (map.has(p1)) return `href=\"${map.get(p1)}\"`;
    if (/^[^:]+\.html$/.test(p1)) return `href=\"https://ultrametal.neocities.org/${p1}\"`;
    return m;
  });
  // Unquoted href
  html = html.replace(/href=([^\s>]+)/g, (m, p1) => {
    if (map.has(p1)) return `href=\"${map.get(p1)}\"`;
    if (/^[^:]+\.html$/.test(p1)) return `href=\"https://ultrametal.neocities.org/${p1}\"`;
    return m;
  });

  // Quote any remaining unquoted attribute values to satisfy HTML minifier
  // e.g., class=wrapper -> class="wrapper"
  html = html.replace(/(\s[\w:-]+)=([^\s\"'`<>]+)/g, (m, attr, val) => `${attr}="${val}"`);

  return html;
}

for (const p of pages){
  const srcPath = path.join('migrate_src', p.src);
  const raw = fs.readFileSync(srcPath, 'utf8');
  const titleMatch = raw.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : p.id;
  const body = extractBetween(raw, '<body>', '</body>');
  const content = replaceLinks(body.trim());

  const frontMatter = [
    '---',
    `id: ${p.id}`,
    `title: ${JSON.stringify(title)}`,
    `slug: ${JSON.stringify(p.slug)}`,
    `hide_title: true`,
    '---',
    '',
  ].join('\n');

  const htmlString = JSON.stringify(content);
  const wrapperStart = `<div className=\"um-page ${p.theme} ${p.bg}\">\n`;
  const inner = `<div dangerouslySetInnerHTML={{__html: ${htmlString}}} />\n`;
  const wrapperEnd = `</div>\n`;

  const out = frontMatter + wrapperStart + inner + wrapperEnd;
  const outPath = path.join('website','docs', `${p.id}.mdx`);
  fs.writeFileSync(outPath, out, 'utf8');
  console.log('Wrote', outPath);
}
