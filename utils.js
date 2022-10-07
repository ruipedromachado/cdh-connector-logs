const fs = require('fs');

require('dotenv').config();

module.exports = {
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
    exportToCsv: (data) => {
        var payload = ["time,connectorName,actionName,totalExistingErrors,totalErrorsExported,errorDescription"];
        data.forEach(entry => {
            entry.errorDetails.forEach(detail => {
                payload.push([
                    detail.time, 
                    '"' + entry.connectorName.replace(/"/ig, "").replace(/\n/ig, "").replace(/,/ig, "|") + '"', 
                    '"' + entry.actionName.replace(/"/ig, "").replace(/\n/ig, "").replace(/,/ig, "|") + '"', 
                    entry.totalErrors, 
                    entry.errorDetails.length, 
                    '"' + detail.message.replace(/"/ig, "").replace(/\n/ig, "").replace(/,/ig, "|") + '"'
                ].join(","));
            });
        });
        fs.writeFileSync('./output/' + process.env.CDH_ACCOUNT + "-" + process.env.CDH_PROFILE + "-" + new Date().getTime() + ".CSV", payload.join('\n'));
    },
    toolName: "connector-error-logs"
}