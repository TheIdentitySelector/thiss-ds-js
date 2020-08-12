Using thiss-ds
==============

Overview
--------

There are two main APIs - a highlevel DiscoveryService API (which in hindsight really should have been called a discovery client API but ...) and a lowlevel PersitenceService. The job of the PersistenceService is to keep track of previous IdP choices. The data is stored in namespace browser local storage (using the `js-storage package <https://www.npmjs.com/package/js-storage>`_). The namespace is called the "context" below (more about how contexts work later).

The DiscoveryService class is essentially a reference to an instance of the PersistenceService and a metadata query service (MDQ for short) which relies on fetch to retrieve JSON-objects that represent known identity providers. This class also contains some utility methods providing a way to implement SAML Identity Provider Discovery v1.0.

Create an instance of the DiscoveryService object thus (where my_context is a string or unkown which makes the instance default to the default (or global) context:

.. code-block:: js

  var ds = new DiscoveryService(function(entity_id) { 
           // return json representation of entity_id
        }, 
        'https://use.thiss.io/ps', 
        my_context):

  var ds = new DiscoveryService('https://md.thiss.io/entities/', 
       'https://use.thiss.io/ps', 
       my_context):

Calling the metadata lookup service with the entityID of an IdP returns a Promise that resolves (if the lookup was successful) to a JSON object (or undefined) that represents the IdP. The "schema" of the JSON is based in large parts on the classical discojson format and is explained below.

.. code-block:: js

  ds.mdq('https://idp.unitedid.org/idp/shibboleth').then(entity => {
    // do something with entity
  });

In order to implement a simple SAML discovery response:

.. code-block:: js

  ds.saml_discovery_response(entity_id, persist)


This call first calls the persistence service to record the users choice (possibly refreshing metadata using the mdq first) and then returns a SAML identity provider discovery protocol response. This could for instance called from an "onclick" method in a UI. In a typical implementation the mdq method is used to lookup metadata which is then used to drive the UI. When the user selects a particular IdP the above call persists the users choice and returns the discovery response via the SAML identity provider discovery protocol (which is essentially just a redirect) by setting the window.location.href to the assembled return URL.

The second parameter (persist) is a boolean (which by default is set to true) which if true causes the metadata returned from the lookup to be persisted in browser local store via the persistence service.

For situations where it is necessary to have more control over how the discovery response is created the following call is available:

.. code-block:: js
 
  ds.do_saml_discovery_response(entity_id, persist).then(entity => {
   // ... do something with entity JSON
  });

In this case the caller has to process the Promise returned by the call and assemble and process a discovery response. This could be useful for implementing extensions to SAML discovery or even as a basis for federation-enabled OpenIDC discovery.

Another use-case for do_saml_discovery_response is to "pin" an IdP choice based on some other process (other than a UI). For instance it may be known that users with access to an intranet site by definition should have a certain IdP pre-selected. In this case a call to do_saml_discovery_response with a static entity_id acts as a way to "pin" that IdP. In combination with UX that displays previous user "choices" this means that intranet users would never have to visit a (possibly complex) IdP search UX.

Because this is an important use-case an alias for ds.do_saml_discovery_response called ds.pin is available:

.. code-block:: js

  ds.pin(enterprise_idp_entity_id);

Note that the mdq implementation provided to the instance of DiscoveryService must be able to resolve this entity_id.

Finally the remove method removes the chose entity_id from the persistence-service if present.

.. code-block:: js

  ds.remove(entity_id)

Metadata JSON schema
--------------------

The following fields are currently used:

.. code-block:: json

  {
    "entity_icon": "a data: URI for direct inclusion in html",
    "descr": "a short description suitable for display inline",
    "title": "the name of the identity provider - primary display for users",
    "name_tag": "an upper-case SLUG - typically based on the non-TLD/ccTLD part of the domain",
    "type": "idp or sp",
    "auth": "saml|opendic|other",
    "entity_id": "the entityID of the IdP",
    "hidden": "if hide-from-discovery is set",
    "scope": "a comma-separated list of domains/scopes associated with the IdP",
    "id": "sha1 ID as specified by the MDQ spec"
  }

Context
-------

The PersistenceService is initialized with a context. The context is a namespace string passed with each call to the API. The context is used to differentiate the persistence local storage to avoid overlap. This may seem counter intutitive as the point of the thiss.io persistence service is to share IdP choices among several services. However the goal is really to share IdP choice among services that share a common view of metadata. In order to make it possible for service to have overlapping or even conflicting metadata "views" the context can be used to differentiate between "metadata domains". A contexts may be protected in a given persistence service ORIGIN so some operations (such as removing a choice) may fail. Failures are always handled as rejected Promises and should be handled by the caller in the appropriate way.
