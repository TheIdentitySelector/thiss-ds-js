Example: Retrieval of entities using the PersistenceService API
================================================================

To illustrate how to use the PersistenceService API we will create and walk through a tiny persistence service call. This represents the smallest (and arguably least practically useful) implementation to update and store a new entity to the persistence service. While not useful as such it can serve as a starting point for further work. This example can be found as update-persistenceService.html in the thiss-ds-js distribution.

Start by creating an empty directory on a webserver and create in it an index.html with the following simple markup:

.. code-block:: html
  :linenos:

  <!DOCTYPE html>
  
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=10,11" />
    <script src="/js/jquery-3.1.1.min.js"></script>
    <title>SeamlessAccess.org - Upload entity to the PersistenceService</title>
    
  </head> 
  <body>
  <h1>SeamlessAccess.org - Upload entity to the PersistenceService</h1>
  <script src="//unpkg.com/@theidentityselector/thiss-ds"></script>
  <script type="text/javascript">
  $(function() {
        
    $('#myform').submit(function(event) {
        event.preventDefault(); // prevents the form to submit
    
        var formElements = $(this); // get all form elements
        var entitydata = $('textarea#entitydata', formElements); // content of the textarea
  
        $.ajax({
          type: 'POST',
          url: formElements.prop('action'),
          accept: {
            javascript: 'application/javascript'
          },
          data: formElements.serialize()
  
      }).done(function(data) {
  
        // retrieves the data from the textarea for submission to the persistence Service
        console.log(entitydata.val());
        
        // defines the context (i.e. key that will be used to store the data)
        // thiss.io is the default context, the same is used when the context is not provided
        var my_context = 'thiss.io'; // change this context value to persist entities in your own context (i.e. key).
       
        var ps = new thiss.PersistenceService('https://service.seamlessaccess.org/ps/'); // prod url
        //var ps = new thiss.PersistenceService('https://use.thiss.io/ps/'); // beta testing URL
  
        var jsonformObj = JSON.parse(entitydata.val());
  
        ps.update(my_context,jsonformObj)
          .then(function(res) {
              // Process the results
              var myObjects = res.data;
              for (i in myObjects) {
                obj = myObjects[i];
                console.log(obj);
              };
           }, function(err) {
              // failed
              console.log('failed ------------------------' + err);
  
           });
        
      });
    });
  
  });
  
  </script>
  
  <form action="" id="myform">
  Populate the text area with the entityID you want to preserve.<br/>
  e.g.
  
    <textarea id="entitydata" rows="20" cols="70" name="inputArea">
  {
        "title": "Lancaster University",
        "descr": "http://www.lancaster.ac.uk/",
        "auth": "saml",
        "entityID": "https://idp.lancs.ac.uk/idp/shibboleth",
        "type": "idp",
        "hidden": "false",
        "scope": "lancaster.ac.uk",
        "domain": "lancaster.ac.uk",
        "name_tag": "LANCASTER",
        "entity_icon_url": {
          "url": "https://idp.lancs.ac.uk/logo-small.png",
          "width": "157",
          "height": "54"
        }
  }
  </textarea>
  <input id="formbutton" type="submit" value="Submit">
  </form>
  
  
  <br>
  <p>Then check the discovery service at <a href="https://service.seamlessaccess.org/ds/" target="_blank">https://service.seamlessaccess.org/ds/</a></p>
  </body>
  </html>

..

Now load this page in your webserver. The institution will be persisted in the `discovery service <https://service.seamlessaccess.org/ds/>`_.

