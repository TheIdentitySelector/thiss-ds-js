Leveraging the Storage Access API
=================================

The persistence service (PS) needs to access first party, non-partitioned storage to be able to remember chosen IdPs across different SPs.
Recent developments in browser technology, designed to protect end user's privacy,
mean that to do so, the PS will have to make use of the Storage Access API.

The Storage Acces API allows javascript code in a third party context (e.g. in an iframe, as is the case for the PS)
to prompt the end user for permission to access first party storage. This API can only be used from code in the third party context,
and can only be called in reaction to an end user interaction with some UI element in the third party context.
In addition, to be able to use the API, the user must have previously visited the third party origin in a first party context.

Previously, the PS ran in an iframe that was fully invisible, with no elemets exposed in the UI.
This is no longer possible, if we want to leverage the Storage Access API; the PS will need to expose some element in the UI.
For the moment, this element is a checkbox. The integrator using the PS client in their code will need to decide where to expose it.
So the call to the constructor for the client for the PS can take a new parameter, a DOM locator, pointing to some element
in the UI to which the checkbox will be appended.

The behaviour of the checkbox only affects the way user choices are persisted.

- If the third party origin (the PS origin) has not been visited (in the current or in previous browser sessions) and thus the API cannot be used, the checkbox will be loaded unchecked.
- With the checkbox unchecked, no attemp at persistence is made.
- If the user checks the checkbox, but the PS origin has not been visited in a first party context, there will be local (partitioned) persistence: the choice of IdP will be remembered per SP. On a subsequent load, the checkbox will be unchecked.
- When the user has visited the PS origin in a first party context (e.g. the user has visited the discovery service (DS)), the checkbox will be loaded unchecked. If the user checks it, the Storage Access API will be called, and the user will be prompted for storage access permission.
- If the user grants the permission, any choices stored in local, partitioned storage will be moved to global, unpartitioned storage, and subsequently there will be global persistence. The checkbox will then on subsequent visits load checked.
- If the user denies the permission, there will only be local persistence for a period of time (30 days) until the API allows prompting the user for storage access permission again.
- In any case, there will be persistence (global or local) when the checkbox is checked.

Accessing the SeamlessAccess persistent storage through Storage Access API
==========================================================================

As mentioned above, first create an element in the form of a checkbox, then associate the checkbox with the call for the persistence service.
The use of a checkbox is our current suggestion, and we will communicate if our suggestion changes.

This is an example of accessing the PS:

.. code-block:: js

    import {PersistenceService} from "@theidentityselector/thiss-ds/src/persist.js";

    const ps = PersistenceService(
        'https://use.thiss.io/ps/',
        {
            selector: '#some-element-id',
        });

    // do something with `ps`

