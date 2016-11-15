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
                fetch(link)
                .then(res => {
                    return res.text();
                })
                .then(body => {
                    let $ = cheerio.load(body);
                    $('body');
                })
            }
        });
    } else {
        console.log('there are no "%s" file', fileName);
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