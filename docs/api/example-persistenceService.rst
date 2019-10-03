Example: Retrieval of entities using the PersistenceService API
================================================================

To illustrate how to use the PersistenceService API we will create and walk through a tiny persistence service call. This represents the smallest (and arguably least practically useful) implementation to retrieve the stored entities from the persistence service. While not useful as such it can serve as a starting point for further work. This example can be found as example-persistenceService.html in the thiss-ds-js distribution.

Start by creating an empty directory on a webserver and create in it an index.html with the following simple markup:

.. code-block:: html
  :linenos:


  <!DOCTYPE html>

  <html lang="en">
  <head>
    <title>SeamlessAccess.org - PersistenceService - Entities retrieval example</title>
  </head>
  <body>

  <h2>Retrieved entities</h2>
  <div id="demo"></div>
          
  <!-- loading Javascript for using the persistence Service -->
  <script src="//unpkg.com/@theidentityselector/thiss-ds"></script>
  
  <script type="text/javascript">
    /**
     * Constructs a WAYFLess URL
     * @param {String} entityId
     *   entityID value
     * @return {String} url
     *   WAYFLess URL as a string
     */
      function getWayfLessUrl(entityId) {
        var spUrl = "https://your.serviceprovider.url"; // e.g. "https://auth.elsevier.com/ShibAuth/institutionLogin
        var returnURL = "https://your.returnURL.page/"; // e.g. "https://www.sciencedirect.com/search/advanced?qs=federated%20access"
        return spUrl + "?entityID=" + encodeURIComponent(entityId)
          + "&appReturnURL=" + encodeURIComponent(returnURL);
      }
     
     
    var my_context = 'thiss.io';
    var ps = new thiss.PersistenceService('https://service.seamlessaccess.org/ps/'); // prod URL
    //var ps = new thiss.PersistenceService('https://use.thiss.io/ps/'); // beta testing URL
     
    ps.entities(my_context)
    .then(function(res) {
       // get the results
          var myObjects = res.data;
        
          for (i in myObjects) {
            obj = myObjects[i];
            console.log(obj);
            
            var logo = "<br/><br/>";
            if (obj.entity.entity_icon_url != null) {
              logo = "<img src=\"" 
                    + obj.entity.entity_icon_url.url
                    + "\"/> ";
            }
            document.getElementById("demo").innerHTML += "" 
              + "<a href=\"" 
              + getWayfLessUrl(obj.entity.entityID) 
              + "\">"
              + logo
              + obj.entity.title 
              + "</a>";
          };
        
      }, function(err) {
         // failed
        console.log('2- failed ------------------------' + err);
      });
       
  </script>

  </body>
  </html>

..

Now load this page in your webserver. If you do not see any persisted institution, you may need to first visit this `discovery service <https://service.seamlessaccess.org/ds/>`_ to populate the persistence service with some institutions.

