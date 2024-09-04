import {PersistenceService} from "./persist.js";
import hex_sha1 from './sha1.js';
const cache_time = 60 * 10 * 1000; // 10 minutes

function _timestamp() {
   if (typeof Date.now === 'function') {
      return Date.now();
   }

   return new Date().getTime();
}

function _sha1_id(s) {
    return "{sha1}"+hex_sha1(s);
}

/**
  * An MDQ client using fetch (https://fetch.spec.whatwg.org/). The function returns a Promise
  * which must be resolved before the object can be accessed.
  *
  * @param {url} [string] an URL
  * @returns {Promise} a Promise resolving an list of json objects
  */

export function json_mdq(url) {
    let opts = {method: 'GET', headers: {'Accept':'application/json'}};
    console.log('json_mdq url: ', url)
    return fetch(url,opts).then(function (response) {
       if (response.status == 404) {
           throw new URIError(`${url}: not found`);
       }
       return response;
    }).then(function (response) {
        let contentType = response.headers.get("content-type");
        if(contentType && contentType.includes("application/json")) {
            return response.json();
        }
        throw new SyntaxError("MDQ didn't provide a JSON response");
    })
}

/**
  * An MDQ client using fetch (https://fetch.spec.whatwg.org/). The function returns a Promise
  * which must be resolved before the object can be accessed.
  *
  * @param {id} [string] an entityID (must be urlencoded) or sha1 id
  * @param {mdq_url} [string] a URL of an MDQ service incl trailing slash - eg https://md.thiss.io/entities/
  * @param {entity_id} [string] entityID of the SP using the discovery service, in case there is a trust profile
  * @param {trust_profile} [string] trustProfile selected by the SP using the discovery service, in case there is a trust profile
  * @returns {object} an object representing the resulting entity
  */

export function json_mdq_get(id, trust_profile, entity_id, mdq_url) {
    let url = mdq_url + id + ".json"
    console.log('json_mdq_get url: ', url)

    if (entity_id && trust_profile) {
        url = `${url}?entityID=${encodeURIComponent(entity_id)}&trustProfile=${trust_profile}`
    }

    return json_mdq(url).then(function(data) {
        if (Object.prototype.toString.call(data) === "[object Array]") {
            data = data[0];
        }
        return data;
    }).catch(function(error) {
        console.log(error);
    });
}

/**
  * An MDQ client using fetch (https://fetch.spec.whatwg.org/). The function returns a Promise
  * which must be resolved before the object can be accessed.
  *
  * @param {id} [string] an entityID (must be urlencoded) or sha1 id
  * @param {mdq_url} [string] a URL of an MDQ service incl trailing slash - eg https://md.thiss.io/entities/
  * @returns {object} an object representing the resulting entity
  */

export function json_mdq_get_sp(entityID, mdq_url) {
    const id = _sha1_id(entityID);
    const url = mdq_url + id + ".json"
    console.log('json_mdq_get_sp url: ', url)

    return json_mdq(url).then(function(data) {
        console.log(`SP DATA: ${data}`);
        if (Object.prototype.toString.call(data) === "[object Array]") {
            data = data[0];
        }
        console.log(`SP DATA 2: ${data}`);
        return data;
    }).catch(function(error) {
        console.log(error);
    });
}

/**
  * An MDQ client using fetch (https://fetch.spec.whatwg.org/). The function returns a Promise
  * which must be resolved before the object can be accessed.
  *
  * @param {text} [string] the string to search for
  * @param {mdq_url} [string] a URL of an MDQ service incl trailing slash - eg https://md.thiss.io/entities/
  * @returns {Promise} a Promise resolving an list of Object observing the discojson schema
  */

export function json_mdq_search(text, mdq_url, entityID, trustProfile) {
    let params = []

    params.push(`q=${text}`)

    if (entityID && trustProfile) {
        params.push(`entityID=${encodeURIComponent(entityID)}`)
        params.push(`trustProfile=${trustProfile}`)
    }

    let remote = `${mdq_url}?${params.join('&')}`
    console.log('json_mdq_search url: ', url)
    return json_mdq(remote);
}

/**
 * Parse an array of querystring components into an Object
 *
 * @params {paramsArray} [Array] an array of k=v parameters resulting from a split on '&' the Query string of a URI
 * @returns an object with each k,v-pair as properties.
 */
export function parse_qs(paramsArray) {
    let params = {};

    paramsArray.forEach( p => {
        let av = p.split('=', 2);
        if (av.length == 2)
            params[av[0]] = decodeURIComponent(av[1].replace(/\+/g, " "))
    });

    return params;
}

/**
 * Create a SAML discovery service protocol response URL from the entity_id property of the
 * entity object and the return and returnIDParam (if present) of the params object.
 * Combine with a base URL to form a full discovery service response.
 *
 * @param {entity} [Object] a discojson entity
 * @param {params} [Object] an object from which 'returnIDParams' and 'return' will be used
 * @returns {string} a query string
 */
export function ds_response_url(entity, params) {
    /* The `return` query-param holds the URL where the response is returned.
     * It is set by the caller and should correspond to one of the SAML
     * DiscoveryResponse elements.
     *
     * Since this is controlled by the caller, We must ensure that it is
     * correct and sanitize it. Ideally, we should compare it against the
     * Location attribute of the known <DiscoveryResponse> elements.
     *
     * If the `return` query-param is not a valid URL we throw an error.
     */
    let response = params['return'];
    if (!response.startsWith('http://') && !response.startsWith('https://')) {
        throw new Error(`Invalid return query param: ${response}`)
    }

    let qs = response.indexOf('?') === -1 ? '?' : '&';
    let returnIDParam = params['returnIDParam'];

    let entity_id = entity.entity_id;
    if (!returnIDParam) {
        returnIDParam = "entityID";
    }

    if (entity_id) {
        response += qs + returnIDParam + '=' + entity_id;
    }

    return response;
}

/**
 * A DiscoveryService class representing the business logic of a SAML disocvery service.
 *
 */
export class DiscoveryService {

    /**
     * The constructor takes 3 parameters:
     *
     * @param {mdq} [function (entity_id) {}|string] a callable or a URL to be used for MDQ-style lookups of entity objects.
     * @param {persistence} [string|PersistenceService] the URL of a persistence service or an instance of the PersistanceService
     * @param {context} [string] the default context identifier
     */
    constructor(mdq, persistence, context = "thiss.io", entity_id, trust_profile) {
        if (typeof mdq === 'function') {
            this.mdq = mdq;
        } else {
            this.mdq = function(idp) { return json_mdq_get(_sha1_id(idp), trust_profile, entity_id, mdq) }
        }
        if (persistence instanceof PersistenceService) {
           this.ps = persistence;
        } else {
           this.ps = new PersistenceService(persistence);
        }
        this.context = context;
    }

    /**
     * Preform callback on all entities in the persistence-service.
     * @param {callback} [function (entity) {}] a callable taking a single entity parameter
     */
    with_items(callback) {
        let obj = this;
        this.ps.entities(this.context).then(result => callback(result.data)).then(function(result) {
            if (result && result.data) {
                result.data.forEach(function (entity) {
                    this.ps.update(obj.context, entity);
                });
            }
        });
    }

    /**
     * Call do_saml_discovery_response and then set window.top.location.href to the discovery response URL
     * This assumes that the code is running on the discovery service URL so the relative redirect works.
     *
     * @param {entity_id} [string] an entityID of the chosen SAML identity provider.
     */
    saml_discovery_response(entity_id, persist=true) {
        return this.do_saml_discovery_response(entity_id, persist).then(item => {
            let params = parse_qs(window.location.search.substr(1).split('&'));
            return ds_response_url(item.entity, params);
        }).then(url => {
            window.top.location.href = url;
        }).catch(function(error) {
            console.log(error);
        });
    }

    /**
     * Shorthand for do_saml_discovery_response. Convenience method for the case when you want to
     * pre-populate (aka pin) an identity provider choice. The idea is to call this function, resolve
     * the Promise but not redirect the user.
     *
     * @param {entity_id} [string] the entityID of the SAML identity provider
     */
    pin(entity_id) {
        return this.do_saml_discovery_response(entity_id, true);
    }

    /**
     * The main entrypoint of the class. Performs the following actions in a Promise-chain:
     * 1. fetches the entity from the persistence service
     * 2. performs an MDQ lookup if the entity was not found
     * 3. returns an item (entity+last_used timestamp)
     *
     * @param {entity_id} [string] the entityID of the SAML identity provider
     * @param (persist) [boolean] set to true (default) to persist the discovery metadata
     */
    do_saml_discovery_response(entity_id, persist=true) {
        let obj = this;

        return obj.ps.entity(obj.context, entity_id)
            .then(result => result.data)
            .then(item => {
                if (item === undefined) {
                    return obj.mdq(entity_id).then(entity => {
                        if (persist) {
                            return obj.ps.update(obj.context, entity).then(result => result.data);
                        } else {
                            let now = Date.now()
                            let item = {
                                entity: entity,
                                last_refresh: now,
                                last_use: now
                            }
                            return Promise.resolve(item);
                        }
                    });
                } else {
                    return Promise.resolve(item);
                }
            }).catch(ex => console.log(ex));
    }

    /**
     * Removes an entity by calling the remove function of the underlying PersistenceService instance.
     *
     * @param {entity_id} [string] the entityID of the SAML identity provider to be removed
     */
    remove(entity_id) {
        return this.ps.remove(this.context, entity_id);
    }

}
