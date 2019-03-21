import {DiscoveryService} from "./discovery"
import {PersistenceService} from "./persist"

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
   let ds = new DiscoveryService("https://md.thiss.io/entities/","https://use.thiss.io/ps/","test")
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
