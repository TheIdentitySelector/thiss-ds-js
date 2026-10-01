Installing thiss-ds-js
======================

Install
=======

Install via npm is straight-forward:

.. code-block:: bash

  # npm install [--save] @theidentityselector/thiss-ds@<version>

Use version 4.0.1 or later, and pin the exact version.
See the section on versions under the title "Using thiss-ds".

The thiss-ds package supports both CommonJS-style and ES6 import as well as old-school CDN delivery:

CommonJS:

.. code-block:: js

  var thiss = require("@theidentityselector/thiss-ds");

ES6-style

.. code-block:: js

  import {DiscoveryService, PersistenceService} from "@theidentityselector/thiss-ds";

CDN (thanks to `unpkg.com <https://unpkg.com>`_), pinned to an exact version:

.. code-block:: html

  <script src="https://unpkg.com/@theidentityselector/thiss-ds@4.0.1/dist/thiss-ds.js"></script>

NOTE: three published versions must not be used, from npm or unpkg: 4.0.0, and the unpkg builds of 1.0.14 and 2.1.54.
They speak a different post-robot wire dialect than the persistence services and fail silently.
Since 4.0.1 the bundle is pinned to the dialect every deployed persistence service speaks.
Pinning the exact version keeps a later publish from changing the dialect under you.
