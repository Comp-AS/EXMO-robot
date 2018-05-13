const getOrderBook = require('./getOrderBook');
const findEntryPoint = require('./findBestEntryPoint');
const createOrder = require('./createOrder');
const cancelOrder = require('./cancelOrder');
const getSortedTicker = require('./getSortedTicker');
const cancelDuplicates = require('./maintainers/cancelDuplicates');
const getEntryPercentRatio = require('./maintainers/getEntryPerfectPercentRatio');
const getOrderPosition = require('./maintainers/getOrderPosition');
const getOrderBacklog = require('./maintainers/getOrderBacklog');
const recreateOrder = require('./maintainers/recreateOrder');
const $ = require('jquery');

const maintainOrders = function () {
    const config = require('../config').config;
    const userInfo = config.userInfo;
    const openOrders = config.open_orders;
    const previousOrders = config.user_trades;
    const TP = config.take_profit;
    const commiss = config.commission;
    //для каждой пары в открытых сделках...
    $.each(openOrders, (pair, ordersArray) => {
        cancelDuplicates(ordersArray, (ordersArray) => {
            $.each(ordersArray, (indx, order) => {
                console.info(`maintaining ${JSON.stringify(order)}`);
                if (order.type === 'buy') {
                    maintainBuyOrder(order);
                }
                //...продажи
                if (order.type === 'sell') {
                    maintainSellOrder(order);
                }
            });
        });
    });

    //создание новых ордеров
    $.each(userInfo.balances, (currency, val) => {
        const value = Number.parseFloat(val);
        const modifier = (config.fiatList.indexOf(currency) !== -1) ? 2 : 5;
        if (value > 1 / Math.pow(10, modifier)) {
            findEntryPoint(currency, 1, (entry) => {
                if (entry) {
                    const operation = (entry.type === 'ask') ? 'sell' : 'buy';
                    //продажа
                    if (operation === 'sell') {
                        //находим предыдущую покупку этой валюты и её цену
                        const prevPurchase = previousOrders[entry.pair].find((item) => {
                            return item.type === 'buy';
                        });
                        //если покупка ранее была хотя бы один раз
                        if (prevPurchase) {
                            const prevPrice = prevPurchase.price;
                            getOrderBook(entry.pair, 20, (ordersInCup) => {
                                const arr = ordersInCup[entry.type];
                                const increment = -0.00000001;
                                let isFoundPlaceInCup = false;
                                for (let indx in arr) {
                                    const cup = arr[indx];
                                    let priceRatio = (Number.parseFloat(cup[0]) + increment) * (commiss - ((commiss - 1) * 2)) / prevPrice;
                                    //создаем сделку выше элемента в стакане, если выгода от продажи превысит take profit
                                    if (priceRatio >= TP) {
                                        let newPrice = Number.parseFloat(cup[0]) + increment;
                                        createOrder(entry.pair, entry.quantity, newPrice, operation, (result) => console.log(`creating new ${operation} order for ${entry.quantity} ${entry.pair}  price - ${newPrice}`));
                                        isFoundPlaceInCup = true;
                                        break;
                                    }
                                }
                            });
                        } else {
                            createOrder(entry.pair, entry.quantity, entry.price, operation, (createResult) => console.log(`creating new ${operation} order for ${entry.quantity} ${entry.pair} (u have ${userInfo.balances[currency]}) price - ${entry.price}, log: ${JSON.stringify(createResult)}`));
                        }
                    }
                    //покупка
                    if (operation === 'buy') {
                        console.log(`trying to buy ${entry.pair} with ${entry.quantity} ${currency} for ${entry.price}`);
                        createOrder(entry.pair, entry.quantity, entry.price, operation, (createResult) => console.log(`creating new ${operation} order for ${entry.quantity} ${entry.pair} (u have ${userInfo.balances[currency]}) price - ${entry.price}, log: ${JSON.stringify(createResult)}`));
                    }
                } else {
                    //точки входа нет
                    getSortedTicker(currency, (sortedTicker) => {
                        const filteredTicker = sortedTicker.filter((el) => {
                            return el.pair.split('_').indexOf(currency) !== -1;
                        });
                        for (const index in filteredTicker) {
                            const pair = filteredTicker[index].pair;
                            const operation = (pair.split('_').indexOf(currency) === 0) ? 'sell' : 'buy';
                            const min_quantity =  config.pair_settings[pair].min_quantity;
                            const max_quantity =  config.pair_settings[pair].max_quantity;
                            if (value >= Number.parseFloat(min_quantity) && value <= Number.parseFloat(max_quantity)) {
                                if (operation === 'sell') {
                                    if (value <= max_quantity && value >= min_quantity) {
                                        const prevPurchase = previousOrders[pair].find((item) => {
                                            return item.type === 'buy';
                                        });
                                        if (prevPurchase) {
                                            const prevPrice = prevPurchase.price;
                                            let newPrice = prevPrice * TP * commiss;
                                            while (newPrice < Number.parseFloat(filteredTicker[index].sell_price)) {
                                                newPrice = newPrice * TP;
                                            }
                                            createOrder(pair, value, newPrice, 'sell', (createResult) => console.log(`creating new sell order for ${value} ${pair} price - ${newPrice}`));
                                        } else {
                                            createOrder(pair, value, filteredTicker[index].sell_price, 'sell', (createResult) => console.log(`creating new sell order for ${value} ${pair} price - ${filteredTicker[index].sell_price}`));
                                        }
                                    }
                                }
                                if (operation === 'buy') {
                                    const amount = value / Number.parseFloat(filteredTicker[index].buy_price);
                                    if (amount <= max_quantity && amount >= min_quantity) {
                                        createOrder(pair, amount, filteredTicker[index].buy_price, 'buy', (createResult) => console.log(`creating new buy order for ${amount} ${pair} price - ${filteredTicker[index].buy_price}, ${JSON.stringify(createResult)}`));
                                    }
                                }
                            }
                        }
                    })
                }
            });
        }
    })
};

function maintainBuyOrder(order) {
    const config = require('../config').config;
    const ownedCurrency = order.pair.split('_')[1];
    //проверка актуальной точки входа
    findEntryPoint(ownedCurrency, 1, (entry) => {
        //сравнение актуальной точки входа и точки входа у ордера.
        const entryRatio = getEntryPercentRatio(entry, order);
        if (entryRatio && entryRatio > 1) {
            const operation = (entry.type === 'ask') ? 'sell' : 'buy';
            recreateOrder(order.order_id, entry.pair, entry.quantity, entry.price, operation,
                `Ордер ${JSON.stringify(order)} отменен: есть более актуальная точка входа (отличается на ${entryRatio})`,
                `creating new ${operation} order for ${entry.quantity} ${entry.pair} price - ${entry.price}`);
        } else {
            //проверка текущей позиции в стакане и отставание от лидера
            getOrderBook(order.pair, 100, (ordersInCup) => {
                const pos = getOrderPosition(ordersInCup, order);
                const backlog = getOrderBacklog(ordersInCup, order);
                let increment = 0.00000001;
                //если мы первые - двигаемся ниже к цене второго
                if (pos === 0) {
                    let bestPrice = Number.parseFloat(ordersInCup['bid'][1][0]) + increment;
                    let amount = order.quantity / bestPrice;
                    const min_quantity = Number.parseFloat(config.pair_settings[order.pair].min_quantity);
                    const max_quantity = Number.parseFloat(config.pair_settings[order.pair].max_quantity);
                    if (!(amount < min_quantity || amount > max_quantity)) {
                        recreateOrder(order.order_id, order.pair, amount, bestPrice, order.type,
                            `Ордер ${JSON.stringify(order)} отменен: слишком высоко в стакане`,
                            `creating new ${order.type} order for ${amount} ${order.pair} price - ${bestPrice}`);
                    }
                } else {
                    let isLesserThanFive = (pos < 5 && pos !== -1);
                    //проверяем отрыв от предыдущего конкурента
                    let posDifference = (pos === -1) ? 0 : Number.parseFloat(ordersInCup['bid'][pos - 1][0]) - Number.parseFloat(order.price);
                    if (isLesserThanFive && posDifference >= increment) {
                        let newPair = (entry) ? entry.pair : order.pair;
                        let newPrice = (entry) ? entry.price : Number.parseFloat(ordersInCup['bid'][pos - 1][0]) + increment;
                        let newQuanity = (entry) ? entry.quantity : (Number.parseFloat(order.quantity) * Number.parseFloat(order.price)) / newPrice;
                        let newType = (entry) ? (entry.type === 'ask' ? 'sell' : 'buy') : 'buy';
                        recreateOrder(order.order_id, newPair, newQuanity, newPrice, newType,
                            `Ордер ${JSON.stringify(order)} отменен: большой разрыв с конкурентом перед нами`,
                            `creating new ${newType} order for ${newQuanity} ${newPair} price - ${newPrice}`);
                        //процентный отрыв от лидера и вхождение в топ-5
                    } else {
                        if (backlog > 1 || !isLesserThanFive) {
                            if (entry) {
                                const operation = (entry.type === 'ask') ? 'sell' : 'buy';
                                recreateOrder(order.order_id, entry.pair, entry.quantity, entry.price, operation,
                                    `Ордер ${JSON.stringify(order)} отменен: слишком сильное отставание`,
                                    `creating new ${operation} order for ${entry.quantity} ${entry.pair}  price - ${entry.price}`);
                            } else {
                                cancelOrder(order.order_id, (cancelResult) => console.log(`Ордер ${JSON.stringify(order)} отменен: слишком сильное отставание`));
                            }
                        }
                    }
                }
            });
        }
    });
}

function maintainSellOrder(order) {
    const ownedCurrency = order.pair.split('_')[0];
    const config = require('../config').config;
    const previousOrders = config.user_trades;
    const SL = config.stop_loss;
    const TP = config.take_profit;
    const commiss = config.commission;
    const prevPurchase = previousOrders[order.pair].find((item) => {
        return item.type === 'buy' && (new Date(order.created * 1000) > new Date(item.date * 1000));
    });
    const checkTime = (order) => {
        const hoursLast = (new Date() - new Date(Number.parseInt(order.created) * 1000)) / 60 / 60 / 1000;
        if (hoursLast > 8) {
            cancelOrder(order.order_id, (cancelResult) => {
                console.log(`Ордер ${JSON.stringify(order)} отменен:  долго стоит`);
                //создаем заявку в любой удобной паре
                findEntryPoint(ownedCurrency, 0.3, (ent) => {
                    if (ent) {
                        const operation = (ent.type === 'ask') ? 'sell' : 'buy';
                        createOrder(ent.pair, ent.quantity, ent.price, operation, (createResult) => console.log(`creating new ${operation} order for ${ent.quantity} ${ent.pair}  price - ${ent.price}`));
                    }
                });
            });
        }
    };

    if (prevPurchase) {
        const prevPrice = Number.parseFloat(prevPurchase.price);
        getOrderBook(order.pair, 20, (ordersInCup) => {
            let param = 'ask';
            const arr = ordersInCup[param];
            let totalQuantity = Number.parseFloat(order.quantity);
            const increment = -0.00000001;
            let isFoundPlaceInCup = false;
            for (let indx in arr) {
                const cup = arr[indx];
                let priceRatio = (Number.parseFloat(cup[0]) + increment) * (commiss - ((commiss - 1) * 2)) / prevPrice;
                let isOurCup = Number.parseFloat(cup[0]) === Number.parseFloat(order.price);
                //создаем сделку выше элемента в стакане, если этот элемент не наш и выгода от продажи превысит 2%
                if (priceRatio >= TP && !isOurCup) {
                    //если профита тут достаточно и конкурирующий ордер не наш, тогда пересоздаем ордер на этом месте
                    let newPrice = Number.parseFloat(cup[0]) + increment;
                    recreateOrder(order.order_id, order.pair, totalQuantity, newPrice, 'sell',
                        `Ордер ${JSON.stringify(order)} отменен: найдена более выгодная позиция`,
                        `creating new sell order for ${totalQuantity} ${order.pair}  price - ${newPrice}`);
                    isFoundPlaceInCup = true;
                    break;
                }
            }
            if (!isFoundPlaceInCup) {
                //проверка на stop loss 7%
                if (arr[0][0] !== order.price && Number.parseFloat(arr[0][0]) * commiss / Number.parseFloat(order.price) <= SL) {
                    recreateOrder(order.order_id, order.pair, totalQuantity, Number.parseFloat(arr[0][0]) + increment, 'sell',
                        `Ордер ${JSON.stringify(order)} отменен: сработал StopLoss`,
                        `creating new sell order for ${totalQuantity} ${order.pair}  price - ${Number.parseFloat(arr[0][0]) + increment}`);
                } else {
                    checkTime(order);
                }
            }
        });
    } else {
        checkTime(order);
    }
}

module.exports = maintainOrders;