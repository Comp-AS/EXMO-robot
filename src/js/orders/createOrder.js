const exmoQuery = require('../query');

const createOrder = function (pair, quantity, price, type, callback) {
    exmoQuery('order_create', {pair, quantity, price, type}, (data) => {
        callback(data);
    });
};

module.exports = createOrder;