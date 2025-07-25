Installing thiss-ds-js
======================

Different versions of the server API require different versions of the client library,
so care must be taken when choosing the version of the of the client library.

Version 1 of the API
--------------------

Version 1 of the API is served from https://service.seamlessaccess.org/ (or https://use.thiss.io/).
The client library fore this API version is 2.1.52.

Version 2 of the API
--------------------

Version 1 of the API is served from https://service.seamlessaccess.org/v2/ (or https://use.thiss.io/v2/).
The client library fore this API version is X.X.X.

Install
=======

Install via npm is straight-forward:

.. code-block:: bash

  # npm install [--save] @theidentityselector/thiss-ds@<version>

The thiss-ds package supports both CommonJS-style and ES6 import aswell as old-school CDN delivery:

CommonJS:

.. code-block:: js

  var thiss = require("thiss-ds.js");

ES6-style

.. code-block:: js

  import {DiscoveryService} from "thiss-ds";
  import {PersistenceService} from "thiss-ds";

CDN (thanks to `unpkg.com <https://unpkg.com>`_)

.. code-block:: html

  <script src="//unpkg.com/browse/@theidentityselector/thiss-ds@<version>" />


NOTE: Pulling from unpkg does not work for version 2.1.52 as it depends on an outdated version of post-robot.
