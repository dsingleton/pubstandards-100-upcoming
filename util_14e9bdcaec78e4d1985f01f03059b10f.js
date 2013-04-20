YAHOO.namespace("up.workarounds");
YAHOO.namespace("widget.Overlay");
YAHOO.namespace("widget.Panel");
YAHOO.namespace("up.util");

// Leonard's hack to prevent problems with screens vertically
// smaller than an overlay.
YAHOO.widget.Overlay.prototype.center = function() {
  var scrollX = window.scrollX || document.documentElement.scrollLeft;
  var scrollY = window.scrollY || document.documentElement.scrollTop;

  var viewPortWidth = YAHOO.util.Dom.getClientWidth();
  var viewPortHeight = YAHOO.util.Dom.getClientHeight();

  var elementWidth = this.element.offsetWidth;
  var elementHeight = this.element.offsetHeight;

  var x = (viewPortWidth / 2) - (elementWidth / 2) + scrollX;
  var y = (viewPortHeight / 2) - (elementHeight / 2) + scrollY;

  // Leonard's Patch
  if(parseInt(x) < 0) x = 0;
  if(parseInt(y) < 0) y = 0;

  if(this.element.style.left != '0px' || viewPortWidth > elementWidth) {
    this.element.style.left = parseInt(x) + "px";
  }

  if(this.element.style.top != '0px' || viewPortHeight > elementHeight) {
    this.element.style.top = parseInt(y) + "px";
  }

  this.syncPosition();

  this.cfg.refireEvent("iframe");

}


// workaround for Panel bug #893153
// is this relevant any more? supposedly fixed in yui 2.1.1 and we're on
// 2.2.
YAHOO.widget.Panel.prototype.init = function(el, userConfig) {
       YAHOO.widget.Panel.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level

       this.beforeInitEvent.fire(YAHOO.widget.Panel);

       YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Panel.CSS_PANEL);

       this.buildWrapper();              

       if (userConfig) {
              this.cfg.applyConfig(userConfig, true);
       }

       this.beforeRenderEvent.subscribe(function() {
              var draggable = this.cfg.getProperty("draggable");
              if (draggable) {
                     if (! this.header) {
                           this.setHeader("&nbsp;");
                     }
              }
       }, this, true);
 
       var me = this;
 
       this.showMaskEvent.subscribe(function() {
              var checkFocusable = function(el) {
                     if (el.tagName == "A" || el.tagName == "BUTTON" || el.tagName == "SELECT" || el.tagName == "INPUT" || el.tagName == "TEXTAREA" || el.tagName == "FORM") {
                           return true;
                     } else {
                           return false;
                     }
              };
              
              this.focusableElements = YAHOO.util.Dom.getElementsBy(checkFocusable);
       }, this, true);
 
       this.beforeShowEvent.subscribe(function() {
              this.cfg.refireEvent("underlay");
       }, this, true);
 
       this.initEvent.fire(YAHOO.widget.Panel);
};


YAHOO.up.workarounds = {
  createNamedElement: function(type, name) {
    var element = null;
    // Try the IE way; this fails on standards-compliant browsers
    try {
      element = document.createElement('<'+type+' name="'+name+'">');
    } catch (e) {
    }
    if (!element || element.nodeName != type.toUpperCase()) {
      // Non-IE browser; use canonical method to create named element
      element = document.createElement(type);
      element.name = name;
    }
    return element;
  },

  optionAdd: function(selector, option) {
    try {
      selector.add(option, null); // standards compliant; doesn't work in IE
    } catch(ex) {
      selector.add(option); // IE only
    }
  },

  // there must be a library function somewhere to do this, but I can't find it!
  escapeHTML: function(s) {
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
  },

  getTextContent: function(tag) {
    // .text is IE only. .textContext is standards compliant but only in FF.
    // .innerText works only on DOM, not on values received via AJAX.
    // firstChild.nodeValue won't work in ffox because it breaks a long text
    // into multiple nodes. So...
    
    var value = '';
    for (var i = 0; i < tag.childNodes.length; i++) {
      var childNode = tag.childNodes[i];
      if (childNode.nodeValue != null) {
        value += childNode.nodeValue;
      }
    }
    return value;
  }

};

YAHOO.up.util = {
  getQueryParams: function() {
    var fields = location.search.substr(1).split('&');
    var params = new Array();
    for (var i = 0; i < fields.length; i++) {
      var parts = fields[i].split('=');
      params[YAHOO.up.util.URLDecode(parts[0])] = YAHOO.up.util.URLDecode(parts[1]);
    }
    return params;
  },

  URLDecode: function(str) {
    return unescape(str.replace(/\+/g, ' '));
  },

  arrayAsQueryString: function(array) {
    var keyvals = new Array();
    for (var name in array) {
      keyvals.push(escape(name) + '=' + escape(array[name]));
    }
    return keyvals.join('&');
  }
};

/* http://l.yimg.com/a/lib/platforms/vitality/disc/rm/disclosure-1.2.js */
YAHOO.namespace("Updates").Disclosure=function(){var i="/updates-status/";var f=100;var A=function(C,B){var D=document.createElement(C);for(var d in B){if(d=="innerHTML"){D.innerHTML=B[d]}else{if(B[d]&&YAHOO.lang.hasOwnProperty(B,d)){D.setAttribute(d,B[d])}}}return D};var p=function(C,d){var B=document.getElementsByTagName("head")[0];var D=A(C,d);B.appendChild(D);return D};var g=function(d,B){return d.indexOf("http")===0||B===false?p("link",{type:"text/css",charset:"utf-8",rel:"stylesheet",href:d}):p("style",{type:"text/css",innerHTML:d})};var t=function(d,B){return d.indexOf("http")===0||B===false?p("script",{type:"text/javascript",charset:"utf-8",src:d}):p("script",{type:"text/javascript",charset:"utf-8",innerHTML:d})};var v=function(B,d){var C=B.getElementsByTagName(d);if(C.length&&C[0].firstChild){C=C[0].firstChild.nodeValue}else{C=false}return C};var x;var o=function(){return x};var r=function(){if(x){x.destroy();x=null}};var e=function(C,d){var B=YAHOO.util.Dom,D=h();B.setStyle(D,"display","block");B.setStyle(D,"left",d[0]+"px");B.setStyle(D,"top",d[1]+"px");B.setStyle(D,"zIndex",(C.cfg.getProperty("zIndex")+2))};var q=function(U){var V=false,T='<div class="disc-ov-msg">'+U.message+'</div> <div class="disc-ov-mng"><a href="'+U.manageURL+'">'+U.manageTxt+"</a></div>",D=U.syndication,X="",O=false,E="";var M=YAHOO.util.Event,N=YAHOO.util.Dom,C=YAHOO.widget.Overlay,L=[];for(var Q=0,P=D.length,J=0;Q<P;Q++){var W=D[Q],K="ov_disc_bcst_img_"+W.destination;if((W.status==="ENABLED")&&(W.destination!=f||W.constraint!="PRIVATE")){V=true;var B="ov_disc_tooltip_"+K;var d=new C(B,{visible:false,modal:true});d.setBody('<div class="disc-tooltip"><div>'+W.iconTxt+"</div></div>");d.render(document.body);L[J]=d;J++;var S;var F=(function(){var Y=d;var Z=K;return function(){if(S){S.cancel()}for(var ad=0,ab=L.length;ad<ab;ad++){if(typeof(L[ad])!=="undefined"){var af=L[ad];if(Y!=af){af.hide()}}}var ae=N.get(Z),ac=N.getRegion(ae),aa=[(ac.left-20),(ac.bottom+8)];N.setStyle(Y.element,"left",aa[0]+"px");N.setStyle(Y.element,"top",aa[1]+"px");Y.cfg.setProperty("zIndex",(N.getStyle("yup-dialog_c","zIndex")+2));e(Y,[ac.left,ac.bottom]);Y.show()}})();M.addListener(K,"mouseover",F);M.addListener(B,"mouseover",F);var H=(function(){var Y=d;return function(){S=YAHOO.lang.later(1,Y,function(){N.setStyle(h(),"display","none");Y.hide()})}})();M.addListener(K,"mouseout",H);M.addListener(B,"mouseout",H);var R='<img src="'+W.iconURL+'" id="'+K+'" alt="'+W.iconTxt+'" />';X+=R}else{if(W.status==="UNLINKED"){O=true;var I="ov_disc_upsell_link_"+W.destination,R='<div id="'+K+'"> <img src="'+W.iconURL+'" alt="'+W.iconTxt+'" /><a href="#" id="'+I+'">'+W.linkTxt+"</a></div>";E+=R;M.addListener(I,"click",function(){var Y=W.linkURL;return function(Z){u();YAHOO.util.Connect.asyncRequest("POST",i,{success:k,argument:U},"initRestApiUrl="+Y+"&destId="+W.destination+"&lang="+U.lang+"&"+U.crumbName+"="+U.crumb)}}())}}}var G="";if(V){var R='<div class="ebcstrs_c">'+T+'<div class="ebcstrs">'+X+"</div> </div>";G+=R}if(O){var R='<div class="unbcstrs_c">'+E+"</div>";G+=R}return G};var y=function(B){if(!YAHOO.lang.isObject(B)||!B.source||!B.container||(!B.response&&!B.type)){return false}var F=function(L){r();if(!L&&B.response){var N=B.response}else{var N=YAHOO.lang.JSON.parse(L.responseText)}var M=N.disclosure||false;if(!YAHOO.lang.isString(M)||(M.toLowerCase()!="show"&&M.toLowerCase()!="showchecked")){return 0}if(N.global_optout=="1"){return}var G=N.syndication,I=false,T;for(var O=0,K=G.length;O<K;O++){T=G[O];if((T.status==="ENABLED")&&(T.destination!=f||T.constraint!="PRIVATE")){I=true}}if(!I){return}if(N.style){g(N.style)}var J=YAHOO.util.Dom;J.addClass(document.body,"yui-skin-sam");var H=function(){this.submit()};x=new YAHOO.widget.SimpleDialog("yup-dialog",{width:"400px",underlay:"shadow",modal:true,fixedcenter:true,close:true,postmethod:"async",visible:false,draggable:false,monitorresize:false,constraintoviewport:true,zIndex:2000000001,buttons:[{text:N.button,handler:H,isDefault:false}]});if(B.events){for(var R in B.events){if(x[R]&&x[R].subscribe){var S=B.events[R];x[R].subscribe(S.fn,S.obj||x,S.scope)}}}x.setHeader(N.loc_localizedName);var P="";var V='<div class="result">'+N.result+"</div>";P+=V;P+=q(N);x.setBody(P);x.render(B.container);var Q=A("form",{id:"yup-show",action:i,method:"POST"});var U=(M.toLowerCase()=="showchecked")?'"checked=checked"':"";Q.innerHTML=['<input type="checkbox" id="yup_ov_disc_option" '+U,' name="yup_ov_disc_option" >','<label for="yup_ov_disc_option">'+N.prompt+"</label>",'<input type="hidden" name="source" value="'+B.source+'">','<input type="hidden" name="'+N.crumb_name+'" value="'+N.crumb+'">','<input type="hidden" name="ov_disc_form" value="submitForm">'].join("");x.appendToBody(Q);x.form.parentNode.replaceChild(Q,x.form);x.form=Q;if(M.toLowerCase()=="showchecked"){document.getElementById("yup_ov_disc_option").checked=true}x.show();if(N.script){t(N.script)}};var E=function(){YAHOO.util.Connect.asyncRequest("POST",i,{success:F},"source="+B.source+"&type="+B.type+"&lang="+(B.lang||"en-US")+"&get_disc=true&format=xml")};var D=B.yuiBasePath||"yui/2.6.0/build/",d="http://l.yimg.com/d/combo?";var C=function(G){var I=YAHOO.env.modules.connection?true:false,K=YAHOO.env.modules.json?true:false,J=YAHOO.env.modules.container?true:false;if(I&&J){if(B.response){F()}else{E()}}else{if(!G){if(!J){g(d+D+"container/assets/skins/sam/container.css")}var H="";H+=K?"":(H?"&":"")+D+"json/json-min.js";H+=I?"":(H?"&":"")+D+"connection/connection-min.js";H+=J?"":(H?"&":"")+D+"container/container-min.js";t(d+H)}setTimeout(function(){C(true)},100)}};if(typeof B.resolveDependencies==="undefined"||B.resolveDependencies){C()}};var l,n={"450":"http://l.yimg.com/kx/ds/html/error_450.html","424":"http://l.yimg.com/kx/ds/html/error_424.html"};var u=function(){l=window.open("","disclosures_auth_flow","modal=yes,width=804,height=507")};var w=function(B,E){var D=YAHOO.lang.JSON.parse(B.responseText),d=B.argument;if(D.errorCode){if(n[D.errorCode]){l.location=n[D.errorCode]+"?lang="+d.lang}else{l.location=n["424"]+"?lang="+d.lang}}else{if(D.results&&D.results.authorizeURL){var G=D.results.authorizeURL;l.location=G;var C=500;var F=YAHOO.lang.later(C,null,function(){if(l.closed){F.cancel();YAHOO.lang.later(250,this,a.updateAllInstances);a.executePostLinkCallbacks()}},null,true)}else{l.location=n["424"]+"?lang="+d.lang}}l.focus()};var k=function(d){w(d,true)};var h=function(){return YAHOO.util.Dom.getElementsByClassName("disc-tooltip-knob","div")[0]};var j=function(G,H){var C=YAHOO.util.Event,D=YAHOO.util.Dom,d=YAHOO.widget.Overlay,E=YAHOO.util.connect,J=G.inlinePermInfo;var I=new d(J.ovlyId,{context:[G.imageId,"tl","bl"]});I.render(J.conId);var F=function(K){D.removeClass(J.ovlyId,"disc-hide");I.show();I.align("tl","bl");C.addListener(document,"click",B);C.stopEvent(K)};var B=function(){I.hide();C.removeListener(document,"click",B)};C.addListener(J.actId,"click",F);C.addListener(J.evId,"click",function(){YAHOO.util.Connect.asyncRequest("POST",i,{success:function(){D.addClass(J.evId,"selected");D.removeClass(J.connId,"selected");B();D.get(G.inputId).checked=true;a.syncOtherInstances(H.id)}},"source="+H.source+"&type="+H.type+"&mod_synd_cons=PUB&dest=100&"+H.crumbName+"="+H.crumb)});C.addListener(J.connId,"click",function(){YAHOO.util.Connect.asyncRequest("POST",i,{success:function(){D.addClass(J.connId,"selected");D.removeClass(J.evId,"selected");B();D.get(G.inputId).checked=true;a.syncOtherInstances(H.id)}},"source="+H.source+"&type="+H.type+"&mod_synd_cons=CXN&dest=100&"+H.crumbName+"="+H.crumb)})};var s=function(D){var I=D,E=YAHOO.util.Event,F=YAHOO.util.Dom,C=YAHOO.widget.Overlay,K=I.destinations,O=[];for(var H=0,G=K.length;H<G;H++){var L=K[H];var B="disc_tooltip_"+L.imageId,J=new C(B,{visible:false});J.setBody('<div class="disc-tooltip"><div>'+L.ttTxt+"</div></div>");J.render(document.body);O[H]=J;var N;var P=(function(){var d=J;var Q=L.imageId;return function(){if(N){N.cancel()}for(var U=0,S=O.length;U<S;U++){var W=O[U];if(d!=W){W.hide()}}var V=F.get(Q),T=F.getRegion(V),R=[(T.left-20),(T.bottom+8)];F.setStyle(d.element,"left",R[0]+"px");F.setStyle(d.element,"top",R[1]+"px");e(d,[T.left,T.bottom]);d.show()}})();E.addListener(L.imageId,"mouseover",P);E.addListener(B,"mouseover",P);var M=(function(){var d=J;return function(){N=YAHOO.lang.later(1,d,function(){F.setStyle(h(),"display","none");d.hide()})}})();E.addListener(L.imageId,"mouseout",M);E.addListener(B,"mouseout",M);if(L.state==="ENABLED"||L.state==="DISABLED"){E.addListener(L.inputId,"click",function(){var d=L;return function(V){var S=function(){a.syncOtherInstances(I.id)};if(d.dest==f){var T=this,U=T.checked?"PUB":"PRIVATE",R=d.inlinePermInfo;S=function(){if(T.checked){F.addClass(R.evId,"selected");F.removeClass(R.connId,"selected")}else{F.removeClass(R.evId,"selected");F.removeClass(R.connId,"selected")}a.syncOtherInstances(I.id)};YAHOO.util.Connect.asyncRequest("POST",i,{success:S},"source="+I.source+"&type="+I.type+"&mod_synd_cons="+U+"&dest="+d.dest+"&"+I.crumbName+"="+I.crumb)}else{var Q=this.checked?"ENABLED":"DISABLED";YAHOO.util.Connect.asyncRequest("POST",i,{success:S},"source="+I.source+"&type="+I.type+"&mod_synd_stat="+Q+"&dest="+d.dest+"&"+I.crumbName+"="+I.crumb)}}}())}if(L.state==="UNLINKED"){E.addListener(L.upsellLinkId,"click",function(){var d=L.initEndPoint;var Q=L.dest;return function(R){u();YAHOO.util.Connect.asyncRequest("POST",i,{success:w,argument:I},"initRestApiUrl="+d+"&"+I.crumbName+"="+I.crumb+"&destId="+Q+"&lang="+I.lang)}}());E.addListener(L.upsellLinkId,"mouseover",P);E.addListener(L.upsellLinkId,"mouseout",M)}if(L.dest==f){j(L,I)}}};var z=false,b=false;var c=function(d){var E=YAHOO.env.modules.connection?true:false,G=YAHOO.env.modules.json?true:false,F=YAHOO.env.modules.container?true:false;if(E&&G&&F){d()}else{if(!z){var C="yui/2.6.0/build/",B="http://l.yimg.com/d/combo?";if(!F){g(B+C+"container/assets/skins/sam/container.css")}var D="";D+=E?"":(D?"&":"")+C+"connection/connection-min.js";D+=G?"":(D?"&":"")+C+"json/json-min.js";D+=F?"":(D?"&":"")+C+"container/container-min.js";t(B+D);z=true}setTimeout(function(){c.call(null,d)},100)}};var m=function(){if(!YAHOO.Updates||!YAHOO.Updates.DiscConfig){return}c(function(){YAHOO.util.Dom.addClass(document.body,"yui-skin-sam");var B=YAHOO.Updates.DiscConfig;for(var C in B){if(YAHOO.lang.hasOwnProperty(B,C)){var d=YAHOO.Updates.DiscConfig[C];a.initRenderedInstance(d)}}})};YAHOO.util.Event.addListener(window,"load",m);var a=function(){var d=[];var C=[];var G=function(J){C[C.length]=J};var H=function(){var L,K,J;for(L=0,K=C.length;L<K;L++){J=C[L];if(typeof(J.fn)=="function"){J.fn.call(J.scope,J.obj)}}};var E=function(J){c(function(){var K=YAHOO.lang.JSON.parse(J);d[d.length]=K;s(K)})};var B=function(){};var I=function(K){var J=function(N){var P=YAHOO.lang.JSON.parse(N.responseText),M=YAHOO.util.Dom,Q=M.get(K.containerId),L=YAHOO.lang.JSON.parse(P.js_config);var O=M.getAncestorByTagName(Q,"div");O.innerHTML=P.html;s(L)};YAHOO.util.Connect.asyncRequest("POST",i,{success:J},"fetchInlineMarkupAndConfig=true&source="+K.source+"&type="+K.type+"&lang="+K.lang+"&id="+K.id+"&"+K.crumbName+"="+K.crumb)};var F=function(){for(var K=0,J=d.length;K<J;K++){I(d[K])}};var D=function(M){for(var K=0,J=d.length;K<J;K++){var L=d[K];if(L.id!=M){I(L)}}};return{initRenderedInstance:E,syncOtherInstances:D,updateAllInstances:F,addInstance:B,registerPostLinkCallback:G,executePostLinkCallbacks:H}}();return{manager:a,showDialog:y,getDialog:o,destroyDialog:r,getXmlNodeValue:v,createNode:A,addCss:g,addJs:t,version:1}}();