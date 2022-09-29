const axios = require("axios");
const qs = require("qs");
const utils = require("./utils");
require('dotenv').config();

module.exports = {
    getSessionDetails: async () => {
        var payload = {};
        var sessionDetailsRequest = await axios({
            method: 'POST',
            url: 'https://api.tealiumiq.com/v1/login',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify({
                username: process.env.TIQ_USER,
                password: process.env.TIQ_PASS
            })
        });
        payload.utk = sessionDetailsRequest.data.utk;
        var cookies = sessionDetailsRequest.headers['set-cookie'] || [];
        var re = /^JSESSIONID=([^;]*);/;
        for (var i = 0; i < cookies.length; i++) {
            var match = re.exec(cookies[i]);
            if (match && match[1]) {
                payload.jSessionId = match[1];
                break;
            }
        }
        return payload;
    },
    getCdhActions: async (sessionDetails) => {
        var payload = [];
        var qsData = qs.stringify({
            utk: sessionDetails.utk,
            _: utils.getRandom(),
            cb: utils.getRandom(),
            tool: utils.toolName
        });
        var cdhProfileUrl = 'https://sso.tealiumiq.com/urest/datacloud/' + process.env.CDH_ACCOUNT + '/' + process.env.CDH_PROFILE + '/profile?' + qsData;
        var cdhProfileRequest = await axios({
            method: 'GET',
            url: cdhProfileUrl,
            headers: { Cookie: 'JSESSIONID=' + sessionDetails.jSessionId, Accept: 'application/json' }
        });
        var enabledActions = (cdhProfileRequest.data.actions || []).filter(el => el.enabled);
        enabledActions.forEach(action => { 
            payload.push({ 
                actionId: action.id, 
                connectorId: action.connectorId, 
                actionName: action.name, 
                connectorName: (cdhProfileRequest.data.connectors.find(connector => connector.id === action.connectorId) || { name: "" }).name
            }); 
        });
        return payload;
    },
    getFailedActionsDetails: async (actions, sessionDetails) => {
        var payload = [];
        var dateRange = utils.getDateRange();
        for (var index = 0; index < actions.length; index++) {
            var action = actions[index];
            var errorDataRequestQs = qs.stringify({
                utk: sessionDetails.utk,
                start: dateRange.startDate,
                end: dateRange.endDate,
                tool: utils.toolName
            });
            var errorDataRequestUrl =
                'https://sso.tealiumiq.com/urest/datacloud/' + process.env.CDH_ACCOUNT + '/' + process.env.CDH_PROFILE + '/audit/' + action.connectorId + '/' + action.actionId + '?' + errorDataRequestQs;
            var errorDataRequest = await axios({
                method: 'GET',
                url: errorDataRequestUrl,
                headers: {
                    Cookie: 'JSESSIONID=' + sessionDetails.jSessionId,
                    Accept: 'application/json'
                }
            });
            action.totalErrors = 0;
            var actionsWithErrors = errorDataRequest.data.filter(e => e.error_count);
            actionsWithErrors.forEach(e => {action.totalErrors+=e.error_count});
            if(action.totalErrors === 0) continue;

            var errorDescriptionsRequestQs = qs.stringify({
                utk: sessionDetails.utk,
                start: dateRange.startDate,
                end: dateRange.endDate,
                limit: action.totalErrors,
                tool: utils.toolName
            });
            var errorDescriptionsRequestUrl =
                'https://sso.tealiumiq.com/urest/datacloud/' + process.env.CDH_ACCOUNT + '/' + process.env.CDH_PROFILE + '/audit/' + action.connectorId + '/' + action.actionId + '/errors?' + errorDescriptionsRequestQs;
            var errorDescriptionsRequest = await axios({
                method: 'GET',
                url: errorDescriptionsRequestUrl,
                headers: {
                    Cookie: 'JSESSIONID=' + sessionDetails.jSessionId,
                    Accept: 'application/json'
                }
            });
            action.errorDetails = action.errorDetails || [];
            errorDescriptionsRequest.data.forEach(e => action.errorDetails.push({time: e.time, title: e.title, message: e.message}));         
            payload.push(action);
        }
        return payload;
    }
}