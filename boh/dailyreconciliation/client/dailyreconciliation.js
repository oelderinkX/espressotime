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
    bankDepositCalc();
}

function calcReconciliation() {
    var bank = document.getElementById("bank");

    var cashout1 = document.getElementById("cashout1");
    var credittobank1 = document.getElementById("credittobank1");
    var amex1 = document.getElementById("amex1");
    var giftredeem1 = document.getElementById("giftredeem1");
    var gifttopup1 = document.getElementById("gifttopup1");

    var cashout2 = document.getElementById("cashout2");
    var credittobank2 = document.getElementById("credittobank2");
    var amex2 = document.getElementById("amex2");
    var giftredeem2 = document.getElementById("giftredeem2");
    var gifttopup2 = document.getElementById("gifttopup2");

    var finalcash = document.getElementById("finalcash");
    var finalmanualsmartpay = document.getElementById("finalmanualsmartpay");
    var finalsmartpay = document.getElementById("finalsmartpay");
    var finalsalesamount = document.getElementById("finalsalesamount");

    var reconcash = document.getElementById("reconcash");
    var reconeftpospaymark = document.getElementById("reconeftpospaymark");
    var giftcardtopups = document.getElementById("giftcardtopups");

    reconcash.innerHTML = (parseFloat(bank.innerHTML)
                            - (parseFloat(finalcash.value)
                            - parseFloat(cashout1.value)
                            - parseFloat(cashout2.value))).toFixed(2);

    reconeftpospaymark.innerHTML = ((parseFloat(credittobank1.value)
                                    + parseFloat(amex1.value)
                                    + parseFloat(giftredeem1.value)
                                    + parseFloat(credittobank2.value)
                                    + parseFloat(amex2.value)
                                    + parseFloat(giftredeem2.value))
                                    - (parseFloat(finalsmartpay.value)
                                    + parseFloat(finalmanualsmartpay.value))).toFixed(2);

    giftcardtopups.innerHTML =  (parseFloat(gifttopup1.value)
                               + parseFloat(gifttopup2.value)).toFixed(2);
}

function bankDepositCalc() {
    var bankdepositcalc = document.getElementById("bankdepositcalc");
    bankdepositcalc.innerHTML = '';

    var noteline = document.createElement('tr');

    var notevalue100 = document.createElement('td');
    notevalue100.setAttribute('style', 'background:#ffffff; color: #000000; padding: 5px;');
    notevalue100.innerText  = '$100';

    var notecount100 = document.createElement('td');
    notecount100.setAttribute('style', 'background:#cccccc; color: #ffffff; padding: 5px;');
    notecount100.innerText  = '0';

    noteline.appendChild(notevalue100);
    noteline.appendChild(notecount100);

    bankdepositcalc.appendChild(noteline);
}

function calcField(event) {
    if (event.key == "Enter") {
        event.target.value = eval(event.target.value);
        event.target.value = parseFloat(event.target.value).toFixed(2);
    } else if (event.key == "Escape") {
        event.target.value = "0.00";
    }
}