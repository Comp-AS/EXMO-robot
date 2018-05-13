const createOrder = require('../createOrder');
const cancelOrder = require('../cancelOrder');

const recreateOrder = function (cancel_id, pair, quantity, price, type, cancelMsg, createMsg) {
    cancelOrder(cancel_id, (cancelResult) => {
        console.log(cancelMsg, cancelResult);
        createOrder(pair, quantity, price, type, (createResult) => {
            console.log(createMsg, createResult);
        });
    });
};

module.exports = recreateOrder;