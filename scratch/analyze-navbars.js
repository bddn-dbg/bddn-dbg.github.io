const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function getHtmlFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(dir, f));
}

const htmlFiles = getHtmlFiles(ROOT);
const templatesDir = path.join(ROOT, 'templates');
if (fs.existsSync(templatesDir)) {
  fs.readdirSync(templatesDir)
    .filter(f => f.endsWith('.html'))
    .forEach(f => htmlFiles.push(path.join(templatesDir, f)));
}

// Baselines
const indexMobile = [
  { href: 'https://bddn.online/', text: 'Home' },
  { href: '#services', text: 'Services' },
  { href: 'about.html', text: 'About Us' },
  { href: 'portfolio.html', text: 'Portfolio' },
  { href: 'blog.html', text: 'Blog' },
  { href: 'contact.html', text: 'Contact' },
  { href: '#enquiry', text: 'Enquiry' },
  { href: 'https://bddn.online/bddn-institute.github.io/', text: 'BDDN Institute' }
];

const indexDesktop = [
  { href: 'https://bddn.online/', text: 'Home' },
  { href: '#services', text: 'Services' },
  { href: 'about.html', text: 'About' },
  { href: 'portfolio.html', text: 'Portfolio' },
  { href: 'blog.html', text: 'Blog' },
  { href: 'contact.html', text: 'Contact' },
  { href: 'https://bddn.online/bddn-institute.github.io/', text: 'BDDN Institute' },
  { href: '#enquiry', text: 'Get Quote' }
];

const subpageMobile = [
  { href: 'index.html', text: 'Home' },
  { href: 'index.html#services', text: 'Services' },
  { href: 'about.html', text: 'About Us' },
  { href: 'portfolio.html', text: 'Portfolio' },
  { href: 'blog.html', text: 'Blog' },
  { href: 'contact.html', text: 'Contact' },
  { href: 'index.html#enquiry', text: 'Enquiry' },
  { href: 'https://bddn.online/bddn-institute.github.io/', text: 'BDDN Institute' }
];

const subpageDesktop = [
  { href: 'index.html', text: 'Home' },
  { href: 'index.html#services', text: 'Services' },
  { href: 'about.html', text: 'About' },
  { href: 'portfolio.html', text: 'Portfolio' },
  { href: 'blog.html', text: 'Blog' },
  { href: 'contact.html', text: 'Contact' },
  { href: 'https://bddn.online/bddn-institute.github.io/', text: 'BDDN Institute' },
  { href: 'index.html#enquiry', text: 'Get Quote' }
];

function cleanHref(href) {
  if (href === 'https://bddn.online' || href === 'https://bddn.online/') return 'index.html';
  return href;
}

htmlFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const baseName = path.relative(ROOT, filePath);

  const isIndex = (baseName === 'index.html');
  const targetMobile = isIndex ? indexMobile : subpageMobile;
  const targetDesktop = isIndex ? indexDesktop : subpageDesktop;

  const mobileMenuMatch = content.match(/<div class="mobile-menu"[^>]*>([\s\S]*?)<\/div>/);
  const navLinksMatch = content.match(/<ul class="nav-links"[^>]*>([\s\S]*?)<\/ul>/);

  const mLinks = [];
  if (mobileMenuMatch) {
    const linkRegex = /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(mobileMenuMatch[1])) !== null) {
      mLinks.push({ href: cleanHref(match[1]), text: match[2].trim().replace(/\s+/g, ' ') });
    }
  }

  const dLinks = [];
  if (navLinksMatch) {
    const linkRegex = /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(navLinksMatch[1])) !== null) {
      dLinks.push({ href: cleanHref(match[1]), text: match[2].trim().replace(/\s+/g, ' ') });
    }
  }

  const discrepancies = [];

  // Compare Mobile
  if (!mobileMenuMatch) {
    discrepancies.push('Mobile Menu DIV missing');
  } else {
    if (mLinks.length !== targetMobile.length) {
      discrepancies.push(`Mobile menu links count mismatch (expected ${targetMobile.length}, found ${mLinks.length})`);
    } else {
      for (let i = 0; i < targetMobile.length; i++) {
        const expected = targetMobile[i];
        const found = mLinks[i];
        if (cleanHref(expected.href) !== cleanHref(found.href) || expected.text !== found.text) {
          discrepancies.push(`Mobile link #${i} mismatch: expected { href: "${expected.href}", text: "${expected.text}" }, found { href: "${found.href}", text: "${found.text}" }`);
        }
      }
    }
  }

  // Compare Desktop
  if (!navLinksMatch) {
    discrepancies.push('Desktop nav UL missing');
  } else {
    if (dLinks.length !== targetDesktop.length) {
      discrepancies.push(`Desktop nav links count mismatch (expected ${targetDesktop.length}, found ${dLinks.length})`);
    } else {
      for (let i = 0; i < targetDesktop.length; i++) {
        const expected = targetDesktop[i];
        const found = dLinks[i];
        if (cleanHref(expected.href) !== cleanHref(found.href) || expected.text !== found.text) {
          discrepancies.push(`Desktop link #${i} mismatch: expected { href: "${expected.href}", text: "${expected.text}" }, found { href: "${found.href}", text: "${found.text}" }`);
        }
      }
    }
  }

  if (discrepancies.length > 0) {
    console.log(`\n❌ DISCREPANCIES IN ${baseName}:`);
    discrepancies.forEach(d => console.log(`  - ${d}`));
  }
});
