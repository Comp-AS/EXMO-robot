const config = require('../../config').config;

const checkPairRequirements = function (pair, amount) {
    const min_quantity = Number.parseFloat(config.pair_settings[pair].min_quantity);
    const max_quantity = Number.parseFloat(config.pair_settings[pair].max_quantity);
};