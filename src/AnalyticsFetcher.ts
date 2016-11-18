import * as csvParse from 'csv-parse';
import * as console from 'console';
import * as fetch from 'node-fetch';
import {HeadersInitInterface} from 'HeadersInitInterface';

export class AnalyticsFetcher {
    constructor(private headers:HeadersInitInterface) {}
    
    public fetch(catalogLinks:Array<string>):Promise<Array<Array<{[index:number]: number}>>> {
        let promises = [];
        for (let link of catalogLinks) {
            promises.push(
                new Promise((resolve, reject) => {
                    fetch(link, {headers: this.headers}) // goto category page
                    .then(res => {
                        return res.text();
                    })
                    .then(body => {
                        let productIds = AnalyticsFetcher.extractProductIdsFromCatPage(body)
                        let productIdsPromises = productIds.map(productId => {
                            return new Promise((resolve, reject) => {
                                this.fetchProductLastPopularity(productId)
                                    .then(popul => {
                                        let res = {};
                                        res[productId] = popul;
                                        resolve(res);
                                    })
                            });
                        });

                        Promise
                            .all(productIdsPromises)
                            .then((stats10) => resolve(stats10)); // [{1:3000}, {2:4433}, ...]
                    })
                })
            );
        }

        return Promise.all(promises); // [[{1:3000}, {2:4433}, ...], [{3:3000}, {5:4433}, ...], ...]
    }

    public fetchProductLastPopularity(productId:number):Promise<number> {
        return fetch(
            "http://hotline.ua/temp/charts/81895/30popul.csv?rnd=" + Math.random(),
            this.headers
        )
        .then(file => {
            return file.text();
        })
        .then(text => {
            return new Promise((resolve, reject) => {
                csvParse(text, {delimiter: ';'}, function(err, data){
                    if (err || !Array.isArray(data)) {
                        reject(err);
                    }

                    resolve(parseInt(data.pop().pop()));
                });
            })
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