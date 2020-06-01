const csv = require('csvtojson')
const fs = require('fs')

csv()
    .fromFile('./data/SDN-00-04-joined.csv')
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
        fs.writeFile('./json/SDN-00-04-joined.json', JSON.stringify(results, null, "\t"), function (err) {
            if (err) throw err;
            console.log('Created file successfully');
        })
    })