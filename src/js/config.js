const exmoQuery = require('./query');
const $ = require('jquery');

const storageNamespace = {
    pair_settings: 'exmo_pair-settings',
    userInfo: 'exmo_user-info',
    ticker: 'exmo-ticker',
    order_book: 'exmo-order-book',
    open_orders: 'exmo-open-orders',
    user_trades: 'exmo-user-trades'
};

const config = {
    pair_settings: JSON.parse(localStorage.getItem(storageNamespace.pair_settings)),
    userInfo: JSON.parse(localStorage.getItem(storageNamespace.userInfo)),
    ticker: JSON.parse(localStorage.getItem(storageNamespace.ticker)),
    order_book: JSON.parse(localStorage.getItem(storageNamespace.order_book)),
    open_orders: JSON.parse(localStorage.getItem(storageNamespace.open_orders)),
    user_trades: JSON.parse(localStorage.getItem(storageNamespace.user_trades)),
    fiatList: ['RUB', 'USD', 'EUR', 'UAH'],
    stop_loss: 0.93,
    take_profit: 1.015,
    commission: 1.002
};

const loadData = function (callback) {
    const pairQuery = exmoQuery('pair_settings', {}, (result) => {
        localStorage.setItem(storageNamespace.pair_settings, JSON.stringify(result));
        config.pair_settings = result;
    });
    const userQuery = exmoQuery('user_info', {}, (result) => {
        localStorage.setItem(storageNamespace.userInfo, JSON.stringify(result));
        config.userInfo = result;
    });
    const tickerQuery = exmoQuery('ticker', {}, (result) => {
        localStorage.setItem(storageNamespace.ticker, JSON.stringify(result));
        config.ticker = result;
    });
    const openOrdersQuery = exmoQuery('user_open_orders', {}, (result) => {
        localStorage.setItem(storageNamespace.open_orders, JSON.stringify(result));
        config.open_orders = result;
    });

    const allPairs = Object.keys(config.pair_settings);
    let queryStr = ``;
    for (const indx in allPairs) {
        queryStr += `${allPairs[indx]},`;
    }
    queryStr = queryStr.substring(0, queryStr.length - 1);

    const orderBookQuery = exmoQuery('order_book', {pair: queryStr, limit: 100}, (result) => {
        localStorage.setItem(storageNamespace.order_book, JSON.stringify(result));
        config.order_book = result;
    });
    const userTradesQuery = exmoQuery('user_trades', {pair: queryStr, limit: 20}, (result) => {
        localStorage.setItem(storageNamespace.user_trades, JSON.stringify(result));
        config.user_trades = result;
    });

    $.when(pairQuery, userQuery, tickerQuery, orderBookQuery, openOrdersQuery, userTradesQuery).done( () => callback());
};

exports.loadData = loadData;
exports.config = config;


