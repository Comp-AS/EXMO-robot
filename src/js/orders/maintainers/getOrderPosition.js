const getOrderPosition = function (ordersInCup, order) {
    const param = (order.type === 'sell') ? 'ask' : 'bid';
    const arr = ordersInCup[param];
    let pos = -1;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] === order.price) {
            pos = i;
            break;
        }
    }
    return pos;
};

module.exports = getOrderPosition;