const $ = require('jquery');
const getOrderBook = require('../orders/getOrderBook');

const mainElement = $('.active_orders');
const fillActiveOrdersElement = function () {
    const config = require('../config').config;
    let openOrders = config.open_orders;
    if (Object.keys(openOrders).length > 0) {
        let domBuilder = `<div class="active_orders__title">Активные ордера</div>`;
        $.each(openOrders, (pair, ordersArray) => {
                let bestPrice = 0;
                let backlog = 0;
                getOrderBook(pair, 40, (ordersInCup) => {
                    $.each(ordersArray, (index, params) => {
                        domBuilder += `<div class="active_orders__item">`;
                        domBuilder += `<div class="active_orders__item--pair">${pair}</div>`;
                        domBuilder += `<ul class="active_orders__list" data-pair="${pair}">`;
                        domBuilder += `<li class="active_orders__list-item${params.order_id}">`;
                        const currentDate = new Date().valueOf();
                        const hoursLast = Math.abs(currentDate - new Date(Number.parseInt(params.created) * 1000).valueOf()) / 60 / 60 / 1000;
                        const fCurrency = pair.split('_')[0];
                        const sCurrency = pair.split('_')[1];
                        let param = (params.type === 'sell') ? 'ask' : 'bid';
                        const arr = ordersInCup[param];
                        bestPrice = arr[0][0];
                        backlog = (params.type === 'sell') ? (Number.parseFloat(params.price) / bestPrice) * 100 - 100 : (bestPrice / Number.parseFloat(params.price) * 100 - 100);
                        let pos = -1;
                        for (let i = 1; i <= 40; i++) {
                            if (arr[i - 1][0] === params.price) {
                                pos = i;
                                break;
                            }
                        }
                        const placementStr = (pos === -1) ? 'более чем 40' : pos;
                        const backlogStr = (backlog === 0) ? '' : `и отстаете на ${backlog.toFixed(2)}%`;

                        domBuilder += `<div class="active_orders__list-item--line">Ордер ${params.order_id}: ${params.type} ${params.quantity} ${fCurrency} for price ${params.price} ${sCurrency}</div>`;
                        domBuilder += `<div class="active_orders__list-item--line">Активен  ${hoursLast.toFixed(2)}ч., топ цена - <span class="active_orders__list-item--price${params.order_id}">${bestPrice}</span></div>`;
                        domBuilder += `<div class="active_orders__list-item--line">Вы на <b>${placementStr}</b> месте в стакане ${backlogStr}</div>`;
                        domBuilder += `</li>`;
                        domBuilder += `</ul></div>`;
                    });
                    mainElement.removeClass('hidden');
                    mainElement.html('');
                    mainElement.append(domBuilder);

                });
            }
        );
    }
    else {
        mainElement.addClass('hidden');
    }
};

module.exports = fillActiveOrdersElement;