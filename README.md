thiss.io clients
====

Install via npm is easiest:

```
npm install [--save] @theidentityselector/thiss-ds
```

A set of clients for the thiss.io service: persistance and discovery. Usage is prettys simple. Load the
js thiss.ds.js somehow ...

CommonJS
---

```
var thiss = require("thiss-ds.js")
```

ES6
---

```
import {DiscoveryService} from "thiss-ds";
import {PersistenceService} from "thiss-ds";
```

Browser
---

```
<script src="/thiss-ds.js"/>
```

Usage
---

```
var ds = new DiscoveryService(entity_id => { ... }, 'https://use.thiss.io/ps'):
var ds = new DiscoveryService('https://md.thiss.io/entities/', 'https://use.thiss.io/ps'):

ds.mdq('https://idp.unitedid.org/idp/shibboleth').then(entity => {
 # do something with entity
});
```
