import * as console from 'console';
import * as fetch from 'node-fetch';
import {HeadersInitInterface} from 'HeadersInitInterface';

export class AnalyticsFetcher {
    constructor(private headers:HeadersInitInterface) {}
    
    public fetch(catalogLinks:Array<string>):Array<Promise<Map<string,number>>> {
        let promises = [];
        for (let link of catalogLinks) {
            promises.push(
                fetch(link, {headers: this.headers}) // goto category page
                .then(res => {
                    return res.text();
                })
                .then(body => {
                    let productIds = AnalyticsFetcher.extractProductIdsFromCatPage(body);
                    // productIds.map(this.fetchProductLastPopularity);
                    // fetch(link, getFetchParams())
                })
            );
        }

        return promises;
    }

    public fetchProductLastPopularity(productId:number):Promise<number> {
        return fetch(
            "http://hotline.ua/temp/charts/81895/30popul.csv?rnd=" + Math.random(),
            this.headers
        )
        .then(file => {
            //todo verify load csv
        });
    } 
    
    public static extractProductIdsFromCatPage(body:string):Array<number> {
        let first10Arr = body.match(/catalogFirst10Products\s*\'\s*:\s*\'((,?\d+)+)/);

        if (typeof first10Arr[1] === 'string') {
            try {
                return first10Arr[1].split(',').map(v => parseInt(v));
            } catch (e) {}
        }

        return [];
    }
}