const fs = require('fs');
const path = require('path');

const ROOT_DIR = '/Users/mdimraniqbal/Downloads/Notebook/BDDN/website/old/bddn-dbg.github.io-main';

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
  const filePath = path.join(ROOT_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping non-existent: ${fileName}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // We want to find the <ul class="nav-links"> block and ensure it has the portfolio link.
  const navLinksMatch = content.match(/<ul class="nav-links"[\s\S]*?<\/ul>/);
  if (!navLinksMatch) {
    console.log(`Error: Could not find <ul class="nav-links"> in ${fileName}`);
    return;
  }
  
  if (navLinksMatch[0].includes('href="portfolio.html"')) {
    console.log(`${fileName} already has portfolio.html link in desktop navbar.`);
    return;
  }

  // Let's replace:
  // <li><a href="about.html"...>About</a></li>
  // with:
  // <li><a href="about.html"...>About</a></li>
  //       <li><a href="portfolio.html" [aria-current="page"]>Portfolio</a></li>
  
  let regex = /(<li><a\s+href="about\.html"[^>]*>About<\/a><\/li>)/g;
  
  if (!regex.test(content)) {
    console.log(`Error: Could not find About link in ${fileName}`);
    return;
  }
  
  // Determine if this file is portfolio.html itself (needs aria-current="page")
  const isPortfolio = (fileName === 'portfolio.html');
  const portfolioLinkHtml = isPortfolio 
    ? '\n      <li><a href="portfolio.html" aria-current="page">Portfolio</a></li>'
    : '\n      <li><a href="portfolio.html">Portfolio</a></li>';

  content = content.replace(regex, `$1${portfolioLinkHtml}`);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully updated: ${fileName}`);
});
