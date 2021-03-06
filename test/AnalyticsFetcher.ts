import { debug } from 'util';
import * as assert from 'assert';
import * as fs from 'fs';
import {AnalyticsFetcher} from '../src/AnalyticsFetcher';

describe('AnalyticsFetcher', () => {
    before((done) => {
      done(); 
    });
  
  after((done) => {
    done(); 
  });

  it('extractProductIdsFromCatPage() should return 10 ids from source string', () => {
    let content = fs.readFileSync(__dirname + '/categoryPageSource.txt');
    let ids = AnalyticsFetcher.extractProductIdsFromCatPage(content.toString());
    assert.equal(ids.length, 11); // this cat has first 11
  });

  it('fetchProductLastPopularity', (done) => {
    let headers = fs.readFileSync(__dirname + '/../app/config/headers.json');
    let af = new AnalyticsFetcher(JSON.parse(headers.toString()));
    let popul = af.fetchProductLastPopularity(2522553);
    popul.then(
      populInt => {
        assert.ok(typeof populInt === 'number');
        done();
      },
      err => {
        throw err;
      }
    );
  });

  it('fetch', (done) => {
    let headers = fs.readFileSync(__dirname + '/../app/config/headers.json');
    let af = new AnalyticsFetcher(JSON.parse(headers.toString()));
    af.fetch(
      ['http://hotline.ua/computer/servery/', 'http://hotline.ua/computer/videokarty/']
    )
    .then(v => {
      assert.equal(v.length, 2);
      done();
    });
  });
});