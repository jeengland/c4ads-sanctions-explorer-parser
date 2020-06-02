const parser = require('./parser.js');

// Use data folder as a default directory but accept an argument if one exists
const runDir = process.argv[2] || './data';

parser.parseAllFiles(runDir);