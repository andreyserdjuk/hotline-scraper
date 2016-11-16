import * as es6Promise from 'es6-promise';
import fetch = require('node-fetch');
import cheerio = require('cheerio');
import fs = require('fs');
import m = require('minimist');
let args = m(process.argv.slice(2));

if (typeof args['c'] !== 'undefined') {
    if (args['c'] === 'fetch') {
        let fetcher = new CatalogListFetcher('http://hotline.ua/catalog/', getHeaders())
        fetcher.fetchCatalogs().then(links => 
            fs.writeFileSync('out.txt', links.join('\r\n'))
        );
    }

    if (args['c'] === 'grab_analytics') {
        grabAnalytics();
    }
}

function grabAnalytics(fileName:string = 'out.txt') {
    if (fs.existsSync(fileName)) {
        let data = fs.readFileSync(fileName, 'utf8')
        let links = data.split('\r\n');

        for (let link of links) {
            fetch(link, {headers:this.headers}) // goto category page
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

class CatalogListFetcher {
    constructor(private url:string, private headers:{}) {}

    public fetchCatalogs():Promise<Array<any>> {
        return fetch(this.url, {headers: this.headers})
        .then(res => {
            return res.text();
        })
        .then(body => {
            return this.parseCatalogLinks(body);
        });
    }

    protected parseCatalogLinks(body:string):Array<any> {
        let $ = cheerio.load(body);
        let links = $('.block').filter('.p_r-20').find('a');
        let hrefs = links.map((k, v) => {
            return $(v).attr('href').replace(/^(\/|http:\/\/\w+\.ua\/)/, 'http://hotline.ua/');
        });

        return hrefs.toArray();
    }
}

function getHeaders() {
    return JSON.parse(fs.readFileSync('headers.json', 'utf8'));
}