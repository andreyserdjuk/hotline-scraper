import fetch = require('node-fetch');
import cheerio = require('cheerio');
import fs = require('fs');
import m = require('minimist');
let args = m(process.argv.slice(2));

if (typeof args['c'] !== 'undefined') {
    if (args['c'] === 'fetch') {
        fetchCatalogs();
    }

    if (args['c'] === 'grab_analytics') {
        grabAnalytics();
    }
}

function grabAnalytics(fileName:string = 'out.txt') {
    if (fs.existsSync(fileName)) {
        // let file = fs.openSync(fileName, 'r');
        fs.readFile(fileName, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            let links = data.split('\r\n');

            for (let link of links) {
                fetch(link) // goto category page
                .then(res => {
                    return res.text();
                })
                .then(body => {
                    // extract first 10 product ids
                    // let $ = cheerio.load(body);
                    // $('body');
                    let first10ProductIds = extractProductIdsFromCatPage(body);
                })
            }
        });
    } else {
        console.log('there are no "%s" file', fileName);
    }
}

function extractProductIdsFromCatPage(body) {
    let first10Arr = body.search(/catalogFirst10Products\s*\'\s*:\s*\'((,?\d+)+)/);

    if (typeof first10Arr[1] !== 'undefined') {
        try {
            let productIdsString = JSON.parse(first10Arr[1])
            return productIdsString.split(',');
        } catch (e) {}
    }
}

function fetchCatalogs() {
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
}