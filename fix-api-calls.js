const fs = require('fs');
const path = require('path');

const files = [
  'public/jobs.html',
  'public/register.html',
  'public/create-job.html',
  'public/admin-stats.html',
  'public/jobs-list.html',
  'public/dashboard-admin.html',
  'public/admin-jobs.html',
  'public/admin-users.html',
  'public/login-simple.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add config.js script if not present
  if (!content.includes('js/config.js')) {
    // Find the closing </head> tag
    const headEndIndex = content.indexOf('</head>');
    if (headEndIndex !== -1) {
      content = content.slice(0, headEndIndex) + 
                '    <script src="js/config.js"></script>\n' +
                content.slice(headEndIndex);
      console.log(`Added config.js to ${file}`);
    }
  }
  
  // Replace fetch('/api/ with fetch(API_CONFIG.API_URL + 'api/
  content = content.replace(/fetch\('\/api\//g, "fetch(API_CONFIG.API_URL + 'api/");
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed API calls in ${file}`);
});

console.log('\nAll files have been updated!');
