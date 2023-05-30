function loadDays() {
    var daylist = document.getElementById('daylist');

    daylist.innerHTML = '';

    var date = new Date();
    date.setDate(date.getDate());

    var firstDate = getDbFormat(date);

    var enableSave = true;
    for(var i = 0; i <= 14; i++) {
            var button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.setAttribute('class', 'list-group-item list-group-item-action');
            button.setAttribute('onclick', 'displayDay(\'' + getDbFormat(date) + '\', ' + enableSave + ');');
            button.style = "font-size:16px";
            button.innerText = date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear() + ' (' + dayNames[date.getDay()] + ')';

            daylist.appendChild(button);

            date.setDate(date.getDate()-1);
            enableSave = false;
    }

    displayDay(firstDate, true);
}

function displayDay(date, enableSave) {
    var recon_date = document.getElementById('recon_date');
    recon_date.value = date;

    var savebutton = document.getElementById('savebutton');
    if (enableSave) {
        savebutton.disabled = false;
    } else {
        savebutton.disabled = true;
    }

    var request = { recon_date: date };
    sendPost("/getreconciliation", JSON.stringify(request), function(response) {
        recon  = JSON.parse(response);

        document.getElementById("ten_cents").value = getIntValue(recon.cents_10);
        document.getElementById("twenty_cents").value = getIntValue(recon.cents_20);
        document.getElementById("fifty_cents").value = getIntValue(recon.cents_50);
        document.getElementById("one_dollar").value = getIntValue(recon.dollars_1);
        document.getElementById("two_dollar").value = getIntValue(recon.dollars_2);
        document.getElementById("five_dollar").value = getIntValue(recon.dollars_5);
        document.getElementById("ten_dollar").value = getIntValue(recon.dollars_10);
        document.getElementById("twenty_dollar").value = getIntValue(recon.dollars_20);
        document.getElementById("fifty_dollar").value = getIntValue(recon.dollars_50);
        document.getElementById("hundred_dollar").value = getIntValue(recon.dollars_100);
        document.getElementById("cashout1").value = getFloatValue(recon.cashout1);
        document.getElementById("credittobank1").value = getFloatValue(recon.credittobank1);
        document.getElementById("amex1").value = getFloatValue(recon.amex1);
        document.getElementById("giftredeem1").value = getFloatValue(recon.giftredeem1);
        document.getElementById("gifttopup1").value = getFloatValue(recon.gifttopup1);
        document.getElementById("cashout2").value = getFloatValue(recon.cashout2);
        document.getElementById("credittobank2").value = getFloatValue(recon.credittobank2);
        document.getElementById("amex2").value = getFloatValue(recon.amex2);
        document.getElementById("giftredeem2").value = getFloatValue(recon.giftredeem2);
        document.getElementById("gifttopup2").value = getFloatValue(recon.gifttopup2);
        document.getElementById("finalcash").value = getFloatValue(recon.finalcash);
        document.getElementById("finalmanualsmartpay").value = getFloatValue(recon.finalmanualsmartpay);
        document.getElementById("finalsmartpay").value = getFloatValue(recon.finalsmartpay);

        calcDailyTaily();
    });
}

function save() {
    var recon_date = document.getElementById('recon_date');
    var ten_cents = document.getElementById("ten_cents");
    var twenty_cents = document.getElementById("twenty_cents");
    var fifty_cents = document.getElementById("fifty_cents");
    var one_dollar = document.getElementById("one_dollar");
    var two_dollar = document.getElementById("two_dollar");
    var five_dollar = document.getElementById("five_dollar");
    var ten_dollar = document.getElementById("ten_dollar");
    var twenty_dollar = document.getElementById("twenty_dollar");
    var fifty_dollar = document.getElementById("fifty_dollar");
    var hundred_dollar = document.getElementById("hundred_dollar");
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

    var recon = {
        recon_date: recon_date.value,
		cents_10: getIntValue(ten_cents.value),
        cents_20: getIntValue(twenty_cents.value),
		cents_50: getIntValue(fifty_cents.value),
		dollars_1: getIntValue(one_dollar.value),
		dollars_2: getIntValue(two_dollar.value),
		dollars_5: getIntValue(five_dollar.value),
        dollars_10: getIntValue(ten_dollar.value),
		dollars_20: getIntValue(twenty_dollar.value),
		dollars_50: getIntValue(fifty_dollar.value),
		dollars_100: getIntValue(hundred_dollar.value),
		cashout1: getFloatValue(cashout1.value),
        credittobank1: getFloatValue(credittobank1.value),
		amex1: getFloatValue(amex1.value),
		giftredeem1: getFloatValue(giftredeem1.value),
		gifttopup1: getFloatValue(gifttopup1.value),
		cashout2: getFloatValue(cashout2.value),
        credittobank2: getFloatValue(credittobank2.value),
		amex2: getFloatValue(amex2.value),
		giftredeem2: getFloatValue(giftredeem2.value),
		gifttopup2: getFloatValue(gifttopup2.value),
		finalcash: getFloatValue(finalcash.value),
        finalmanualsmartpay: getFloatValue(finalmanualsmartpay.value),
		finalsmartpay: getFloatValue(finalsmartpay.value)
    };

    sendPost("/savereconciliation", JSON.stringify(recon), function(response) {
        var json  = JSON.parse(response);
        alert('Saved!');
    });
}

function setColour(element, value) {
    if (value < -100) {
        element.setAttribute('style', 'background:#ff4000; color: #000000; padding: 5px;');
    } else if (value < -50) {
        element.setAttribute('style', 'background:#ff8000; color: #000000; padding: 5px;');
    } else if (value < -10) {
        element.setAttribute('style', 'background:#ffbf00; color: #000000; padding: 5px;');
    } else {
        element.setAttribute('style', 'background:#00ff00; color: #000000; padding: 5px;');
    }
}

function getFloatValue(float) {
    if (isNaN(float)) {
        if (float && float.includes("$")) {
            return parseFloat(float.replace("$", ""));
        } else {
            return 0;
        }
    } else if (float == "") {
        return 0;
    }else {
        return parseFloat(float);
    }
}

function getIntValue(int) {
    if (isNaN(int)) {
        return 0;
    } else if (int == "") {
        return 0;
    }else {
        return parseInt(int);
    }
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

    subtotal.innerHTML =  (getFloatValue(ten_cents_calc.innerHTML)
                        + getFloatValue(twenty_cents_calc.innerHTML)
                        + getFloatValue(fifty_cents_calc.innerHTML)
                        + getFloatValue(one_dollar_calc.innerHTML)
                        + getFloatValue(two_dollar_calc.innerHTML)
                        + getFloatValue(five_dollar_calc.innerHTML)
                        + getFloatValue(ten_dollar_calc.innerHTML)
                        + getFloatValue(twenty_dollar_calc.innerHTML)
                        + getFloatValue(fifty_dollar_calc.innerHTML)
                        + getFloatValue(hundred_dollar_calc.innerHTML)).toFixed(2);

    float.innerHTML = '600.00';

    bank.innerHTML = (getFloatValue(subtotal.innerHTML) - getFloatValue(float.innerHTML)).toFixed(2);

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
    var recontotal = document.getElementById("recontotal");

    var giftcardtopups = document.getElementById("giftcardtopups");

    //calc final sales amount from all other values
    finalsalesamount.innerHTML = (getFloatValue(finalcash.value)
                                    + getFloatValue(finalmanualsmartpay.value)
                                    + getFloatValue(finalsmartpay.value)).toFixed(2);

    // CASHED TO BE BACKED - Cash
    var reconcashvalue = (getFloatValue(bank.innerHTML)
                       - (getFloatValue(finalcash.value)
                       - getFloatValue(cashout1.value)
                       - getFloatValue(cashout2.value)));
    reconcash.innerHTML = (reconcashvalue).toFixed(2);
    setColour(reconcash, reconcashvalue);

    // ACCT + AMEX + REDEEM - Smartpay - manualpay
    var reconeftpospaymarkvalue = ((getFloatValue(credittobank1.value)
                                    + getFloatValue(amex1.value)
                                    + getFloatValue(giftredeem1.value)
                                    + getFloatValue(credittobank2.value)
                                    + getFloatValue(amex2.value)
                                    + getFloatValue(giftredeem2.value))
                                    - (getFloatValue(finalsmartpay.value)
                                    + getFloatValue(finalmanualsmartpay.value)));
    reconeftpospaymark.innerHTML = (reconeftpospaymarkvalue).toFixed(2);
    setColour(reconeftpospaymark, reconeftpospaymarkvalue);

    // recon CASH + recon EFTPOS Paymark
    var recontotalvalue =  (getFloatValue(reconcash.innerHTML)
                           + getFloatValue(reconeftpospaymark.innerHTML));
    recontotal.innerHTML = (recontotalvalue).toFixed(2);
    setColour(recontotal, recontotalvalue);

    // Add all gift top ups
    var giftcardtopupsvalue =  (getFloatValue(gifttopup1.value)
                               + getFloatValue(gifttopup2.value));
    giftcardtopups.innerHTML = (giftcardtopupsvalue).toFixed(2);                   

}

function bankDepositCalc() {
    /*var bankdepositcalc = document.getElementById("bankdepositcalc");
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

    bankdepositcalc.appendChild(noteline);*/
}

function calcField(event) {
    if (event.key == "Enter") {
        event.target.value = eval(event.target.value);
        event.target.value = getFloatValue(event.target.value).toFixed(2);
    } else if (event.key == "Escape") {
        event.target.value = "0.00";
    }
}