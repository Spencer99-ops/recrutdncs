const fs = require('fs');
const path = require('path');

const directories = [
  'routes',
  'src/routes',
  'src/controllers',
  'src/models',
  'server.js'
];

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern pour détecter les requêtes SQL avec des placeholders ?
  // On cherche les chaînes contenant SQL avec query() ou execute()
  const lines = content.split('\n');
  const newLines = [];

  for (let line of lines) {
    let newLine = line;
    let inSqlString = false;
    let sqlStartQuote = null;
    let sqlString = '';
    let beforeSql = '';
    let afterSql = '';

    // Détecter si la ligne contient une requête SQL
    if (line.includes('?') && (line.includes('query(') || line.includes('execute(') || line.includes('.query('))) {
      // Trouver la chaîne SQL (entre quotes)
      const quoteMatches = line.match(/(['"`])(.*?)\1/g);
      if (quoteMatches) {
        for (let match of quoteMatches) {
          if (match.includes('?')) {
            // C'est probablement une chaîne SQL
            const quote = match[0];
            const sqlContent = match.slice(1, -1);
            let counter = 1;
            const convertedSql = sqlContent.replace(/\?/g, () => `$${counter++}`);
            newLine = newLine.replace(match, `${quote}${convertedSql}${quote}`);
            modified = true;
          }
        }
      }
    }
    newLines.push(newLine);
  }

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`Converted: ${filePath}`);
    return true;
  }
  return false;
}

// Convertir les fichiers
directories.forEach(dir => {
  if (dir.endsWith('.js')) {
    // C'est un fichier
    if (fs.existsSync(dir)) {
      convertFile(dir);
    }
  } else if (fs.existsSync(dir)) {
    // C'est un répertoire
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    files.forEach(file => {
      const filePath = path.join(dir, file);
      convertFile(filePath);
    });
  }
});

console.log('Conversion terminée!');
