var shopOptions = {};

function updateShopOptions() {
    sendPost("/get_shop_options", JSON.stringify('{}'), function(response) {
        shopOptions = JSON.parse(response);
    });
}

function option_allowSingleClickBreaks() {
    var option = shopOptions['allowSingleClickBreaks'];
    if (option) {
        return option;
    } else {
        return false;
    }
}