const getOrderBook = function (pair, limit, callback) {
    const config = require('../config').config;
    let result = Object.assign({}, config.order_book[pair]);
    result.ask = result.ask.slice(0, limit);
    result.bid = result.bid.slice(0, limit);
    callback(result);

};

module.exports = getOrderBook;