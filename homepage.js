$(document).ready(function() {
	var dropdown = 0;	
	
/* Homepage */

   $(".slideshow2").show();
   $(".slideshow3").show();
   
    $('.slideshow').cycle({
		fx:     'fade', 
		speed:   1200, 
		timeout: 6000, 
		next:   '.slideshow', 
		pause:   1 
	});
   
  
	/*	
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
            var data = "querystring_key=" + $(this).attr("rel").split(" ")[0];
            $(this).closest(".endless_page_template").load($(this).attr("href"), data);
            return false;
        }); 
        */
        
        
   $(function(){
   		   $(".question").tipTip({activation:"click",delay:0});
   });
   
   $('#leave_post').click(function(e){
     e.preventDefault();
     if ($("#entryerrors").html() != '') { $("#entryerrors").slideToggle(); }
     $(".entryformwrapper").slideToggle();
     if (dropdown == 0) {
     	     $("#id_tags").dropdownchecklist({icon:{},emptyText:'Click me',width:425,onItemClick:function(checkbox, selector){
		var thisIndex = checkbox.attr("id").split('-')[2].replace('i', '');
		selector.options[thisIndex].selected = checkbox.attr("checked");
		}
	     });
	     dropdown = 1;
	     }
     
     
     //$(this).next().slideToggle();
     $(".plusminus").toggleClass("minus");
     $(".plusminus").toggleClass("plus");
   });
   
   function submitEntry(e) {
     e.preventDefault();
     var entry_form = $(e.target);
     // Begin form validation
     if ($("#id_usertype").val() == '') { $("#entryerrors").hide().fadeIn('slow').html('<p>Please select an option from the "I am a" dropdown menu.</p>'); return 0; }
     if ($("#id_school").val() == '') { $("#entryerrors").hide().fadeIn('slow').html('<p>Please select a school from the "I go to or work at" menu.</p>'); return 0; }
     if ($("#id_title").val().substr(0,19) == "Put an eye-catching") {$("#entryerrors").hide().fadeIn('slow').html('<p>Please include a title for your post.</p>'); return 0; } 
     if ($("#id_title").val() == "") {$("#entryerrors").hide().fadeIn('slow').html('<p>Please include a title for your post.</p>'); return 0; } 
     if ($("#id_title").val().length > 110) { $("#entryerrors").hide().fadeIn('slow').html('<p>Please ensure that your title is no more than 110 characters long. <br><span style="font-weight:normal;font-size:95%;">(Current length: ' + document.getElementById("id_title").value.length + ')</span></p>'); return 0; }
     if ($("#id_title").val().length < 5) { $("#entryerrors").hide().fadeIn('slow').html('<p>Please make your title at least 5 characters long. (Come on...) <br><span style="font-weight:normal;font-size:95%;">(Current length: ' + document.getElementById("id_title").value.length + ')</span></p>'); return 0; }
     if ($("#id_thePost").val().substr(0,20) == "Your post goes here.") {$("#entryerrors").hide().fadeIn('slow').html('<p>Please write something before submitting this form.</p>'); return 0; } 
     if ($("#id_thePost").val() == "") {$("#entryerrors").hide().fadeIn('slow').html('<p>Please write something before submitting this form.</p>'); return 0; } 
     if ($("#id_thePost").val().length > 1000) { $("#entryerrors").hide().fadeIn('slow').html('<p>Please ensure that your post is no more than 1,000 characters long. <br><span style="font-weight:normal;font-size:95%;">(Current length: ' + document.getElementById("id_thePost").value.length + ')</span></p>'); return 0; }
     if ($("#id_thePost").val().length < 25) { $("#entryerrors").hide().fadeIn('slow').html('<p>Please ensure that your post is at least 25 characters long. <br><span style="font-weight:normal;font-size:95%;">(Current length: ' + document.getElementById("id_thePost").value.length + ')</span></p>'); return 0; }
     
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
   
   
   $("form#entrysubmit").submit(function(e){
     submitEntry(e);
   });
   
});
