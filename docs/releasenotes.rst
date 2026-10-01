Release Notes
=============

Version 1.0.13
-------------

* Support for turning off persistence in DiscoveryService.do_saml_discovery_response

Version 2.1.1
-------------

* Support for Storage Access API

Version 2.1.2
-------------

* Bugfixes and cleanup

Version 2.1.3
-------------

* Missing build directory

Version 2.1.4
-------------

* Bugfixes

Version 2.1.6
-------------

* Bugfixes and cleanup

Version 2.1.15
--------------

* Special behaviour for shibboleth session initiator

Version 2.1.16
--------------

* Docs and API

Version 2.1.17
--------------

* Revert special behaviour for shibboleth session initiator
* Docs

Version 2.1.28
--------------

* Documentation
* Readthedocs configuration

Version 2.1.29
--------------

* Backwards compatibility with ps 1.0.19
* Allow loading checkbox later than page load

version 2.1.30
--------------

* fix documentation

version 2.1.31
--------------

* handle init-checkbox message with no listener

version 2.1.32
--------------

* Bugfix

version 2.1.35
--------------

* Cleanup

version 2.1.36
--------------

* Fix problem with delayed display of the checkbox

version 2.1.39
--------------

* remove code for pinning entities
* Update documentation

version 2.1.40
--------------

* Update documentation

version 2.1.47
--------------

* Prepare for users using / as return URL

version 2.1.48
--------------

* Allow undefined params in ds_response_url

version 2.1.52
--------------

* Add has_storage_access funtion to advanced ps API

version 2.1.56
--------------

* Add clear method to discovery service API
* Update docs

version 4.0.0
-------------

* Do not use. The post-robot dependency moved to `@krakenjs/post-robot` 11, whose wire format differs from the
  10.0.14 dialect every deployed persistence service speaks, so this build cannot talk to any service.

version 4.0.1
-------------

* post-robot is `@krakenjs/post-robot` 11, with the wire protocol pinned to the 10.0.14 dialect at install time
  (`scripts/pin-post-robot-key.sh`): the envelope key and the one-message-per-envelope format. Works with every
  deployed persistence service, old and new.
* The build fails if `dist/thiss-ds.js` speaks any other dialect (`scripts/check-wire-key.sh`).
* Upgrade development dependencies.
* Fix the `entities()` docstring: the timestamp property is `last_use`, on the item wrapper, not inside `entity`.
