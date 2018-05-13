const getOrderBook = require('./getOrderBook');
const getSortedTicker = require('./getSortedTicker');
const $ = require('jquery');


const findBestEntryPoint = function (currency, percentage, callback) {
    const config = require('../config').config;
    const userInfo = config.userInfo;
    const openOrders = config.open_orders;
    let bestPair, totalQuantity = 0, bestPrice = 0, orderType;
    totalQuantity = Number.parseFloat(userInfo.balances[currency]);
    getSortedTicker(currency, (statistics) => {
        let flag = true;
        $.each(statistics, (key, value) => {
            const pair = value.pair.split('_');
            const percent = value.perfectPercent;
            const avg = value.avg;
            const openPairOrders = openOrders[value.pair];
            let type;
            if (pair[0] === currency) {
                type = 'ask';
                if (openPairOrders) {
                    const currentBuyOrder = openPairOrders.find((el) => {
                        return el.type === 'buy';
                    });
                    if (currentBuyOrder) return flag;
                }
            } else if (pair[1] === currency) {
                type = 'bid';
                if (openPairOrders) {
                    const currentSellOrder = openPairOrders.find((el) => {
                        return el.type === 'sell';
                    });
                    if (currentSellOrder) return flag;
                }
            }
            getOrderBook(value.pair, 5, (orders) => {
                if (flag) {
                    let quantitySum = 0;
                    const entryRate = (type === 'ask') ? avg / orders.ask_top : avg / orders.bid_top;
                    if (entryRate < 1.02) {
                        return flag;
                    } else {
                        bestPair = value.pair;
                        orderType = type;
                        let count = 0;
                        const ordersArray = orders[orderType];
                        $.each(ordersArray, (key, value) => {
                            count++;
                            quantitySum += (orderType === 'ask') ? Number.parseFloat(value[1]) : Number.parseFloat(value[2]);
                            let increment = (orderType === 'ask') ? -0.00000001 : 0.00000001;
                            if (quantitySum >= totalQuantity * percentage || count >= ordersArray.length) {
                                bestPrice = Number.parseFloat(value[0]) + increment;
                                let amount = (orderType === 'ask') ? totalQuantity : totalQuantity / bestPrice;
                                const min_quantity = Number.parseFloat(config.pair_settings[bestPair].min_quantity);
                                const max_quantity = Number.parseFloat(config.pair_settings[bestPair].max_quantity);
                                if (amount < min_quantity || amount > max_quantity) {
                                    return flag;
                                } else {
                                    callback({
                                        pair: bestPair,
                                        type: orderType,
                                        quantity: amount,
                                        price: bestPrice,
                                        perfectPercent: percent
                                    });
                                    console.log(`Pair ${bestPair}: ${orderType} ${totalQuantity} ${currency} for ${bestPrice.toFixed(7)} with ${percent.toFixed(1)}% and entry rate ${entryRate}`);
                                    flag = false;
                                }
                            }
                            return flag;
                        });
                        return flag;
                    }
                }
            });
            return flag;
        });
        if (flag) {
            callback(false);
        }

    });
};

module.exports = findBestEntryPoint;