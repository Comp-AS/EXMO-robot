const $ = require('jquery');
const getUserTrades = require('../orders/getUserTrades');

const mainElement = $('.user_trades');
const fillUserTradesElement = function () {
    getUserTrades(40, (userTrades) => {
        if (Object.keys(userTrades).length > 0) {
            let domBuilder = `<div class="user_trades__title">Завершенные сделки</div>`;
            domBuilder += `<ul class="user_trades__list">`;
            $.each(userTrades, (none, order) => {
                const dateInOrder = new Date(Number.parseInt(order.date) * 1000);
                const dateNow = new Date();
                let newElementClass = (dateNow - dateInOrder < 2 * 60 * 1000) ? 'new' : '';
                let dateString = `${dateInOrder.getHours()}:${dateInOrder.getMinutes() < 10 ? '0' + dateInOrder.getMinutes() : dateInOrder.getMinutes()}`;
                let profitStr = ``;
                if (order.type === 'sell') {
                    const previousOrders = require('../config').config.user_trades;
                    const prevPurchase = previousOrders[order.pair].find((item) => {
                        return item.type === 'buy' && (new Date(order.date * 1000) > new Date(item.date * 1000));
                    });
                    if (prevPurchase) {
                        let profit = ((Number.parseFloat(order.price) / Number.parseFloat(prevPurchase.price)) * 100 - 100);
                        profitStr = `(${profit > 0 ? '+' : ''}${profit.toFixed(2)}%)`;
                    }
                }
                domBuilder += `<li class="user_trades__list-item ${order.type} ${newElementClass}">`;
                domBuilder += `${dateString} ${order.type} ${order.quantity} ${order.pair.split('_')[0]} for ${order.amount} ${order.pair.split('_')[1]} <b>${profitStr}</b>`;
                domBuilder += `</li>`;
            });
            domBuilder += `</ul>`;
            mainElement.removeClass('hidden');
            mainElement.html('');
            mainElement.append(domBuilder);
        }
        else {
            mainElement.addClass('hidden');
        }
    });
};

module.exports = fillUserTradesElement;