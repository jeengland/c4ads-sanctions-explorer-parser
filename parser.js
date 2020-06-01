const csv = require('csvtojson')
const fs = require('fs')

csv()
    .fromFile('./data/SDN-00-04-joined.csv')
    .then((results) => {
        let newResults = {}
        for (const prop in results {
            if (results[prop]) {
                newResults[prop] = results[prop]
            }
        }
        return newResults
    })
    .then((results) => {
        fs.writeFile('./json/SDN-00-04-joined.json', JSON.stringify(results, null, "\t"), function (err) {
            if (err) throw err;
            console.log('Created file successfully');
        })
    })