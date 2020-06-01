const csv = require('csvtojson')
const fs = require('fs')

const parse = (fileName, dir) => {
    csv()
        .fromFile(`${dir}/${fileName}.csv`)
        .then((results) => {
            const newResults = results.map((result) => {
                let newResult = {}
                for (const prop in result) {
                    if (result[prop]) {
                        newResult[prop] = result[prop]
                    }
                }
                return newResult
                })
            return newResults;
        })
        .then((results) => {
            fs.writeFile(`./json/${fileName}.json`, JSON.stringify(results, null, "\t"), (err) => {
                if (err) {
                    throw err
                };
                console.log('Created file successfully');
            })
        })
}

function getFileNames(dir) {
    file = fs.readdirSync(dir, (err, files) => {
        if (err) {
            throw err;
        }
        return files;
    })
    const formattedFiles = file.map((file) => {
        return file.slice(0, file.indexOf('.csv'))
    })
    return formattedFiles;
}

const parseAllFiles = (dir) => {
    const fileNames = getFileNames(dir);
    fileNames.forEach((fileName) => {
        parse(fileName, dir);
    })
}

parseAllFiles('./data')