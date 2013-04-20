YAHOO.namespace('up.eventpage');
YAHOO.namespace('up.eventpage.tagHandler');
YAHOO.namespace('up.eventpage.groupHandler');
YAHOO.namespace('up.eventpage.performerHandler');

YAHOO.up.eventpage = {
        exportWidget: null,
	reminderWidget: null,
        photoLinkHtml: null,
	init: function() {
		var YEvent = YAHOO.util.Event;
		var YDom = YAHOO.util.Dom;
		var add_tag = YDom.get('add_tag_link');
		YEvent.addListener(add_tag, 'click', YAHOO.up.eventpage.replaceTagLink);
		var send_to_group = YDom.get('send_to_group_link');
		YEvent.addListener(send_to_group, 'click', YAHOO.up.eventpage.replaceGroupLink);
		var add_performer = YDom.get('add_performer_link');
		YEvent.addListener(add_performer, 'click', YAHOO.up.eventpage.replacePerformerLink);
		YAHOO.up.performerSearchAdd.init();
		YAHOO.up.performerAutoComplete.addPerformer = YAHOO.up.eventpage.addPerformer;
		var send_attendee_note = YDom.get('send_attendee_note_link');
		YEvent.addListener(send_attendee_note, 'click', YAHOO.up.eventpage.replaceAttendeeLink);
		var exportButtonContainer = YDom.get('export_button_container');

    YAHOO.up.eventpage.eventId = YDom.get('hidden_event_id').innerHTML;
		YAHOO.up.eventpage.exportWidget = new YAHOO.widget.Overlay('export_container', {visible: false, effect:{effect:YAHOO.widget.ContainerEffect.FADE, duration:0.25}});
		YAHOO.up.eventpage.exportWidget.cfg.setProperty("context", ["export_button_container", "tr", "br"]);
		YAHOO.up.eventpage.exportWidget.cfg.setProperty("zIndex", 96);
		YEvent.addListener('export_link', 'click', YAHOO.up.eventpage.toggleExportPanel);
		YEvent.addListener('export_close_link', 'click', YAHOO.up.eventpage.closeExportPanel);

		YAHOO.up.eventpage.reminderWidget = new YAHOO.widget.Overlay('reminder_container', {visible: false, effect:{effect:YAHOO.widget.ContainerEffect.FADE, duration:0.25}});
		YAHOO.up.eventpage.reminderWidget.cfg.setProperty("context", ["reminder_button_container", "tl", "bl"]);
		YAHOO.up.eventpage.reminderWidget.cfg.setProperty("zIndex", 97);
		YEvent.addListener('reminder_link', 'click', YAHOO.up.eventpage.toggleReminderPanel);
		YEvent.addListener('reminder_close_link', 'click', YAHOO.up.eventpage.closeReminderPanel);

		YAHOO.up.eventpage.photoWidget = new YAHOO.widget.Overlay('add_photo_container', {visible: false, effect:{effect:YAHOO.widget.ContainerEffect.FADE, duration:0.25}});
		YAHOO.up.eventpage.photoWidget.cfg.setProperty("context", ["add_photo_button_container", "tl", "bl"]);
		YAHOO.up.eventpage.photoWidget.cfg.setProperty("zIndex", 11);
		YEvent.addListener('add_photo_link', 'click', YAHOO.up.eventpage.togglePhotoPanel);
		YEvent.addListener('add_official_photo_link', 'click', YAHOO.up.eventpage.showOfficialPhotoPanel);
		YEvent.addListener('add_photo_close_link', 'click', YAHOO.up.eventpage.closePhotoPanel);
		YEvent.addListener('add_photo_link2', 'click', YAHOO.up.eventpage.togglePhotoPanel);

    var link_array = YDom.getElementsBy(function(el) { return (el.id == 'add_photo_link' || el.id == 'add_photo_link2'); });
    if (link_array.length > 0) {
      YAHOO.up.eventpage.photoLinkHtml = link_array[link_array.length - 1];
    }

    YEvent.addListener(window, 'resize', YAHOO.up.eventpage.positionPanels);
 
    YAHOO.up.eventpage.initAttendeeToggler();
  },

  positionPanels: function(e) {
    var YDom = YAHOO.util.Dom;
    var panel = YDom.get('add_photo_container');
    if (panel && panel.style.visibility == 'visible') {
      var region = YDom.getRegion(YAHOO.up.eventpage.photoLinkHtml);
      YDom.setXY(panel, Array(region.left, region.bottom));
    }
  },

  initAttendeeToggler: function() {
    var YEvent = YAHOO.util.Event;
    var YDom = YAHOO.util.Dom;
    var placeholderDiv = YDom.get('placeholder_attendees');
    if (!placeholderDiv) { 
      YAHOO.up.eventpage.watchlistExpanded = false;
      return;
    }
    // Update "Show all" button to include proper link.
    YEvent.addListener('hide_attendees', 'click', function(e) { 
		    YAHOO.util.Event.stopEvent(e);
        YAHOO.up.eventpage.hideAllAttendees();
      });
    YEvent.addListener('expand_attendees', 'click', function(e) { 
		    YAHOO.util.Event.stopEvent(e);
        YAHOO.up.eventpage.fetchOrExpandAllAttendees(); 
      });
    placeholderDiv.style.display = 'none';
    YAHOO.up.eventpage.hideableAttendeeDiv = YDom.getElementsByClassName('hideable', 'div', 'userlistAttend')[0];
    YAHOO.up.eventpage.hideableWatcherDiv = YDom.getElementsByClassName('hideable', 'div', 'userlistWatch')[0];
    if (YAHOO.up.eventpage.hideableWatchlistDivsPopulated()) {
      YAHOO.up.eventpage.expandAllAttendees();
    } else {
      YAHOO.up.eventpage.hideAllAttendees();
    }
  },

  hideableWatchlistDivsPopulated: function() {
    return (YAHOO.up.eventpage.hideableAttendeeDiv.innerHTML != ''
            || YAHOO.up.eventpage.hideableWatcherDiv.innerHTML != '')
  },

  fetchOrExpandAllAttendees: function() {
    if (YAHOO.up.eventpage.hideableWatchlistDivsPopulated()) {
      YAHOO.up.eventpage.expandAllAttendees();
    } else {
      YAHOO.util.Dom.get('userlistExpandBusy').style.visibility = 'visible';
      var transaction = YAHOO.util.Connect.asyncRequest(
        'GET', 
        '/ajax/event_page_all_attendees.php?event_id=' + YAHOO.up.eventpage.eventId,
        YAHOO.up.eventpage.ajaxWatchlistExpandHandler);
    }
  },

  expandAllAttendees: function() {
		var YDom = YAHOO.util.Dom;
    YDom.get('hide_attendees').style.display = 'block';
    YDom.get('expand_attendees').style.display = 'none';
                
    YDom.setStyle('userlistContents', 'display', 'block');
                
    YAHOO.up.eventpage.hideableAttendeeDiv.style.display = 'block';
    YAHOO.up.eventpage.hideableWatcherDiv.style.display = 'block';
    YAHOO.up.eventpage.watchlistExpanded = true;
  },

  hideAllAttendees: function(e) {
		var YDom = YAHOO.util.Dom;
    YDom.get('hide_attendees').style.display = 'none';

    YDom.setStyle('userlistContents', 'display', 'none');
       
    YDom.get('expand_attendees').style.display = 'block';
    YAHOO.up.eventpage.hideableAttendeeDiv.style.display = 'none';
    YAHOO.up.eventpage.hideableWatcherDiv.style.display = 'none';
    YAHOO.up.eventpage.watchlistExpanded = false;
  },

	toggleExportPanel: function(e) {
		var YDom = YAHOO.util.Dom;
		var YEvent = YAHOO.util.Event;
		YEvent.stopEvent(e);
		var panel = YDom.get('export_container');
		if (panel.style.visibility == 'visible') {
			YAHOO.up.eventpage.exportWidget.hide();
		} else {
			if ( parseInt(panel.style.left) < 0 ) { 
				YAHOO.up.eventpage.exportWidget.cfg.setProperty('x', 10); 
			}
			YAHOO.up.eventpage.exportWidget.show();
		}
	},
	closeExportPanel: function(e) {
		var YDom = YAHOO.util.Dom;
		var YEvent = YAHOO.util.Event;
		YEvent.stopEvent(e);
		YAHOO.up.eventpage.exportWidget.hide();
	},
	toggleReminderPanel: function(e) {
		var YDom = YAHOO.util.Dom;
		var YEvent = YAHOO.util.Event;
		YEvent.stopEvent(e);
		var panel = YDom.get('reminder_container');
		if (panel.style.visibility == 'visible') {
			YAHOO.up.eventpage.reminderWidget.hide();
		} else {
			YAHOO.up.eventpage.reminderWidget.show();
		}
	},
	closeReminderPanel: function(e) {
		var YDom = YAHOO.util.Dom;
		var YEvent = YAHOO.util.Event;
		YEvent.stopEvent(e);
		YAHOO.up.eventpage.reminderWidget.hide();
	},
  showOfficialPhotoPanel: function(e) {
      YAHOO.up.eventpage.togglePhotoPanel(e);
		YAHOO.util.Dom.get('add_photo_official').checked = 'ckecked';
  },
	togglePhotoPanel: function(e) {
		var YDom = YAHOO.util.Dom;
		var YEvent = YAHOO.util.Event;
		YEvent.stopEvent(e);
		var panel = YDom.get('add_photo_container');
                var region = YDom.getRegion(YAHOO.up.eventpage.photoLinkHtml);
                YDom.setXY(panel, Array(region.left, region.bottom));
                if (panel.style.visibility == 'visible') {
			YAHOO.up.eventpage.photoWidget.hide();
		} else {
			YAHOO.up.eventpage.photoWidget.show();
		}

	},
	closePhotoPanel: function(e) {
		var YDom = YAHOO.util.Dom;
		var YEvent = YAHOO.util.Event;
		YEvent.stopEvent(e);
		YAHOO.up.eventpage.photoWidget.hide();
	},
	replaceTagLink: function(e) {
		var YEvent = YAHOO.util.Event;
		YEvent.stopEvent(e);
		var YDom = YAHOO.util.Dom;
		var add_tag_form = YDom.get('add_tag_form');
		add_tag_form.style.display = 'block';
		var add_tag_link = YDom.get('add_tag_link');
		add_tag_link.style.display = 'none';
		YEvent.addListener(YDom.get('add_tag_form'), 'submit', YAHOO.up.eventpage.submitTagForm);
	},
	submitTagForm: function(e) {
		var YEvent = YAHOO.util.Event;
		var YDom = YAHOO.util.Dom;
		var YConnect = YAHOO.util.Connect;
		YEvent.stopEvent(e);
		YConnect.setForm(YAHOO.util.Dom.get('add_tag_form'));

		var tag_field = YDom.get('add_tag_field');
		var tag_submit = YDom.get('add_tag_submit');
		if (!(tag_field.value == '') && !tag_submit.disabled) {
			var statusImgDiv = YDom.get('add_tag_status_img');
			statusImgDiv.style.display = 'inline';
			var transaction = YAHOO.util.Connect.asyncRequest('POST', '/ajax/add_event_tag.php', YAHOO.up.eventpage.tagHandler);
			tag_field.setAttribute('disabled','disabled');
			tag_submit.setAttribute('disabled','disabled');
		}
	},
	replaceGroupLink: function(e) {
		var YEvent = YAHOO.util.Event;
		YEvent.stopEvent(e);
		var YDom = YAHOO.util.Dom;
		var send_to_group_form = YDom.get('send_to_group_form');
		send_to_group_form.style.display = 'block';
		var send_to_group_link = YDom.get('send_to_group_link');
		send_to_group_link.style.display = 'none';
		YEvent.addListener(YDom.get('send_to_group_select'), 'change', YAHOO.up.eventpage.submitGroupForm);
	},
	replaceAttendeeLink: function(e) {
		var YEvent = YAHOO.util.Event;
		YEvent.stopEvent(e);
		var YDom = YAHOO.util.Dom;
		var send_attendee_note_form = YDom.get('send_attendee_note_form');
		send_attendee_note_form.style.display = 'block';
		var send_attendee_note_link = YDom.get('send_attendee_note_link');
		send_attendee_note_link.style.display = 'none';
	},
	submitGroupForm: function(e) {
		var YEvent = YAHOO.util.Event;
		YEvent.stopEvent(e);
		var YConnect = YAHOO.util.Connect;
		var YDom = YAHOO.util.Dom;
		var selector_null = YDom.get('null_option');
		var selector = YDom.get('send_to_group_select');
		if (!selector_null.selected && !selector.disabled) {
			var statusImgDiv = YDom.get('send_to_group_status_img');
			statusImgDiv.style.display = 'inline';
			YConnect.setForm(YDom.get('send_to_group_form'));
			var transaction = YAHOO.util.Connect.asyncRequest('POST', '/ajax/send_event_to_group.php', YAHOO.up.eventpage.groupHandler);

			selector.setAttribute('disabled', 'disabled');
		}

       },
       replacePerformerLink: function(e) {
               var YEvent = YAHOO.util.Event;
               YEvent.stopEvent(e);
               var YDom = YAHOO.util.Dom;
               YDom.get('performer_autocomplete').style.display = 'block';
               YDom.get('add_performer_link').style.display = 'none';
               YDom.get('performerSearchInput').focus();
       },
       addPerformer: function(perf) {
               var YDom = YAHOO.util.Dom, YConnect = YAHOO.util.Connect;
               var transaction = YConnect.asyncRequest('POST', '/ajax/add_event_performer.php', YAHOO.up.eventpage.performerHandler,
                       "_ucrumb="+encodeURI(YDom.get('perf_ucrumb').value)+
                       "&event_id="+encodeURI(YDom.get('perf_event_id').value)+
                       "&performer_id="+encodeURI(perf.id));
	}
};

YAHOO.up.eventpage.ajaxWatchlistExpandHandler = {
  success: function(o) {
    var YDom = YAHOO.util.Dom;
    YDom.get('userlistExpandBusy').style.visibility = 'hidden';
    /*success handler code*/
    
    /* XXX this is stolen from AttendWidget.isResponseOk -- should integrate */
    var ok = true;
    var rsp = o.responseXML.getElementsByTagName('rsp').item(0);
    if (rsp == null) {
      alert("could not understand Upcoming's response.");
      ok = false;
    } else {
      var stat = rsp.getAttribute("stat");
      if (stat != 'ok') {
        alert("status was NOT ok, despite being HTTP ok. This shouldn't happen.");
        ok = false;
      }
    }

    if (ok) {
      YAHOO.up.eventpage.hideableAttendeeDiv.innerHTML = 
        YAHOO.up.workarounds.getTextContent(rsp.getElementsByTagName('attend').item(0));
      YAHOO.up.eventpage.hideableWatcherDiv.innerHTML = 
        YAHOO.up.workarounds.getTextContent(rsp.getElementsByTagName('watch').item(0));
      YAHOO.up.eventpage.initAttendeeToggler();
    }

    return ok;
  },

  failure: function(o) {
    YAHOO.util.Dom.get('userlistExpandBusy').style.visibility = 'hidden';
    var error = o.responseXML.getElementsByTagName('error')[0];
    // Do nothing ??
  },
  timeout: 5000
};

YAHOO.up.eventpage.tagHandler = {
	  success: function(o) {
			/*success handler code*/
			var newTagsXML = o.responseXML.getElementsByTagName('tag');
			var YDom = YAHOO.util.Dom;
			var tag_list = YDom.get('tag_list');
			for (var i=0,j=newTagsXML.length;i<j;i++) {
				var normalizedTag = newTagsXML[i].getElementsByTagName('normalized')[0].firstChild.nodeValue;
				var rawTag = newTagsXML[i].getElementsByTagName('raw')[0].firstChild.nodeValue;
				var deleteUrl = newTagsXML[i].getElementsByTagName('deleteurl')[0].firstChild.nodeValue;
				tag_list.innerHTML += '<a href="/tag/'+(normalizedTag)+'/">' +
				rawTag+'</a> [<a href="?delete_tag='+(deleteUrl)+'">x</a>]<br />';

			}
			YDom.get('add_tag_form').style.display = 'none';
			YDom.get('add_tag_link').style.display = 'inline';
			YDom.get('add_tag_field').value = '';
			YDom.get('add_tag_field').removeAttribute('disabled');
			YDom.get('add_tag_submit').removeAttribute('disabled');
			var statusImgDiv = YDom.get('add_tag_status_img');
			statusImgDiv.style.display = 'none';
		},
	  failure: function(o) {
			var error = o.responseXML.getElementsByTagName('error')[0];
		    alert(error.firstChild.nodeValue);
			var YDom = YAHOO.util.Dom;
			YDom.get('add_tag_form').style.display = 'none';
			YDom.get('add_tag_link').style.display = 'inline';
			YDom.get('add_tag_field').value = '';
			YDom.get('add_tag_field').removeAttribute('disabled');
			YDom.get('add_tag_submit').removeAttribute('disabled');
			var statusImgDiv = YDom.get('add_tag_status_img');
			statusImgDiv.style.display = 'none';
		},
	  timeout: 5000
}

YAHOO.up.eventpage.groupHandler = {
	  success: function(o) {
			var newGroupXML = o.responseXML.getElementsByTagName('group');
			var YDom = YAHOO.util.Dom;
			var YEvent = YAHOO.util.Event;
			var group_list = YDom.get('group_list');
			var groupId = newGroupXML[0].getElementsByTagName('id')[0].firstChild.nodeValue;
			var groupName = newGroupXML[0].getElementsByTagName('name')[0].firstChild.nodeValue;
			group_list.innerHTML += '<li><a href="/group/'+(groupId)+'/">' +
				groupName+'</a> [<a href="/group/'+groupId+'/moderate/event/'+ YAHOO.up.eventpage.eventId + '/">x</a>]</li>';

			YDom.get('send_to_group_form').style.display = 'none';
			YDom.get('send_to_group_link').style.display = 'inline';

			var selector = YDom.get('send_to_group_select');
			selector.removeAttribute('disabled');
			var selector_null = YDom.get('null_option');
			selector_null.selected = 'selected';
			var statusImgDiv = YDom.get('send_to_group_status_img');
			statusImgDiv.style.display = 'none';

			// Remove the group option we just used.
			var sentGroupOption = YDom.get('group_option_' + groupId);
			sentGroupOption.parentNode.removeChild(sentGroupOption);

			   },
	  failure: function(o) {
			var error = o.responseXML.getElementsByTagName('error')[0];
		    alert(error.firstChild.nodeValue);
			var YDom = YAHOO.util.Dom;
			var selector = YDom.get('send_to_group_select');
			selector.removeAttribute('disabled');
			var statusImgDiv = YDom.get('send_to_group_status_img');
			statusImgDiv.style.display = 'none';
			var selector_null = YDom.get('null_option');
			selector_null.selected = 'selected';
			   },
	  timeout: 5000
}

YAHOO.up.eventpage.performerHandler = {
	success: function(o) {
		YAHOO.util.Dom.get('performer_list').innerHTML = o.responseText;
	},
	failure: function(o) {
		var error = o.responseXML.getElementsByTagName('error')[0];
		alert(error.firstChild.nodeValue);
		YAHOO.util.Dom.get('add_performer_status_img').style.display = 'none';
	},
	timeout: 5000
}

YAHOO.util.Event.addListener(window, 'load', YAHOO.up.eventpage.init);

function additionalDatesTable(eventId) {
  this.eventId = eventId;
  this.getHtml();
  this.addListeners();
}

additionalDatesTable.prototype = {
  ajaxUrl: '/ajax/additional_dates.php',
  eventId: null,
  allDatesLoaded: false,
  id: 'additional-dates',
  html: null,
  tableContainerHtml: null,
  busyHtml: null,
  linkNames: new Array('see-more', 'hide-more', 'see-past', 'hide-past'),
  linkIdPrefix: 'additional-dates-',
  frontClassName: 'front',

  html: null,
  links: new Array(),

  getHtml: function() {
    this.html = YAHOO.util.Dom.get(this.id);
    this.tableContainerHtml = YAHOO.util.Dom.get('additional-dates-table-container');
    this.busyHtml = YAHOO.util.Dom.getElementsByClassName('busy', 'span', this.html)[0];
    for (var l = 0; l < this.linkNames.length; l++) {
      this.links[this.linkNames[l]] = new Array();
      this.links[this.linkNames[l]]['html'] = YAHOO.util.Dom.get(this.linkIdPrefix + this.linkNames[l]);
      this.links[this.linkNames[l]]['frontHtml'] = YAHOO.util.Dom.getElementsByClassName(this.frontClassName, 'span', this.links[this.linkNames[l]]['html'])[0];
    }
  },

  addListeners: function() {
    for (var l = 0; l < this.linkNames.length; l++) {
      YAHOO.util.Event.addListener(this.links[this.linkNames[l]]['frontHtml'], 'click', this.getContentUpdater(this.linkNames[l]));
      YAHOO.util.Event.addListener(this.links[this.linkNames[l]]['frontHtml'], 'mouseover', this.getHoverChanger(this.linkNames[l], true));
      YAHOO.util.Event.addListener(this.links[this.linkNames[l]]['frontHtml'], 'mouseout', this.getHoverChanger(this.linkNames[l], false));
    }
  },

  setBusy: function() {
    YAHOO.util.Dom.setStyle(this.busyHtml, 'visibility', 'visible');
  },

  setDone: function() {
    YAHOO.util.Dom.setStyle(this.busyHtml, 'visibility', 'hidden');
  },

  updateContent: function(linkName) {
    if (!this.allDatesLoaded && (linkName == 'see-more' || linkName == 'see-past')) {
      this.loadAllDates(linkName);
    } else {
      this.updateVisibility(linkName);
    }
  },

  getContentUpdater: function(linkName) {
    var adt = this;
    return function() { adt.updateContent(linkName); }
  },

  loadAllDates: function(linkName) {
    this.setBusy();
    var data = new Array();
    data['event_id'] = this.eventId;
    YAHOO.util.Connect.asyncRequest(
      'POST',
      this.ajaxUrl,
      this.getLoadCallback(linkName),
      YAHOO.up.util.arrayAsQueryString(data)
    );
  },

  getLoadCallback: function(linkName) {
    return {
      success: this.getResponseParser(linkName),
      failure: this.getConnectionErrorShower()
    };
  },

  showConnectionError: function() {
    alert('Sorry, your request timed out. Check your connection and try again.');
    this.setDone();
  },

  showResponseError: function() {
    alert('Sorry, this information is unavailable at this time. Try again later.');
    this.setDone();
  },

  getConnectionErrorShower: function() {
    adt = this;
    return function() { adt.showConnectionError(); };
  },

  parseResponse: function(xml, linkName) {
    var rsp = null;
    if (xml) {
      rsp = xml.getElementsByTagName('rsp').item(0);
    }
    if (!rsp) {
      this.showResponseError();
      return;
    }
    var stat = rsp.getAttribute('stat');
    if (stat == 'ok') {
      this.parseTable(rsp, linkName);
    } else {
      this.showResponseError();
    }
  },

  getResponseParser: function(linkName) {
    var adt = this;
    return function(req) { adt.parseResponse(req.responseXML, linkName); };
  },

  parseTable: function(rsp, linkName) {
    var responseHtml = this.getTextContent(rsp, 'html');
    this.tableContainerHtml.innerHTML = responseHtml;
    this.allDatesLoaded = true;
    this.setDone();
    this.updateVisibility(linkName);
  },

  getTextContent: function(rsp, tagName) {
    return YAHOO.up.workarounds.getTextContent(rsp.getElementsByTagName(tagName).item(0));
  },

  updateVisibility: function(linkName) {
    if (linkName == 'see-more') {
      YAHOO.util.Dom.removeClass(this.html, 'hide-more');
      YAHOO.util.Dom.addClass(this.html, 'show-more');
    } else if (linkName == 'hide-more') {
      YAHOO.util.Dom.removeClass(this.html, 'show-more');
      YAHOO.util.Dom.addClass(this.html, 'hide-more');
    } else if (linkName == 'see-past') {
      YAHOO.util.Dom.removeClass(this.html, 'hide-past');
      YAHOO.util.Dom.addClass(this.html, 'show-past');
    } else if (linkName == 'hide-past') {
      YAHOO.util.Dom.removeClass(this.html, 'show-past');
      YAHOO.util.Dom.addClass(this.html, 'hide-past');
    }
  },

  getHoverChanger: function(linkName, hover) {
    var adt = this;
    if (hover) {
      return function() { YAHOO.util.Dom.addClass(adt.links[linkName]['frontHtml'], 'hover'); };
    } else {
      return function() { YAHOO.util.Dom.removeClass(adt.links[linkName]['frontHtml'], 'hover'); };
    }
    return null;
  }
};
