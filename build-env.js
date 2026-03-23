const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'https://controles-gsti-taller-backend.onrender.com';
const content = `// env.js — generado en build\n(function () {\n  window.APP_CONFIG = window.APP_CONFIG || {};\n  window.APP_CONFIG.API_URL = ${JSON.stringify(apiUrl)};\n})();\n`;

const outPath = path.join(__dirname, 'public', 'env.js');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, 'utf8');
console.log('Generated', outPath);
