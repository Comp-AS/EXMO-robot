const getSortedTicker = require('../getSortedTicker');

const getEntryPercentRatio = function (entry, orderToCompare) {
    let pair = orderToCompare.pair;
    let ownedCurrency;
    if (orderToCompare.type === 'buy') {
        ownedCurrency = pair.split('_')[1];
    } else {
        ownedCurrency = pair.split('_')[0];
    }
    getSortedTicker(ownedCurrency, (ticker) => {
        let neededTicker = ticker.find((item) => {
            return item.pair === pair;
        });
        return (entry) ? (entry.perfectPercent / neededTicker.perfectPercent > 1) : entry;
    });
};

module.exports = getEntryPercentRatio;