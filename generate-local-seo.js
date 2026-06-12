const fs = require('fs');
const path = require('path');

// 1. Configuration & Paths
const DATA_FILE = path.join(__dirname, 'data', 'cities.json');
const TEMPLATE_FILE = path.join(__dirname, 'templates', 'website-development-template.html');
const LOCATIONS_OUTPUT_FILE = path.join(__dirname, 'website-development-locations.html');
const SITEMAP_FILE = path.join(__dirname, 'sitemap.xml');

// Load City Dataset
if (!fs.existsSync(DATA_FILE)) {
  console.error(`Error: Dataset file not found at ${DATA_FILE}`);
  process.exit(1);
}
const cities = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Load HTML Template
if (!fs.existsSync(TEMPLATE_FILE)) {
  console.error(`Error: HTML template file not found at ${TEMPLATE_FILE}`);
  process.exit(1);
}
const templateHtml = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// 2. Haversine Distance Formula (to calculate distance between cities)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// 3. Find 5 closest cities for a given city
function getNearbyCities(targetCity, allCities, count = 5) {
  return allCities
    .filter(c => c.slug !== targetCity.slug)
    .map(c => {
      const dist = calculateDistance(targetCity.lat, targetCity.lng, c.lat, c.lng);
      return { ...c, distance: dist };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

// 4. Main Generation Logic
console.log(`Starting Local SEO Generation for BDDN (Total Cities: ${cities.length})...`);

cities.forEach(city => {
  console.log(`- Generating: website-development-${city.slug}.html...`);

  // Build breadcrumb, title, description, and keywords
  const title = `Website Development Company in ${city.name} | Affordable Web Design`;
  const metaDescription = `Looking for a professional website developer in ${city.name}? BDDN builds custom static, dynamic, & e-commerce websites in ${city.name}, Bihar starting at ₹699. 7-day delivery!`;
  const metaKeywords = `website development ${city.name}, website maker ${city.name}, web designer ${city.name}, web developer ${city.name}, BDDN ${city.name}, affordable website Bihar, local SEO ${city.name}`;
  const canonicalUrl = `https://bddn.online/website-development-${city.slug}.html`;

  // Calculate nearby cities and generate HTML links
  const closestCities = getNearbyCities(city, cities, 5);
  const nearbyHtml = closestCities
    .map(c => `      <a href="website-development-${c.slug}.html" class="serve-card nearby-link-card">
        <span class="serve-icon-small" aria-hidden="true">📍</span>
        <h3 class="serve-title-small">${c.name}</h3>
      </a>`)
    .join('\n');

  // Generate Use Cases HTML
  const useCasesHtml = city.useCases
    .map(uc => `      <article class="service-card">
        <div class="service-icon" aria-hidden="true">${uc.icon}</div>
        <h3>${uc.title}</h3>
        <p>${uc.desc}</p>
      </article>`)
    .join('\n');

  // Generate FAQs HTML
  const faqsHtml = city.faqs
    .map(faq => `      <div class="faq-item-card">
        <h3>${faq.q}</h3>
        <p>${faq.a}</p>
      </div>`)
    .join('\n');

  // Build JSON-LD Schema
  const schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://bddn.online/#organization",
        "name": "Bihar Digital Data and Network",
        "alternateName": "BDDN",
        "url": "https://bddn.online/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bddn.online/bddn_logo.png"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-79822-29379",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["Hindi", "English"]
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Darbhanga",
          "addressRegion": "Bihar",
          "addressCountry": "IN"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://bddn.online/#website",
        "url": "https://bddn.online/",
        "name": "BDDN – Bihar Digital Data & Network",
        "publisher": { "@id": "https://bddn.online/#organization" },
        "inLanguage": "en-IN"
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        "url": canonicalUrl,
        "name": title,
        "isPartOf": { "@id": "https://bddn.online/#website" },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://bddn.online/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Locations",
              "item": "https://bddn.online/website-development-locations.html"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": `Website Development ${city.name}`,
              "item": canonicalUrl
            }
          ]
        }
      },
      {
        "@type": "LocalBusiness",
        "@id": `${canonicalUrl}#localbusiness`,
        "name": `Bihar Digital Data and Network (BDDN) - ${city.name}`,
        "url": canonicalUrl,
        "telephone": "+91-79822-29379",
        "email": "info@bddn.online",
        "image": "https://bddn.online/bddn_logo.png",
        "priceRange": "₹699 – ₹14,999",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city.name,
          "addressRegion": "Bihar",
          "postalCode": city.postalCode,
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": city.lat.toString(),
          "longitude": city.lng.toString()
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
          "opens": "09:00",
          "closes": "21:00"
        }
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        "name": `Website Development in ${city.name}`,
        "url": canonicalUrl,
        "provider": { "@id": "https://bddn.online/#organization" },
        "areaServed": { "@type": "City", "name": city.name },
        "description": `Professional website development for businesses in ${city.name} and surrounding areas of Bihar. Starting at ₹699.`,
        "offers": [
          { "@type": "Offer", "name": "Basic Landing Page", "price": "699", "priceCurrency": "INR" },
          { "@type": "Offer", "name": "Static Business Website", "price": "2999", "priceCurrency": "INR" },
          { "@type": "Offer", "name": "E-Commerce Website", "price": "14999", "priceCurrency": "INR" }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": city.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ]
  };

  const schemaMarkup = JSON.stringify(schemaObj, null, 2);

  // Perform replacements on template
  let pageContent = templateHtml
    .replace(/{{CANONICAL_URL}}/g, canonicalUrl)
    .replace(/{{TITLE}}/g, title)
    .replace(/{{META_DESCRIPTION}}/g, metaDescription)
    .replace(/{{META_KEYWORDS}}/g, metaKeywords)
    .replace(/{{CITY_NAME}}/g, city.name)
    .replace(/{{INTRO_TEXT}}/g, city.introduction)
    .replace(/{{USE_CASES_HTML}}/g, useCasesHtml)
    .replace(/{{FAQS_HTML}}/g, faqsHtml)
    .replace(/{{NEARBY_LOCATIONS_HTML}}/g, nearbyHtml)
    .replace(/{{SCHEMA_MARKUP}}/g, schemaMarkup);

  // Write page
  const outputFilePath = path.join(__dirname, `website-development-${city.slug}.html`);
  fs.writeFileSync(outputFilePath, pageContent, 'utf8');
});

// 5. Generate website-development-locations.html (Index Hub)
console.log(`- Generating: website-development-locations.html...`);

const locationsTitle = "Website Development Services in Bihar | Service Locations";
const locationsDesc = "We provide professional, fast-loading, and affordable website development services across all major locations in Bihar including Patna, Darbhanga, Begusarai, Muzaffarpur, and more.";
const locationsKeywords = "website development locations, website developer Bihar, BDDN locations, local website makers Bihar";
const locationsCanonical = "https://bddn.online/website-development-locations.html";
const locationsIntro = "To serve you better, Bihar Digital Data & Network (BDDN) provides dedicated website development, local SEO, and digital marketing services across multiple cities in Bihar. Select your location below to explore customized solutions for your local business.";

const citiesGridHtml = cities
  .map(c => `      <a href="website-development-${c.slug}.html" class="serve-card locations-grid-card">
        <span class="serve-icon" aria-hidden="true">📍</span>
        <h3>${c.name}</h3>
        <p>Website Developer in ${c.name}</p>
        <span class="view-services-btn">View Services →</span>
      </a>`)
  .join('\n');

const locationsFaqsHtml = `      <div class="faq-item-card">
        <h3>Which cities do you serve in Bihar?</h3>
        <p>BDDN serves all major districts and cities in Bihar, including Patna, Darbhanga, Begusarai, Muzaffarpur, Bhagalpur, Gaya, and more. Select your city from our locations directory to view tailored services.</p>
      </div>
      <div class="faq-item-card">
        <h3>Do you provide remote support for projects?</h3>
        <p>Yes, we collaborate seamlessly with clients across Bihar using online channels (WhatsApp, Zoom, and Email). We provide high-quality support and delivery without needing physical travel.</p>
      </div>`;

const locationsNearbyHtml = `      <div class="locations-nearby-box">
        <p class="locations-nearby-text">Don't see your city listed above? BDDN serves businesses across all of Bihar and India remotely.</p>
        <a href="contact.html" class="btn btn-outline-dark locations-nearby-btn">Get in Touch</a>
      </div>`;

const locationsSchemaObj = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${locationsCanonical}#webpage`,
      "url": locationsCanonical,
      "name": locationsTitle,
      "isPartOf": { "@id": "https://bddn.online/#website" },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bddn.online/" },
          { "@type": "ListItem", "position": 2, "name": "Locations", "item": locationsCanonical }
        ]
      }
    }
  ]
};

let locationsContent = templateHtml
  .replace(/{{CANONICAL_URL}}/g, locationsCanonical)
  .replace(/{{TITLE}}/g, locationsTitle)
  .replace(/{{META_DESCRIPTION}}/g, locationsDesc)
  .replace(/{{META_KEYWORDS}}/g, locationsKeywords)
  .replace(/{{CITY_NAME}}/g, "Bihar")
  .replace(/{{INTRO_TEXT}}/g, locationsIntro)
  .replace(/{{USE_CASES_HTML}}/g, citiesGridHtml)
  .replace(/{{FAQS_HTML}}/g, locationsFaqsHtml)
  .replace(/{{NEARBY_LOCATIONS_HTML}}/g, locationsNearbyHtml)
  .replace(/{{SCHEMA_MARKUP}}/g, JSON.stringify(locationsSchemaObj, null, 2));

// In locations hub breadcrumb we don't need double locations page, let's fix it dynamically:
locationsContent = locationsContent.replace(
  `<li><a href="index.html" style="color:var(--cyan);text-decoration:none;">Home</a></li>
          <li style="color:rgba(255,255,255,.3);">/</li>
          <li style="color:rgba(255,255,255,.3);"><a href="website-development-locations.html" style="color:var(--cyan);text-decoration:none;">Locations</a></li>
          <li style="color:rgba(255,255,255,.3);">/</li>
          <li style="color:rgba(255,255,255,.7);">Website Development Bihar</li>`,
  `<li><a href="index.html" style="color:var(--cyan);text-decoration:none;">Home</a></li>
          <li style="color:rgba(255,255,255,.3);">/</li>
          <li style="color:rgba(255,255,255,.7);">Our Service Locations</li>`
);

// We should also replace the title of sections to make sense for locations hub:
locationsContent = locationsContent
  .replace("Website Solutions for Bihar Businesses", "Our Bihar Locations Directory")
  .replace("Website Development FAQ – Bihar", "Frequently Asked Questions")
  .replace("in Bihar, Bihar", "across Bihar")
  .replace("📍 Bihar, Bihar", "📍 Darbhanga, Bihar");

fs.writeFileSync(LOCATIONS_OUTPUT_FILE, locationsContent, 'utf8');

// 6. Generate sitemap.xml
console.log(`- Generating: sitemap.xml...`);

const currentDate = new Date().toISOString().split('T')[0];

const files = fs.readdirSync(__dirname);
const coreHtmlFiles = [
  'index.html',
  'about.html',
  'contact.html',
  'portfolio.html',
  'blog.html',
  'privacy-policy.html',
  'terms-and-conditions.html',
  'website-development-locations.html',
  'ecommerce-website-darbhanga.html',
  'logo-design-darbhanga.html',
  'seo-services-darbhanga.html'
];

// Combine core files and dynamically detect generated website-development-{city}.html files
const generatedCityFiles = files.filter(f => 
  f.startsWith('website-development-') && 
  f.endsWith('.html') && 
  f !== 'website-development-locations.html' && 
  f !== 'website-development-template.html'
);

// Define sitemap metadata structures
const sitemapPriorities = {
  'index.html': { priority: '1.0', freq: 'monthly' },
  'about.html': { priority: '0.8', freq: 'yearly' },
  'contact.html': { priority: '0.9', freq: 'yearly' },
  'portfolio.html': { priority: '0.8', freq: 'monthly' },
  'blog.html': { priority: '0.9', freq: 'weekly' },
  'website-development-locations.html': { priority: '0.9', freq: 'monthly' },
  'ecommerce-website-darbhanga.html': { priority: '0.9', freq: 'monthly' },
  'seo-services-darbhanga.html': { priority: '0.9', freq: 'monthly' },
  'logo-design-darbhanga.html': { priority: '0.85', freq: 'monthly' },
  'privacy-policy.html': { priority: '0.5', freq: 'yearly' },
  'terms-and-conditions.html': { priority: '0.5', freq: 'yearly' }
};

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Core Pages -->`;

// Add core pages
coreHtmlFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    const loc = file === 'index.html' ? 'https://bddn.online/' : `https://bddn.online/${file}`;
    const meta = sitemapPriorities[file] || { priority: '0.5', freq: 'yearly' };
    sitemapXml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${meta.freq}</changefreq>
    <priority>${meta.priority}</priority>
  </url>`;
  }
});

sitemapXml += `\n\n  <!-- Generated Local SEO Pages -->`;

// Add generated city pages
generatedCityFiles.sort().forEach(file => {
  const loc = `https://bddn.online/${file}`;
  sitemapXml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.95</priority>
  </url>`;
});

sitemapXml += `\n\n</urlset>\n`;

fs.writeFileSync(SITEMAP_FILE, sitemapXml, 'utf8');

// 7. Auto-update footers in core files to include Service Locations link
console.log(`- Updating footer links in core HTML files...`);
const coreFilesToUpdate = [
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
  'website-development-darbhanga.html'
];

coreFilesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if locations link is already there
    if (!content.includes('website-development-locations.html')) {
      let updated = false;

      // Regex 1: Contact followed by Privacy Policy
      const regex1 = /(<li><a\s+href="contact\.html">Contact<\/a><\/li>)(\s*<li><a\s+href="privacy-policy\.html"[^>]*>Privacy Policy<\/a><\/li>)/;
      // Regex 2: Contact followed by closing ul
      const regex2 = /(<li><a\s+href="contact\.html">Contact<\/a><\/li>)(\s*<\/ul>)/;

      if (regex1.test(content)) {
        content = content.replace(regex1, `$1\n          <li><a href="website-development-locations.html">Service Locations</a></li>$2`);
        updated = true;
      } else if (regex2.test(content)) {
        content = content.replace(regex2, `$1\n          <li><a href="website-development-locations.html">Service Locations</a></li>$2`);
        updated = true;
      }

      if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  Updated footer in: ${file}`);
      }
    }
  }
});

console.log(`Local SEO Generation complete! Generated ${cities.length} city pages, locations hub, and updated sitemap.xml.`);

