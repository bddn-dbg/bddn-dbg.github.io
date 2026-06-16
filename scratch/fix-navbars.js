const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const filesToFix = [
  'about.html',
  'blog.html',
  'contact.html',
  'ecommerce-website-darbhanga.html',
  'logo-design-darbhanga.html',
  'portfolio.html',
  'privacy-policy.html',
  'seo-services-darbhanga.html',
  'terms-and-conditions.html'
];

filesToFix.forEach(fileName => {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist: ${fileName}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace href="#" for mobile-institute-cta
  content = content.replace(
    /href="#"(\s+target="_blank"\s+rel="noopener noreferrer"\s+class="mobile-institute-cta")/g,
    'href="https://bddn.online/bddn-institute.github.io/"$1'
  );

  // Replace href="#" for nav-institute-cta
  content = content.replace(
    /href="#"(\s+target="_blank"\s+rel="noopener noreferrer"\s+class="nav-institute-cta")/g,
    'href="https://bddn.online/bddn-institute.github.io/"$1'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrected BDDN Institute links in: ${fileName}`);
  } else {
    console.log(`⚠️ No changes made in: ${fileName} (regex might not have matched or already correct)`);
  }
});
