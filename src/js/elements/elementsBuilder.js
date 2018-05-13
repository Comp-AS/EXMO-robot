const fillBestOffersSection = require('./bestOffersElement');
const fillBalanceSection = require('./userBalanceElement');
const fillActiveOrdersSection = require('./activeOrdersElement');
const fillUserTradesElement = require('./userTradesElement');


const buildPage = function() {
    fillBalanceSection();
    fillBestOffersSection();
    fillActiveOrdersSection();
    fillUserTradesElement();
};

module.exports = buildPage;