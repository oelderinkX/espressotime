var productcostings = [];
var productdetails = [];

function loadAllProducts() {
    var request = {};
    sendPost("/getproducts", JSON.stringify(request), function(response) {
        productcostings = [];
        var allproducts  = JSON.parse(response);

        productcostings.push({
            id: 0,
            name: 'New Product',
            author: '',
            ingredients: [{
                id: 0,
                name: '',
                retailquantity: 0,
                measureunt: '',
                retailcost: 0.00,
                quantityneeded: 0,
                cost: 0.00
            }],
            totalcost: 0.00,
            yield: 0,
            costperyield: 0.00,
            recommendedprice: 0.00,
            recipe: ''
        });

        for(var i = 0; i < allproducts.length; i++)
        {
            productcostings.push(allproducts[i]);
        }

        getProductionCostings();
    });
}

function loadAllProductDetails() {
    var request = {};
    sendPost("/getproductdetails", JSON.stringify(request), function(response) {
        productdetails = [];
        var allproducts  = JSON.parse(response);

        for(var i = 0; i < allproducts.length; i++)
        {
            productdetails.push(allproducts[i]);
        }

        loadProductDetailsCombo();
    });
}

function loadProductDetailsCombo() {
    var productdetailslist = document.getElementById('productdetailslist');

    productdetailslist.innerHTML = '';

    for(var i = 0; i < productdetails.length; i++) {
        var productdetail = productdetails[i];
        var option = document.createElement('option');
        option.setAttribute('value', productdetail.id);
        option.innerHTML = productdetail.name;
        productdetailslist.appendChild(option);
    }
}

function displayProductDetails() {
    var select = document.getElementById('productdetailslist');
    var productdetails = getProductDetails(select.value);
    
    var id = document.getElementById('id');
    id.value = productdetails.id;

    var product_id = document.getElementById('product_id');
    product_id.value = productdetails.product_id;

    var vegetarian = document.getElementById('vegetarian');
    vegetarian.value = productdetails.vegetarian;
}

function getProductionCostings() {
    var selectproductcosting = document.getElementById('productcostings');
    selectproductcosting.innerHTML = '';

    for(var i = 0; i < productcostings.length; i++) {
        var productcosting = productcostings[i];
        var option = document.createElement('option');
        option.setAttribute('value', productcosting.id);
        option.innerHTML = productcosting.name;
        selectproductcosting.appendChild(option);
    }

    selectproductcosting.selectedIndex = 0;
    displayProductCosting();
}

function getProductCosting(id) {
    for(var i = 0; i < productcostings.length; i++) {
        if (productcostings[i].id == id) {
            return productcostings[i];
        }
    } 
}

function getProductDetails(id) {
    for(var i = 0; i < productdetails.length; i++) {
        if (productdetails[i].id == id) {
            return productdetails[i];
        }
    } 
}

function addIngredient()
{
    var ingredientsTable = document.getElementById('ingredients');
    var ingredientcount = document.getElementById('ingredientcount');

    var tr = document.createElement('tr');

    var td1 = document.createElement('td');
    var inputrname = document.createElement('input');
    inputrname.setAttribute('id', 'retailname' + ingredientcount.value);
    inputrname.setAttribute('type', 'text');
    inputrname.classList.add('form-control');
    inputrname.value = '';
    td1.appendChild(inputrname);
    tr.appendChild(td1);

    var td2 = document.createElement('td');
    var inputrquality = document.createElement('input');
    inputrquality.setAttribute('id', 'inputrquality' + ingredientcount.value);
    inputrquality.setAttribute('onkeyup', 'calculateCost(' + ingredientcount.value + ');');
    inputrquality.setAttribute('type', 'number');
    inputrquality.classList.add('form-control');
    inputrquality.value = 0;
    td2.appendChild(inputrquality);
    tr.appendChild(td2);

    var td3 = document.createElement('td');
    var selectmeasureunit = document.createElement('select');
    selectmeasureunit.setAttribute('id', 'measureunit' + ingredientcount.value);
    selectmeasureunit.classList.add('input-large');
    selectmeasureunit.classList.add('form-control');

    var option1 = document.createElement('option');
    option1.innerHTML = 'units';
    selectmeasureunit.appendChild(option1);

    var option2 = document.createElement('option');
    option2.innerHTML = 'grams';
    selectmeasureunit.appendChild(option2);

    var option3 = document.createElement('option');
    option3.innerHTML = 'mls';
    selectmeasureunit.appendChild(option3);

    td3.appendChild(selectmeasureunit);
    tr.appendChild(td3);

    var td4 = document.createElement('td');
    var retailcost = document.createElement('input');
    retailcost.setAttribute('id', 'retailcost' + ingredientcount.value);
    retailcost.setAttribute('onkeyup', 'calculateCost(' + ingredientcount.value + ');');
    retailcost.setAttribute('type', 'number');
    retailcost.classList.add('form-control');
    retailcost.value = 0.00;
    td4.appendChild(retailcost);
    tr.appendChild(td4);

    var td5 = document.createElement('td');
    var quantityneeded = document.createElement('input');
    quantityneeded.setAttribute('id', 'quantityneeded' + ingredientcount.value);
    quantityneeded.setAttribute('onkeyup', 'calculateCost(' + ingredientcount.value + ');');
    quantityneeded.setAttribute('type', 'number');
    quantityneeded.classList.add('form-control');
    quantityneeded.value = 0;
    td5.appendChild(quantityneeded);
    tr.appendChild(td5);

    var td6 = document.createElement('td');
    td6.setAttribute('id', 'calcost' + ingredientcount.value)
    td6.setAttribute('name', 'calcost');
    td6.innerHTML = 0.00;
    tr.appendChild(td6);

    ingredientsTable.appendChild(tr);

    ingredientcount.value = parseInt(ingredientcount.value) + 1;
}

function displayProductCosting()
{
    var selectproductcosting = document.getElementById('productcostings');
    var productcosting = getProductCosting(selectproductcosting.value);
    
    var id = document.getElementById('id');
    id.value = productcosting.id;

    var name = document.getElementById('name');
    name.value = productcosting.name;

    var author = document.getElementById('author');
    author.value = productcosting.author;

    var recipe = document.getElementById('recipe');
    recipe.value = productcosting.recipe;

    var ingredientsTable = document.getElementById('ingredients');
    ingredientsTable.innerHTML = '';

    var ingredientcount = document.getElementById('ingredientcount');
    ingredientcount.value = productcosting.ingredients.length;

    for(var i = 0; i < productcosting.ingredients.length; i++) {
        var tr = document.createElement('tr');
        var ingredient = productcosting.ingredients[i];

        var td1 = document.createElement('td');
        var inputrname = document.createElement('input');
        inputrname.setAttribute('id', 'retailname' + i);
        inputrname.setAttribute('type', 'text');
        inputrname.classList.add('form-control');
        inputrname.value = ingredient.name;
        td1.appendChild(inputrname);
        tr.appendChild(td1);

        var td2 = document.createElement('td');
        var inputrquality = document.createElement('input');
        inputrquality.setAttribute('id', 'inputrquality' + i);
        inputrquality.setAttribute('onkeyup', 'calculateCost(' + i + ');');
        inputrquality.setAttribute('type', 'number');
        inputrquality.classList.add('form-control');
        inputrquality.value = ingredient.retailquantity;
        td2.appendChild(inputrquality);
        tr.appendChild(td2);

        var td3 = document.createElement('td');
        var selectmeasureunit = document.createElement('select');
        selectmeasureunit.setAttribute('id', 'measureunit' + i);
        selectmeasureunit.classList.add('input-large');
        selectmeasureunit.classList.add('form-control');

        var option1 = document.createElement('option');
        option1.innerHTML = 'units';
        selectmeasureunit.appendChild(option1);

        var option2 = document.createElement('option');
        option2.innerHTML = 'grams';
        selectmeasureunit.appendChild(option2);

        var option3 = document.createElement('option');
        option3.innerHTML = 'mls';
        selectmeasureunit.appendChild(option3);

        selectmeasureunit.value = ingredient.measureunt;

        td3.appendChild(selectmeasureunit);
        tr.appendChild(td3);

        var td4 = document.createElement('td');
        var retailcost = document.createElement('input');
        retailcost.setAttribute('id', 'retailcost' + i);
        retailcost.setAttribute('onkeyup', 'calculateCost(' + i + ');');
        retailcost.setAttribute('type', 'number');
        retailcost.classList.add('form-control');
        retailcost.value = ingredient.retailcost;
        td4.appendChild(retailcost);
        tr.appendChild(td4);

        var td5 = document.createElement('td');
        var quantityneeded = document.createElement('input');
        quantityneeded.setAttribute('id', 'quantityneeded' + i);
        quantityneeded.setAttribute('onkeyup', 'calculateCost(' + i + ');');
        quantityneeded.setAttribute('type', 'number');
        quantityneeded.classList.add('form-control');
        quantityneeded.value = ingredient.quantityneeded;
        td5.appendChild(quantityneeded);
        tr.appendChild(td5);

        //calc cost
        var td6 = document.createElement('td');
        td6.innerHTML = ingredient.cost;
        td6.setAttribute('id', 'calcost' + i)
        td6.setAttribute('name', 'calcost');
        tr.appendChild(td6);

        ingredientsTable.appendChild(tr);

        calculateCost(i);
    }

    var totalcost = document.getElementById('totalcost');
    totalcost.value = productcosting.totalcost;

    var yield = document.getElementById('yield');
    yield.value = productcosting.yield;

    var costperyield = document.getElementById('costperyield');
    costperyield.value = productcosting.costperyield;

    var rrp = document.getElementById('rrp');
    rrp.value = productcosting.recommendedprice;
}

function calculateCost(id) {
    var inputrquality = document.getElementById('inputrquality'+id).value;
    var retailcost = document.getElementById('retailcost'+id).value;
    var quantityneeded = document.getElementById('quantityneeded'+id).value;
    var calcostElement = document.getElementById('calcost'+id);

    if (inputrquality && retailcost && quantityneeded) {
        calcostElement.innerHTML = (retailcost / inputrquality * quantityneeded).toFixed(2);
    } else {
        calcostElement.innerHTML = '0';
    }

    calculateTotalCost();
}

function calculateTotalCost() {
    var totalcostElement = document.getElementById('totalcost');
    var totalcost = 0;
    var allcosts = document.getElementsByName('calcost');
    for(var i = 0; i < allcosts.length; i++) {
        var val = parseFloat(allcosts[i].innerHTML);
        totalcost = totalcost + val;
    }

    totalcostElement.value = totalcost.toFixed(2);

    calculateCostPerYield();
}

function calculateCostPerYield() {
    var totalcost = document.getElementById('totalcost').value;
    var yield = document.getElementById('yield').value;
    var costperyield = document.getElementById('costperyield');

    if (yield) {
        costperyield.value = (totalcost / yield).toFixed(2);
    } else {
        costperyield.value = '0';
    }

    calculateRRP();
}

function calculateRRP() {
    var costperyield = document.getElementById('costperyield').value;
    var rrpElement = document.getElementById('rrp');

    rrpElement.value = (costperyield / 0.33).toFixed(2);
}

function saveProductCosting() {
    var id = document.getElementById('id');
    var name = document.getElementById('name');
    var author = document.getElementById('author');
    var recipe = document.getElementById('recipe');

    var totalcost = document.getElementById('totalcost');
    var yield = document.getElementById('yield');
    var costperyield = document.getElementById('costperyield');
    var rrp = document.getElementById('rrp');

    var ingredientcount = document.getElementById('ingredientcount');

    var ingredients = [];

    for(var i=0; i < ingredientcount.value; i++) {
        var retailname = document.getElementById('retailname' + i);
        var inputrquality = document.getElementById('inputrquality' + i);
        var measureunit = document.getElementById('measureunit' + i);
        var retailcost = document.getElementById('retailcost' + i);
        var quantityneeded = document.getElementById('quantityneeded' + i);
        var calcost = document.getElementById('calcost' + i);

        ingredients.push({
            id: i,
            name: retailname.value,
            retailquantity: inputrquality.value,
            measureunt: measureunit.value,
            retailcost: retailcost.value,
            quantityneeded: quantityneeded.value,
            cost: calcost.value
        });
    }

    var product = {
        id: id.value,
        name: name.value,
        author: author.value,
        ingredients: ingredients,
        totalcost: totalcost.value,
        yield: yield.value,
        costperyield: costperyield.value,
        recommendedprice: rrp.value,
        recipe: recipe.value
    };

    sendPost("/updateproducts", JSON.stringify(product), function(response) {
        loadAllProducts();
    });
}