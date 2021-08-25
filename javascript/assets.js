var assets = {};

function loadAssets() {
    var json = {};

    sendPost("/getassets", JSON.stringify(json), function(response) {
        assets = JSON.parse(response);

        var assetselect = document.getElementById('assetselect');
        assetselect.innerHTML = '';
    
        for(var i = 0; i < assets.length; i++) {
            var asset = assets[i];
            var option = document.createElement('option');
            option.setAttribute('value', asset.id);
            option.innerHTML = asset.name;
            option.setAttribute('onclick', "displayAsset(" + asset.id + ");");
            assetselect.appendChild(option);
        }   
    });
}

function displayAsset(id)
{
    for(var i = 0; i < assets.length; i++) {
        var asset = assets[i];
        if (asset.id == id)
        {
            alert('you have selected: ' + asset.name);
        }
    }
}