const $ = require('jquery');

const getUserTrades = function (limit, callback) {
    const config = require('../config').config;
    const raw = Object.assign({}, config.user_trades);
    let result = [];
    $.each(raw, (pair, objectArr) => {
        result = result.concat(objectArr);
    });
    result.sort((a1, a2) => {
        return Number.parseInt(a2.date) - Number.parseInt(a1.date);
    });
    result = result.slice(0, limit);
    callback(result);
    return result;
};

module.exports = getUserTrades;