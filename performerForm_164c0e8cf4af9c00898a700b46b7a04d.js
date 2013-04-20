YAHOO.namespace("up.performerDupeForm");
YAHOO.namespace("up.performerForm");

YAHOO.up.performerForm = {
  init: function(mode, onPerformerSubmitted) {
    YAHOO.up.performerForm.mode = mode;
    YAHOO.up.performerForm.onPerformerSubmitted = onPerformerSubmitted;
    YAHOO.up.performerDupeForm.init();
  },

  getForm: function() {
    var YDom = YAHOO.util.Dom;
  	return YDom.get('performerForm.name');
  },

  setFormBusy: function(busy) {
    YAHOO.up.performerForm.setBusy(busy, 'performerFormProgressArea');
  },

  setLocaleBusy: function(busy) {
    YAHOO.up.performerForm.setBusy(busy, 'localeProgressArea');
  },
  
  setBusy: function(busy, elementId) {
    var YDom = YAHOO.util.Dom;
    var statusImgDiv = YDom.get(elementId);
    var submitButton = YDom.get('performer_submit');
    if (busy) {
      // Start busy animation
      statusImgDiv.style.visibility = 'visible';
      // disable submit button
      submitButton.setAttribute('disabled', 'disabled');
    } else {
      // Conclude busy animation 
      statusImgDiv.style.visibility = 'hidden';
      // Re-enable submit
      submitButton.removeAttribute('disabled');
    }
  },

  AjaxPerformerHandler: {
    success: function(o) {
      var YDom = YAHOO.util.Dom;
      var resultPerformer = o.responseXML.getElementsByTagName('performer')[0];

      // Pull out name/id/url to go in the chosen performer list
      var data = [];
      resultFields = ['name', 'id', 'url', 'tiny_image'];
      for (i = 0; i < resultFields.length; i++) {
        tagName = resultFields[i];
        resultData = resultPerformer.getElementsByTagName(tagName)[0].firstChild;
        if (resultData) {
          resultValue = resultData.nodeValue;
          resultValue.replace(/^\s+|\s+$/g,""); // trim whitespace
          if (resultValue.length > 0) {
            data[i] = resultValue;
          }
        }
      }

      YAHOO.up.performerForm.setFormBusy(false);
      YAHOO.up.performerForm.onPerformerSubmitted(data);
      return true;
    },

    failure: function(o) {
      YAHOO.up.performerForm.setFormBusy(false);
      var YDom = YAHOO.util.Dom;
      // Remove existing error messages
      var performerFormErrorDiv = YDom.get('performerFormErrorDiv');
      while (performerFormErrorDiv.firstChild) { 
        performerFormErrorDiv.removeChild(performerFormErrorDiv.firstChild);
      }

      // Write any error messages to the form
      if (!performerFormErrorDiv) {
        return false;
      }
      // Detect type of error.
      var errors = o.responseXML.getElementsByTagName('error');
      var duplicates = o.responseXML.getElementsByTagName('duplicate');
      if (errors.length > 0) {
        var errorStr = "Please correct these errors:";
        performerFormErrorDiv.appendChild(document.createTextNode(errorStr));
        var ErrorList = document.createElement('ul');
        for (var i=0, j=errors.length;i<j;i++) {
          if (errors[i].firstChild) {
            var error = document.createElement('li');
            error.appendChild(document.createTextNode(errors[i].firstChild.nodeValue));
            ErrorList.appendChild(error);
          }
        }
        performerFormErrorDiv.appendChild(ErrorList);
        performerFormErrorDiv.style.visibility = 'inherit';
      }
      if (duplicates.length > 0) {
        var dupeStr = "Oops, we might have this already:";
        performerDupCheckTable = YDom.get('performer_dupe_check_table');
        performerDupCheck_UseMineRow = YDom.get('use_my_performer_tr');
        if (!performerDupCheckTable) {
          alert("No dup check table");
        }
        if (!performerDupCheck_UseMineRow) {
          alert("No row");
        }
        for (var i=0,j=duplicates.length;i<j;i++) {
          var dupe_row = document.createElement('tr');
          var dupe_input_cell = document.createElement('td');
          var dupe_display_cell = document.createElement('td');
          var dupe_id = duplicates[i].getElementsByTagName('id')[0].firstChild.nodeValue
          // HACK: Keep the input boxes have the same id, which will cause IE
          // to give them all the name equal to the ID. 
          var dupe_input_box = YAHOO.up.workarounds.createNamedElement('input', 'use_performer');
          dupe_input_box.type = 'radio';
          dupe_input_box.id = 'use_performer_' + dupe_id;
          dupe_input_box.value = duplicates[i].getElementsByTagName('id')[0].firstChild.nodeValue;
          var dupe_link = document.createElement('a');
	  dupe_link.target = '_blank';
          dupe_link.href = '/performer/'+dupe_id;
	  var url_node = duplicates[i].getElementsByTagName('url')[0].firstChild;
          var dupe_string = duplicates[i].getElementsByTagName('name')[0].firstChild.nodeValue;
	  if (url_node) dupe_string += ': ' + url_node.nodeValue;
	  var dupe_image_url_node = duplicates[i].getElementsByTagName('tiny_image')[0].firstChild;
          var dupe_display_name = document.createTextNode(dupe_string);
          dupe_link.appendChild(dupe_display_name);
          var dupe_display_label = document.createElement('label');
          dupe_display_label.setAttribute('for', 'use_performer_' + dupe_id);
          dupe_display_label.appendChild(dupe_link);
	  if (dupe_image_url_node) {
	    var dupe_image_url = dupe_image_url_node.nodeValue;
	    dupe_display_label.appendChild(document.createTextNode(" "));
	    var dupe_img = document.createElement('img');
	    dupe_img.src = dupe_image_url;
	    dupe_img.width = dupe_img.height = 40;
	    dupe_img.align = 'absmiddle';
	    dupe_display_label.appendChild(dupe_img);
	  }
          dupe_display_cell.appendChild(dupe_display_label);
          dupe_input_cell.appendChild(dupe_input_box);
          dupe_row.className = 'dupe_row';
          dupe_row.appendChild(dupe_input_cell);
          dupe_row.appendChild(dupe_display_cell);
          performerDupCheck_UseMineRow.parentNode.insertBefore(dupe_row, performerDupCheck_UseMineRow);
        }
        YAHOO.up.performerDupeForm.dlg.show();
      }
      // Return to the top of the page.
      scrollTo(0,0);
      // Keep window open

      return true;
    }

  },

  submit: function() {
    var YDom = YAHOO.util.Dom;

    // basic url validation
    var url_elem = YDom.get('performerForm.url'),
      url = url_elem.value;
    if (url && url != '') {
      if (!/^http:\/\//.test(url)) {
	alert("Invalid URL: must start with 'http://'!");
	url_elem.focus();
	url_elem.select();
	return false;
      }
    }

    // now post the form
    var sUrl = '/ajax/performer.php';
    var encData = YAHOO.util.Connect.setForm('performerForm');
    var transaction = YAHOO.util.Connect.asyncRequest('POST', sUrl, YAHOO.up.performerForm.AjaxPerformerHandler);
    YAHOO.up.performerForm.setFormBusy(true);
    return false;
  }

};


YAHOO.up.performerDupeForm = {
  init: function() {
    YAHOO.up.performerDupeForm.dlg = new YAHOO.widget.Dialog(
      'performerDupeCheckContainer', { width:"30em", x:200, y:100, visible:false,  zIndex: 20000, modal:true, fixedcenter: true}); 
    var myButtons = [{ text:"Submit", handler:YAHOO.up.performerDupeForm.Handler.handleDupeSubmit, isDefault:true }, {text:"Cancel", handler:YAHOO.up.performerDupeForm.Handler.handleDupeCancel}];
    YAHOO.up.performerDupeForm.dlg.cfg.queueProperty("buttons", myButtons);
    YAHOO.up.performerDupeForm.dlg.cfg.queueProperty("postmethod", 'async');
    YAHOO.up.performerDupeForm.dlg.showMaskEvent.subscribe(function() {YAHOO.up.performerDupeForm.dlg.mask.style.zIndex = 19000;});
    YAHOO.up.performerDupeForm.dlg.callback.success = YAHOO.up.performerDupeForm.Handler.commitResult;
    YAHOO.up.performerDupeForm.dlg.render(document.body);
    return true;
  },

  Handler: {
    handleDupeCancel: function() {
      YAHOO.up.performerDupeForm.Handler.resetForm();
      this.cancel();
    },
    handleDupeSubmit: function() {
      var YDom = YAHOO.util.Dom;
      // If the selected element is 'use_mine', then we close this one and
      // submit the previous form.
      if (YDom.get('use_my_performer').checked) {
        var forceElement = YDom.get('forcePerformerElement');
        forceElement.value = 1;
        this.hide();
        YAHOO.up.performerForm.submit();
      } else {
        // Accept the selected performer.
	YAHOO.up.performerForm.setFormBusy(true);
        YAHOO.up.performerDupeForm.dlg.submit();
      }
        YAHOO.up.performerDupeForm.Handler.resetForm();
    },
    commitResult: function(o) {
      // Submit the calling form with the substitute object we
      // receive as the callback of a performer object that looks the
      // same as a new object received from the original form.
      YAHOO.up.performerForm.AjaxPerformerHandler.success(o);
      YAHOO.up.performerDupeForm.dlg.hide();
    },
    resetForm: function() {
      var YDom = YAHOO.util.Dom;
      var performerDupCheckTable = YDom.get('performer_dupe_check_table');
      var dupRows = YDom.getElementsByClassName('dupe_row', 'tr', performerDupCheckTable);
      // Wipe out old dupes.
      for(var i=0,j=dupRows.length;i<j;i++) {
        while (dupRows[i].firstChild) {
          dupRows[i].removeChild(dupRows[i].firstChild);
        }
        dupRows[i].parentNode.removeChild(dupRows[i]);
      }
      YDom.get('use_my_performer').checked = 'checked';
    }
  }
};


