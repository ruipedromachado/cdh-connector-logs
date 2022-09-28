const fs = require('fs');

require('dotenv').config();

module.exports = {
    getDateRange: () => {  
        var payload = {};
        var date = new Date();
        date.setDate(date.getDate()-1);
        date.setHours(0,0,0,0);
        payload.startDate = date.toJSON();
        date.setHours(23,59,59,0);
        payload.endDate = date.toJSON();
        return payload;
    },
    getRandom: () => { return new Date().getTime(); },
    exportToCsv: (data) => {
        var payload = ["time,connectorName,actionName,totalExistingErrors,totalErrorsExported,errorDescription"];
        data.forEach(entry => {
            entry.errorDetails.forEach(detail => {
                payload.push([detail.time, entry.connectorName, entry.actionName, entry.totalErrors, entry.errorDetails.length, detail.message.replace(/\n/ig, "").replace(/,/ig, "|")].join(","));
            });
        });
        fs.writeFileSync('./output/' + process.env.CDH_ACCOUNT + "-" + process.env.CDH_PROFILE + "-" + new Date().getTime() + ".CSV", payload.join('\n'));
    },
    toolName: "connector-error-logs"
}