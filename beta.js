function submitKey(e) {
	e.preventDefault();
	var keyform = $(e.target);
        $("#errors").hide();
        var keyVal = $("#id_key").val();
        if(keyVal == '') {
            $("#errors").hide().fadeIn('slow').html('<p>Please enter your invite key in the box below.</p>');
            return false;
        }
 
        else {
        	$("#loader").show();
        	$('.redbutton').attr('disabled', 'disabled');
        }
        $.ajax({
         url: '.',
         type: keyform.attr('method'),
         data: keyform.serialize(),
         dataType: 'json',
         success: function(json){ // Server success, not necessarily form success!
         	 if (json) {
         	 	 if (json.success == "false") {
         	 	 $("#errors").hide().fadeIn('slow').html(json.html); // Hide first in case another error is already being displayed. Show contents of JSON key "html"
         	 	 $('.redbutton').removeAttr('disabled');
         	 	 }
         	 }
         	 else {
         	 	 window.location.href = '/';
         	 }
      	 },
      	 error: function(xhr, ajaxOptions, thrownError){
      	 	  $("#errors").hide().fadeIn('slow').html("Sorry, an error type " + xhr.status + ", " + xhr.statusText + ", occurred. Please try again later.");
      	 	  $('.redbutton').removeAttr('disabled');
      	 },
      	 complete: function(a, b) {
      		$("#loader").hide();
      		
      	}
      	});
}

$(document).ready(function() { 
 
    $('form#keyform').submit(function(e) {
        submitKey(e);
     });
 
});

/* Begin Google Analytics code */
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-23477375-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
/* End Google Analytics code */
