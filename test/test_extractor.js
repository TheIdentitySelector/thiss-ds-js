import { assert, expect } from 'chai';
import { EntityReader } from "../src/md_extractor";


const saml_entity = {
    "entityID": "https://idp.example.com/idp",
    "type": "idp",
    "domain": "example.com",
    "title": "Example.com Login",
    "auth": "saml",
    "scope": "example.com",
    "hidden": "false",
    "entity_icon_url": {
        "url": "https://idp.example.com/logo.png",
        "width": 100,
        "height": 100
    }
};

const openid_entity = {
    "entity_id": "https://idp.example.com/idp",
    "entity_types": [
      "openid_provider",
    ],
    "ui_infos": {
      "openid_provider": {
        "display_name": "Example.com Login",
        "logo_uri": "https://idp.example.com/logo.png"
      }
    }
};

describe('EntityReader', function() {

    beforeEach(function() {
    });

    it('Can read SAML discojson metadata', function() {
        const extractor = new EntityReader(saml_entity, 'idp');
        expect(extractor.detectedStandard).to.equal('SAML');
        expect(extractor.getAttribute('entityID')).to.equal('https://idp.example.com/idp');
        expect(extractor.getAttribute('title')).to.equal('Example.com Login');
        expect(extractor.getAttribute('hidden')).to.equal(false);
        expect(extractor.getAttribute('entity_icon_url').url).to.equal("https://idp.example.com/logo.png");
        expect(extractor.getAttribute('entity_icon_url').width).to.equal(100);
        expect(extractor.getAttribute('entity_icon_url').height).to.equal(100);
    });

    it('Can read openid metadata', function() {
        const extractor = new EntityReader(openid_entity, 'idp');
        expect(extractor.detectedStandard).to.equal('Openid');
        expect(extractor.getAttribute('entityID')).to.equal('https://idp.example.com/idp');
        expect(extractor.getAttribute('title')).to.equal('Example.com Login');
        expect(extractor.getAttribute('hidden')).to.equal(false);
        expect(extractor.getAttribute('entity_icon_url').url).to.equal("https://idp.example.com/logo.png");
        expect(extractor.getAttribute('entity_icon_url').width).to.equal(100);
        expect(extractor.getAttribute('entity_icon_url').height).to.equal(100);
    });

});
