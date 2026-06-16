/**
 * fix-html-all-v2.js
 * Second pass - fix remaining inline styles:
 * 1. Replace inline page-hero inner div style with CSS class .page-hero-inner
 * 2. Replace inline CTA section styles with CSS class .cta-section
 * 3. Replace inline about/stats section styles with CSS class .navy-section
 * 4. Fix remaining inline breadcrumb styles with CSS class
 * 5. Fix inline styles like style="text-align:center;" on hero-title
 * 6. Fix inline styles on hero-sub max-width
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function getHtmlFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(dir, f));
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Fix page-hero inner div inline style → class="page-hero-inner"
  content = content.replace(
    /<div style="position:relative;z-index:1;max-width:900px;margin:0 auto;padding:80px 5vw;text-align:center;">/g,
    '<div class="page-hero-inner">'
  );

  // 2. Fix CTA section inline background → class="cta-section"
  // Pattern: style="background:linear-gradient(135deg,var(--navy),var(--navy2));text-align:center;"
  content = content.replace(
    / style="background:linear-gradient\(135deg,var\(--navy\),var\(--navy2\)\);text-align:center;"/g,
    ' class="cta-section"'
  );

  // 3. Fix about/why sections with just the navy gradient background → class="navy-section"
  content = content.replace(
    / style="background:linear-gradient\(135deg,var\(--navy\),var\(--navy2\)\);"/g,
    ' class="navy-section"'
  );

  // 4. Fix breadcrumb ordered list inline style
  content = content.replace(
    /<ol\n?\s+style="display:flex;gap:8px;justify-content:center;list-style:none;font-size:13px;color:rgba\(255,255,255,\.5\);margin-bottom:24px;">/g,
    '<ol class="breadcrumb-list">'
  );
  // Also handle single-line version
  content = content.replace(
    /<ol style="display:flex;gap:8px;justify-content:center;list-style:none;font-size:13px;color:rgba\(255,255,255,\.5\);margin-bottom:24px;">/g,
    '<ol class="breadcrumb-list">'
  );

  // 5. Fix breadcrumb link inline style
  content = content.replace(
    /<a href="index.html" style="color:var\(--cyan\);text-decoration:none;">/g,
    '<a href="index.html" class="breadcrumb-link">'
  );

  // 6. Fix breadcrumb separator inline style
  content = content.replace(
    /<li style="color:rgba\(255,255,255,\.3\);">\//g,
    '<li class="breadcrumb-sep">/'
  );

  // 7. Fix breadcrumb current page item inline style
  content = content.replace(
    /<li style="color:rgba\(255,255,255,\.7\);">/g,
    '<li class="breadcrumb-current">'
  );

  // 8. Fix hero title text-align center inline style
  content = content.replace(
    /<h1 class="hero-title" style="text-align:center;">/g,
    '<h1 class="hero-title hero-title-center">'
  );

  // 9. Fix hero-sub max-width inline styles (various widths)
  content = content.replace(
    /<p class="hero-sub" style="max-width:680px;margin:0 auto 36px;">/g,
    '<p class="hero-sub hero-sub-page">'
  );
  content = content.replace(
    /<p class="hero-sub" style="max-width:640px;margin:0 auto;">/g,
    '<p class="hero-sub hero-sub-page">'
  );
  content = content.replace(
    /<p class="hero-sub" style="max-width:700px;margin:0 auto;">/g,
    '<p class="hero-sub hero-sub-page">'
  );

  // 10. Fix inline enquiry section background
  content = content.replace(
    /<section id="enquiry" style="background:var\(--light\);" aria-labelledby="enquiry-title">/g,
    '<section id="enquiry" aria-labelledby="enquiry-title">'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

const htmlFiles = getHtmlFiles(ROOT);
let changed = 0;
let unchanged = 0;

for (const file of htmlFiles) {
  const wasChanged = fixFile(file);
  if (wasChanged) {
    console.log(`✅ Fixed: ${path.basename(file)}`);
    changed++;
  } else {
    unchanged++;
  }
}

// Also process templates folder
const templatesDir = path.join(ROOT, 'templates');
if (fs.existsSync(templatesDir)) {
  const templateFiles = fs.readdirSync(templatesDir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(templatesDir, f));
  for (const file of templateFiles) {
    const wasChanged = fixFile(file);
    if (wasChanged) {
      console.log(`✅ Fixed template: ${path.basename(file)}`);
      changed++;
    }
  }
}

console.log(`\nDone! Changed: ${changed}, Unchanged: ${unchanged}`);
