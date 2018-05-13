const getOrderBacklog = function (ordersInCup, order) {
    const param = (order.type === 'sell') ? 'ask' : 'bid';
    const arr = ordersInCup[param];
    const bestPrice = arr[0][0];
    return (bestPrice / Number.parseFloat(order.price) * 100 - 100);
};

module.exports = getOrderBacklog