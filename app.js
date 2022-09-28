const utils = require("./utils");
const api = require("./api");

(async function () {
  var sessionDetails = await api.getSessionDetails();
  var cdhActions = await api.getCdhActions(sessionDetails);
  var failedActionsDetails = await api.getFailedActionsDetails(cdhActions, sessionDetails);
  utils.exportToCsv(failedActionsDetails);
})();