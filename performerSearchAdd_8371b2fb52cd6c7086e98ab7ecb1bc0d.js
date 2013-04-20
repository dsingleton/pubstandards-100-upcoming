YAHOO.namespace("up.performerSearchAdd");
YAHOO.namespace("up.performerAutoComplete");
YAHOO.namespace("up.newPerformerForm");
YAHOO.namespace("up.workarounds");

YAHOO.up.performerSearchAdd = {

    init: function(mode) {
	YAHOO.up.performerAutoComplete.init();
	YAHOO.up.newPerformerForm.init();
    }

}

// form to add a new performer.  can we merge this with newVenueForm?
YAHOO.up.newPerformerForm = {
  init: function() {
    var YDom = YAHOO.util.Dom;
    var newPerformerButton = YDom.get('newPerformerFormButton');
    // IE hack - see newPerformerForm.init for details:
    var modal = (navigator.appName != 'Microsoft Internet Explorer');
    YAHOO.up.newPerformerForm.win = new YAHOO.widget.Panel("performerFormContainer", { width:"50em", x:150, y:50,  close:false, visible:false, draggable:false, modal:modal, iframe:true, fixedcenter:true, constraintoviewport:true, underlay:"shadow", zIndex:10000} );
    YAHOO.up.newPerformerForm.win.showMaskEvent.subscribe(function() {YAHOO.up.newPerformerForm.win.mask.style.zIndex = 9990;});
    YAHOO.up.newPerformerForm.win.render();
    YAHOO.up.performerForm.init('add', YAHOO.up.newPerformerForm.onPerformerSubmitted);
  },

  show: function() {
    var YDom = YAHOO.util.Dom;
    /* Copy whatever's in the performer search field to the new form value. */
    var vSearchInput = YDom.get('performerSearchInput');
    YAHOO.up.performerForm.getForm().value = vSearchInput.value;
    // hack: modality workaround for IE in /event/add/. See init()
    // showing a non-modal window makes the menu "behind" bleed through. So, let's hide it.
    var el = YDom.get('category_id');
    if (el) el.style.visibility = 'hidden';
    // end hack.
    YAHOO.up.newPerformerForm.win.show();
    YDom.get('performerForm.name').focus();
    
    return false;
  },

  close: function() {
    // hack: modality workaround for IE in /event/add/. See init()
    // showing a non-modal window makes the menu "behind" bleed through. So, we show it after we hid it.
    var YDom = YAHOO.util.Dom;
    var el = YDom.get('category_id');
    if (el) el.style.visibility = 'visible';
    // end hack.
    YAHOO.up.newPerformerForm.win.hide();
  },

  submit: function() {
    return YAHOO.up.performerForm.submit();
  },

  // performerForm has taken care of communicating with the
  // database, and is now telling us the results.
  // let's update the interface of the event form
  onPerformerSubmitted: function(data) {
    var YDom = YAHOO.util.Dom;

    // add the new performer into the list of selected performers
    var pac = YAHOO.up.performerAutoComplete;
    if (pac.addPerformer) pac.addPerformer({id: data[1], name: data[0], tiny_image: data[3]});

    YDom.get("performerSearchInput").value = ""; // reset search field
    YDom.get('forcePerformerElement').value = 0; // reset forcePerformerElement

    // Close the performer Form window
    YAHOO.up.newPerformerForm.close();
  }

}

YAHOO.up.performerAutoComplete = {

 init: function(mode) {
    var cls = YAHOO.up.performerAutoComplete;
    var YDom = YAHOO.util.Dom;

    if (!YDom.get('performerSearchInput')) return; // not logged in, probably

    var performerDataSource = new YAHOO.widget.DS_XHR("/ajax/performer_search.php", ["result", "name", "id", "tiny_image"]);
    performerDataSource.responseType = YAHOO.widget.DS_XHR.TYPE_XML;

    cls.addPerformer = null; // callback that gives performer info after one has been selected

    this.widget = new YAHOO.widget.AutoComplete('performerSearchInput', 'performerSearchMatches', performerDataSource, {
      useShadow: true,
      queryDelay: 0.15,
      useIFrame: (navigator.userAgent.match(/msie/gi) ? true : false),
      formatResult: function(aItem, sQuery) {
	var p_name = aItem[0], p_id = aItem[1], p_tiny_image = aItem[2];
	var h = YAHOO.up.workarounds.escapeHTML(p_name);
	if (p_tiny_image) h = '<img width="40" height="40" src="'+YAHOO.up.workarounds.escapeHTML(p_tiny_image)+'"> ' + h;
	return h;
      }
    });

    var iconSpan = YAHOO.util.Dom.get('performer_search_icon');
    this.widget.dataRequestEvent.subscribe(function(sType, aArgs) {
      cls.last_performer_search_name = YDom.get("performerSearchInput").value;
      iconSpan.style.display = 'inline';
    });
    this.widget.dataReturnEvent.subscribe(function(sType, aArgs) {
      iconSpan.style.display = 'none';
    });
    this.widget.itemSelectEvent.subscribe(function(sType, aArgs) {
      var oItem = aArgs[1];
      var item_name = oItem._oResultData[0], item_id = oItem._oResultData[1], item_tiny_image = oItem._oResultData[2];
      if (item_id == "new") {
	YDom.get("performerSearchInput").value = cls.last_performer_search_name; // replace 'none of the above' in performerSearchInput with the original search query, so it'll be properly copied into the new performer form.
	YAHOO.up.newPerformerForm.show();
      } else {
	//alert("item selected: "+aArgs[1]+"; id "+item_id+", name "+item_name);
	if (cls.addPerformer) cls.addPerformer({id: item_id, name: item_name, tiny_image: item_tiny_image});
      }
      document.getElementById("performerSearchInput").value = ""; // reset search field
    });
  }

}; // performerAutoComplete
