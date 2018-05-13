const $ = require('jquery');

const balanceElement = $(".balance__list");
const reservedElement = $(".reserved__list");
const fillBalanceSection = function () {
    const config = require('../config').config;
    const fiat = config.fiatList;
    const userInfo = config.userInfo;
    const balances = userInfo.balances;
    const reserved = userInfo.reserved;
    let balancesCounter = 0, reservedCounter = 0;
    //balance block
    let balanceDOM = ``;
    for (let currency in balances) {
        const value = Number.parseFloat(balances[currency]);
        const modifier = (fiat.indexOf(currency) !== -1) ? 2 : 5;
        if (value > 1 / Math.pow(10, modifier)) {
            balancesCounter++;
            balanceDOM += `
                <div class="balance__list--item">
                    ${currency}: ${value.toFixed(modifier)}&nbsp;
                </div>
                `;
        }
    }
    balanceElement.html(``);
    balanceElement.append(balanceDOM);
    //reserved block
    let reservedDOM = ``;
    for (let currency in reserved) {
        const value = Number.parseFloat(reserved[currency]);
        const modifier = (fiat.indexOf(currency) !== -1) ? 2 : 5;
        if (value > 1 / Math.pow(10, modifier)) {
            reservedCounter++;
            reservedDOM += `
                <div class="reserved__list--item">
                    ${currency}: ${value.toFixed(modifier)}&nbsp;
                </div>
                `;
        }
    }
    reservedElement.html('');
    reservedElement.append(reservedDOM);

    if (balancesCounter === 0) balanceElement.append(`<div class="balance__list--item">0</div>`);
    if (reservedCounter === 0) reservedElement.append(`<div class="balance__list--item">0</div>`)
};

module.exports = fillBalanceSection;