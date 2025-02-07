Leveraging the Storage Access API
=================================

The persistence service (PS) needs to access first party, non-partitioned storage to be able to remember chosen IdPs across different SPs.
Recent developments in browser technology, designed to protect end user's privacy,
mean that to do so, the PS will have to make use of the Storage Access API.

The Storage Acces API allows javascript code in a third party context (e.g. in an iframe, as is the case for the PS)
to prompt the end user for permission to access first party storage. This API can only be used from code in the third party context,
and can only be called in reaction to an end user interaction with some UI element in the third party context.
In addition, to be able to use the API, the user must have previously visited the third party origin in a first party context.

Note that at this point, to test the Storage Access API in chrome and chromium derivatives, the end user has to enable the flag
"third party cookie phaseout". To do this, enter `chrome://flags` in the address bar, and then look for "third party cookie phaseout",
enable it, and restart the browser.

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

As mentioned above, first we create an element which will hold the PS checkbox, and then provide the PS constructor with a selector for the element.

This is an example of accessing the PS. The client page will have some HTML similar to:

.. code-block:: html

    <p><span id="ps-checkbox-holder"><span/> Remember my choice</p>

Then we call the constructor:

.. code-block:: js

    import {PersistenceService} from "@theidentityselector/thiss-ds/src/persist.js";

    const ps = PersistenceService(
        'https://use.thiss.io/ps/',
        {
            selector: '#ps-checkbox-holder',
        });

    // do something with `ps`

Now we can do things with the `ps` object, see the PS API :ref:`api/persist`

The changes to code using the :class:`DiscoveryService` class are similar, since it includes a :class:`PersistenceService` property.
Firt we would add some HTML element to hold te checkbox, and the provide the constructor with a selector for the element:

.. code-block:: js

  var ds = new DiscoveryService(
       'https://md.thiss.io/entities/', 
       'https://use.thiss.io/ps/', 
       'my_context',
        {
          selector: "#ps-checkbox-holder",
        }):

And now we can do things with the `ds` object, see the DS API :ref:`api/discovery`

Event signalling that the end user has granted storage access persmission
=========================================================================

When an advanced integration exposes the persistence service checkbox, and an end user clicks on it, is prompted for storage access permission,
and grants it, the persistence service will emit a message event (managed with post-robot) with id `storage-access-granted`,
that the top level host site can listen to, for example to retrieve persisted entities, now that they can access them. For example:

.. code-block:: js

    postRobot.on('storage-access-granted', {window: ds.ps.dst}, function(event) {
        ds.ps.entities(ds.context).then(function(result) {
            if (result && result.data) {
                // do something with the entities in result.data
            }
        });
    });

Event signalling that the end user has clicked on the PS checkbox
=================================================================

Whenever the end user clicks on the PS checkbox, the PS will emit a message event that the top level site can subscribe to.
This way, integrations can leverage the checkbox for their own purposes. This event will have (post-robot) id `sa-checkbox-clicked`
and will include the subsequent state of the checkbox (checked/unchecked).
For example:

.. code-block:: js

    postRobot.on('sa-checkbox-clicked', {window: ds.ps.dst}, function(event) {
        const checked = event.data.checked;  // checked is a boolean
        // do something
    });


Exposing the checkbox after the persistence service is loaded
=============================================================

There may be cases where the advanced integrator may want to expose the persistence service checkbox in an element that is not visible on page load,
for example in a modal that is opened in response to an end user interaction. In this case, we need to append the checkbox after the modal has loaded
and is exposing the element to which the checkbox is to be attached. So we would first instantiate the persistence service without providing it with a locator:

.. code-block:: js

    import {PersistenceService} from "@theidentityselector/thiss-ds/src/persist.js";

    const ps = PersistenceService('https://use.thiss.io/ps/');

Then, at the time of displaying the element that will contain the checkbox, we need to call `PersistenceService.show_checkbox(selector: string)`.
In this case, if we want to handle the `storage-access-granted` post-message event, we have to set the handler after calling `show_checkbox`
(since `show_checkbox` will change `ps.dst`):

.. code-block:: js

    someButton.addEventListener("click", (e) => {
        // Code to display element with id "checkbox-sa-holder"
        // ...
        // Then attach checkbox to it:
        ds.ps.show_checkbox("#checkbox-sa-holder");
        postRobot.on('storage-acccess-granted', {window: ds.ps.dst}, function(event) {
            // Do something
        });
    });

Finally, if we need to hide the element that contains the checkbox (e.g., the checkbox is shown in a modal, and the end user closes the modal),
we have to call `hide_checkbox` beforehand.

.. code-block:: js

    someButton.addEventListener("click", (e) => {
        ds.ps.hide_checkbox("#checkbox-sa-holder");
        // now we can remove the element holding the checkbox from the UI.
    });
