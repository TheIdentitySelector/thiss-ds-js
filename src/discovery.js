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
  * @param {string} url The URL of an MDQ
  * @returns {Promise} a Promise resolving a list of json objects
  */

export function json_mdq(url) {
    let opts = {method: 'GET', headers: {'Accept':'application/json'}};
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

export function json_mdq_pre_get(id, trustProfile, entity_id, mdq_url) {
    let url = mdq_url + id + ".json"

    if (entity_id && trustProfile) {
        url = `${url}?entityID=${encodeURIComponent(entity_id)}&trustProfile=${trustProfile}`
    }

    return json_mdq(url).then(function(data) {
        if (Array.isArray(data) && data.length > 0) {
            data = data[0];
        }
        return data;
    })
}

/**
  * An MDQ client using fetch (https://fetch.spec.whatwg.org/). The function returns a Promise
  * which must be resolved before the object can be accessed.
  *
  * @param {string} id an entityID (must be urlencoded) or sha1 id
  * @param {string} mdq_url a URL of an MDQ service incl trailing slash - eg https://md.thiss.io/entities/
  * @param {string} entity_id entityID of the SP using the discovery service, in case there is a trust profile
  * @param {string} trustProfile trustProfile selected by the SP using the discovery service, in case there is a trust profile
  * @returns {Promise} A promise that resolves to an object representing the resulting entity
  */
export function json_mdq_get(id, trustProfile, entity_id, mdq_url) {
    return json_mdq_pre_get(id, trustProfile, entity_id, mdq_url)
        .catch(function(error) {
            console.log(error);
        });
}

/**
  * An MDQ client using fetch (https://fetch.spec.whatwg.org/)
  * that will look for an SP entity based on its entityID. The function returns a Promise
  * which must be resolved before the object can be accessed.
  *
  * @param {string} entityID an entityID (must be urlencoded)
  * @param {string} mdq_url a URL of an MDQ service incl trailing slash - eg https://md.thiss.io/entities/
  * @returns {object} an object representing the resulting entity
  */

export function json_mdq_get_sp(entityID, mdq_url) {

    const id = _sha1_id(entityID);
    const url = mdq_url + id + ".json"

    return json_mdq(url).then(function(data) {
        if (Object.prototype.toString.call(data) === "[object Array]") {
            data = data[0];
        }
        return data;
    }).catch(function(error) {
        console.log("ERROR getting SP md:", error);
    });
}

/**
  * An MDQ client using fetch (https://fetch.spec.whatwg.org/). The function returns a Promise
  * which must be resolved before the objects can be accessed.
  *
  * @param {string} text the string to search for
  * @param {string} mdq_url a URL of an MDQ service incl trailing slash - eg https://md.thiss.io/entities/
  * @param {string} entity_id entityID of the SP using the discovery service, in case there is a trust profile. This is optional.
  * @param {string} trustProfile trustProfile selected by the SP using the discovery service. This is optional.
  * @returns {Promise} a Promise resolving an list of Object observing the discojson schema
  */

export function json_mdq_search(text, mdq_url, entityID, trustProfile) {
    let params = []

    params.push(`q=${text}`)

    if (entityID && trustProfile) {
        params.push(`entityID=${encodeURIComponent(entityID)}`)
        params.push(`trustProfile=${trustProfile}`)
    }

    let url = `${mdq_url}?${params.join('&')}`
    return json_mdq(url);
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
 * When specifying a 'shib' initiator type, the shibboleth SP session initiator should be
 * configured with property `entityIDParam="IDPEntityID"`.
 *
 * @param {Object} entity a discojson entity
 * @param {Object} params an object object from which 'return' (required) and 'returnIDParams' (optional) will be used
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
    let response = params.return;
    if (response === "/") {
        response = window.location.origin
                    ? window.location.origin + '/'
                    : window.location.protocol + '//' + window.location.host + '/';
    }
    if (response === undefined || (!response.startsWith('http://') && !response.startsWith('https://'))) {
        throw new Error(`Invalid return query param: ${response}`)
    }

    let qs = response.indexOf('?') === -1 ? '?' : '&';
    let returnIDParam = params.returnIDParam;

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
  * To obtain cross-site persistence, using the browser's Storage Access API,
  * an integrator must expose a checkbox from the persistence service, so that when
  * the user clicks on it, they will be prompted for permission to share persisted
  * entities across different sites using the persistence service. This exposed
  * checkbox can be labelled "remember me" or something of the sort.
  *
  */
export class DiscoveryService {

    /**
     * The constructor takes 4 parameters:
     *
     * @constructor
     *
     * @param {function|string} mdq a callable or a URL to be used for MDQ-style lookups of entity objects.
     * @param {string|PersistenceService} persistence the URL of a persistence service or an instance of the PersistanceService
     * @param {string} context the default context identifier
     * @param {Object} opts An optional object containing options. Supported keys:
     *      @props {str} opts.selector A selector in which to place the PS checkbox
     *      @props {str} opts.trustProfile The name of a trust profile with filtering information
     *      @props {str} opts.entityID The entityID of the SP publishing the trust profile
     */
    constructor(mdq, persistence, context, opts = {}) {
        let selector, entityID, trustProfile;
        if (typeof context === 'string') {
            selector = opts.selector;
            entityID = opts.entityID;
            trustProfile = opts.trustProfile;
        } else if (typeof context === 'object') {
            selector = context.selector;
            entityID = context.entityID;
            trustProfile = context.trustProfile;
            context = "thiss.io";
        } else {
            context = "thiss.io";
        }
        if (typeof mdq === 'function') {
            this.mdq = mdq;
        } else {
            this.mdq = function(idp) { return json_mdq_get(_sha1_id(idp), trustProfile, entityID, mdq) }
        }
        this.mdq_sp = function(eID) { return json_mdq_get_sp(eID, mdq) }

        if (persistence instanceof PersistenceService) {
           this.ps = persistence;
        } else {
           this.ps = new PersistenceService(persistence, {selector: selector});
        }
        this.context = context;
    }

    /**
     * Preform callback on all entities in the persistence-service.
     * @param {function} callback a callable taking a single entity parameter
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
     * @param {string} entity_id an entityID of the chosen SAML identity provider.
     * @param {boolean} persist whether to persist the choice
     */
    saml_discovery_response(entity_id, persist=true) {
        return this.do_saml_discovery_response(entity_id, persist).then(item => {
            let params = Object.fromEntries(new URLSearchParams(window.location.search));
            const url = ds_response_url(item.entity, params);
            return url;
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
     * @param {string} entity_id the entityID of the SAML identity provider
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
     * @param {string} entity_id the entityID of the SAML identity provider
     * @param {boolean} persist set to true (default) to persist the discovery metadata
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
     * @param {string} entity_id the entityID of the SAML identity provider to be removed
     */
    remove(entity_id) {
        return this.ps.remove(this.context, entity_id);
    }
}
