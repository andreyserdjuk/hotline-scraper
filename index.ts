import fetch = require('node-fetch');
import cheerio = require('cheerio');
import fs = require('fs');

fetch('http://hotline.ua/catalog/')
.then(res => {
    return res.text();
})
.then(body => {
    let $ = cheerio.load(body);
    let links = $('.block').filter('.p_r-20').find('a');
    let hrefs = links.map((k, v) => {
        return $(v).attr('href').replace(/^(\/|http:\/\/\w+\.ua\/)/, 'http://hotline.ua/');
    });

    fs.writeFileSync('out.txt', hrefs.toArray().join('\r\n'));
});