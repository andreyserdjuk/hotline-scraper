import * as fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as minimist from 'minimist';
import {HeadersInitInterface} from '../src/HeadersInitInterface';
import {AnalyticsFetcher} from '../src/AnalyticsFetcher';
import {CatalogListFetcher} from '../src/CatalogListFetcher';
let args = minimist(process.argv.slice(2));
let headers = JSON.parse(fs.readFileSync('headers.json', 'utf8')) as HeadersInitInterface;

if (typeof args['c'] !== 'undefined') {
    if (args['c'] === 'fetch') {
        let cfetcher = new CatalogListFetcher('http://hotline.ua/catalog/', headers)
        cfetcher.fetch().then(links => 
            fs.writeFileSync('out.txt', links.join('\r\n'))
        );
    }

    if (args['c'] === 'grab_analytics') {
        let fileName = 'out.txt';
        if (fs.existsSync(fileName)) {
            let data = fs.readFileSync(fileName, 'utf8')
            let links = data.split('\r\n');
            let afetcher = new AnalyticsFetcher(headers);
            afetcher.fetch(links);
        } else {
            console.log('there are no "%s" file', fileName);
        }
    }
}