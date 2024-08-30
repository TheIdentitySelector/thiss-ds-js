import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { assert, expect } from 'chai';
import fetchMock from 'fetch-mock';
import pkgIsoFetch from 'isomorphic-fetch';
const { Response, Request, Headers, fetch } = pkgIsoFetch;
import { JSDOM } from "jsdom";

const window = new JSDOM().window;

describe('DiscoveryService', function() {

    beforeEach(function() {
       global.window = window;
       global.DiscoveryService = require('../src/discovery.js').DiscoveryService;
       global.PersistenceService = require('../src/persist.js').PersistenceService;
       global.fetchMock = fetchMock;
    });

    it('exists', function() {
        expect(DiscoveryService).to.exist;
    });

    it('has a working constructor', function() {
        expect(new DiscoveryService("http://localhost","http://localhost","foo")).to.exist;
    });

    it('can construct by steps', function() {
       let ps = new PersistenceService('http://localhost')
       expect(new DiscoveryService("http://localhost",ps,"foo")).to.exist;
    });

    it('is able to run MDQ', function () {
        let ps = new PersistenceService('http://localhost/ps')
        let ds = new DiscoveryService("http://localhost",ps);
        fetchMock.get('*',[{
            "domain": "example.com",
            "title": "Example.com Login",
            "auth": "saml",
            "scope": "example.com",
            "entityID": "https://idp.example.com/idp",
            "hidden": "false"
        }]);
        ds.mdq('{sha1}d0469ad9c683b6cf90de8210fba9a15b75fd3b2e')
            .then(function (entity) {
                expect(entity).to.exist;
                expect(entity.entityID).to.equal("https://idp.example.com/idp");
            });
        fetchMock.reset();
    });

});
