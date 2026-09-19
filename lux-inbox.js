/*lux-inbox -- floating messages bubble + unread badge for buyers (shows only if they have an order).*/
(function(){try{
  var oid="";try{oid=(localStorage.getItem("luxu_order")||"").replace(/[^a-z0-9_-]/gi,"");}catch(e){}
  if(!oid)return;
  var API="https://ai.luxucleen.com/ask";
  function draw(n){
    if(document.getElementById("luxInboxBubble"))return;
    var a=document.createElement("a");a.id="luxInboxBubble";
    a.href="/messages/?o="+encodeURIComponent(oid);
    a.setAttribute("aria-label","Your messages"+(n?(" ("+n+" new)"):""));
    a.style.cssText="position:fixed;left:14px;bottom:82px;z-index:2147483000;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#7c5cff,#2ea27e);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(124,92,255,.45);text-decoration:none";
    a.innerHTML='<svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></svg>'+(n?('<span style="position:absolute;top:-3px;right:-3px;min-width:20px;height:20px;padding:0 5px;box-sizing:border-box;border-radius:10px;background:#ef4444;color:#fff;font:800 12px/20px system-ui,Arial;text-align:center">'+(n>9?"9+":n)+'</span>'):"");
    document.body.appendChild(a);
  }
  fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"feed",op:"inbox_unread",orderid:oid})})
    .then(function(r){return r.json();}).then(function(d){draw((d&&d.unread)|0);}).catch(function(){draw(0);});
}catch(e){}})();
