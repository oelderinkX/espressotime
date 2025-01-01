function getShopDetails() {
    sendPost("/getshopdetails", JSON.stringify({}), function(response) {
        var shop = JSON.parse(response);

        var name = document.getElementById('name');
        name.value = shop.name;

        var phone = document.getElementById('phone');
        phone.value = shop.phone;

        var address = document.getElementById('address');
        address.value = shop.address;
    
        var allow_single_click_breaks = document.getElementById('allow_single_click_breaks');
        if (shop.options && shop.options.allowSingleClickBreaks) {
            allow_single_click_breaks.checked = shop.options.allowSingleClickBreaks;
        } else {
            allow_single_click_breaks.checked = false;
        }

        var employees_see_full_roster = document.getElementById('employees_see_full_roster');
        if (shop.options && shop.options.employeesSeeFullRoster) {
            employees_see_full_roster.checked = shop.options.employeesSeeFullRoster;
        } else {
            employees_see_full_roster.checked = false;
        }
    });
}

function saveShopDetails() {
    var allow_single_click_breaks = document.getElementById('allow_single_click_breaks');
    var employees_see_full_roster = document.getElementById('employees_see_full_roster');

    var phone = document.getElementById('phone');
    var address = document.getElementById('address');

    var json = {
        options: {
            allowSingleClickBreaks: allow_single_click_breaks.checked,
            employeesSeeFullRoster: employees_see_full_roster.checked
        },
        phone: phone.value,
        address: address.value
    };

    sendPost("/saveshopdetails", JSON.stringify(json), function(response) {
        alert('saved shop details');
    });
}