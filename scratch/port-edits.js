const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROD_DIR = '/Users/mdimraniqbal/Downloads/Notebook/BDDN/website/bddn-dbg.github.io-main';

// 1. Update templates/website-development-template.html
const templatePath = path.join(PROD_DIR, 'templates/website-development-template.html');
let templateContent = fs.readFileSync(templatePath, 'utf8');
if (!templateContent.match(/<ul class="nav-links"[\s\S]*?href="portfolio.html"/)) {
  templateContent = templateContent.replace(
    /(<li><a\s+href="about\.html"[^>]*>About<\/a><\/li>)/g,
    '$1\n      <li><a href="portfolio.html">Portfolio</a></li>'
  );
  fs.writeFileSync(templatePath, templateContent, 'utf8');
  console.log('Template updated.');
} else {
  console.log('Template already has portfolio link.');
}

// 2. Update navbars in all core HTML files
const coreHtmlFiles = [
  'index.html',
  'about.html',
  'contact.html',
  'portfolio.html',
  'blog.html',
  'privacy-policy.html',
  'terms-and-conditions.html',
  'ecommerce-website-darbhanga.html',
  'logo-design-darbhanga.html',
  'seo-services-darbhanga.html',
  'website-development-locations.html'
];

coreHtmlFiles.forEach(fileName => {
  const filePath = path.join(PROD_DIR, fileName);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const navLinksMatch = content.match(/<ul class="nav-links"[\s\S]*?<\/ul>/);
  if (navLinksMatch && !navLinksMatch[0].includes('href="portfolio.html"')) {
    const isPortfolio = (fileName === 'portfolio.html');
    const portfolioLinkHtml = isPortfolio 
      ? '\n      <li><a href="portfolio.html" aria-current="page">Portfolio</a></li>'
      : '\n      <li><a href="portfolio.html">Portfolio</a></li>';
    content = content.replace(/(<li><a\s+href="about\.html"[^>]*>About<\/a><\/li>)/g, `$1${portfolioLinkHtml}`);
    changed = true;
  }

  // Ensure it is in the mobile menu as well
  if (!content.includes('<a href="portfolio.html">Portfolio</a>')) {
    content = content.replace(
      /(<a\s+href="about\.html">About Us<\/a>)/g,
      '$1\n    <a href="portfolio.html">Portfolio</a>'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Navbar updated in: ${fileName}`);
  } else {
    console.log(`Navbar already consistent in: ${fileName}`);
  }
});

// 3. Replace pincode 846001 with 846004 everywhere in PROD_DIR
function replacePincodeInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('846001')) {
    content = content.replace(/846001/g, '846004');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Pincode replaced in: ${path.basename(filePath)}`);
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.git') {
        processDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (ext === '.html' || ext === '.json' || ext === '.js') {
        replacePincodeInFile(fullPath);
      }
    }
  }
}
processDirectory(PROD_DIR);

// 4. Update style.css
const cssPath = path.join(PROD_DIR, 'style.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
const overrides = '\n.legal-content{min-width:0}.legal-card{min-width:0}.table-container{width:100%;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}\n';
if (!cssContent.includes('.legal-content{min-width:0}')) {
  cssContent += overrides;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('CSS overrides appended to style.css.');
} else {
  console.log('CSS overrides already present.');
}

// 5. Run node generate-local-seo.js to rebuild local city pages
console.log('Regenerating local SEO pages...');
try {
  execSync('node generate-local-seo.js', { cwd: PROD_DIR, stdio: 'inherit' });
  console.log('Local SEO pages regenerated.');
} catch (e) {
  console.error('Failed to regenerate SEO pages:', e.message);
}
