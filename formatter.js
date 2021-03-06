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

// ----- Function to run parser with formatter middleware and sort results by entity type -----
parser.parse('ofac', './data', formatter)
    .then((results) => {
        for (tableKeys in filter) {
            let entityTable = {};
            for (const table in filter[tableKeys]) {
                entityTable[table] = [];
            }
            let idList = {};
            results.forEach((result) => {
                if (tableKeys === 'individual') {
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
                        for (const table in entityTable) {
                            if (table === 'individual' && idList[result.individual_id]) {
                                // I can't get this statement to work inversely for some reason
                            } else {
                                const newTable = {}
                                filter[tableKeys][table].forEach((key) => {
                                    if (result[key]) {
                                        newTable[key] = result[key]
                                    }
                                })
                                if (Object.keys(newTable).length > 1) {
                                    entityTable[table].push(newTable)
                                }
                                if (table === 'individual') {
                                    idList[result.individual_id] = true;
                                }
                            }    
                        }
                    }
                } else if (tableKeys === 'organization') {
                    if (result.entity_type === 'entity' && result.entity_name) {
                        let id = result.entity_name;
                        let hash = crypto.createHash('sha1');
                        result.organization_id = hash.update(id, 'utf8').digest('base64')
                        for (const table in entityTable) {
                            if (table === 'organization' && idList[result.organization_id]) {
                                // I can't get this statement to work inversely for some reason
                            } else {
                                const newTable = {}
                                filter[tableKeys][table].forEach((key) => {
                                    if (result[key]) {
                                        newTable[key] = result[key]
                                    }
                                })
                                if (Object.keys(newTable).length > 1) {
                                    entityTable[table].push(newTable)
                                }
                                if (table === 'individual') {
                                    idList[result.organization_id] = true;
                                }
                            }    
                        }
                    }
                } else if (tableKeys === 'vessel') {
                    if (result.entity_type === 'vessel') {
                        let id = ''
                        if (result.vessel_registration_identification) {
                            id = result.vessel_registration_identification
                        } else if (result.entity_name) {
                            id = result.entity_name;
                        } else {
                            id = `${Date.now()}`;
                        }
                        let hash = crypto.createHash('sha1');
                        result.vessel_id = hash.update(id, 'utf8').digest('base64')
                        for (const table in entityTable) {
                            if (table === 'vessel' && idList[result.vessel_id]) {
                                // I can't get this statement to work inversely for some reason
                            } else {
                                const newTable = {}
                                filter[tableKeys][table].forEach((key) => {
                                    if (result[key]) {
                                        newTable[key] = result[key]
                                    }
                                })
                                if (Object.keys(newTable).length > 1) {
                                    entityTable[table].push(newTable)
                                }
                                if (table === 'individual') {
                                    idList[result.vessel_id] = true;
                                }
                            }    
                        }
                    }
                } else if (tableKeys === 'aircraft') {
                    if (result.entity_type === 'aircraft') {
                        let id = ''
                        if (result.aircraft_tail_number) {
                            id = result.aircraft_tail_number
                        } else if (result.previous_aircraft_tail_number) {
                            id = result.previous_aircraft_tail_number;
                        }
                        let hash = crypto.createHash('sha1');
                        result.aircraft_id = hash.update(id, 'utf8').digest('base64')
                        for (const table in entityTable) {
                            if (table === 'aircraft' && idList[result.aircraft_id]) {
                                // I can't get this statement to work inversely for some reason
                            } else {
                                const newTable = {}
                                filter[tableKeys][table].forEach((key) => {
                                    if (result[key]) {
                                        newTable[key] = result[key]
                                    }
                                })
                                if (Object.keys(newTable).length > 1) {
                                    entityTable[table].push(newTable)
                                }
                                if (table === 'individual') {
                                    idList[result.aircraft_id] = true;
                                }
                            }    
                        }
                    }
                }
            })
            console.log(`Created ${tableKeys}.json successfully`);
            fs.writeFileSync(`./json/${tableKeys}.json`, JSON.stringify(entityTable, null, "\t"), (err) => {
                if (err) {
                    throw err;
                };
            })
        }
    })
    .catch((err) => console.error(err));