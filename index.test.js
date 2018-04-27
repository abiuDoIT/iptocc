const iptocc = require('./index.js');
function get_random(max) {
    return Math.floor(Math.random() * max);
}
function get_random_ip() {
    return [get_random(256), get_random(256), get_random(256), get_random(256)].join('.');
}

function get_ips(ip_num){
    ip_num = ip_num||Math.pow(10,6);
    let ip_arr = Array.from(new Array(ip_num),d=>get_random_ip());
    return ip_arr;
}
function test_time(ip_arr,fn){
    console.log('start ...');
    let start_at = Date.now()
    ip_arr.forEach(fn);
    console.log(`look up ${ip_arr.length} ips,cost ${Date.now()-start_at}ms. `)
    return Date.now()-start_at;
}
test_time(get_ips(10**6),iptocc)
