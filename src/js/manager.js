const buildPage = require('./elements/elementsBuilder');
const init = require('./config').loadData;
const maintainOrders = require('./orders/maintainOrders');

let working = true;
let timer;

const start = function () {
    working = true;
    init(() => {
        buildPage();
        maintainOrders();
        refreshPage();
    });
};

const stop = function () {
    working = false;
};

const refreshPage = function () {
    function refresh() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            if (working) {
                init(() => {
                    maintainOrders();
                    buildPage();
                    refresh();
                });
            }
        }, 15 * 1000);
    }
    refresh();
};

exports.start = start;
exports.stop = stop;