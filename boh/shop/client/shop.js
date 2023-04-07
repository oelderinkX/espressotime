function getShopDetails() {
    sendPost("/getshopdetails", JSON.stringify({}), function(response) {
        var shop = JSON.parse(response);

        var name = document.getElementById('name');
        name.value = shop.name;
        
        var allow_single_click_breaks = document.getElementById('allow_single_click_breaks');
        if (shop.options && shop.options.allowSingleClickBreaks) {
            allow_single_click_breaks.checked = shop.options.allowSingleClickBreaks;
        } else {
            allow_single_click_breaks.checked = false;
        }
    });
}

function saveShopDetails() {
    var allow_single_click_breaks = document.getElementById('allow_single_click_breaks');

    var json = {
        options: {
            allowSingleClickBreaks: allow_single_click_breaks.checked
        }
    };

    sendPost("/saveshopdetails", JSON.stringify(json), function(response) {
        alert('saved shop details');
    });
}