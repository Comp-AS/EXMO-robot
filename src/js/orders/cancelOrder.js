const exmoQuery = require('../query');

const cancelOrder = function (order_id, callback) {
    return exmoQuery('order_cancel', {order_id}, (data) => {
        callback(data);
    });
};

module.exports = cancelOrder;