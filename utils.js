const fs = require('fs');
require('dotenv').config();

var mod = {
    getDateRange: (totalDays) => {  
        var payload = {};
        var startDate = new Date();
        totalDays = !isNaN(totalDays) ? totalDays : 1;
        totalDays = totalDays > 7 ? 7 : totalDays;
        totalDays = totalDays < 1 ? 1 : totalDays;
        startDate.setDate(startDate.getDate()-totalDays);
        startDate.setHours(0,0,0,0);
        payload.startDate = startDate.toJSON();
        var endDate = new Date();
        payload.endDate = endDate.toJSON();
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