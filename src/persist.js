import postRobot from "post-robot";

/**
  * Generate a 32 byte random identifier.
  *
  * @returns {string} a random string
  */

function randID() {
     return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, 100));
}

/**
 *
 * A client for the thiss.io persistence service. The Persistence service methods all follow
 * the same pattern - a call that returns a Promise that resolves to one or more item Objects.
 * An item is an Object with two properties:
 *
 *  @prop {Object} entity An entity object (discojson schema)
 *  @prop {int} last_refresh A timestamp when this entity was last updated (used)
 */
export class PersistenceService {

    /**
     *
     * The constructor initializes an iframe in window.document setting src to the
     * URL provided to the constructor.
     * To obtain cross-site persistence, using the browser's Storage Access API,
     * an integrator must expose a checkbox from the persistence service, so that when
     * the user clicks on it, they will be prompted for permission to share persisted
     * entities across different sites using the persistence service. This exposed
     * checkbox can be labelled "remember me" or something of the sort.
     * 
     * @constructor
     *
     *  @param {string} url The URL of the persistence service - eg https://use.thiss.io/ps/
     *  @param {Object} opts An object containing options. Supported keys:
     *      @prop {opts.selector} [str] A selector in which to place the PS checkbox
     *      @prop {opts.apikey} [str] An optional API-key
     *
     */
    constructor(url, opts = {}) {
        this._url = url;
        this._selector = opts.selector;
        this._frame = window.document.createElement('iframe');
        this._frame.id = "ps_"+randID();
        this._frame.src = url;
        this._init_iframe(this._selector);
        this.dst = this._frame.contentWindow || this._frame;
        this.apikey = opts.apikey || undefined;
        delete opts.apikey;
        this.opts = opts
    }

    _init_iframe(selector) {
        if (selector !== undefined) {
            this.show_checkbox(selector)
        } else {
            this.hide_checkbox(undefined);
        }
    }

    _detach_checkbox(selector) {
        const sel = selector || this._selector;
        if (sel) {
            const elem = window.document.querySelector(sel);
            if (elem) {
                try {
                    this._frame = elem.removeChild(this._frame);
                } catch (err) {
                    console.log(`Iframe not attached to: ${sel}`);
                }
            }
        }
    }

    /**
     * Hide Persistence Service checkbox that hasd been displayed under the provided selector
     *
     *  @param {string} selector A selector identifying the element to which the checkbox is currently appended
     *  @returns {boolean} true on success.
     */
    hide_checkbox(selector) {
        try {
            this._detach_checkbox(selector);
            this._frame.style['content-visibility'] = 'hidden';
            this._frame.style['display'] = 'none';
            this._frame.style['position'] = 'absolute';
            this._frame.style['top'] = '-999px';
            this._frame.style['left'] = '-999px';
            this._frame.style['height'] = '0px';
            this._frame.style['width'] = '0px';
            this._frame.style['border'] = '0px';
            window.document.body.appendChild(this._frame);
            this.dst = this._frame.contentWindow || this._frame;
            return true;
        } catch (err) {
            console.log(`Problem attaching hidden checkbox: ${err}`);
            return false;
        }
    }

    /**
     * Attach and display Persistence Service checkbox to the element identified by the selector
     *
     *  @param {string} selector A selector identifying the element to which the checkbox will be appended
     *  @returns {boolean} true on success.
     */
    show_checkbox(selector) {
        try {
            const elem = window.document.body.querySelector(selector);
            if (elem !== null) {
                this._detach_checkbox("body");
                this._frame.style['content-visibility'] = 'visible';
                this._frame.style['display'] = 'inline-block';
                this._frame.style['position'] = 'relative';
                this._frame.style['top'] = '0px';
                this._frame.style['left'] = '0px';
                this._frame.style['height'] = '40px';
                this._frame.style['width'] = '40px';
                this._frame.style['border'] = '0px';
                this._frame.style['background-color'] = 'transparent';
                elem.appendChild(this._frame);
                this.dst = this._frame.contentWindow || this._frame;
                postRobot.send(this.dst, 'init-checkbox')
                      .then(event => {console.log(`Handled init-checkbox message`)})
                      .catch(err => {console.log(`Error handling init-checkbox message: ${err}`)});
                return true;
            } else {
                console.log(`Selector not found: ${selector}`);
                return false;
            }
        } catch (err) {
            console.log(`Problem attaching checkbox: ${err}`);
            return false;
        }
    }

    /**
     * Update an an entity object in browser local store tied to the ORIGIN of the service URL.
     *
     *  @param {string} context The context to write to
     *  @param {Object} entity A js object representing an entity. Uses the discojson schema.
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
     *  @param {string} context The context to write to
     *  @returns {Promise} A Promise that resolves to a list of items on success.
     */
    entities(context) {
        const self = this;
        return postRobot.send(self.dst, 'entities', {"context": context, "apikey": self.apikey})
            .then(result => result)
            .catch(e => {
                return new Promise((resolve, reject) => {
                    const timeout = 30000;
                    const timeoutID = window.setTimeout(() => {
                        reject(`Timeout waiting for initialized message: ${timeout}`);
                    }, timeout);
                    postRobot.on('initialized', {window: self.dst}, function(event) {
                        window.clearTimeout(timeoutID);
                        resolve(
                            postRobot.send(self.dst, 'entities', {"context": context, "apikey": self.apikey})
                        );
                    });
                });
            });
    }

    /**
     * Remove an entity from the context.
     *
     *  @param {string} context The context to write to
     *  @param {string} entity_id The entityID of the item to be removed.
     *  @returns {Promise} A Promise that resolves to nothing on success.
     *
     */
    remove(context, entity_id) {
        return postRobot.send(this.dst, 'remove', {"context": context, "entity_id": entity_id, "apikey": this.apikey});
    }

    /**
     * Fetch an entity from the context.
     *
     *  @param {string} context The context to write to
     *  @param {string} entity_id The entityID of the item to be removed.
     *  @returns {Promise} A Promise that resolves to an item containing the entity on success.
     *
     */
    entity(context, entity_id) {
        return postRobot.send(this.dst, 'entity', {"context": context, "entity_id": entity_id, "apikey": this.apikey});
    }

    /**
     * Check whether the persistence service has storage access permission
     *
     *  @param {string} context The context to write to
     *  @returns {boolean} A promise that resolves to a boolean
     *
     */
    has_storage_access(context) {
        return postRobot.send(this.dst, 'has_storage_access', {"context": context, "apikey": this.apikey});
    }
}
