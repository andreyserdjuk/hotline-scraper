import * as fetch from 'node-fetch';
import {HeadersInitInterface} from 'HeadersInitInterface';

export class CatalogListFetcher {
    constructor(private url:string, private headers:HeadersInitInterface) {}

    public fetch():Promise<Array<any>> {
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