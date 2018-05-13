const cancelOrder = require('../cancelOrder');
const $ = require('jquery');

const cancelDuplicates = function (ordersArray, callback) {
    if (ordersArray.length > 1) {
        let remainUncancelledArray = [];
        let buyArr = [];
        let sellArr = [];
        let querryArray = [];
        for (let index in ordersArray) {
            if (ordersArray[index].type === "buy") {
                buyArr.push({
                    order_id: ordersArray[index].order_id
                });
                remainUncancelledArray.push(ordersArray[index]);
            }
            if (ordersArray[index].type === "sell") {
                sellArr.push({
                    order_id: ordersArray[index].order_id
                });
                remainUncancelledArray.push(ordersArray[index]);
            }
        }
        if (buyArr.length > 1) {
            for (let ord in buyArr) {
                querryArray.push(cancelOrder(buyArr[ord].order_id, (cr) => {
                    remainUncancelledArray = $.grep(remainUncancelledArray, (e) => e.order_id === buyArr[ord].order_id, true);
                    console.log(`order ${buyArr[ord].order_id} cancelled cause of duplicating: ${JSON.stringify(cr)}`);
                }));
            }
        }
        if (sellArr.length > 1) {
            for (let ord in sellArr) {
                querryArray.push(cancelOrder(sellArr[ord].order_id, (cr) => {
                    remainUncancelledArray = $.grep(remainUncancelledArray, (e) => e.order_id === sellArr[ord].order_id, true);
                    console.log(`order ${sellArr[ord].order_id} cancelled cause of duplicating ${JSON.stringify(cr)}`)
                }));
            }
        }
        $.when.apply(this, querryArray).done(() => {
            callback(remainUncancelledArray);
        });
    } else {
        callback(ordersArray);
    }
};

module.exports = cancelDuplicates;