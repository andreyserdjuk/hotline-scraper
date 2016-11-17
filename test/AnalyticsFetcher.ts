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
});