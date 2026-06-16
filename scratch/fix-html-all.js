/**
 * fix-html-all.js
 * Fixes the following issues across ALL HTML files:
 * 1. Replace <span class="mobile-close"> with <button class="mobile-close" type="button"> (accessibility)
 * 2. Replace inline SVG style on whatsapp float icon with class="wa-svg-icon"
 * 3. Replace inline SVG style on contact card whatsapp button with class="wa-svg-btn-icon"
 * 4. Fix footer-bottom link style inline styles with class
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

  // 1. Fix mobile-close: span → button (proper semantic element for accessibility)
  // Pattern: <span class="mobile-close" aria-label="Close Menu" role="button" tabindex="0">✕</span>
  content = content.replace(
    /<span class="mobile-close" aria-label="Close Menu" role="button" tabindex="0">✕<\/span>/g,
    '<button class="mobile-close" aria-label="Close navigation menu" type="button">✕</button>'
  );

  // 2. Fix WhatsApp float SVG icon: remove inline style, add class
  // Pattern in secondary pages: <svg style="width:30px;height:30px;fill:currentColor;" viewBox="0 0 24 24"
  content = content.replace(
    /<svg style="width:30px;height:30px;fill:currentColor;" viewBox="0 0 24 24" aria-hidden="true" focusable="false">/g,
    '<svg class="wa-svg-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
  );

  // 3. Fix WhatsApp contact card button SVG: remove inline style, add class
  // Pattern in contact.html: <svg style="width:20px;height:20px;fill:currentColor;margin-right:8px;" viewBox="0 0 24 24"
  content = content.replace(
    /<svg style="width:20px;height:20px;fill:currentColor;margin-right:8px;" viewBox="0 0 24 24" aria-hidden="true" focusable="false">/g,
    '<svg class="wa-svg-btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
  );

  // 4. Fix footer-bottom link inline styles (e.g. contact.html had these)
  // Pattern: <a href="privacy-policy.html" style="color:rgba(255,255,255,.5);">
  content = content.replace(
    / style="color:rgba\(255,255,255,\.5\);"/g,
    ' class="footer-bottom-link"'
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

console.log(`\nDone! Changed: ${changed}, Unchanged: ${unchanged}`);
