const csv = require('csvtojson');
const fs = require('fs');

// ----- Parser to convert CSV to JSON and remove null keys -----
const parse = (fileName, dir, middleware) => {
    // The parser accepts a directory, a filename without extension and it returns a promise
    return csv()
        .fromFile(`${dir}/${fileName}.csv`)
        .then((results) => {
            // Loop through each key/value pair in the new JSON object
            const newResults = results.map((result) => {
                let newResult = {};
                for (const prop in result) {
                    // Only carry over keys if their values exist
                    if (result[prop]) {
                        newResult[prop] = result[prop];
                    }
                }
                return newResult;
            })
            return newResults;
        })
        // Run a middleware function if it exists
        .then((results) => {
            if (middleware) {
                return middleware(results)
            } else {
                return results
            }
        })
        .then((results) => {
            // Write the files to a json, stringify them with a tab in between values
            fs.writeFile(`./json/${fileName}.json`, JSON.stringify(results, null, "\t"), (err) => {
                if (err) {
                    throw err;
                };
                console.log(`Created ${fileName}.json successfully`);
            })
            return results;
        })
}
    
// ----- Function to get the names of all files in a folder and remove the .csv extension -----
function getFileNames(dir) {
    // Create a list of all the filenames
    filesArr = fs.readdirSync(dir, (err, files) => {
        if (err) {
            throw err;
        }
        return files;
    })
    // Remove all files that aren't .csv files
    filesArr = filesArr.filter((file) => file.includes('.csv'))
    // Remove the .csv extension
    const formattedFiles = filesArr.map((file) => {
        return file.slice(0, file.indexOf('.csv'));
    })
    return formattedFiles;
}
    
// ----- Function to map through each CSV in a folder and run it through the parser -----
const parseAllFiles = (dir) => {
    const fileNames = getFileNames(dir);
    let totalFiles = 0;
    fileNames.forEach((fileName) => {
        parse(fileName, dir)
            .then(() => totalFiles++)
            .catch((err) => console.error(err));
    })
}

// Use data folder as a default directory but accept an argument if one exists
const runDir = process.argv[2] || './data';

parseAllFiles(runDir)

module.exports = {
    parse,
    parseAllFiles
};