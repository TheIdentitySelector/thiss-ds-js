Example: Metadata lookup
========================

To illustrate how to use the DiscoveryService API we will create and walk through a tiny discovery service. This represents the smallest (and arguably least practially useful) possible SAML-based DS. While not useful as such it can serve as a starting point for further work. This example can be found as demo.js and index.html in the thiss-ds-js distribution.

Start by creating an empty directory on a webserver and create in it an index.html with the following simple markup:

.. code-block:: html
  :linenos:

  <!DOCTYPE html>
  <html>
  <head>
    <script src="//unpkg.com/@theidentityselector/thiss-ds@<version>"></script>
    <script src="demo.js"></script>
    <title>Tiny Discovery Service</title>
  </head>
  <body>
    <main role="main">
      <h1>Search for your identity provider!</h1>
      <p>Enter an entityID and hit the lookup button</p>
      <input role="button" id="lookup" value="https://idp.unitedid.org/idp/shibboleth" type="text"/>
      <input type="button" id="submit" value="lookup"/>
      <div id="info"></div>
    </main>
  </body>
  </html>

..

The only thing that goes on here is a couple of fields for letting the js code interact with the user. The real meat
goes on in demo.js which we'll create next. Note that we load the thiss-js package from the unpkg CDN first.

Now in demo.js (in the same directory) put this:

.. code-block:: js
  :linenos:

  function entity_to_dl(entity,dl) {
     let doc = window.document;
     Array.from(dl.children).forEach(c => o.removeChild(c));
     Object.getOwnPropertyNames(entity).forEach(k => {
        let v = entity[k];
        let dt = doc.createElement("dt");
        dt.textContent = k;
        dl.appendChild(dt);
        let dd = doc.createElement("dd");
        if (k === "entity_icon") {
           let img = doc.createElement("img")
           img.setAttribute("src", v);
           dd.appendChild(img);
        } else if (typeof v === 'object') {
           let inner = doc.createElement("dl");
           entity_to_dl(v, inner);
           dd.appendChild(inner);
        } else {
           dd.textContent = v;
        }
           dl.appendChild(dd);
     })
      
  }
  
  window.onload = function() {
     let ds = new thiss.DiscoveryService("https://md.thiss.io/entities/",
                                         "https://use.thiss.io/ps/","test")
     let doc = window.document;
     let o = doc.getElementById("info");
     let i = doc.getElementById("lookup");
     let s = doc.getElementById("submit");
     let dl = doc.createElement("dl");
     o.appendChild(dl);
  
     s.onclick = function() {
        ds.mdq(i.value).then(entity => {
           if (!entity) { entity = {"error": "not found"} }
           entity_to_dl(entity, dl);
        });
     }
  }


The function ``entity_to_dl`` is a simple callback that displays information about an entity. The onload callback sets up a click handler on the submit button that calls the mdq service and after completion of the Promise in the ``then`` function call, uses ``entity_to_dl`` to show the entity. In a real discovery service the user would of course be redirected to the idp for authentication so the ``entity_to_dl`` would be replaced by a redirect of some sort. In a real DS the user would also not be expected to type in an entityID of their IdP but would be presented with some UX that allows the user to identify the right IdP in some other way.
