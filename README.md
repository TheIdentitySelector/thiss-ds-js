thiss.io clients
====

A set of clients for the thiss.io service: persistance and discovery. Usage is prettys simple. Load the
js thiss.ds.js somehow either

** CommonJS

```
var thiss = require("thiss.ds")
```

** ES6

```
import {DiscoveryService} from "thiss.ds";
import {PersistenceService} from "thiss.ds";
```

```
var ds = new DiscoveryService(entity_id => { ... }, 'https://use.thiss.io/ps'):
```
