const fs = require('fs');
const path = require('path');

const files = [
  'public/admin-users.html',
  'public/admin-jobs.html',
  'public/dashboard-admin.html',
  'public/jobs-list.html',
  'public/admin-stats.html',
  'public/applications.html',
  'public/profile-candidat.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace data.data. with data.
  const originalLength = content.length;
  content = content.replace(/data\.data\./g, 'data.');
  
  if (content.length !== originalLength) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed data.data. in ${file}`);
  } else {
    console.log(`No changes needed in ${file}`);
  }
});

console.log('\nAll files have been processed!');
