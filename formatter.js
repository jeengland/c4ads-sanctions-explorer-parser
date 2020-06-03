const parser = require('./parser.js');
const fs = require('fs');
const crypto = require('crypto');

const filter = require('./filter.json');

// This script is the specific formatter for the C4ADS dataset
// ----- Cleaner for known anomalies -----
const cleaner = (json) => {
    const newJson = json.map((obj) => {
        if (obj.identification_number[1]) {
            obj.identification_number = obj.identification_number[1];
        } else {
            delete obj.identification_number;
        }
        if (!obj.identification_number_country[0]) {
            delete obj.identification_number_country;
        } 
        if (obj.c.o) {
            obj.co = obj.c.o;
        }
        delete obj.c;
        if (obj.company.number) {
            obj.company_number = obj.company.number;
        }
        delete obj.company;
        if (obj.swift.bic) {
            obj.swift_bic = obj.swift.bic;
        }
        delete obj.swift;
        if (obj.un.locode) {
            obj.un_locode = obj.un.locode;
        }
        delete obj.un;
        return obj;
    })
    return newJson
}
// ----- Function to normalize key names -----
const normalize = (json) => {
    const newJson = json.map((obj) => {
        obj.cedula_number = obj.cedula_no;
        delete obj.cedula_no;
        obj.matricula_mercantil_number = obj.matricula_mercantil_no;
        delete obj.matricula_mercantil_no;
        obj.ruc_number = obj.ruc;
        delete obj.ruc;
        obj.visa_number_id = obj.visanumberid;
        delete obj.visanumberid;
        obj.electoral_registry_number = obj.electoral_registry_no;
        delete obj.electoral_registry_no;
        obj.drivers_license_number = obj.drivers_license_no;
        delete obj.drivers_license_no;
        obj.registered_charity_number = obj.registered_charity_no;
        delete obj.registered_charity_no;
        obj.trade_license_number = obj.trade_license_no;
        delete obj.trade_license_no;
        obj.tourism_license_number = obj.tourism_license_no;
        delete obj.tourism_license_no;
        obj.folio_mercantil_number = obj.folio_mercantil_no;
        delete obj.folio_mercantil_no;
        return obj;
    })
    return newJson
}

// ----- Middleware function that runs all of the other functions together -----
const formatter = (json) => {
    json = cleaner(json);
    json = normalize(json);
    return json;
}

const tableKeys = filter.individual_keys;

parser.parse('ofac', './data', formatter)
    .then((results) => {
        startTime = Date.now();
        let ind = {};
        ind.individual = [];
        ind.individual_attributes = [];
        ind.individual_contact_info = [];
        ind.individual_actions = [];
        ind.individual_remarks = [];
        let idList = {};
        results.forEach((result) => {
            if (result.entity_type === 'individual') {
                let id = null;
                if (result.first_name && result.last_name) {
                    id = `${result.first_name}${result.last_name}`
                } else if (result.first_name) {
                    id = result.first_name
                } else if (result.last_name) {
                    id = result.last_name
                } else if (result.entity_name) {
                    id = result.entity_name
                }
                let hash = crypto.createHash('sha1');
                result.individual_id = hash.update(id, 'utf8').digest('base64')
                for (const table in ind) {
                    if (table === 'individual' && idList[result.individual_id]) {
                        return null;
                    } else {
                        const newTable = {}
                        tableKeys[table].forEach((key) => {
                            if (result[key]) {
                                newTable[key] = result[key]
                            }
                        })
                        if (Object.keys(newTable).length > 1) {
                            ind[table].push(newTable)
                        }
                        if (table === 'individual') {
                            idList[result.individual_id] = true;
                        }
                    }    
                }
            }
        })
        console.log(`${ind.individual.length} unique individuals`)
        fs.writeFile(`./json/individuals.json`, JSON.stringify(ind, null, "\t"), (err) => {
            if (err) {
                throw err;
            };
            totalTime = Date.now() - startTime;
            console.log(`Created individuals.json successfully in ${totalTime} ms`);
        })
    })