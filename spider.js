const request = require('request-promise')
const fs = require('fs');
const _ = require('abiutils');
async function run(){
    let result = await request.get('https://lite.ip2location.com/ip-address-ranges-by-country');
    const links_pattern = /<span class="flag-icon flag-icon-\w+"><\/span> <a href="\/.+?-ip-address-ranges">/ig;
    let links = result.match(links_pattern);
    const link_pattern = /<span class="flag-icon flag-icon-(\w+)"><\/span> <a href="(\/.+?-ip-address-ranges)">/;
    // console.log(result)
    links = links.map(function(link){
        let match = link.match(link_pattern);
        return {
            country:match[1],
            link:match[2],
        }
    })
    console.log(links.length);
    let task = [];
    for(let link of links){
        task.push(downloadIpRanges(link).catch(console.error))
        if(task.length>10){
            await Promise.all(task);
            task = [];
        }
    }
    await Promise.all(task);
    console.log('end');
}


async function downloadIpRanges({country,link}){
    const baseUrl = 'https://lite.ip2location.com';
    let result = await request.get(baseUrl+link);
    let ips = result.match(ip_range_pattern);
    const ip_pattern = /<td>(\d+\.\d+\.\d+\.\d+)<\/td>\n\s+<td>(\d+\.\d+\.\d+\.\d+)<\/td>/i;
    ips = ips.map(function(ip_range){
        return ip_range.match(ip_pattern).slice(1,3);   
    })
    result = JSON.stringify({country,ips});
    fs.writeFileSync(`./ipRanges/${country}.json`,result);
    console.log(`spider finish ${country}`);
}
run().catch(console.error);