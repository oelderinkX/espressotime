var assets = {};

function loadAssets() {
    var json = {};

    sendPost("/getassets", JSON.stringify(json), function(response) {
        assets = JSON.parse(response);
    });
}

function displayAsset(id)
{
    for(var i = 0; i < assets.length; i++) {
        var asset = assets[i];
        //this other things
    }
}