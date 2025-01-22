let sql_cache = [];

let cache = [];

const shopOptions = 'shopOptions';
module.exports.shopOptions = shopOptions;

function hasCache(shopid, name) {
    console.log('hasCache: ' + shopid + ' ' + name);

    return getCache(shopid, name) !== null;
}
module.exports.hasCache = hasCache;

// usage getCache(1, cacheName.shopoptions)
function getCache(shopid, name) {
    console.log('getCache: ' + shopid + ' ' + name);

    let value = null;
    let now = new Date();

    for(let i = 0; i < cache.length; i++ ) {
        if (cache[i].shopid === shopid && cache[i].name === name) {
            if (now < cache[i].expire) {
                console.log('getCache: used cache');
                value = cache[i].value;
                break;
            }
        }
    }

    return value;
}
module.exports.getCache = getCache;

function clearCache(shopid, name) {
    console.log('clearCache: ' + shopid + ' ' + name);

    cache = cache.filter(c => c.shopid !== shopid && c.name !== name);
}
module.exports.clearCache = clearCache;

function setCache(shopid, name, value, expireMinutes)
{
    console.log('setCache: ' + shopid + ' ' + name);

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

function query(client, sql, values, expireMinutes, callback) {
    let result = getSql(sql, values);

    if (result === null) {
        console.log('query: No cache');
        client.query(sql, values, function(err, result) {
            setSql(sql, values, result, expireMinutes);
            callback(err, result);
        });
    } else {
        let err;
        callback(err, result);
    }
}
module.exports.query = query;

function getSql(sql, values) {
    console.log('getSql: ' + sql + ' ' + JSON.stringify(values) );

    let now = new Date();

    for(let i = 0; i < sql_cache.length; i++ ) {
        if (sql_cache[i].sql === sql && JSON.stringify(sql_cache[i].values) === JSON.stringify(values)) {
            if (now < sql_cache[i].expire) {
                console.log('getSql: used cache');
                return sql_cache[i].result;
            }
        }
    }

    return null;
}

function setSql(sql, values, result, expireMinutes) {
    console.log('setSql: ' + sql + ' ' + JSON.stringify(values) );

    // clear old cached css
    sql_cache = sql_cache.filter(s => !(s.sql === sql && JSON.stringify(s.values) === JSON.stringify(values)));

    // cache expires after (expireMinutes) minutes
    let expire = new Date();
    expire.setMinutes(expire.getMinutes() + expireMinutes);

    sql_cache.push({
        sql: sql,
        values: values,
        result: result,
        expire: expire
    })
}