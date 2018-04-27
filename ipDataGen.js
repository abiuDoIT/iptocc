const fs = require('fs');
const path = require('path');
const file_dir = './ipRanges';

const UNKONWN = '--';
const countries = get_country();

function combine(){
    let ip_ranges = [];
    const files = fs.readdirSync(file_dir);
    files.forEach(function(filename){
        let content = fs.readFileSync(path.resolve(file_dir,filename));
        content = JSON.parse(content);
        let ips = content.ips;
        const country = filename.slice(0,2);
        ips.forEach(v=>{
            v[2]=countries[country];
            ip_ranges.push(v);
        });
    })
    return ip_ranges;
}

function get_country(){
    let country = {[UNKONWN]:0};
    const files = fs.readdirSync(file_dir);
    files.forEach((v,index)=>country[v.slice(0,2)]=index+1);
    return country;
}

function ip2long(ip){
    var d = ip.split('.');
    return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
}

function save_as_buffer(ip_ranges){
    let buffers = [];
   
    let start_ip = 0;
    let end_ip = 0;
    const UNKONWN_COUNTRY = countries[UNKONWN];
    function insert(start,end,countryNo){
        let buf = Buffer.alloc(5);
        buf.writeUInt32BE(end);
        buf.writeUInt8(countryNo,4);
        buffers.push(buf)
        start_ip = start;
        end_ip = end;
    }

    insert(start_ip,end_ip,UNKONWN_COUNTRY);
    for(let range of ip_ranges){
        if(range[0]-end_ip<=0){
            throw `conflict between [${start_ip},${end_ip}] and [${range[0]},${range[1]}] `
        }
        if(range[0]-end_ip!==1){
            insert(end_ip,range[0]-1,UNKONWN_COUNTRY);
        }
        insert(range[0],range[1],range[2]);
    }
    insert(end_ip,ip2long('255.255.255.255'),UNKONWN_COUNTRY);

    return Buffer.concat(buffers);
}

function createIndex(ipBuffer){
    console.log(ipBuffer.length/5);
     function readPreIp(index){
         index = index*5;
         return (ipBuffer[index]<<8)+ipBuffer[index+1];
     }
     let bufferArr = [],latest_ip_index = 0;
    for(let j=0,i=0;j<Math.pow(2,16);j++){
        while(readPreIp(latest_ip_index)<j&&latest_ip_index<ipBuffer.length/5){
         latest_ip_index++;
        }
        let buf = Buffer.alloc(4);
        buf.writeUInt32BE(latest_ip_index);
        bufferArr[j] = buf;
    }
    return Buffer.concat(bufferArr);
 }

async function start(){
    let ip_ranges = combine();
    ip_ranges.forEach(function(range){
        range[0] = ip2long(range[0]);
        range[1] = ip2long(range[1]);
    })
    fs.writeFileSync('./country.json',JSON.stringify(countries));
    ip_ranges = ip_ranges.sort((a,b)=>a[0]-b[0]);
    let ip_buffer = save_as_buffer(ip_ranges);
    fs.writeFileSync('./ipBuffer',ip_buffer);
    let index_buffer = createIndex(ip_buffer);
    fs.writeFileSync('./ipIndexBuffer',index_buffer);
}
start().catch(console.error)