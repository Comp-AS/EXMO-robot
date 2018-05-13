const getSortedTicker = require('../orders/getSortedTicker');
const $ = require('jquery');

const resultList = $(".best_offers__list");
const wholeBlock = $(".best_offers");
const fillBestOffersSection = function () {
    const config = require('../config').config;
    const userInfo = config.userInfo;
    const fiat = config.fiatList;
    let bestCurrency,
        bestValue = 0;
    const balances = userInfo.balances;
    for (let currency in balances) {
        const value = Number.parseFloat(balances[currency]);
        const modifier = (fiat.indexOf(currency) !== -1) ? 2 : 4;
        if (value > 1 / Math.pow(10, modifier)) {
            if (value > bestValue) {
                bestValue = value;
                bestCurrency = currency;
            }
        }
    }
    if (bestCurrency) {
        getSortedTicker(bestCurrency, (result) => {
            let sortedData = result;
            if (sortedData.length > 5) {
                sortedData = sortedData.splice(0, 5);
            }

            resultList.html('');
            for (let indx in sortedData) {
                const item = sortedData[indx];
                resultList.append(`
        <div class="best_offers__item">
            <p class="best_offers__item--pair">${item.pair}</p>
            <p class="best_offers__item--value">Идеальный процент: <b>${item.perfectPercent.toFixed(1)}</b></p>
            <p class="best_offers__item--value">Объем торгов: <b>${Number.parseFloat(item.vol).toFixed(1)}</b></p>
            <p class="best_offers__item--value">Средний курс: <b>${Number.parseFloat(item.avg).toFixed(8)}</b></p>
        </div>`);
            }
            wholeBlock.removeClass('hidden');
        });
    } else {
        wholeBlock.addClass('hidden');
    }
};

module.exports = fillBestOffersSection;