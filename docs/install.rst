Installing thiss-ds-js
======================

Install via npm is straight-forward:

.. code-block:: bash

  # npm install [--save] @theidentityselector/thiss-ds

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

  <script src="//unpkg.com/browse/@theidentityselector/thiss-ds" />


NOTE: Pulling from unpkg does not work for version 2.1.52 as it depends on an outdated version of post-robot.
