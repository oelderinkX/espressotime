let log = true;

function logDbStats(pool) {
    if (log) {
        if (pool) {
            console.log('pg.Pool.totalCount: ' + pool.totalCount);
            console.log('pg.Pool.idleCount: ' + pool.idleCount);
            console.log('pg.Pool.waitingCount: ' + pool.waitingCount);
        }
    }
}
module.exports.logDbStats = logDbStats;
  
function logPoolConnect() {
    if (log) {
        console.log('Connecting to Db Pool...');
    }
}
module.exports.logPoolConnect = logPoolConnect;