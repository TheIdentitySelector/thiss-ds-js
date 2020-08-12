const postRobot = require("post-robot");

/**
  * Generate a 32 byte random identifier.
  * 
  * @returns {string} a random string
  */

function randID() {
     return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

/**
 *
 * A client for the thiss.io persistence service. The Persistence service methods all follow 
 * the same pattern - a call that returns a Promise that resolves to one or more item Objects.
 * An item is an Object with two properties:
 * 
 *  @param {entity}: An entity object (discojson schema)
 *  @param {last_refresh}: A timestamp when this entity was last updated (used)
 */
export class PersistenceService {

    /**
     *
     * The constructor initializes an iframe in window.document setting src to the
     * URL provided to the constructor.
     *
     *  @param {url} The URL of the persistence service - eg https://use.thiss.io/ps/
     *  @param {opts} [Object] An object containing options. Supported keys:
     *      @param {opts.apikey} [str] An optional API-key
     *  
     */
    constructor(url, opts) {
        this._url = url;
        opts |= {};
        this._frame = this.create_iframe(url);
        this.dst = this._frame.contentWindow || this._frame;
        this.apikey = opts.apikey || undefined;
    }

    create_iframe(url) {
        let frame = window.document.createElement('iframe');
        frame.style['display'] = 'none';
        frame.style['position'] = 'absolute';
        frame.style['top'] = '-999px';
        frame.style['left'] = '-999px';
        frame.id = "ps_"+randID();
        window.document.body.appendChild(frame);
        frame.src = url;
        return frame;
    }

    /**
     * Update an an entity object in browser local store tied to the ORIGIN of the service URL.
     * 
     *  @param {context} [str] The context to write to
     *  @param {entity} [Object] A js object representing an entity. Uses the discojson schema.
     *  @returns {Promise} A Promise that resolves to an item containing the provided entity on success.
     */
    update(context, entity) {
        return postRobot.send(this.dst, 'update', {"context": context, "entity": entity, "apikey": this.apikey});
    }

    /**
     * Returns 0-3 of the most recently used entities as a list of item Objects. Be sure to 
     * examine the last_time property to make sure the provided entities are "recent" enough 
     * to be used.
     * 
     *  @param {context} [str] The context to write to
     *  @returns {Promise} A Promise that resolves to a list of items on success.
     */
    entities(context) {
        return postRobot.send(this.dst, 'entities', {"context": context, "apikey": this.apikey});
    }
    
    /**
     * Remove an entity from the context.
     *  
     *  @param {entity_id} [string] The entityID of the item to be removed.
     *  @returns {Promise} A Promise that resolves to nothing on success.
     *
     */
    remove(context, entity_id) {
        return postRobot.send(this.dst, 'remove', {"context": context, "entity_id": entity_id, "apikey": this.apikey});
    }

    /**
     * Fetch an entity from the context.
     *  
     *  @param {entity_id} [string] The entityID of the item to be removed.
     *  @returns {Promise} A Promise that resolves to an item containing the entity on success.
     *
     */
    entity(context, entity_id) {
        return postRobot.send(this.dst, 'entity', {"context": context, "entity_id": entity_id, "apikey": this.apikey});
    }

}
