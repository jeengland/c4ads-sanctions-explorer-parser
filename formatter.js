const parser = require('./parser.js');
const fs = require('fs');
const crypto = require('crypto');

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

const tableKeys = {
    individual: [
        'individual_id',
        'last_name',
        'first_name',
        'entity_type'
    ],
    individual_attributes: [
        'individual_id',
        'passport',
        'travel_document_number',
        'identification_number',
        'national_identification_number',
        'curp',
        'tax_identification_number',
        'tax_identification_number_country',
        'cedula',
        'registration_number',
        'italian_fiscal_code',
        'matricula_mercantil_number',
        'digital_currency_address',
        'personal_id_card',
        'former_citizenship_country',
        'linked_to',
        'cedula_number',
        'ruc_number',
        'nie',
        'residency_number',
        'seafarers_identification_document',
        'visa_number_id',
        'citizens_card_number',
        'national_foreign_id_number',
        'chinese_commercial_code',
        'birth_certificate_number',
        'voter_identification_number',
        'voter_identification_number_country',
        'electoral_registry_number',
        'drivers_license_number',
        'le_number',
        'un_locode',
        'aka',
        'cuit',
        'cui',
        'dni',
        'fka',
        'nka',
        'nit',
        'ssn',
        'rfc',
        'programs',
        'category',
        'title',
        'pob',
        'dob',
        'gender',
        'nationality',
        'additional_sanctions_information',
        'secondary_sanctions_risk',
        'executive_order',
        'citizen'
    ],
    individual_contact_info: [
        'individual_id',
        'website',
        'email_address',
        'telephone',
        'co',
        'address'
    ],
    individual_actions: [
        'individual_id',
        'date',
        'action',
        'authority'
    ],
    individual_remarks: [
        'individual_id',
        'comments'
    ]
}

parser.parse('ofac', './data', formatter)
    .then((results) => {
        let ind = {};
        ind.individual = [];
        ind.individual_attributes = [];
        ind.individual_contact_info = [];
        ind.individual_actions = [];
        ind.individual_remarks = [];
        results.forEach((result) => {
            if (result.entity_type === 'individual') {
                let id = null;
                let hash = crypto.createHash('sha1');
                if (result.first_name && result.last_name) {
                    id = hash.update(`${result.first_name}${result.last_name}`, 'utf8').digest('base64')
                } else if (result.first_name) {
                    id = hash.update(result.first_name, 'utf8').digest('base64')
                } else if (result.last_name) {
                    id = hash.update(result.last_name, 'utf8').digest('base64')
                } else if (result.entity_name) {
                    id = hash.update(result.entity_name, 'utf8').digest('base64')
                }
                result.individual_id = id
                for (const table in ind) {
                    const newTable = {}
                    tableKeys[table].forEach((key) => {
                        if (result[key]) {
                            newTable[key] = result[key]
                        }
                    })
                    if (Object.keys(newTable).length > 1) {
                        ind[table].push(newTable)
                    }
                }
            }
        })
        // for (const table in ind) {
            fs.writeFile(`./json/individuals.json`, JSON.stringify(ind, null, "\t"), (err) => {
                if (err) {
                    throw err;
                };
                console.log(`Created individuals.json successfully`);
            })
        // }
    })