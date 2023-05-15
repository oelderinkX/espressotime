function loadDays() {
    var daylist = document.getElementById('daylist');

    daylist.innerHTML = '';

    var date = new Date();
    date.setDate(date.getDate()-14);

    for(var i = 0; i <= 14; i++) {
            var button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.setAttribute('class', 'list-group-item list-group-item-action');
            button.setAttribute('onclick', 'displayDay(\'' + getDbFormat(date) + '\');');
            button.style = "font-size:16px";
            button.innerText = date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear() + ' (' + dayNames[date.getDay()] + ')';

            daylist.appendChild(button);

            date.setDate(date.getDate()+1);
    }
}

function displayDay(date) {
    // alert(date);
    // get recon for "date" for company
    // should only have 1 per day
}

function calcDailyTaily() {
    var ten_cents = document.getElementById("ten_cents");
    var ten_cents_calc = document.getElementById("ten_cents_calc");
    var twenty_cents = document.getElementById("twenty_cents");
    var twenty_cents_calc = document.getElementById("twenty_cents_calc");
    var fifty_cents = document.getElementById("fifty_cents");
    var fifty_cents_calc = document.getElementById("fifty_cents_calc");
    var one_dollar = document.getElementById("one_dollar");
    var one_dollar_calc = document.getElementById("one_dollar_calc");

    var two_dollar = document.getElementById("two_dollar");
    var two_dollar_calc = document.getElementById("two_dollar_calc");
    var five_dollar = document.getElementById("five_dollar");
    var five_dollar_calc = document.getElementById("five_dollar_calc");
    var ten_dollar = document.getElementById("ten_dollar");
    var ten_dollar_calc = document.getElementById("ten_dollar_calc");
    var twenty_dollar = document.getElementById("twenty_dollar");
    var twenty_dollar_calc = document.getElementById("twenty_dollar_calc");
    var fifty_dollar = document.getElementById("fifty_dollar");
    var fifty_dollar_calc = document.getElementById("fifty_dollar_calc");
    var hundred_dollar = document.getElementById("hundred_dollar");
    var hundred_dollar_calc = document.getElementById("hundred_dollar_calc");

    var subtotal = document.getElementById("subtotal");
    var float = document.getElementById("float");
    var bank = document.getElementById("bank");

    ten_cents_calc.innerHTML = (ten_cents.value * 0.10).toFixed(2);
    twenty_cents_calc.innerHTML = (twenty_cents.value * 0.20).toFixed(2);
    fifty_cents_calc.innerHTML = (fifty_cents.value * 0.50).toFixed(2);
    one_dollar_calc.innerHTML = (one_dollar.value * 1.00).toFixed(2);

    two_dollar_calc.innerHTML = (two_dollar.value * 2.00).toFixed(2);
    five_dollar_calc.innerHTML = (five_dollar.value * 5.00).toFixed(2);
    ten_dollar_calc.innerHTML = (ten_dollar.value * 10.00).toFixed(2);
    twenty_dollar_calc.innerHTML = (twenty_dollar.value * 20.00).toFixed(2);
    fifty_dollar_calc.innerHTML = (fifty_dollar.value * 50.00).toFixed(2);
    hundred_dollar_calc.innerHTML = (hundred_dollar.value * 100.00).toFixed(2);

    subtotal.innerHTML =  (parseFloat(ten_cents_calc.innerHTML)
                        + parseFloat(twenty_cents_calc.innerHTML)
                        + parseFloat(fifty_cents_calc.innerHTML)
                        + parseFloat(one_dollar_calc.innerHTML)
                        + parseFloat(two_dollar_calc.innerHTML)
                        + parseFloat(five_dollar_calc.innerHTML)
                        + parseFloat(ten_dollar_calc.innerHTML)
                        + parseFloat(twenty_dollar_calc.innerHTML)
                        + parseFloat(fifty_dollar_calc.innerHTML)
                        + parseFloat(hundred_dollar_calc.innerHTML)).toFixed(2);

    float.innerHTML = '600.00';

    bank.innerHTML = (parseFloat(subtotal.innerHTML) - parseFloat(float.innerHTML)).toFixed(2);

    calcReconciliation();
}

function calcReconciliation() {
    var bank = document.getElementById("bank");

    var cashout1 = document.getElementById("cashout1");
    var giftcards1 = document.getElementById("giftcards1");
    var total1 = document.getElementById("total1");

    var cashout2 = document.getElementById("cashout2");
    var giftcards2 = document.getElementById("giftcards2");
    var total2 = document.getElementById("total2");

    var poscash = document.getElementById("poscash");
    var poseftpos = document.getElementById("poseftpos");
    var posaccount = document.getElementById("posaccount");
    var posvoucher = document.getElementById("posvoucher");

    var reconcash = document.getElementById("reconcash");
    var reconeftpos = document.getElementById("reconeftpos");
    var reconaccount = document.getElementById("reconaccount");
    var reconvoucher = document.getElementById("reconvoucher");

    reconcash.innerHTML = (parseFloat(bank.innerHTML) - (poscash.value - cashout1.value - cashout2.value)).toFixed(2);
    reconeftpos.innerHTML = ((parseFloat(total1.value) + parseFloat(total2.value)) - parseFloat(poseftpos.value)).toFixed(2);

    reconaccount.innerHTML = '0.00'; // no idea how to do this ?
    reconvoucher.innerHTML = '0.00'; // no idea!
}