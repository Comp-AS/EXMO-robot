const ticker= require('../config').config.ticker;

const getSortedTicker = function(currency, callback) {
    let sortedData = [];
    for (const pair in ticker) {
        if (pair.indexOf(currency) !== -1) {
            const obj = ticker[pair];
            obj.pair = pair;
            sortedData.push(obj);
        }
    }
    sortedData.sort(function (a, b) {
        const a_percent = (a.high/(a.low/100)) - 100;
        const b_percent = (b.high/(b.low/100)) - 100;
        a.perfectPercent = a_percent;
        b.perfectPercent = b_percent;
        return b_percent - a_percent;
    });

    if (sortedData.length === 1) {
        sortedData[0].perfectPercent = (sortedData[0].high / (sortedData[0].low / 100)) - 100;
    }

    callback(sortedData);
};

module.exports = getSortedTicker;

