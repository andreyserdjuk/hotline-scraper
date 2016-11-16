import * as fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as minimist from 'minimist';
let args = minimist(process.argv.slice(2));

if (typeof args['c'] !== 'undefined') {
    if (args['c'] === 'fetch') {
        let fetcher = new CatalogListFetcher('http://hotline.ua/catalog/', getHeaders())
        fetcher.fetch().then(links => 
            fs.writeFileSync('out.txt', links.join('\r\n'))
        );
    }

    if (args['c'] === 'grab_analytics') {
        let afetcher = new AnalyticsFetcher(getHeaders());
        // afetcher.fetch
    }
}

class AnalyticsFetcher {
    constructor(private headers:{}) {}

    public fetchSavedLinks(fileName:string = 'out.txt') {
        if (fs.existsSync(fileName)) {
            let data = fs.readFileSync(fileName, 'utf8')
            let links = data.split('\r\n');
            return this.fetch(links);
        } else {
            console.log('there are no "%s" file', fileName);
        }
    }
    
    public fetch(catalogLinks:Array<string>):Array<Promise<Map<string,number>>> {
        let promises = [];
        for (let link of catalogLinks) {
            promises.push(
                fetch(link, getFetchParams()) // goto category page
                .then(res => {
                    return res.text();
                })
                .then(body => {
                    let productIds = this.extractProductIdsFromCatPage(body);
                    // productIds.map(this.fetchProductLastPopularity);
                    // fetch(link, getFetchParams())
                })
            );
        }

        return promises;
    }

    protected fetchProductLastPopularity(productId:number):Promise<number> {
        return fetch(
            "http://hotline.ua/temp/charts/81895/30popul.csv?rnd=" + Math.random(),
            this.headers
        )
        .then(file => {
            //todo verify load csv
        });
    } 
    
    protected extractProductIdsFromCatPage(body):Array<number> {
        let first10Arr = body.search(/catalogFirst10Products\s*\'\s*:\s*\'((,?\d+)+)/);

        if (typeof first10Arr[1] !== 'undefined') {
            try {
                let productIdsString = JSON.parse(first10Arr[1])
                return productIdsString.split(',');
            } catch (e) {}
        }

        return [];
    }
}

class CatalogListFetcher {
    constructor(private url:string, private headers:{}) {}

    public fetch():Promise<Array<any>> {
        return fetch(this.url, getFetchParams())
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

interface RequestInit {
     [index: string]: string;
}

function getFetchParams() {
    let headers = JSON.parse(fs.readFileSync('headers.json', 'utf8')) as RequestInit;
    return {
        'method': 'GET',
        'headers': headers
    };
}

function getHeaders():RequestInit {
    let headers = JSON.parse(fs.readFileSync('headers.json', 'utf8')) as RequestInit;
    return headers;
}