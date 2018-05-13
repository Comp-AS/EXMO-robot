const CryptoJS = require('crypto-js');
const $ = require('jquery');
const settings = require('../../settings');

const config = {
    base_url: 'https://api.exmo.com/v1/',
    key: settings.key,
    secret: settings.secret,
    auth_methods: ['user_info', 'order_create', 'order_cancel', 'user_open_orders', 'user_trades', 'user_cancelled_orders', 'order_trades'],
};

function pad(d, digits) {
    let str = `${d}`;
    while (str.length < digits) {
        str = `0${str}`;
    }
    return str;
}

function sign(msg) {
    return CryptoJS.HmacSHA512(msg, config.secret).toString(CryptoJS.enc.hex);
}

const exmoQuery = (method_name, data, callback) => {
    let async = true;
    if (config.auth_methods.indexOf(method_name) !== -1) {
        let a = new Date();
        config.nonce = Number.parseInt(`${a.getFullYear()}${pad(a.getMonth() + 1, 2)}${pad(a.getDate(), 2)}${pad(a.getHours(), 2)}${pad(a.getMinutes(), 2)}${pad(a.getSeconds(), 2)}${pad(a.getMilliseconds(), 3)}`);
        data.nonce = config.nonce++;
        async = false;
    }
    const post_data = $.param(data);
    return $.ajax({
        url: `${config.base_url}${method_name}`,
        type: 'post',
        data,
        async,
        headers: {
            Key: config.key,
            Sign: sign(post_data)
        },
        dataType: 'json',
        success(data) {
            callback(data);
        }
    });

};

module.exports = exmoQuery;