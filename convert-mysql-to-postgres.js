const fs = require('fs');
const path = require('path');

// Fonction pour convertir les placeholders MySQL (?) en PostgreSQL ($1, $2, ...)
function convertPlaceholders(sql) {
  let counter = 1;
  return sql.replace(/\?/g, () => `$${counter++}`);
}

// Fonction pour convertir les types ENUM
function convertEnums(sql) {
  // MySQL: ENUM('a', 'b') -> PostgreSQL: utiliser le type créé dans database_postgres.sql
  // C'est déjà géré dans le schema SQL, donc pas besoin de conversion ici
  return sql;
}

// Lister tous les fichiers JavaScript dans routes/ et src/
const directories = [
  'routes',
  'src/routes',
  'src/controllers',
  'src/models'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Chercher les patterns SQL avec ?
    const sqlPattern = /`[^`]*\?[^`]*`|'[^']*\?[^']*'/g;
    let match;
    let modified = false;

    // On va être plus simple: remplacer tous les ? dans les strings SQL
    // Mais attention: il faut identifier les chaînes SQL
    const lines = content.split('\n');
    const newLines = lines.map(line => {
      if (line.includes('?') && (line.includes('query(') || line.includes('execute('))) {
        // Convertir les placeholders
        let counter = 1;
        return line.replace(/\?/g, () => `$${counter++}`);
      }
      return line;
    });

    if (newLines.join('\n') !== content) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
      console.log(`Converted: ${filePath}`);
    }
  });
});

console.log('Conversion MySQL → PostgreSQL terminée!');
