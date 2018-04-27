##Usage
1. the data is from ip2location free database.
2. it only supports country code info

##how to use
```
npm install ip2cc
```
```
const iptocc = require('iptocc');
const countryCode = iptocc('164.52.12.83');
console.log(countryCode);//HK
```

##how about efficiency
```
node index.test.js
```
on my mac ,look up 1,000,000 ips only need about 2000ms.  
it is faster hundred times than [ip2location-nodejs](https://www.npmjs.com/package/ip2location-nodejs).  
