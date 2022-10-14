const fs = require('fs');
require('dotenv').config();

var mod = {
    getDateRange: (justYesterday) => {  
        var payload = {};
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        yesterday.setHours(0,0,0,0);
        payload.startDate = yesterday.toJSON();
        if (justYesterday) {
            yesterday.setHours(23,59,59,0);
            payload.endDate = yesterday.toJSON();
        } else {
            var today = new Date();
            payload.endDate = today.toJSON();
        }
        return payload;
    },
    getRandom: () => { return new Date().getTime(); },
    normaliseCsvString: (data) => {
        return '"' + data.replace(/"/ig, "").replace(/\n/ig, "").replace(/,/ig, "|") + '"';
    },
    exportToCsv: (data) => {
        var payload = ["time,connectorName,actionName,totalExistingErrors,totalErrorsExported,errorDescription"];
        data.forEach(entry => {
            entry.errorDetails.forEach(detail => {
                payload.push([
                    detail.time, 
                    mod.normaliseCsvString(entry.connectorName), 
                    mod.normaliseCsvString(entry.actionName), 
                    entry.totalErrors, 
                    entry.errorDetails.length, 
                    mod.normaliseCsvString(detail.message)
                ].join(","));
            });
        });
        fs.writeFileSync('./output/' + process.env.CDH_ACCOUNT + "-" + process.env.CDH_PROFILE + "-" + new Date().getTime() + ".CSV", payload.join('\n'));
    },
    toolName: "connector-error-logs"
}

module.exports = mod;