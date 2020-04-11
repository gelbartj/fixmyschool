// Allow AJAX requests to get through CSRF protection
$(document).ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});
// End CSRF protection

// Cause all links with "rel=external" to launch in new window
 window.onload = function() {
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
      var rels = links[i].getAttribute("rel");
      if (rels) {
        var testpattern = new RegExp("external");
        if (testpattern.test(rels)) {
          links[i].onclick = function() {
            return !window.open(this.href);  
          }
        }
      }    
    }
  }

  
/////////////////////////////////
//                             //
// DECLARE FUNCTION PROTOTYPES //
//                             //
/////////////////////////////////


// Called when user submits a comment 
    var media = '/static/ajaxcomments';
    
    function submitComment(e) {
	   e.preventDefault();
	   var form_wrapper = $(e.target).closest(".commentformwrapper");
	   if (form_wrapper.find("#id_name").val() == '') 
	   	   { 
	   	   form_wrapper.find(".commenterrors").hide().fadeIn('slow').html('<p>Please enter a nickname.</p>'); 
	   	   return 0; 
	   	   }
	   if (form_wrapper.find("#id_comment").val() == '') 
	   	   { 
	   	   form_wrapper.find(".commenterrors").hide().fadeIn('slow').html('<p>Please enter a comment.</p>'); 
	   	   return 0; 
	   	   }
	   if (form_wrapper.find(".comment_reply_wrapper")){ //exists?
		var form_obj = $(e.target);
		ajaxComment({'media': media, 'form_obj':form_obj});
		return false;
	   }
    }

// Ajax call for the "Let me in!" school request form
    function schoolRequest(e) {
	e.preventDefault();
	if ($("#schoolreqtext").val() == '' || $("#schoolreqtext").val() == 'Your school name') {
		$("#schoolreqerrors").fadeIn('slow').html('Please enter your school\'s name.');
		return 0;
	}
	$("#requestloader").show();
	$("#request_submit").attr('disabled','disabled');
	schoolform = $(e.target);
	$.ajax({
         url: schoolform.attr('action'),
         type: schoolform.attr('method'),
         data: schoolform.serialize(),
         dataType: 'json',
         success: function(json){ // Server success, not necessarily form success!
         	 if (json) {
         	 	 $("#schoolreqerrors").hide().fadeIn('slow').html(json.html); // Hide first in case another error is already being displayed. Show contents of JSON key "html"
         	 }
         	 else {
         	 	 $("#schoolrequest").fadeOut('fast');
         	 	 $("#schoolreqsuccess").fadeIn('slow');
         	 }
      	 },
      	 error: function(xhr, ajaxOptions, thrownError){
      	 	  $("#schoolreqerrors").hide().fadeIn('slow').html("Sorry, an error type " + xhr.status + ", " + xhr.statusText + ", occurred. Please try again later.");
      	 	  $("#request_submit").removeAttr('disabled');
      	 },
      	 complete: function(a, b) {
      	 	 $("#requestloader").hide();
      	 }
      	});
    }
   
// Call for "Beta feedback" page
    function submitFeedback(e) {
	e.preventDefault();
	var feedbackform = $(e.target);
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        var emailaddressVal = $("#id_email").val();
        if(emailaddressVal == '') {
            $("#feedbackerrors").hide().fadeIn('slow').html('<p>Please enter your email address.</p>');
            return false;
        }
        
        if(!emailReg.test(emailaddressVal)) {
            $("#feedbackerrors").hide().fadeIn('slow').html('<p>Please enter a valid email address.</p>');
            return false;
        }
        
        if($("#id_bug").val() == '' || $("#id_bug").val() == 'Put suggestion here if you have one instead of a bug report.') {
            $("#feedbackerrors").hide().fadeIn('slow').html('<p>Please enter your description of the bug or suggestion.</p>');
            return false;
        }
 
        	$("#loader").show();
        	$('#feedbacksubmit').attr('disabled', 'disabled');
        
        $.ajax({
         url: '.',
         type: feedbackform.attr('method'),
         data: feedbackform.serialize(),
         dataType: 'json',
         success: function(json){ // Server success, not necessarily form success!
         	 if (json) {
         	 	 $("#feedbackerrors").hide().fadeIn('slow').html(json.html); // Hide first in case another error is already being displayed. Show contents of JSON key "html"
         	 	 $('#feedbacksubmit').removeAttr('disabled');
         	 }
         	 else {
         	 	 $("#formwrapper").fadeOut('fast');
         	 	 $("#feedbacksuccess").fadeIn('slow');
         	 }
      	 },
      	 error: function(xhr, ajaxOptions, thrownError){
      	 	  $("#feedbackerrors").hide().fadeIn('slow').html("Sorry, an error type " + xhr.status + ", " + xhr.statusText + ", occurred. Please try again later.");
      	 	  $('#feedbacksubmit').removeAttr('disabled');
      	 },
      	 complete: function(a, b) {
      		$("#loader").hide();
      		
      	}
      	});
    }
    
// Submit entry on home page
    function submitEntry(e) {
     e.preventDefault();
     var entry_form = $(e.target);
     // Begin form validation
     if ($("#id_usertype").val() == '') { $("#entryerrors").hide().fadeIn('slow').html('<p>Please select an option from the "I am a" dropdown menu.</p>'); return 0; }
     if ($("#id_school").val() == '') { $("#entryerrors").hide().fadeIn('slow').html('<p>Please enter the name of your school in the "My school" box.</p>'); return 0; }
     if ($("#id_title").val().substr(0,19) == "Put an eye-catching") {$("#entryerrors").hide().fadeIn('slow').html('<p>Please include a title for your post.</p>'); return 0; } 
     if ($("#id_title").val() == "") {$("#entryerrors").hide().fadeIn('slow').html('<p>Please include a title for your post.</p>'); return 0; } 
     if ($("#id_title").val().length > 110) { $("#entryerrors").hide().fadeIn('slow').html('<p>Please ensure that your title is no more than 110 characters long. <br><span style="font-weight:normal;font-size:95%;">(Current length: ' + $("#id_title").val().length + ')</span></p>'); return 0; }
     if ($("#id_title").val().length < 5) { $("#entryerrors").hide().fadeIn('slow').html('<p>Please make your title at least 5 characters long. (Come on...) <br><span style="font-weight:normal;font-size:95%;">(Current length: ' + $("#id_title").val().length + ')</span></p>'); return 0; }
     if ($("#id_thePost").val().substr(0,20) == "Your post goes here.") {$("#entryerrors").hide().fadeIn('slow').html('<p>Please write something before submitting this form.</p>'); return 0; } 
     if ($("#id_thePost").val() == "") {$("#entryerrors").hide().fadeIn('slow').html('<p>Please write something before submitting this form.</p>'); return 0; } 
     if ($("#id_thePost").val().length > 1000) { $("#entryerrors").hide().fadeIn('slow').html('<p>Please ensure that your post is no more than 1,000 characters long. <br><span style="font-weight:normal;font-size:95%;">(Current length: ' + $("#id_thePost").val().length + ')</span></p>'); return 0; }
     if ($("#id_thePost").val().length < 25) { $("#entryerrors").hide().fadeIn('slow').html('<p>Please ensure that your post is at least 25 characters long. <br><span style="font-weight:normal;font-size:95%;">(Current length: ' + $("#id_thePost").val().length + ')</span></p>'); return 0; }
     
     // End form validation
     
     $("#loader").show();
     $("#entry_submit").attr('disabled','disabled');
     
     $.ajax({
         url: entry_form.attr('action'),
         type: entry_form.attr('method'),
         data: entry_form.serialize(),
         dataType: 'json',
         success: function(json){ // Server success, not necessarily form success!
         	 if (json) {
         	 	 $("#entryerrors").hide().fadeIn('slow').html(json.html); // Hide first in case another error is already being displayed. Show contents of JSON key "html"
         	 	 $('#entry_submit').removeAttr('disabled');
         	 }
         	 else {
         	 	 $(".entryformwrapper").fadeOut('fast');
         	 	 $(".verytopform").fadeOut('fast');
         	 	 $("#entrysuccess").fadeIn('slow');
         	 }
      	 },
      	 error: function(xhr, ajaxOptions, thrownError){
      	 	  $("#entryerrors").hide().fadeIn('slow').html("Sorry, an error type " + xhr.status + ", " + xhr.statusText + ", occurred. Please try again later.");
      	 	  $('#entry_submit').removeAttr('disabled');
      	 },
      	 complete: function(a, b) {
      		$("#loader").hide();
      		
      	}
     });
   }     
    
// Check whether to show the "s" in "votes" on pages with comments
   function checkPlural(votes, pluralDiv) {
     	     if (votes == 1) {
     	     	     pluralDiv.hide(); 
     	     }
     	     else {
     	     	     pluralDiv.html('s');
     	     	     pluralDiv.show();
     	     }
    }   
   
// Verify status page

function verifyEmail(e) {
	e.preventDefault();
	if ($("#verifyemailform #id_email").val() == '') {
		$("#verifyerrors").hide().fadeIn('slow').html('Please enter your e-mail address.');
		return 0;
	}
	$("#emailloader").show();
	verifyform = $(e.target);
	verifyform.find('input[type="submit"]').attr('disabled','disabled');
	$.ajax({
         url: verifyform.attr('action'),
         type: verifyform.attr('method'),
         data: verifyform.serialize(),
         dataType: 'json',
         success: function(json){ // Server success, not necessarily form success!
         	 if (json) {
         	 	 $("#verifyerrors").hide().fadeIn('slow').html(json.html); // Hide first in case another error is already being displayed. Show contents of JSON key "html"
         	 	 verifyform.find('input[type="submit"]').removeAttr('disabled');
         	 }
         	 else {
         	 	 $("#verifyemailform").fadeOut('fast');
         	 	 $("#verifyerrors").fadeOut('fast');
         	 	 $("#verifysuccess").html('E-mail address successfully submitted. Please click the link in the e-mail we\'ve just sent you to complete this step.').fadeIn('slow');
         	 }
      	 },
      	 error: function(xhr, ajaxOptions, thrownError){
      	 	  $("#verifyerrors").hide().fadeIn('slow').html("Sorry, an error type " + xhr.status + ", " + xhr.statusText + ", occurred. Please try again later.");
      	 	  verifyform.find('input[type="submit"]').removeAttr('disabled');
      	 },
      	 complete: function(a, b) {
      	 	 $("#emailloader").hide();
      	 }
      	});
    }
    
    function checkComplete(form,type) {
    	var iframe = form.find('iframe').contents().text();
    	var message;
    	if (!iframe) {
    		setTimeout(function(){
    			checkComplete(form,type);
    		},2000);
    	}
    	else {
    		form.prev().hide();
    		if (iframe.substr(0,1) == "{"){
    		    message =  $.parseJSON(iframe);
    		    if (message.success == "true"){
    		    	  form.fadeOut('fast');
    		    	  var completeselector = "#verifyformcomplete" + type;
    		    	  $(completeselector).find(".rejected").fadeOut('fast');
    		    	  $(completeselector).find(".complete").fadeIn('slow');
    		    	  $("#verifysuccess").html('Document uploaded successfully.').fadeIn('slow');
    		    }
    		    if (message.success == "false"){
    		    	  $("#verifyerrors").hide().fadeIn('slow').html(message.html); // Hide first in case another error is already being displayed. Show contents of JSON key "html"
    		    	  form.find('input[type="submit"]').removeAttr('disabled');
    		    }
    		}
    		else {
    		    message = iframe.find('title').html();
    		    $("#verifyerrors").hide().fadeIn('slow').html(message); // Hide first in case another error is already being displayed. Show contents of JSON key "html"
    		    form.find('input[type="submit"]').removeAttr('disabled');
    		}
    	}
    	
    }
    
    function verifyDocument(e) {
	e.preventDefault();
	$("#verifyerrors").fadeOut('fast');
	$("#verifysuccess").fadeOut('fast');
	var verifyform = $(e.target).closest('form');
	var type = verifyform.find("#id_type").val();
	var the_iframe = "iframe" + type;
	verifyform[0].target = the_iframe;
	if (verifyform.find('input[type="file"]').val() == '') {
		$("#verifyerrors").hide().fadeIn('slow').html('Please select a file to upload.');
		return 0;
	}
	var loaderselector = "#verifyloader" + type;
	$(loaderselector).show();
	verifyform.find('input[type="submit"]').attr('disabled','disabled');
	var newAction = verifyform.attr('action') + "ajax/";
	verifyform.attr('action',newAction);
	var iframeselector = "#" + the_iframe;
	$(iframeselector).hide(); // Just in case
	$(iframeselector).contents().text('');
	verifyform.submit();
	checkComplete(verifyform,type);
      	
    }
    
 
/////////////////////////////
//                         //
// BEGIN FORMER ENDLESS.JS //
//                         //
/////////////////////////////

// initializes links for ajax requests
(function($) {
   $(document).ready(function(){
       $("a.endless_more").live("click", function() {
	    var container = $(this).closest(".endless_container");
	    var loading = container.find(".endless_loading");
	    $(this).hide();
	    loading.show();
	    var data = "querystring_key=" + $(this).attr("rel").split(" ")[0];
	    $.get($(this).attr("href"), data, function(data) {
		container.before(data);
		container.remove();
	    });
	    return false;
       });
       $("a.endless_page_link").live("click", function() {
	    $(".endless_loading").show();
	    var data = "querystring_key=" + $(this).attr("rel").split(" ")[0];
	    $(this).closest(".endless_page_template").load($(this).attr("href"), data);
	    return false;
       }); 
   });
})(jQuery);


////////////////////////////
//                        //
// BEGIN FORMER TIPTIP.JS //
//                        //
////////////////////////////

 /*
 * TipTip
 * Copyright 2010 Drew Wilson
 * www.drewwilson.com
 * code.drewwilson.com/entry/tiptip-jquery-plugin
 *
 * Version 1.3   -   Updated: Mar. 23, 2010
 *
 * This Plug-In will create a custom tooltip to replace the default
 * browser tooltip. It is extremely lightweight and very smart in
 * that it detects the edges of the browser window and will make sure
 * the tooltip stays within the current window size. As a result the
 * tooltip will adjust itself to be displayed above, below, to the left 
 * or to the right depending on what is necessary to stay within the
 * browser window. It is completely customizable as well via CSS.
 *
 * This TipTip jQuery plug-in is dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function($){$.fn.tipTip=function(options){var defaults={activation:"hover",keepAlive:false,maxWidth:"200px",edgeOffset:3,defaultPosition:"bottom",delay:400,fadeIn:200,fadeOut:200,attribute:"title",content:false,enter:function(){},exit:function(){}};var opts=$.extend(defaults,options);if($("#tiptip_holder").length<=0){var tiptip_holder=$('<div id="tiptip_holder" style="max-width:'+opts.maxWidth+';"></div>');var tiptip_content=$('<div id="tiptip_content"></div>');var tiptip_arrow=$('<div id="tiptip_arrow"></div>');$("body").append(tiptip_holder.html(tiptip_content).prepend(tiptip_arrow.html('<div id="tiptip_arrow_inner"></div>')))}else{var tiptip_holder=$("#tiptip_holder");var tiptip_content=$("#tiptip_content");var tiptip_arrow=$("#tiptip_arrow")}return this.each(function(){var org_elem=$(this);if(opts.content){var org_title=opts.content}else{var org_title=org_elem.attr(opts.attribute)}if(org_title!=""){if(!opts.content){org_elem.removeAttr(opts.attribute)}var timeout=false;if(opts.activation=="hover"){org_elem.hover(function(){active_tiptip()},function(){if(!opts.keepAlive){deactive_tiptip()}});if(opts.keepAlive){tiptip_holder.hover(function(){},function(){deactive_tiptip()})}}else if(opts.activation=="focus"){org_elem.focus(function(){active_tiptip()}).blur(function(){deactive_tiptip()})}else if(opts.activation=="click"){org_elem.click(function(){active_tiptip();return false}).hover(function(){},function(){if(!opts.keepAlive){deactive_tiptip()}});if(opts.keepAlive){tiptip_holder.hover(function(){},function(){deactive_tiptip()})}}function active_tiptip(){opts.enter.call(this);tiptip_content.html(org_title);tiptip_holder.hide().removeAttr("class").css("margin","0");tiptip_arrow.removeAttr("style");var top=parseInt(org_elem.offset()['top']);var left=parseInt(org_elem.offset()['left']);var org_width=parseInt(org_elem.outerWidth());var org_height=parseInt(org_elem.outerHeight());var tip_w=tiptip_holder.outerWidth();var tip_h=tiptip_holder.outerHeight();var w_compare=Math.round((org_width-tip_w)/2);var h_compare=Math.round((org_height-tip_h)/2);var marg_left=Math.round(left+w_compare);var marg_top=Math.round(top+org_height+opts.edgeOffset);var t_class="";var arrow_top="";var arrow_left=Math.round(tip_w-12)/2;if(opts.defaultPosition=="bottom"){t_class="_bottom"}else if(opts.defaultPosition=="top"){t_class="_top"}else if(opts.defaultPosition=="left"){t_class="_left"}else if(opts.defaultPosition=="right"){t_class="_right"}var right_compare=(w_compare+left)<parseInt($(window).scrollLeft());var left_compare=(tip_w+left)>parseInt($(window).width());if((right_compare&&w_compare<0)||(t_class=="_right"&&!left_compare)||(t_class=="_left"&&left<(tip_w+opts.edgeOffset+5))){t_class="_right";arrow_top=Math.round(tip_h-13)/2;arrow_left=-12;marg_left=Math.round(left+org_width+opts.edgeOffset);marg_top=Math.round(top+h_compare)}else if((left_compare&&w_compare<0)||(t_class=="_left"&&!right_compare)){t_class="_left";arrow_top=Math.round(tip_h-13)/2;arrow_left=Math.round(tip_w);marg_left=Math.round(left-(tip_w+opts.edgeOffset+5));marg_top=Math.round(top+h_compare)}var top_compare=(top+org_height+opts.edgeOffset+tip_h+8)>parseInt($(window).height()+$(window).scrollTop());var bottom_compare=((top+org_height)-(opts.edgeOffset+tip_h+8))<0;if(top_compare||(t_class=="_bottom"&&top_compare)||(t_class=="_top"&&!bottom_compare)){if(t_class=="_top"||t_class=="_bottom"){t_class="_top"}else{t_class=t_class+"_top"}arrow_top=tip_h;marg_top=Math.round(top-(tip_h+5+opts.edgeOffset))}else if(bottom_compare|(t_class=="_top"&&bottom_compare)||(t_class=="_bottom"&&!top_compare)){if(t_class=="_top"||t_class=="_bottom"){t_class="_bottom"}else{t_class=t_class+"_bottom"}arrow_top=-12;marg_top=Math.round(top+org_height+opts.edgeOffset)}if(t_class=="_right_top"||t_class=="_left_top"){marg_top=marg_top+5}else if(t_class=="_right_bottom"||t_class=="_left_bottom"){marg_top=marg_top-5}if(t_class=="_left_top"||t_class=="_left_bottom"){marg_left=marg_left+5}tiptip_arrow.css({"margin-left":arrow_left+"px","margin-top":arrow_top+"px"});tiptip_holder.css({"margin-left":marg_left+"px","margin-top":marg_top+"px"}).attr("class","tip"+t_class);if(timeout){clearTimeout(timeout)}timeout=setTimeout(function(){tiptip_holder.stop(true,true).fadeIn(opts.fadeIn)},opts.delay)}function deactive_tiptip(){opts.exit.call(this);if(timeout){clearTimeout(timeout)}tiptip_holder.fadeOut(opts.fadeOut)}}})}})(jQuery);

///////////////////////////
//                       //
// BEGIN FORMER CYCLE.JS //
//                       //
///////////////////////////
/*
 * jQuery Cycle Lite Plugin
 * http://malsup.com/jquery/cycle/lite/
 * Copyright (c) 2008-2011 M. Alsup
 * Version: 1.1 (03/07/2011)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Requires: jQuery v1.3.2 or later
 */
(function($){var ver="Lite-1.1";$.fn.cycle=function(options){return this.each(function(){options=options||{};if(this.cycleTimeout){clearTimeout(this.cycleTimeout);}this.cycleTimeout=0;this.cyclePause=0;var $cont=$(this);var $slides=options.slideExpr?$(options.slideExpr,this):$cont.children();var els=$slides.get();if(els.length<2){window.console&&console.log("terminating; too few slides: "+els.length);return ;}var opts=$.extend({},$.fn.cycle.defaults,options||{},$.metadata?$cont.metadata():$.meta?$cont.data():{});opts.before=opts.before?[opts.before]:[];opts.after=opts.after?[opts.after]:[];opts.after.unshift(function(){opts.busy=0;});var cls=this.className;opts.width=parseInt((cls.match(/w:(\d+)/)||[])[1])||opts.width;opts.height=parseInt((cls.match(/h:(\d+)/)||[])[1])||opts.height;opts.timeout=parseInt((cls.match(/t:(\d+)/)||[])[1])||opts.timeout;if($cont.css("position")=="static"){$cont.css("position","relative");}if(opts.width){$cont.width(opts.width);}if(opts.height&&opts.height!="auto"){$cont.height(opts.height);}var first=0;$slides.css({position:"absolute",top:0,left:0}).each(function(i){$(this).css("z-index",els.length-i);});$(els[first]).css("opacity",1).show();if($.browser.msie){els[first].style.removeAttribute("filter");}if(opts.fit&&opts.width){$slides.width(opts.width);}if(opts.fit&&opts.height&&opts.height!="auto"){$slides.height(opts.height);}if(opts.pause){$cont.hover(function(){this.cyclePause=1;},function(){this.cyclePause=0;});}var txFn=$.fn.cycle.transitions[opts.fx];txFn&&txFn($cont,$slides,opts);$slides.each(function(){var $el=$(this);this.cycleH=(opts.fit&&opts.height)?opts.height:$el.height();this.cycleW=(opts.fit&&opts.width)?opts.width:$el.width();});if(opts.cssFirst){$($slides[first]).css(opts.cssFirst);}if(opts.timeout){if(opts.speed.constructor==String){opts.speed={slow:600,fast:200}[opts.speed]||400;}if(!opts.sync){opts.speed=opts.speed/2;}while((opts.timeout-opts.speed)<250){opts.timeout+=opts.speed;}}opts.speedIn=opts.speed;opts.speedOut=opts.speed;opts.slideCount=els.length;opts.currSlide=first;opts.nextSlide=1;var e0=$slides[first];if(opts.before.length){opts.before[0].apply(e0,[e0,e0,opts,true]);}if(opts.after.length>1){opts.after[1].apply(e0,[e0,e0,opts,true]);}if(opts.click&&!opts.next){opts.next=opts.click;}if(opts.next){$(opts.next).bind("click",function(){return advance(els,opts,opts.rev?-1:1);});}if(opts.prev){$(opts.prev).bind("click",function(){return advance(els,opts,opts.rev?1:-1);});}if(opts.timeout){this.cycleTimeout=setTimeout(function(){go(els,opts,0,!opts.rev);},opts.timeout+(opts.delay||0));}});};function go(els,opts,manual,fwd){if(opts.busy){return ;}var p=els[0].parentNode,curr=els[opts.currSlide],next=els[opts.nextSlide];if(p.cycleTimeout===0&&!manual){return ;}if(manual||!p.cyclePause){if(opts.before.length){$.each(opts.before,function(i,o){o.apply(next,[curr,next,opts,fwd]);});}var after=function(){if($.browser.msie){this.style.removeAttribute("filter");}$.each(opts.after,function(i,o){o.apply(next,[curr,next,opts,fwd]);});};if(opts.nextSlide!=opts.currSlide){opts.busy=1;$.fn.cycle.custom(curr,next,opts,after);}var roll=(opts.nextSlide+1)==els.length;opts.nextSlide=roll?0:opts.nextSlide+1;opts.currSlide=roll?els.length-1:opts.nextSlide-1;}if(opts.timeout){p.cycleTimeout=setTimeout(function(){go(els,opts,0,!opts.rev);},opts.timeout);}}function advance(els,opts,val){var p=els[0].parentNode,timeout=p.cycleTimeout;if(timeout){clearTimeout(timeout);p.cycleTimeout=0;}opts.nextSlide=opts.currSlide+val;if(opts.nextSlide<0){opts.nextSlide=els.length-1;}else{if(opts.nextSlide>=els.length){opts.nextSlide=0;}}go(els,opts,1,val>=0);return false;}$.fn.cycle.custom=function(curr,next,opts,cb){var $l=$(curr),$n=$(next);$n.css(opts.cssBefore);var fn=function(){$n.animate(opts.animIn,opts.speedIn,opts.easeIn,cb);};$l.animate(opts.animOut,opts.speedOut,opts.easeOut,function(){$l.css(opts.cssAfter);if(!opts.sync){fn();}});if(opts.sync){fn();}};$.fn.cycle.transitions={fade:function($cont,$slides,opts){opts.cssBefore={opacity:0};opts.animOut={opacity:0};opts.animIn={opacity:1};}};$.fn.cycle.ver=function(){return ver;};$.fn.cycle.defaults={fx:"fade",timeout:4000,speed:1000,next:null,prev:null,before:null,after:null,height:"auto",sync:1,fit:0,pause:0,delay:0,slideExpr:null,cssBefore:{},cssAfter:{},animIn:{},animOut:{}};})(jQuery);


///////////////////////////////////////
//                                   //
// BEGIN FORMER AJAX POST-COMMENT.JS //
//                                   //
///////////////////////////////////////

$(document).ready(function() {
    previewed = false;
    
    commentBusy = false;
});

function ajaxComment(args) {
  
    // TODO: if the media variable ends in a forward slash, remove it.
    var media = args.media;
    var form_obj = args.form_obj;
    var parent = form_obj.closest(".commentformwrapper");
    $('div.comment-error').remove();
    
    if (commentBusy) {
        parent.find('.comment_form').before('\
            <div class="comment-error">\
                Your comment is currently in the process of posting.\
            </div>\
        ');
        parent.find('.comment-error').fadeOut(2000);
        
        return false;
    }
    
    comment = parent.find('.comment_form').serialize();
   
    // Add a wait animation
    parent.find('.submit-post').after('\
        <img src="' + media + '/img/ajax-wait.gif" alt="Please wait..."\
            class="ajax-loader" />\
    ');
    
    // Indicate that the comment is being posted
    parent.find('.submit').after('\
        <div class="comment-waiting" style="display: none;">\
            One moment while the comment is posted. . .\
        </div>\
    ');
    parent.find('.comment-waiting').fadeIn(1000);
    
    commentBusy = true;
    
    url = form_obj.attr('action');
    // Use AJAX to post the comment.
    $.ajax({
        type: 'POST',
        url: url,
        data: comment,
        success: function(data) {
        	
            commentBusy = false;
            removeWaitAnimation();
   
            if (data.success == true) {
                commentSuccess(data, parent);
            } else {
                commentFailure(data, parent);
            }
        },
        error:  function (xhr, textStatus, errorThrown) {
            commentBusy = false;
          
            removeWaitAnimation();
            
            /* $('form.comment_form').unbind('submit');
            $('form.comment_form').submit(); */
            if (xhr.status == "400") {
            parent.find(".commenterrors").hide().fadeIn('slow').html("Sorry, comments for this post are currently disabled. Please try again later.");
            }
            else {
            parent.find(".commenterrors").hide().fadeIn('slow').html("Sorry, an error type " + xhr.status + ", \"" + xhr.statusText + ",\" occurred. Please try again later.");
            }
            },
        dataType: 'json'
    });
    
    return false;
}

function commentSuccess(data, parent) {

    comment = parent.find('#id_comment').val();
    name = parent.find('#id_name').val();
    
    /* if ($('div#comments').children().length == 0) {
        $('div#comments').prepend(
            '<h2 class="comment-hd">First post!</h2>'
        )
    } */
    
     if (parent.attr("id") == "commentformwrapper"){
     	
    $('#comments').prepend(data['html']);
    $('.comment:first').show('slow');    
    $('.comment_and_link').fadeOut('slow');
    $('.noComments').fadeOut('slow');
    }
   
    else {    	    
    	     parent.html(data['html']);    
    }
    
    $('.commenterrors').hide();
    $('div.comment-thanks').delay(1000).fadeOut(6000);
}

function commentFailure(data, parent) {
	
    parent.find('.errorlist').each(function() {
	    this.parentNode.removeChild(this);
        });

    for (var error in data.errors) {
    	    parent.find('#id_' + error).parent().before(error + ": " + data.errors[error])
    }
}

function removeWaitAnimation() {
    // Remove the wait animation and message
    $('.ajax-loader').remove();
    $('div.comment-waiting').stop().remove();
}

/////////////////////////////
//                         //
// BEGIN FORMER JQMODAL.JS //
//                         //
/////////////////////////////

/*
 * jqModal - Minimalist Modaling with jQuery
 *   (http://dev.iceburg.net/jquery/jqModal/)
 *
 * Copyright (c) 2007,2008 Brice Burgess <bhb@iceburg.net>
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 * 
 * $Version: 03/01/2009 +r14
 */
(function($) {
$.fn.jqm=function(o){
var p={
overlay: 50,
overlayClass: 'jqmOverlay',
closeClass: 'jqmClose',
trigger: '.jqModal',
ajax: F,
ajaxText: '',
target: F,
modal: F,
toTop: F,
onShow: F,
onHide: F,
onLoad: F
};
return this.each(function(){if(this._jqm)return H[this._jqm].c=$.extend({},H[this._jqm].c,o);s++;this._jqm=s;
H[s]={c:$.extend(p,$.jqm.params,o),a:F,w:$(this).addClass('jqmID'+s),s:s};
if(p.trigger)$(this).jqmAddTrigger(p.trigger);
});};

$.fn.jqmAddClose=function(e){return hs(this,e,'jqmHide');};
$.fn.jqmAddTrigger=function(e){return hs(this,e,'jqmShow');};
$.fn.jqmShow=function(t){return this.each(function(){t=t||window.event;$.jqm.open(this._jqm,t);});};
$.fn.jqmHide=function(t){return this.each(function(){t=t||window.event;$.jqm.close(this._jqm,t)});};

$.jqm = {
hash:{},
open:function(s,t){var h=H[s],c=h.c,cc='.'+c.closeClass,z=(parseInt(h.w.css('z-index'))),z=(z>0)?z:3000,o=$('<div></div>').css({height:'100%',width:'100%',position:'fixed',left:0,top:0,'z-index':z-1,opacity:c.overlay/100});if(h.a)return F;h.t=t;h.a=true;h.w.css('z-index',z);
 if(c.modal) {if(!A[0])L('bind');A.push(s);}
 else if(c.overlay > 0)h.w.jqmAddClose(o);
 else o=F;

 h.o=(o)?o.addClass(c.overlayClass).prependTo('body'):F;
 if(ie6){$('html,body').css({height:'100%',width:'100%'});if(o){o=o.css({position:'absolute'})[0];for(var y in {Top:1,Left:1})o.style.setExpression(y.toLowerCase(),"(_=(document.documentElement.scroll"+y+" || document.body.scroll"+y+"))+'px'");}}

 if(c.ajax) {var r=c.target||h.w,u=c.ajax,r=(typeof r == 'string')?$(r,h.w):$(r),u=(u.substr(0,1) == '@')?$(t).attr(u.substring(1)):u;
  r.html(c.ajaxText).load(u,function(){if(c.onLoad)c.onLoad.call(this,h);if(cc)h.w.jqmAddClose($(cc,h.w));e(h);});}
 else if(cc)h.w.jqmAddClose($(cc,h.w));

 if(c.toTop&&h.o)h.w.before('<span id="jqmP'+h.w[0]._jqm+'"></span>').insertAfter(h.o);	
 (c.onShow)?c.onShow(h):h.w.show();e(h);return F;
},
close:function(s){var h=H[s];if(!h.a)return F;h.a=F;
 if(A[0]){A.pop();if(!A[0])L('unbind');}
 if(h.c.toTop&&h.o)$('#jqmP'+h.w[0]._jqm).after(h.w).remove();
 if(h.c.onHide)h.c.onHide(h);else{h.w.hide();if(h.o)h.o.remove();} return F;
},
params:{}};
var s=0,H=$.jqm.hash,A=[],ie6=$.browser.msie&&($.browser.version == "6.0"),F=false,
i=$('<iframe src="javascript:false;document.write(\'\');" class="jqm"></iframe>').css({opacity:0}),
e=function(h){if(ie6)if(h.o)h.o.html('<p style="width:100%;height:100%"/>').prepend(i);else if(!$('iframe.jqm',h.w)[0])h.w.prepend(i); f(h);},
f=function(h){try{$(':input:visible',h.w)[0].focus();}catch(_){}},
L=function(t){$()[t]("keypress",m)[t]("keydown",m)[t]("mousedown",m);},
m=function(e){var h=H[A[A.length-1]],r=(!$(e.target).parents('.jqmID'+h.s)[0]);if(r)f(h);return !r;},
hs=function(w,t,c){return w.each(function(){var s=this._jqm;$(t).each(function() {
 if(!this[c]){this[c]=[];$(this).click(function(){for(var i in {jqmShow:1,jqmHide:1})for(var s in this[i])if(H[this[i][s]])H[this[i][s]].w[i](this);return F;});}this[c].push(s);});});};
})(jQuery);


///////////////////////////////////////
//                                   //
// BEGIN FORMER DROPDOWNCHECKLIST.JS //
//                                   //
///////////////////////////////////////

(function(a){a.widget("ui.dropdownchecklist",{version:function(){alert("DropDownCheckList v1.4")},_appendDropContainer:function(b){var d=a("<div/>");d.addClass("ui-dropdownchecklist ui-dropdownchecklist-dropcontainer-wrapper");d.addClass("ui-widget");d.attr("id",b.attr("id")+"-ddw");d.css({position:"absolute",left:"-33000px",top:"-33000px"});var c=a("<div/>");c.addClass("ui-dropdownchecklist-dropcontainer ui-widget-content");c.css("overflow-y","auto");d.append(c);d.insertAfter(b);d.isOpen=false;return d},_isDropDownKeyShortcut:function(c,b){return c.altKey&&(a.ui.keyCode.DOWN==b)},_isDropDownCloseKey:function(c,b){return(a.ui.keyCode.ESCAPE==b)||(a.ui.keyCode.ENTER==b)},_keyFocusChange:function(f,i,c){var g=a(":focusable");var d=g.index(f);if(d>=0){d+=i;if(c){var e=this.dropWrapper.find("input:not([disabled])");var b=g.index(e.get(0));var h=g.index(e.get(e.length-1));if(d<b){d=h}else{if(d>h){d=b}}}g.get(d).focus()}},_handleKeyboard:function(d){var b=this;var c=(d.keyCode||d.which);if(!b.dropWrapper.isOpen&&b._isDropDownKeyShortcut(d,c)){d.stopImmediatePropagation();b._toggleDropContainer(true)}else{if(b.dropWrapper.isOpen&&b._isDropDownCloseKey(d,c)){d.stopImmediatePropagation();b._toggleDropContainer(false);b.controlSelector.focus()}else{if(b.dropWrapper.isOpen&&(d.target.type=="checkbox")&&((c==a.ui.keyCode.DOWN)||(c==a.ui.keyCode.UP))){d.stopImmediatePropagation();b._keyFocusChange(d.target,(c==a.ui.keyCode.DOWN)?1:-1,true)}else{if(b.dropWrapper.isOpen&&(c==a.ui.keyCode.TAB)){}}}}},_handleFocus:function(f,d,b){var c=this;if(b&&!c.dropWrapper.isOpen){f.stopImmediatePropagation();if(d){c.controlSelector.addClass("ui-state-hover");if(a.ui.dropdownchecklist.gLastOpened!=null){a.ui.dropdownchecklist.gLastOpened._toggleDropContainer(false)}}else{c.controlSelector.removeClass("ui-state-hover")}}else{if(!b&&!d){if(f!=null){f.stopImmediatePropagation()}c.controlSelector.removeClass("ui-state-hover");c._toggleDropContainer(false)}}},_cancelBlur:function(c){var b=this;if(b.blurringItem!=null){clearTimeout(b.blurringItem);b.blurringItem=null}},_appendControl:function(){var j=this,c=this.sourceSelect,k=this.options;var b=a("<span/>");b.addClass("ui-dropdownchecklist ui-dropdownchecklist-selector-wrapper ui-widget");b.css({display:"inline-block",cursor:"default",overflow:"hidden"});var f=c.attr("id");if((f==null)||(f=="")){f="ddcl-"+a.ui.dropdownchecklist.gIDCounter++}else{f="ddcl-"+f}b.attr("id",f);var h=a("<span/>");h.addClass("ui-dropdownchecklist-selector ui-state-default");h.css({display:"inline-block",overflow:"hidden","white-space":"nowrap"});var d=c.attr("tabIndex");if(d==null){d=0}else{d=parseInt(d);if(d<0){d=0}}h.attr("tabIndex",d);h.keyup(function(l){j._handleKeyboard(l)});h.focus(function(l){j._handleFocus(l,true,true)});h.blur(function(l){j._handleFocus(l,false,true)});b.append(h);if(k.icon!=null){var i=(k.icon.placement==null)?"left":k.icon.placement;var g=a("<div/>");g.addClass("ui-icon");g.addClass((k.icon.toOpen!=null)?k.icon.toOpen:"ui-icon-triangle-1-e");g.css({"float":i});h.append(g)}var e=a("<span/>");e.addClass("ui-dropdownchecklist-text");e.css({display:"inline-block","white-space":"nowrap",overflow:"hidden"});h.append(e);b.hover(function(){if(!j.disabled){h.addClass("ui-state-hover")}},function(){if(!j.disabled){h.removeClass("ui-state-hover")}});b.click(function(l){if(!j.disabled){l.stopImmediatePropagation();j._toggleDropContainer(!j.dropWrapper.isOpen)}});b.insertAfter(c);a(window).resize(function(){if(!j.disabled&&j.dropWrapper.isOpen){j._toggleDropContainer(true)}});return b},_createDropItem:function(g,f,o,l,q,h,e,k){var m=this,c=this.options,d=this.sourceSelect,p=this.controlWrapper;var t=a("<div/>");t.addClass("ui-dropdownchecklist-item");t.css({"white-space":"nowrap"});var r=h?' checked="checked"':"";var j=e?' class="inactive"':' class="active"';var b=p.attr("id");var n=b+"-i"+g;var s;if(m.isMultiple){s=a('<input disabled type="checkbox" id="'+n+'"'+r+j+' tabindex="'+f+'" />')}else{s=a('<input disabled type="radio" id="'+n+'" name="'+b+'"'+r+j+' tabindex="'+f+'" />')}s=s.attr("index",g).val(o);t.append(s);var i=a("<label for="+n+"/>");i.addClass("ui-dropdownchecklist-text");if(q!=null){i.attr("style",q)}i.css({cursor:"default"});i.html(l);if(k){t.addClass("ui-dropdownchecklist-indent")}t.addClass("ui-state-default");if(e){t.addClass("ui-state-disabled")}i.click(function(u){u.stopImmediatePropagation()});t.append(i);t.hover(function(v){var u=a(this);if(!u.hasClass("ui-state-disabled")){u.addClass("ui-state-hover")}},function(v){var u=a(this);u.removeClass("ui-state-hover")});s.click(function(w){var v=a(this);w.stopImmediatePropagation();if(v.hasClass("active")){var x=m.options.onItemClick;if(a.isFunction(x)){try{x.call(m,v,d.get(0))}catch(u){v.prop("checked",!v.prop("checked"));m._syncSelected(v);return}}m._syncSelected(v);m.sourceSelect.trigger("change","ddcl_internal");if(!m.isMultiple&&c.closeRadioOnClick){m._toggleDropContainer(false)}}});t.click(function(y){var x=a(this);y.stopImmediatePropagation();if(!x.hasClass("ui-state-disabled")){var v=x.find("input");var w=v.prop("checked");v.prop("checked",!w);var z=m.options.onItemClick;if(a.isFunction(z)){try{z.call(m,v,d.get(0))}catch(u){v.prop("checked",w);m._syncSelected(v);return}}m._syncSelected(v);m.sourceSelect.trigger("change","ddcl_internal");if(!w&&!m.isMultiple&&c.closeRadioOnClick){m._toggleDropContainer(false)}}else{x.focus();m._cancelBlur()}});t.focus(function(v){var u=a(this);v.stopImmediatePropagation()});t.keyup(function(u){m._handleKeyboard(u)});return t},_createGroupItem:function(f,d){var b=this;var e=a("<div />");e.addClass("ui-dropdownchecklist-group ui-widget-header");if(d){e.addClass("ui-state-disabled")}e.css({"white-space":"nowrap"});var c=a("<span/>");c.addClass("ui-dropdownchecklist-text");c.css({cursor:"default"});c.text(f);e.append(c);e.click(function(h){var g=a(this);h.stopImmediatePropagation();g.focus();b._cancelBlur()});e.focus(function(h){var g=a(this);h.stopImmediatePropagation()});return e},_createCloseItem:function(e){var b=this;var d=a("<div />");d.addClass("ui-state-default ui-dropdownchecklist-close ui-dropdownchecklist-item");d.css({"white-space":"nowrap","text-align":"right"});var c=a("<span/>");c.addClass("ui-dropdownchecklist-text");c.css({cursor:"default"});c.html(e);d.append(c);d.click(function(g){var f=a(this);g.stopImmediatePropagation();f.focus();b._toggleDropContainer(false)});d.hover(function(f){a(this).addClass("ui-state-hover")},function(f){a(this).removeClass("ui-state-hover")});d.focus(function(g){var f=a(this);g.stopImmediatePropagation()});return d},_appendItems:function(){var d=this,f=this.options,h=this.sourceSelect,g=this.dropWrapper;var b=g.find(".ui-dropdownchecklist-dropcontainer");h.children().each(function(j){var k=a(this);if(k.is("option")){d._appendOption(k,b,j,false,false)}else{if(k.is("optgroup")){var l=k.prop("disabled");var n=k.attr("label");if(n!=""){var m=d._createGroupItem(n,l);b.append(m)}d._appendOptions(k,b,j,true,l)}}});if(f.explicitClose!=null){var i=d._createCloseItem(f.explicitClose);b.append(i)}var c=b.outerWidth();var e=b.outerHeight();return{width:c,height:e}},_appendOptions:function(g,d,f,c,b){var e=this;g.children("option").each(function(h){var i=a(this);var j=(f+"."+h);e._appendOption(i,d,j,c,b)})},_appendOption:function(g,b,h,d,n){var m=this;var k=g.html();if((k!=null)&&(k!="")){var j=g.val();var i=g.attr("style");var f=g.prop("selected");var e=(n||g.prop("disabled"));var c=m.controlSelector.attr("tabindex");var l=m._createDropItem(h,c,j,k,i,f,e,d);b.append(l)}},_syncSelected:function(h){var i=this,l=this.options,b=this.sourceSelect,d=this.dropWrapper;var c=b.get(0).options;var g=d.find("input.active");if(l.firstItemChecksAll=="exclusive"){if((h==null)&&a(c[0]).prop("selected")){g.prop("checked",false);a(g[0]).prop("checked",true)}else{if((h!=null)&&(h.attr("index")==0)){var e=h.prop("checked");g.prop("checked",false);a(g[0]).prop("checked",e)}else{var f=true;var k=null;g.each(function(m){if(m>0){var n=a(this).prop("checked");if(!n){f=false}}else{k=a(this)}});if(k!=null){if(f){g.prop("checked",false)}k.prop("checked",f)}}}}else{if(l.firstItemChecksAll){if((h==null)&&a(c[0]).prop("selected")){g.prop("checked",true)}else{if((h!=null)&&(h.attr("index")==0)){g.prop("checked",h.prop("checked"))}else{var f=true;var k=null;g.each(function(m){if(m>0){var n=a(this).prop("checked");if(!n){f=false}}else{k=a(this)}});if(k!=null){k.prop("checked",f)}}}}}var j=0;g=d.find("input");g.each(function(n){var m=a(c[n+j]);var o=m.html();if((o==null)||(o=="")){j+=1;m=a(c[n+j])}m.prop("selected",a(this).prop("checked"))});i._updateControlText();if(h!=null){h.focus()}},_sourceSelectChangeHandler:function(c){var b=this,d=this.dropWrapper;d.find("input").val(b.sourceSelect.val());b._updateControlText()},_updateControlText:function(){var c=this,g=this.sourceSelect,d=this.options,f=this.controlWrapper;var h=g.find("option:first");var b=g.find("option");var i=c._formatText(b,d.firstItemChecksAll,h);var e=f.find(".ui-dropdownchecklist-text");e.html(i);e.attr("title",e.text())},_formatText:function(b,d,e){var f;if(a.isFunction(this.options.textFormatFunction)){try{f=this.options.textFormatFunction(b)}catch(c){alert("textFormatFunction failed: "+c)}}else{if(d&&(e!=null)&&e.prop("selected")){f=e.html()}else{f="";b.each(function(){if(a(this).prop("selected")){if(f!=""){f+=", "}var g=a(this).attr("style");var h=a("<span/>");h.html(a(this).html());if(g==null){f+=h.html()}else{h.attr("style",g);f+=a("<span/>").append(h).html()}}});if(f==""){f=(this.options.emptyText!=null)?this.options.emptyText:"&nbsp;"}}}return f},_toggleDropContainer:function(e){var c=this;var d=function(f){if((f!=null)&&f.dropWrapper.isOpen){f.dropWrapper.isOpen=false;a.ui.dropdownchecklist.gLastOpened=null;var h=f.options;f.dropWrapper.css({top:"-33000px",left:"-33000px"});var g=f.controlSelector;g.removeClass("ui-state-active");g.removeClass("ui-state-hover");var j=f.controlWrapper.find(".ui-icon");if(j.length>0){j.removeClass((h.icon.toClose!=null)?h.icon.toClose:"ui-icon-triangle-1-s");j.addClass((h.icon.toOpen!=null)?h.icon.toOpen:"ui-icon-triangle-1-e")}a(document).unbind("click",d);f.dropWrapper.find("input.active").prop("disabled",true);if(a.isFunction(h.onComplete)){try{h.onComplete.call(f,f.sourceSelect.get(0))}catch(i){alert("callback failed: "+i)}}}};var b=function(n){if(!n.dropWrapper.isOpen){n.dropWrapper.isOpen=true;a.ui.dropdownchecklist.gLastOpened=n;var g=n.options;if((g.positionHow==null)||(g.positionHow=="absolute")){n.dropWrapper.css({position:"absolute",top:n.controlWrapper.position().top+n.controlWrapper.outerHeight()+"px",left:n.controlWrapper.position().left+"px"})}else{if(g.positionHow=="relative"){n.dropWrapper.css({position:"relative",top:"0px",left:"0px"})}}var m=0;if(g.zIndex==null){var l=n.controlWrapper.parents().map(function(){var o=a(this).css("z-index");return isNaN(o)?0:o}).get();var i=Math.max.apply(Math,l);if(i>=0){m=i+1}}else{m=parseInt(g.zIndex)}if(m>0){n.dropWrapper.css({"z-index":m})}var j=n.controlSelector;j.addClass("ui-state-active");j.removeClass("ui-state-hover");var h=n.controlWrapper.find(".ui-icon");if(h.length>0){h.removeClass((g.icon.toOpen!=null)?g.icon.toOpen:"ui-icon-triangle-1-e");h.addClass((g.icon.toClose!=null)?g.icon.toClose:"ui-icon-triangle-1-s")}a(document).bind("click",function(o){d(n)});var f=n.dropWrapper.find("input.active");f.prop("disabled",false);var k=f.get(0);if(k!=null){k.focus()}}};if(e){d(a.ui.dropdownchecklist.gLastOpened);b(c)}else{d(c)}},_setSize:function(b){var m=this.options,f=this.dropWrapper,l=this.controlWrapper;var k=b.width;if(m.width!=null){k=parseInt(m.width)}else{if(m.minWidth!=null){var c=parseInt(m.minWidth);if(k<c){k=c}}}var i=this.controlSelector;i.css({width:k+"px"});var g=i.find(".ui-dropdownchecklist-text");var d=i.find(".ui-icon");if(d!=null){k-=(d.outerWidth()+4);g.css({width:k+"px"})}k=l.outerWidth();var j=(m.maxDropHeight!=null)?parseInt(m.maxDropHeight):-1;var h=((j>0)&&(b.height>j))?j:b.height;var e=b.width<k?k:b.width;a(f).css({height:h+"px",width:e+"px"});f.find(".ui-dropdownchecklist-dropcontainer").css({height:h+"px"})},_init:function(){var c=this,d=this.options;if(a.ui.dropdownchecklist.gIDCounter==null){a.ui.dropdownchecklist.gIDCounter=1}c.blurringItem=null;var g=c.element;c.initialDisplay=g.css("display");g.css("display","none");c.initialMultiple=g.prop("multiple");c.isMultiple=c.initialMultiple;if(d.forceMultiple!=null){c.isMultiple=d.forceMultiple}g.prop("multiple",true);c.sourceSelect=g;var e=c._appendControl();c.controlWrapper=e;c.controlSelector=e.find(".ui-dropdownchecklist-selector");var f=c._appendDropContainer(e);c.dropWrapper=f;var b=c._appendItems();c._updateControlText(e,f,g);c._setSize(b);if(d.firstItemChecksAll){c._syncSelected(null)}if(d.bgiframe&&typeof c.dropWrapper.bgiframe=="function"){c.dropWrapper.bgiframe()}c.sourceSelect.change(function(i,h){if(h!="ddcl_internal"){c._sourceSelectChangeHandler(i)}})},_refreshOption:function(e,d,c){var b=e.parent();if(d){e.prop("disabled",true);e.removeClass("active");e.addClass("inactive");b.addClass("ui-state-disabled")}else{e.prop("disabled",false);e.removeClass("inactive");e.addClass("active");b.removeClass("ui-state-disabled")}e.prop("checked",c)},_refreshGroup:function(c,b){if(b){c.addClass("ui-state-disabled")}else{c.removeClass("ui-state-disabled")}},close:function(){this._toggleDropContainer(false)},refresh:function(){var b=this,e=this.sourceSelect,d=this.dropWrapper;var c=d.find("input");var g=d.find(".ui-dropdownchecklist-group");var h=0;var f=0;e.children().each(function(i){var j=a(this);var l=j.prop("disabled");if(j.is("option")){var k=j.prop("selected");var n=a(c[f]);b._refreshOption(n,l,k);f+=1}else{if(j.is("optgroup")){var o=j.attr("label");if(o!=""){var m=a(g[h]);b._refreshGroup(m,l);h+=1}j.children("option").each(function(){var p=a(this);var r=(l||p.prop("disabled"));var q=p.prop("selected");var s=a(c[f]);b._refreshOption(s,r,q);f+=1})}}});b._syncSelected(null)},enable:function(){this.controlSelector.removeClass("ui-state-disabled");this.disabled=false},disable:function(){this.controlSelector.addClass("ui-state-disabled");this.disabled=true},destroy:function(){a.Widget.prototype.destroy.apply(this,arguments);this.sourceSelect.css("display",this.initialDisplay);this.sourceSelect.prop("multiple",this.initialMultiple);this.controlWrapper.unbind().remove();this.dropWrapper.remove()}});a.extend(a.ui.dropdownchecklist,{defaults:{width:null,maxDropHeight:null,firstItemChecksAll:false,closeRadioOnClick:false,minWidth:50,positionHow:"absolute",bgiframe:false,explicitClose:null}})})(jQuery);


//////////////////////////////////
//                              //
// BEGIN REGISTRATION FORM CODE //
//                              //
//////////////////////////////////

(function( $ ) {
		$.widget( "ui.combobox", {
			_create: function() {
				var self = this,
					select = this.element.hide(),
					selected = select.children( ":selected" ),
					value = selected.val() ? selected.text() : "";
				var input = this.input = $( "<input>" )
					.insertAfter( select )
					.val( value )
					.autocomplete({
						delay: 0,
						minLength: 3,
						source: function( request, response ) {
							var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
							response( select.children( "option" ).map(function() {
								var text = $( this ).text();
								if ( this.value && ( !request.term || matcher.test(text) ) )
									return {
										label: text.replace(
											new RegExp(
												"(?![^&;]+;)(?!<[^<>]*)(" +
												$.ui.autocomplete.escapeRegex(request.term) +
												")(?![^<>]*>)(?![^&;]+;)", "gi"
											), "<strong>$1</strong>" ),
										value: text,
										option: this
									};
							}) );
						},
						select: function( event, ui ) {
							ui.item.option.selected = true;
							self._trigger( "selected", event, {
								item: ui.item.option
							});
							select.trigger("change"); 
						},
						change: function( event, ui ) {
							if ( !ui.item ) {
								var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
									valid = false;
								select.children( "option" ).each(function() {
									if ( $( this ).text().match( matcher ) ) {
										this.selected = valid = true;
										return false;
									}
								});
								if ( !valid ) {
									// remove invalid value, as it didn't match anything
									$( this ).val( "" );
									select.val( "" );
									input.data( "autocomplete" ).term = "";
									return false;
								}
							}
						}
					})
					.addClass( "ui-widget ui-widget-content ui-corner-all" );

				input.data( "autocomplete" )._renderItem = function( ul, item ) {
					return $( "<li></li>" )
						.data( "item.autocomplete", item )
						.append( "<a>" + item.label + "</a>" )
						.appendTo( ul );
				};

			},

			destroy: function() {
				this.input.remove();
				/*this.button.remove();*/
				this.element.show();
				$.Widget.prototype.destroy.call( this );
			}
		});
	})( jQuery );

	$(function() {
		$( "#signupleft #id_school,.entryform #id_school,.parentform #id_school" ).combobox();
	});
	
	function signUp(e) {
 	
            e.preventDefault();
            var signup_form = $(e.target);
     
            $("#signup #loader").show();
            $("#signup_submit").attr('disabled','disabled');
     
            $.ajax({
                url: signup_form.attr('action'),
                type: signup_form.attr('method'),
                data: signup_form.serialize(),
                dataType: 'json',
                success: function(json){ // Server success, not necessarily form success!
         	if (json) {
         	 	 $("#signuperrors").html(json.html); // Hide first in case another error is already being displayed. Show contents of JSON key "html"
         	 	 $(".signuperrors").hide();
         	 	 if ($("#signuperrors #returnedusernameerror").length){
         	 	 	 $("#usernameerror").html($("#returnedusernameerror")).fadeIn('slow');
         	 	 	 
         	 	 }
         	 	 if ($("#signuperrors #returnedusertypeerror").length){
         	 	 	 $("#usertypeerror").html($("#returnedusertypeerror")).fadeIn('slow');
         	 	 	 
         	 	 }
         	 	 if ($("#signuperrors #returnedschoolerror").length){
         	 	 	 $("#schoolerror").html($("#returnedschoolerror")).fadeIn('slow');
         	 	 	
         	 	 }
         	 	 if ($("#signuperrors #returnedpassword1error").length){
         	 	 	 $("#password1error").html($("#returnedpassword1error")).fadeIn('slow');
         	 	 	
         	 	 }
         	 	 if ($("#signuperrors #returnedpassword2error").length){
         	 	 	 $("#password2error").html($("#returnedpassword2error")).fadeIn('slow');
         	 	 	 
         	 	 }
         	 	 if ($("#signuperrors #returnedemailerror").length){
         	 	 	 $("#emailerror").html($("#returnedemailerror")).fadeIn('slow');
      
         	 	 }
         	 	  if ($("#signuperrors #returnednonfielderrors").length){
         	 	  	  $("#nonfielderrors").html($("#returnednonfielderrors")).fadeIn('slow');
         	 	  }
         	 	 $('#signup_submit').removeAttr('disabled');
         	 }
         	 else {
         	 	 $("#signup").fadeOut('fast');
         	 	 location.href='/accounts/profile';
         	 }
         	},
         	error: function(xhr, ajaxOptions, thrownError){
      	 	    $("#signuperrors").hide().fadeIn('slow').html("Sorry, an error type " + xhr.status + ", " + xhr.statusText + ", occurred. Please try again later.");
      	 	    $('#signup_submit').removeAttr('disabled');
      	 	},
      	 	complete: function(a, b) {
      		    $("#signup #loader").hide();
      		}
      	    });
      	}     
   
        function logIn(e) {
 	
            e.preventDefault();
            var signup_form = $(e.target);
            var submitURL = signup_form.attr('action');
            var whereIsAjax = signup_form.attr('action').indexOf('ajax');
           
            if (whereIsAjax == -1){
            	    submitURL += "ajax/";
            }
            	    
            $("#signup #loader2").show();
            $("#login_submit").attr('disabled','disabled');
     
            $.ajax({
                url: submitURL,
                type: signup_form.attr('method'),
                data: signup_form.serialize(),
                dataType: 'json',
                success: function(json){ // Server success, not necessarily form success!
         	if (json){
         	 	 $("#loginerrors").fadeIn('slow').html(json.html);
         	 	 $('#login_submit').removeAttr('disabled');
         	}
         	else {
         	$("#signup").fadeOut('fast');
         	location.href=$("#id_next").val();
         	 }
         	},
         	error: function(xhr, ajaxOptions, thrownError){
      	 	    $("#loginerrors").hide().fadeIn('slow').html("Sorry, an error type " + xhr.status + ", " + xhr.statusText + ", occurred. Please try again later.");
      	 	    $('#login_submit').removeAttr('disabled');
      	 	},
      	 	complete: function(a, b) {
      		    $("#signup #loader2").hide();
      		}
      	    });
      	}
      	
      	function customSelect(select){
	   if (!$.browser.opera) {
	   	   select.each(function(){
	   	   		   $(this).attr('title','Pick one');
	   	   });
		select.each(function(){
		    var title = $(this).attr('title');
		    if( $('option:selected', this).val() != ''  ) title = $('option:selected',this).text();
		    $(this)
			.css({'z-index':10,'opacity':0,'-khtml-appearance':'none'})
			.after('<span class="select">' + title + '</span>')
			.change(function(){
			    val = $('option:selected',this).text();
			    $(this).next().text(val);
			    })
		});
	
	    };
   }

      	
//////////////////////////
//                      //
// DOCUMENT.READY BLOCK //
//                      //
//////////////////////////

var dropdown = 0;
  
$(document).ready(function() {
		
    //////////////////////////
    //                      //
    // BEGIN FORMER SITE.JS //
    //                      //
    //////////////////////////

    $("#schoolreqtext").css('color','#999');
    $("#schoolreqtext").focus(function() {
		$(this).val('');
		$(this).css('color','#000');
    });

    // Reveals full posts with "Show More" links
    $(".showMore").click(function(e){
      		      e.preventDefault();
      		      var entry_id = $(this).closest(".entry").attr("id");
      		      if (!entry_id){
      		      	     entry_id = "tag_info";
      		      }
      		      if ($(this).html() == '(show more)'){      		      
      		      	      $("#" + entry_id).find(".truncatedPost").hide();
      		      	      $("#" + entry_id).find(".fullPost").show();
      		      	      $(this).html('(show less)');
      		      }
      		      else {
      		      	      $("#" + entry_id).find(".fullPost").hide();
      		      	      $("#" + entry_id).find(".truncatedPost").show();      		      	      
      		      	      $(this).html('(show more)');
      		      }
      });


    $("#schoolrequest").submit(function(e) {
	schoolRequest(e);
    });
 
    ////////////////////////////
    //                        //
    // BEGIN FORMER DETAIL.JS //
    //                        //
    ////////////////////////////

    $('#leave_comment').click(function(e){
        e.preventDefault();
        $(this).next().slideToggle();
        $(".plusminus").toggleClass("minus");
        $(".plusminus").toggleClass("plus");
    });
   
   
    $(".comment_form").submit(function(e){
   	  submitComment(e);
    });
   
    $(".comment_reply").click(function(e){
	   e.preventDefault();
	   var comment_id = $(this).closest(".comment").attr("id");
	   //comment_id = comment_id.substring(1);
	   $("#" + comment_id + "_reply").html($("#commentformwrapper").clone().css("display","inline-block").attr("id","commentformwrapper_" + comment_id));
	   $("#commentformwrapper_" + comment_id).find("#parent_id").val(comment_id.substr(1));
	   $("#commentformwrapper_" + comment_id).find(".commenterrors").hide();
	   $("#" + comment_id + "_reply").slideToggle();
	   $(".comment_form").unbind('submit').submit(function(e){	  
	       submitComment(e);
	   });
    });
   

   
    //////////////////////////////
    //                          //
    // BEGIN FORMER FEEDBACK.JS //
    //                          //
    //////////////////////////////
    
    $('form#feedbackform').submit(function(e) {
        submitFeedback(e);
    });
    
    $("#id_page,#id_bug").css('color','#555555');

   //////////////////////////////
   //                          //
   // BEGIN FORMER HOMEPAGE.JS //
   //                          //
   //////////////////////////////   
 

   $(".slideshow2").show();
   $(".slideshow3").show();
   
   $('.slideshow').cycle({
		fx:     'fade', 
		speed:   1200, 
		timeout: 6000, 
		next:   '.slideshow', 
		pause:   1 
   });
               
   $(function(){
   	$(".question").tipTip({activation:"click",delay:0});
   });
   
   $('#leave_post').click(function(e){
     e.preventDefault();
     if ($("#entryerrors").html() != '') { $("#entryerrors").slideToggle(); }
     $(".entryformwrapper").slideToggle();
     if (window.dropdown == 0) {
	     $("#id_tags").dropdownchecklist({
		 icon:{},
		 emptyText:'Click me',
		 width:425,
		 onItemClick:function(checkbox, selector){
		     var thisIndex = checkbox.attr("id").split('-')[2].replace('i', '');
		     selector.options[thisIndex].selected = checkbox.attr("checked");
		 }
	     });
	     window.dropdown = 1;
     }
     
     $(".plusminus").toggleClass("minus");
     $(".plusminus").toggleClass("plus");
   
   });
   
   $("form#entrysubmit").submit(function(e){
     submitEntry(e);
   });
   
   customSelect($('.entryform #id_usertype,#signupleft #id_usertype'));
   
   var focusCount = 1;
   if ($("#proof_registered").length){
   	   focusCount = 3;
   	   $("#id_title").css({
   	   		   'color':'#555555',
   	       	           'background-color':'#E9FFEA',
   	       	           'border':'2px solid #0c8903'
   	   });   	   
   }
   else{if ($(".parentform").length){
   	   focusCount = 2;
   	   $('.parentform .ui-autocomplete-input').css({
       	       		       'background':'#E9FFEA',
       	       		       'border':'2px solid #0c8903'
       	       });	   
   }
   }
   $("#id_title").css('color','#555');
   
   $(".entryform #id_usertype,.parentform #id_usertype").change(function(){
       if (focusCount == 1){
       if ($(this).attr('selectedIndex') != 0){
       	       $('span.select').css('background','url(/static/bg_select.gif) no-repeat 0 0');
       	       $('.entryform .ui-autocomplete-input,.parentform .ui-autocomplete-input').css({
       	       		       'background':'#E9FFEA',
       	       		       'border':'2px solid #0c8903'
       	       }).focus();
       	       
       	       focusCount++;
       }
       }
   });
   
   $(".entryform #id_school,.parentform #id_school").change(function() {
 
       if (focusCount == 2){
         
               $('.entryform .ui-autocomplete-input,.parentform .ui-autocomplete-input').css({
       		       'border':'1px solid #ccc',
       		       'background':'#eeeeee url(/static/images/ui-bg_highlight-soft_100_eeeeee_1x100.png) 50% top repeat-x',
       	       });
       	       $("#id_title").css({
       	           'background-color':'#E9FFEA',
   	       	   'border':'2px solid #0c8903'
   	       });
   	       focusCount++;
       	   
       }
   
       
   });
   
   $("#id_title").focus(function(){
   		
   	       if ($(this).val().substr(0,30) == 'Put an eye-catching title or q')
   	       	       {
   	       	       	$(this).val('');
   	       	       }
   	   })
   	   .blur(function(){
   	       if ($(this).val().length < 5 && focusCount >= 3){
   	       	       
   	       	       $(this).val('Put an eye-catching title or quote for your post here.');
   	       	       $(this).css({
   	       	           'color':'#555555',
   	       	           'background-color':'#E9FFEA',
   	       	           'border':'2px solid #0c8903'
   	       	       });
   	       }
   	   })
   	   .keyup(function(){
   	   	if (focusCount == 3){	   
   	   	if ($(this).val().length >= 5){
   	   		if ($('#id_thePost').css('background-color') != '#E9FFEA'){
				$('#id_thePost').css({
				   'color':'#555555',
				   'background-color':'#E9FFEA',
				   'border':'2px solid #0c8903'
			       });
				$(this).css({
				   'color':'#333333',
				   'background-color':'#F1F1F1',
				   'border':'1px solid #AAAAAA'
			       });
				focusCount++;
   	       	        }
   	       	}
   	       	}
   	    });
   	   
   $("#id_thePost").focus(function(){
   		  if ($(this).val().substr(0,30) == 'Your post goes here. You can s'){
   		      $(this).val('');
   		      $(this).css('color','#333');
   		  }
        })
       .blur(function(){
   		   if ($(this).val() == ''){
			$(this).css('color','#555');
			$(this).val('Your post goes here. You can submit anything: questions, comments or complaints; praise, ideas or desires; or anything else you\'d like to share.\n\nTry to make your post thoughtful - something that will lead to a constructive debate.\n\nHTML is not permitted. Line breaks will be retained. URLs will be automatically converted to links.');
		}
	})
       .keyup(function(){
   	   	if (focusCount == 4){	   
   	   	if ($(this).val().length >= 25){
   	   		if ($('#id_thePost').css('background-color') != '#E9FFEA'){
				$('.entryform .ui-dropdownchecklist-selector').css({
				   'color':'#555555',
				   'background':'#E9FFEA',
				   'border':'2px solid #0c8903'
			       });
				$(this).css({
				   'color':'#333333',
				   'background-color':'#F1F1F1',
				   'border':'1px solid #AAAAAA'
			       });
				focusCount++;
   	       	        }
   	       	}
   	       	}
   	    });
       
       $("#id_tags").change(function(){
          if (focusCount == 5){
       	    $('.ui-dropdownchecklist-selector').css({
       	    		    'background':'#eee',
       	    		    'border':'1px solid #ccc'
       	    })
       	    $('#entry_submit_wrapper').css({
       	    		    'background-color':'#e9ffea',
       	    		    'border':'2px solid #0c8903'
       	    });
       	    focusCount++;
       	  }
       });

  
    //////////////////////////////
    //                          //
    // BEGIN FORMER MODERATE.JS //
    //                          //
    //////////////////////////////

    $(".approve").click(function(){
     var entryid = $(this).closest(".entry").attr('id');
     $.ajax({
     		     type:"POST",
     		     url:".",
     		     data: {
     		     	     'action': 'A',
     		     	     'entryid': entryid 
            	     },
            	     success: function(){
            	     	     $("#" + entryid).fadeOut('slow');
            	     }
        });
     });
   
    $(".reject").click(function(){
        var entryid = $(this).closest(".entry").attr('id');
        $.ajax({
     		     type:"POST",
     		     url:".",
     		     data: {
     		     	     'action': 'R',
     		     	     'entryid': entryid
            	     },
            	     success: function(){
            	     	     $("#" + entryid).fadeOut('slow');
            	     }
        });
    });

    
    ///////////////////////////
    //                       //
    // BEGIN FORMER SHARE.JS //
    //                       //
    ///////////////////////////
   	   
    $("#shareErrors").hide();
   
    $("#id_bio").val("<span style='font-family:serif;'>Write your story here.</span>");
   
    $("#share_submit").click(function(e) {
   		   
   	e.preventDefault();  	
   	nicEditors.findEditor('id_bio').saveContent();
   	var content = nicEditors.findEditor('id_bio').getContent().replace(/<.*?>/g, ''); // Strip html tags
        
   	if ($("#id_usertype").length) {	
            if ($("#id_usertype").val() == '') 
            { 
    	      $("#emptyschool").hide();$("#emptystory").hide();$("#emptyemail").hide();$("#emptycity").hide();$("#toolong").hide();$("#tooshort").hide();$("#biolength").hide();
     	      $("#shareErrors").hide().fadeIn('slow');
     	      $("#emptystatus").show();
     	      return 0; 
     	    }
        }
        
        if ($("#id_school").length) {
           if ($("#id_school").val() == '' || $("#id_school").val().length < 6) 
           { 
   	      $("#emptystatus").hide();$("#emptystory").hide();$("#emptyemail").hide();$("#emptycity").hide();$("#toolong").hide();$("#tooshort").hide();$("#biolength").hide();
     	      $("#shareErrors").hide().fadeIn('slow')
     	      $("#emptyschool").show();
     	     return 0; 
     	   }
        }
        
        if ($("#id_schoolCity").length) {
             if ($("#id_schoolCity").val() == '' || $("#id_schoolCity").val().length < 3) 
             { 
   	        $("#emptystatus").hide();$("#emptystory").hide();$("#emptyschool").hide();$("#emptyemail").hide();$("#toolong").hide();$("#tooshort").hide();$("#biolength").hide();
     	        $("#shareErrors").hide().fadeIn('slow')
     	        $("#emptycity").show();
     	        return 0; 
     	     }
        }
        
        if ($("#id_notify").length) {
           if ($("#id_notify").val() == '' || $("#id_notify").val().length < 7) 
           { 
   	      $("#emptystatus").hide();$("#emptystory").hide();$("#emptyschool").hide();$("#emptycity").hide();$("#toolong").hide();$("#tooshort").hide();$("#biolength").hide();
     	      $("#shareErrors").hide().fadeIn('slow')
     	      $("#emptyemail").show();
     	     return 0; 
     	   }
     	}
     	
     	if (content == "Write your story here.")
        {
     	   $("#emptyschool").hide();$("#emptystatus").hide();$("#emptyemail").hide();$("#emptycity").hide();$("#toolong").hide();$("#tooshort").hide();$("#biolength").hide();
   	   $("#shareErrors").hide().fadeIn('slow');
   	   $("#emptystory").show();
   	   return 0; 
   	}
   	
   	// Check if submission is greater than 600 words
   	if (content.split(' ').length > 600) 
   	{ 
   	   $("#emptyschool").hide();$("#emptystatus").hide();$("#emptystory").hide();$("#emptyemail").hide();$("#emptycity").hide();$("#tooshort").hide();
   	   $("#shareErrors").hide().fadeIn('slow');
   	   $("#biolength").html('(Current length: ' + content.split(' ').length + ')');
   	   $("#toolong").show();
   	   $("#biolength").show();
   	   return 0; 
   	}
   	
   	// Check if submission is under 150 words
   	if (content.split(' ').length < 150) 
   	{ 
     	   $("#emptyschool").hide();$("#emptystatus").hide();$("#emptystory").hide();$("#emptyemail").hide();$("#emptycity").hide();$("#toolong").hide();
     	   $("#shareErrors").hide().fadeIn('slow');
   	   $("#biolength").html('(Current length: ' + content.split(' ').length + ')');
   	   $("#tooshort").show();
   	   $("#biolength").show();
     	   return 0; 
     	}
     
        var storyform = $("#storyform");
     
        $.ajax({
            url: storyform.attr('action'),
            type: storyform.attr('method'),
            data: storyform.serialize(),
            dataType: 'json',
            success: function(json){ // Server success, not necessarily form success!
         	 if (json) {
         	 	 $("#shareErrors").hide().fadeIn('slow').html(json.html); // Hide first in case another error is already being displayed. Show contents of JSON key "html"
         	 }
         	 else {
         	 	 $("#storyform").fadeOut('fast');
         	 	 $("#shareErrors").fadeOut('fast');
         	 	 $("#sharesuccess").fadeIn('slow');
         	 }
            },
            error: function(xhr, ajaxOptions, thrownError){
      	 	  $("#shareErrors").hide().fadeIn('slow').html("Sorry, an error type " + xhr.status + ", " + xhr.statusText + ", occurred. Please try again later.");
      	    }
      	});
     
   }); 
  
    //////////////////////////
    //                      //
    // BEGIN FORMER VOTE.JS //
    //                      //
    //////////////////////////

    // Only show entries from the school selected in drodown menu
    $("#id_schoolpicker").change(function(e){
   		   e.preventDefault();
   		   var school_filter = $(this).val();
   		   var current_url = document.URL;
   		   var ending = current_url.slice(-1);
   		   var beginning = '?';
   		   //if (ending != "/") { beginning = "&"; }
   		   window.location.href = beginning + 'school=' + school_filter;
    });
      
    
   // Begin normal entry voting
   $(".upvote").click(function(e){
     e.preventDefault();
     var entryid = $(this).closest(".entry").attr('id');
     var votes = parseInt($("#" + entryid).find('.votes').html());
     
     // send request
     if ($("#" + entryid).find('.upvote').hasClass('active')) {
     	$.ajax({
     		     type:"POST",
     		     url:"/vote/",
     		     data: {
     		     	     'direction': 'up',
     		     	     'entryid': entryid,
            	     },
            	     success: function(){
            	     	     $("#" + entryid).find('.votes').html(votes-1);
            	     	     $("#" + entryid).find('.votes').removeClass("up");
            	     	     $("#" + entryid).find('.upvote').removeClass("active");
            	     }
         });    
     
     }
     
     else if ($("#" + entryid).find('.downvote').hasClass('active')) {
     	$.ajax({
     		     type:"POST",
     		     url:"/vote/",
     		     data: {
     		     	     'direction': 'twoup',
     		     	     'entryid': entryid,
            	     },
            	     success: function(){
            	     	     $("#" + entryid).find('.votes').html(votes+2);
            	     	     $("#" + entryid).find('.votes').removeClass("down");
            	     	     $("#" + entryid).find('.votes').addClass("up");
            	     	     $("#" + entryid).find('.downvote').removeClass("active");
            	     	     $("#" + entryid).find('.upvote').addClass("active");
            	     }
             });    
     
     }
     
     else {
     	     	 $.ajax({
     		     type:"POST",
     		     url:"/vote/",
     		     data: {
     		     	     'direction': 'up',
     		     	     'entryid': entryid,
            	     },
            	     success: function(){
            	     	     $("#" + entryid).find('.votes').html(votes+1);
            	     	     $("#" + entryid).find('.votes').addClass("up");
            	     	     $("#" + entryid).find('.upvote').addClass("active");
            	     }
             }); 
     }
   });
   
    $(".downvote").click(function(e){
        e.preventDefault();
        var entryid = $(this).closest(".entry").attr('id');
        var votes = parseInt($("#" + entryid).find('.votes').html());
     
        // send request
        if ($("#" + entryid).find('.downvote').hasClass('active')) {
     	    $.ajax({
     		     type:"POST",
     		     url:"/vote/",
     		     data: {
     		     	     'direction': 'down',
     		     	     'entryid': entryid,
            	     },
            	     success: function(){
            	     	     $("#" + entryid).find('.votes').html(votes+1);
            	     	     $("#" + entryid).find('.votes').removeClass("down");
            	     	     $("#" + entryid).find('.downvote').removeClass("active");
            	     }
            });    
        }
     
        else if ($("#" + entryid).find('.upvote').hasClass('active')) {
     	    $.ajax({
     		     type:"POST",
     		     url:"/vote/",
     		     data: {
     		     	     'direction': 'twodown',
     		     	     'entryid': entryid,
            	     },
            	     success: function(){
            	     	     $("#" + entryid).find('.votes').html(votes-2);
            	     	     $("#" + entryid).find('.votes').removeClass("up");
            	     	     $("#" + entryid).find('.votes').addClass("down");
            	     	     $("#" + entryid).find('.upvote').removeClass("active");
            	     	     $("#" + entryid).find('.downvote').addClass("active");
            	     }
            });    
        }
     
        else {
     	     $.ajax({
     		     type:"POST",
     		     url:"/vote/",
     		     data: {
     		     	     'direction': 'down',
     		     	     'entryid': entryid,
            	     },
            	     success: function(){
            	     	     $("#" + entryid).find('.votes').html(votes-1);
            	     	     $("#" + entryid).find('.votes').addClass("down");
            	     	     $("#" + entryid).find('.downvote').addClass("active");
            	     }
             }); 
        }
   });
   // End normal entry voting

   // Begin comment voting
   
  

    $(".comment_upvote").click(function(e){
         e.preventDefault();
         var commentid = $(this).closest(".comment").attr('id').substr(1);
         var votes = parseInt($("#c" + commentid).find('.comment_votes').html());
     
         // send request
         if ($("#c" + commentid).find('.comment_upvote').hasClass('active')) {
     	     $.ajax({
     		     type:"POST",
     		     url:"/commentvote/",
     		     data: {
     		     	     'direction': 'up',
     		     	     'commentid': commentid,
            	     },
            	     success: function(){
            	     	     $("#c" + commentid).find('.comment_votes').html(votes-1);
            	     	    
            	     	     $("#c" + commentid).find('.comment_upvote').removeClass("active");
            	     	     checkPlural(votes-1,$("#c" + commentid).find('.plural'));
            	     }
             });    
         }
     
         else if ($("#c" + commentid).find('.comment_downvote').hasClass('active')) {
     	     $.ajax({
     		     type:"POST",
     		     url:"/commentvote/",
     		     data: {
     		     	     'direction': 'twoup',
     		     	     'commentid': commentid,
            	     },
            	     success: function(){
            	     	     $("#c" + commentid).find('.comment_votes').html(votes+2);
            	     	
            	     	     $("#c" + commentid).find('.comment_downvote').removeClass("active");
            	     	     $("#c" + commentid).find('.comment_upvote').addClass("active");
            	     	     checkPlural(votes+2,$("#c" + commentid).find('.plural'));
            	     }
             });    
         }
     
         else {
     	     $.ajax({
     		     type:"POST",
     		     url:"/commentvote/",
     		     data: {
     		     	     'direction': 'up',
     		     	     'commentid': commentid,
            	     },
            	     success: function(){
            	     	     $("#c" + commentid).find('.comment_votes').html(votes+1);
            	     	    
            	     	     $("#c" + commentid).find('.comment_upvote').addClass("active");
            	     	     checkPlural(votes+1,$("#c" + commentid).find('.plural'));
            	     }
             }); 
         }
    });
    $(".comment_downvote").click(function(e){
        e.preventDefault();
        var commentid = $(this).closest(".comment").attr('id').substr(1);
        var votes = parseInt($("#c" + commentid).find('.comment_votes').html());
     
        // send request
        if ($("#c" + commentid).find('.comment_downvote').hasClass('active')) {
     	    $.ajax({
     		     type:"POST",
     		     url:"/commentvote/",
     		     data: {
     		     	     'direction': 'down',
     		     	     'commentid': commentid,
            	     },
            	     success: function(){
            	     	     $("#c" + commentid).find('.comment_votes').html(votes+1);
            	     	    
            	     	     $("#c" + commentid).find('.comment_downvote').removeClass("active");
            	     	     checkPlural(votes+1,$("#c" + commentid).find('.plural'));
            	     }
             });    
        }
     
        else if ($("#c" + commentid).find('.comment_upvote').hasClass('active')) {
            $.ajax({
     		     type:"POST",
     		     url:"/commentvote/",
     		     data: {
     		     	     'direction': 'twodown',
     		     	     'commentid': commentid,
            	     },
            	     success: function(){
            	     	     $("#c" + commentid).find('.comment_votes').html(votes-2);
            	     	 
            	     	     $("#c" + commentid).find('.comment_upvote').removeClass("active");
            	     	     $("#c" + commentid).find('.comment_downvote').addClass("active");
            	     	     checkPlural(votes-2,$("#c" + commentid).find('.plural'));
            	     }
            });    
        }
     
        else {
     	     $.ajax({
     		     type:"POST",
     		     url:"/commentvote/",
     		     data: {
     		     	     'direction': 'down',
     		     	     'commentid': commentid,
            	     },
            	     success: function(){
            	     	     $("#c" + commentid).find('.comment_votes').html(votes-1);
            	     	   
            	     	     $("#c" + commentid).find('.comment_downvote').addClass("active");
            	     	     checkPlural(votes-1,$("#c" + commentid).find('.plural'));
            	     }
             }); 
        }
    });
    // End comment voting
    
    
    //////////////////////////////////
    //                              //
    // BEGIN REGISTRATION FORM CODE //
    //                              //
    //////////////////////////////////
    
    $("#signupform").submit(function(e){	
        signUp(e);
    });
   
    $("#loginform").submit(function(e){	
        logIn(e);
    });
    
    $(".successbox").delay(5000).fadeOut('slow');
    
    ////////////////////////
    //                    //
    // VERIFY STATUS PAGE //
    //                    //
    ////////////////////////
    
    $("#verifyemailform").submit(function(e){
    	verifyEmail(e);
    });
    
    $("#documentUpload2,#documentUpload1").click(function(e){
    	verifyDocument(e);
    });
    
   	   
});
  
  
// Begin Google Analytics code
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-23477375-1']);
_gaq.push(['_trackPageview']);

(function() {
var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
// End Google Analytics code
