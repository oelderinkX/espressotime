let sql_cache = [];

let cache = [];

const cacheName = {
    shopoptions: 'shopoptions'
}


function hasCache(shopid, name) {
    return getCache(shopid, name) !== null;
}
module.exports.hasCache = hasCache;

// usage getCache(1, cacheName.shopoptions)
function getCache(shopid, name) {
    let value = null;
    let now = new Date();

    for(let i = 0; i < cache.length; i++ ) {
        if (cache[i].shopid === shopid && cache[i].name === name) {
            if (now < cache[i].expire) {
                value = cache[i].value;
                break;
            }
        }
    }

    return value;
}
module.exports.getCache = getCache;


function clearCache(shopid, name) {
    for(let i = 0; i < cache.length; i++ ) {
        cache = cache.filter(c => c.shopid !== shopid && c.name !== name);
    }
}
module.exports.clearCache = clearCache;


function setCache(shopid, name, value, expireMinutes)
{
    clearCache(shopid, name);

    let expire = new Date();
    expire.setMinutes(expire.getMinutes() + expireMinutes);

    cache.push({
        shopid: shopid,
        name: name,
        value: value,
        expire: expire
    })
}
module.exports.setCache = setCache;


// this need to go
function query(client, sql, values, callback) {
    let result = getSql(sql, values);

    if (result === null) {
        console.log('no cache');
        client.query(sql, values, function(err, result) {
            setSql(sql, values, result);
            callback(err, result);
        });
    } else {
        let err;
        console.log('used cache');
        callback(err, result);
    }
}
module.exports.query = query;

//
function getSql(sql, values) {
    console.log('getSql...');
    let now = new Date();

    for(let i = 0; i < sql_cache.length; i++ ) {
        if (sql_cache[i].sql === sql && JSON.stringify(sql_cache[i].values) === JSON.stringify(values)) {
            if (now < sql_cache[i].expire) {
                return sql_cache[i].result;
            }
        }
    }

    return null;
}

//
function setSql(sql, values, result) {
    console.log('setSql...');

    // clear old cached css
    for(let i = 0; i < sql_cache.length; i++ ) {
        sql_cache = sql_cache.filter(s => s.sql !== sql && JSON.stringify(s.values) !== JSON.stringify(values));
    }

    // cache expires after 30 minutes
    let expire = new Date();
    expire.setMinutes(expire.getMinutes() + 30);

    sql_cache.push({
        sql: sql,
        values: values,
        result: result,
        expire: expire
    })
}