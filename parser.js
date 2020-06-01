const csv = require('csvtojson')
const fs = require('fs')

const parser = (filename, dir) => {
    csv()
        .fromFile(`${dir}/${filename}.csv`)
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
            fs.writeFile(`./json/${filename}.json`, JSON.stringify(results, null, "\t"), (err) => {
                if (err) {
                    throw err
                };
                console.log('Created file successfully');
            })
        })
}

const getFileNames = (dir) => {
    fs.readdir(dir, (err, files) => {
        if (err) {
            throw err;
        }
        const formattedFiles = files.map((file) => {
            return file.slice(0, file.indexOf('.csv'))
        })
        console.log(formattedFiles);
        return formattedFiles;
    })
}

getFileNames('./data')