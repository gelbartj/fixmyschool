from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from django.template import Context, loader
from main.models import Entry, EmailList, Biography, SchoolReq, Tag
from main.forms import EntryForm, BiographyForm, EmailListForm, SchoolPickerForm
from customcomments.forms import CustomCommentForm
from customcomments.models import CustomComment
from django.http import HttpResponse, HttpResponsePermanentRedirect, HttpResponseRedirect
from django.contrib.sessions.backends.base import SessionBase
from django.contrib.sites.models import Site
from django.core.mail import send_mail
from django.core.mail import mail_admins
from django.core.urlresolvers import reverse
from django.core.validators import email_re
from django.contrib import messages
from django.http import Http404
from time import time
from datetime import datetime
import simplejson

def index(request, template = 'main/view_entries.html',page_template = 'main/view_entries_page.html'):
	try:
		cookie = request.session['beta']
	except KeyError:
		return HttpResponseRedirect('/beta/')
	else:
		domain = Site.objects.get_current().domain
		school_filter = request.GET.get('school')
		if not school_filter:
			entry_list = Entry.objects.filter(published='A').order_by('-created')
			entries = sorted(entry_list, key=lambda o: o.frontpage_rank(), reverse=True)
		else:
			entry_list = Entry.objects.filter(published='A').filter(school=school_filter).order_by('-created')
			entries = sorted(entry_list, key=lambda o: o.frontpage_rank(), reverse=True)
		form = EntryForm()
		pickerform = SchoolPickerForm(initial={'schoolpicker':school_filter})
		showform = request.GET.get('showform')
		context = {
			'form':form,
			'pickerform':pickerform,
			'domain':domain,
			'entries' : entry_list,
			'page_template': page_template,
			'showform':showform,
		}
		
		if request.is_ajax():
			template = page_template
		if request.session['beta'] == 'first':
			request.session['beta'] = 'second'
		elif request.session['beta'] == 'second':
			request.session['beta'] = 'third'
		return render_to_response(
			template, context, context_instance=RequestContext(request) )

def terms(request):
	return render_to_response("main/terms.html", {'request':request}, context_instance=RequestContext(request))
    
    
def top(request, template = 'main/top.html',page_template = 'main/view_entries_page.html'):
    try:
		cookie = request.session['beta']
    except KeyError:
		return HttpResponseRedirect('/beta/')
    else:
    	    school_filter = request.GET.get('school')
	    if not school_filter:
		entry_list = Entry.objects.filter(published='A').order_by('-upvotes')
		sorted_entry_list = sorted(entry_list, key=lambda o: o.best_rank(), reverse=True)
	    else:
		entry_list = Entry.objects.filter(published='A').filter(school=school_filter).order_by('-upvotes')
		sorted_entry_list = sorted(entry_list, key=lambda o: o.best_rank(), reverse=True)
	    pickerform = SchoolPickerForm(initial={'schoolpicker':school_filter})
	    #entry_list = Entry.objects.filter(published='A').order_by('-upvotes')
	    #sorted_entry_list = sorted(entry_list, key=lambda o: o.best_rank(), reverse=True)
	    domain = Site.objects.get_current().domain
	    
	    if request.is_ajax():
			template = page_template
	    
	    return render_to_response(template, {'entries': sorted_entry_list, 'request':request, 'domain':domain, 'page_template': page_template,'pickerform':pickerform}, context_instance=RequestContext(request))

def best(request, template = 'main/best.html',page_template = 'main/view_entries_page.html'):
    try:
		cookie = request.session['beta']
    except KeyError:
		return HttpResponseRedirect('/beta/')
    else:
	    school_filter = request.GET.get('school')
	    if not school_filter:
		entry_list = Entry.objects.filter(published='A').order_by('-downvotes')
	    else:
		entry_list = Entry.objects.filter(published='A').filter(school=school_filter).order_by('-downvotes')
	    #entry_list = Entry.objects.filter(published='A').order_by('-downvotes')
	    #sorted_entry_list = sorted(entry_list, key=lambda o: o.best_rank(), reverse=True)
	    pickerform = SchoolPickerForm(initial={'schoolpicker':school_filter})
	    domain = Site.objects.get_current().domain
	    
	    if request.is_ajax():
			template = page_template
	    
	    return render_to_response(template, {'entries': entry_list, 'request':request, 'domain':domain, 'page_template': page_template,'pickerform':pickerform}, context_instance=RequestContext(request))

def tags(request, tag_slug=None, template = 'main/tag.html',page_template = 'main/view_entries_page.html'):
    try:
		cookie = request.session['beta']
    except KeyError:
		return HttpResponseRedirect('/beta/')
    else:
    	    if tag_slug:
		    tag = Tag.objects.filter(slug=tag_slug)[0]
		    school_filter = request.GET.get('school')
		    if not school_filter:
			    entry_list = Entry.objects.filter(published='A').filter(tags__slug=tag_slug).order_by('-upvotes')
		    else:
			    entry_list = Entry.objects.filter(published='A').filter(tags__slug=tag_slug).filter(school=school_filter).order_by('-upvotes')
		    pickerform = SchoolPickerForm(initial={'schoolpicker':school_filter})
		    #entry_list = Entry.objects.filter(published='A').order_by('-upvotes')
		    #sorted_entry_list = sorted(entry_list, key=lambda o: o.best_rank(), reverse=True)
		    domain = Site.objects.get_current().domain
		    
		    if request.is_ajax():
				template = page_template
		    
		    return render_to_response(template, {'entries': entry_list, 'tag':tag,'request':request, 'domain':domain, 'page_template': page_template,'pickerform':pickerform}, context_instance=RequestContext(request))
	    else:
	    	    tag_list = Tag.objects.all().order_by('tag')
	    	    return render_to_response("main/taglist.html", {'request':request,'tag_list':tag_list}, context_instance=RequestContext(request))
	    	    
def learn(request):
	learn_list = Tag.objects.filter(tagType='T').order_by('tag')
	return render_to_response("main/learn.html", {'request':request,'learn_list':learn_list}, context_instance=RequestContext(request))

def schoolfilter(request):
	if request.method == 'POST':
		school_filter = request.POST['schoolpicker']
		current_url = request.POST['current']
		new_url = current_url + '?school=' + school_filter
		return HttpResponseRedirect(new_url)

def contact(request):
    try:
		cookie = request.session['beta']
    except KeyError:
		return HttpResponseRedirect('/beta/')
    else:
    	    return render_to_response("main/contact.html", {'request':request}, context_instance=RequestContext(request))
    
def about(request):
    try:
		cookie = request.session['beta']
    except KeyError:
		return HttpResponseRedirect('/beta/')
    else:
    	    return render_to_response("main/about.html", {'request':request}, context_instance=RequestContext(request))
    
def beta(request):
	return HttpResponseRedirect('http://beta2.fixmyschool.net')

def feedback(request):	
    try:
		cookie = request.session['beta']
    except KeyError:
		return HttpResponseRedirect('/beta/')
    else:	
	    if request.method == 'POST':
		    email = request.POST['email']
		    page = request.POST['page']
		    bug = request.POST['bug']
		    mail_admins('Beta feedback', 'Email: %s\nPage: %s\nBug: %s' % (email, page, bug))
		    return HttpResponse(status=200)
	    return render_to_response("main/feedback.html", {'request':request}, context_instance=RequestContext(request))
	  

def moderate(request):
    if request.user.is_superuser:
	    if request.method == 'GET':
		    entry_list = Entry.objects.filter(published='W').order_by('-created')[:10]
		    domain = Site.objects.get_current().domain
		    return render_to_response("main/moderate.html", {'entry_list': entry_list, 'request':request, 'domain':domain,}, context_instance=RequestContext(request))
		
	    if request.method == 'POST':
		    entryid = request.POST['entryid']
		    action = request.POST['action']
		    t = get_object_or_404(Entry, pk=entryid)
		    if action == 'A':
			    t.published = 'A'
			    t.save()
			    if t.notify:
				    send_mail('Your submission to fixmyschool.net', 'Your submission to fixmyschool.net has been approved. You can view it at http://www.fixmyschool.net/' + entryid + '/ . If you have any questions, comments or concerns, you can reply to this message or email contact@fixmyschool.net.',
					    'contact@fixmyschool.net',
					  [entry.notify])
			    return HttpResponse(status=200)
		    if action == 'R':
			    t.published = 'R'
			    t.save()
			    if t.notify:
				    send_mail('Your submission to fixmyschool.net', 'Your submission to fixmyschool.net has been rejected. Please review our submission guidelines. If you have any questions, comments or concerns, you can reply to this message or email contact@fixmyschool.net.', 
					    'contact@fixmyschool.net',
					  [entry.notify])
			    return HttpResponse(status=200)
    else:
   	   return HttpResponseRedirect('/')
		    	    
    
def vote(request):
    if request.method == 'POST': 	    
    	    if request.is_ajax():
		    entryid = request.POST['entryid']
		    try:
		    	    cookie = request.session[entryid]
		    except KeyError:
		    	    cookie = ""   
		    direction = request.POST['direction']
		    t = get_object_or_404(Entry, pk=entryid)
		    if direction == 'up':
			 if not cookie:
				 t.upvotes += 1
				 t.save()
				 request.session[entryid] = "up"
				 return HttpResponse(status=200)
			 t.upvotes -= 1
			 t.save()
			 del request.session[entryid]					
			 return HttpResponse(status=200)
	            elif direction == "twoup":
			 t.upvotes += 1
			 t.downvotes -= 1
			 t.save()
			 request.session[entryid] = "up"
			 return HttpResponse(status=200)
		    elif direction == 'down':
			 if not cookie:
				 t.downvotes += 1
				 t.save()
				 request.session[entryid] = "down"
				 return HttpResponse(status=200)
			 t.downvotes -= 1
			 t.save()
			 del request.session[entryid]					
			 return HttpResponse(status=200)
		    elif direction == 'twodown':
			 t.upvotes -= 1
			 t.downvotes += 1
			 t.save()
			 request.session[entryid] = "down"
			 return HttpResponse(status=200)
		 
	    else:
			action = request.POST['action']
			entryid = action[1:]
			try:
				cookie = request.session[entryid]
			except KeyError:
				cookie = ""   
			t = get_object_or_404(Entry, pk=entryid)
			if action[0] == "u":
				if not cookie:
					t.upvotes += 1
					t.save()
					request.session[entryid] = "up"
					return HttpResponseRedirect(request.POST['current'])
				if cookie == "down":
					t.upvotes += 1
					t.downvotes -= 1
					t.save()
					request.session[entryid] = "up"
					return HttpResponseRedirect(request.POST['current'])
				t.upvotes -= 1
				t.save()
				del request.session[entryid]
				return HttpResponseRedirect(request.POST['current'])
			elif action[0] == "d":
				if not cookie:
					t.downvotes += 1
					t.save()
					request.session[entryid] = "down"
					return HttpResponseRedirect(request.POST['current'])
				if cookie == "up":
					t.upvotes -= 1
					t.downvotes += 1
					t.save()
					request.session[entryid] = "down"
					return HttpResponseRedirect(request.POST['current'])
				t.upvotes += 1
				t.save()
				del request.session[entryid]
				return HttpResponseRedirect(request.POST['current'])	

def commentvote(request):
    if request.method == 'POST': 	    
    	    if request.is_ajax():
		    commentid = request.POST['commentid']
		    try:
		    	    cookie = request.session["c" + commentid]
		    except KeyError:
		    	    cookie = ""   
		    direction = request.POST['direction']
		    t = get_object_or_404(CustomComment, pk=commentid)
		    if direction == 'up':
			 if not cookie:
				 t.upvotes += 1
				 t.save()
				 request.session["c" + commentid] = "up"
				 return HttpResponse(status=200)
			 t.upvotes -= 1
			 t.save()
			 del request.session["c" + commentid]					
			 return HttpResponse(status=200)
	            elif direction == "twoup":
			 t.upvotes += 1
			 t.downvotes -= 1
			 t.save()
			 request.session["c" + commentid] = "up"
			 return HttpResponse(status=200)
		    elif direction == 'down':
			 if not cookie:
				 t.downvotes += 1
				 t.save()
				 request.session["c" + commentid] = "down"
				 return HttpResponse(status=200)
			 t.downvotes -= 1
			 t.save()
			 del request.session["c" + commentid]					
			 return HttpResponse(status=200)
		    elif direction == 'twodown':
			 t.upvotes -= 1
			 t.downvotes += 1
			 t.save()
			 request.session["c" + commentid] = "down"
			 return HttpResponse(status=200)
		 
	    else:
			action = request.POST['action']
			commentid = action[1:]
			try:
				cookie = request.session["c" + commentid]
			except KeyError:
				cookie = ""   
			t = get_object_or_404(CustomComment, pk=commentid)
			if action[0] == "u":
				if not cookie:
					t.upvotes += 1
					t.save()
					request.session["c" + commentid] = "up"
					return HttpResponseRedirect(request.POST['current'])
				if cookie == "down":
					t.upvotes += 1
					t.downvotes -= 1
					t.save()
					request.session["c" + commentid] = "up"
					return HttpResponseRedirect(request.POST['current'])
				t.upvotes -= 1
				t.save()
				del request.session["c" + commentid]
				return HttpResponseRedirect(request.POST['current'])
			elif action[0] == "d":
				if not cookie:
					t.downvotes += 1
					t.save()
					request.session["c" + commentid] = "down"
					return HttpResponseRedirect(request.POST['current'])
				if cookie == "up":
					t.upvotes -= 1
					t.downvotes += 1
					t.save()
					request.session["c" + commentid] = "down"
					return HttpResponseRedirect(request.POST['current'])
				t.upvotes += 1
				t.save()
				del request.session["c" + commentid]
				return HttpResponseRedirect(request.POST['current'])	

def detail(request, entry_id, entry_slug=None):
    try:
		cookie = request.session['beta']
    except KeyError:
		return HttpResponseRedirect('/beta/')
    else:
	    entry = get_object_or_404(Entry, pk=entry_id)
	    domain = Site.objects.get_current().domain
	    form = CustomCommentForm(entry)
	    showform = request.GET.get('showform')
	    if entry_slug == entry.slug:
		    return render_to_response("main/detail.html", {'entry': entry, 'request':request, 'domain':domain, 'form':form,'showform':showform}, context_instance=RequestContext(request))
	    else:
		    return HttpResponsePermanentRedirect("/" + str(entry.id) + "/" + str(entry.slug) + "/")

def schoolreq(request):
    if request.method == 'POST':
	    formschool = request.POST['school']
	    next = request.POST['next']
	    try:
		    cookie = request.session['schoolreq']
	    except KeyError:
		    cookie = None
	    if cookie:
		    if request.is_ajax():
			    response = simplejson.dumps({'success':'false','html':'You can only vote once!'})
			    return HttpResponse(response,content_type="application/javascript")
		    else:
		    	    messages.error(request, 'You can only vote once!')
		    	    return  HttpResponseRedirect(next)
	    else:
	    	    if formschool != '' and formschool != "Your school name":
			    newReq = SchoolReq(school=formschool)
			    newReq.save()
			    request.session['schoolreq'] = formschool
			    if request.is_ajax():
				    return HttpResponse(status=200)
			    else:
				    messages.success(request, '')
				    return  HttpResponseRedirect(next) 
		    else:
		    	    messages.error(request, 'Please enter your school\'s name.')
		    	    return  HttpResponseRedirect(next)

def bios(request, bio_year, bio_month, bio_slug):
    try:
		cookie = request.session['beta']
    except KeyError:
		return HttpResponseRedirect('/beta/')
    else:
	    if not bio_year and not bio_month and not bio_slug:
		    try:
		    	    bio = Biography.objects.defer('bio').filter(published='A').latest('featured')
		    except Biography.DoesNotExist:
		    	    raise Http404
		    return HttpResponseRedirect("/bios/" + str(bio.featured.year) + "/" + str(bio.featured.month) + "/" + bio.slug + "/")
	    if bio_year and bio_month and not bio_slug:
	    	    try:
	    	    	    bio = Biography.objects.defer('bio').filter(published='A').filter(featured__year=bio_year).filter(featured__month=bio_month).latest('featured')
		    except Biography.DoesNotExist:
		    	    raise Http404
		    return HttpResponsePermanentRedirect("/bios/" + str(bio.featured.year) + "/" + str(bio.featured.month) + "/" + bio.slug + "/")
	    if bio_year and not bio_month and not bio_slug:
	    	    bio_list = Biography.objects.defer('bio').filter(published='A').filter(featured__year=bio_year)
		    if not bio_list:
		    	    raise Http404
		    return render_to_response("main/bioyear.html", {'bio_list': bio_list, 'request': request, 'bio_year': bio_year}, context_instance=RequestContext(request))
	    if bio_year and bio_month and bio_slug:	    
		    try:
		    	    bio = Biography.objects.defer('bio').filter(slug=bio_slug).latest('featured')
		    except Biography.DoesNotExist:
		    	    raise Http404
		    #get_object_or_404(Biography, pk=bio_id)
	    form = CustomCommentForm(bio)
	    latest = False
	    if bio == Biography.objects.defer('bio').filter(published='A').latest('featured'):
		    latest = True
	    earliest = False
	    if bio.featured.year == 2011 and bio.featured.month == 11:
	    	    earliest = True
	    showform = request.GET.get('showform')
	    return render_to_response("main/bio.html", {'bio': bio, 'earliest':earliest,'form':form, 'latest':latest, 'request':request,'showform':showform}, context_instance=RequestContext(request))

def share(request):
    try:
		cookie = request.session['beta']
    except KeyError:
		return HttpResponseRedirect('/beta/')
    else:
	    form = BiographyForm(request.POST or None)
	    if request.method == 'POST':
		    if form.is_valid():
			    e = form.save(commit=False)
			    e.published = 'W'
			    e.save()
			    if request.is_ajax():
				    return HttpResponse(status=200)
			    else:
				    return render_to_response("main/sharethanks.html", {'request':request}, context_instance=RequestContext(request))
		    else:
			    if request.is_ajax():	
				    response = simplejson.dumps({'success':'False','html':form.errors.as_ul()})
				    return HttpResponse(response,content_type="application/javascript")
	    return render_to_response("main/share.html", {'request':request,'form':form}, context_instance=RequestContext(request)) 
	  
def teaser(request):
    if request.method == 'POST':
    	formemail = request.POST['email']
        if email_re.match(formemail):
		try:
			new_email_object = EmailList.objects.get(email=formemail)
		except EmailList.DoesNotExist:
			newemail = EmailList(email=formemail)
			newemail.save()
			send_mail('Confirmation from fixmyschool.net', 'Dear education reformer,\n\nThank you for subscribing to our notification list. This list will be used to notify you of major updates to fixmyschool.net. We will never sell or distribute your e-mail address. If you have a spam filter, please make sure to add contact@fixmyschool.net to your accepted addresses list.\n\nOur state will have a great education system when its people start to demand it--you are now part of that movement. Thank you for your support.\n\nSincerely,\nThe fixmyschool.net team\n\n---\nwww.facebook.com/fixmyschool\nTwitter @fixmyschool',
    	    	    	    	    'fixmyschool.net <contact@fixmyschool.net>',
    	    	    	    	    [formemail])
			if request.is_ajax():
				return HttpResponse(status=200) 
			else:
				return render_to_response("main/teaserthanks.html", {'request':request}, context_instance=RequestContext(request))
		except EmailList.MultipleObjectsReturned:
			pass # The next few lines of code handle this
		if request.is_ajax():
			response = simplejson.dumps({'success':'False','html':'You are already on our list. Thank you for your support.'})
			return HttpResponse(response,content_type="application/javascript")
		else:
			return  render_to_response("main/teaser.html", {'request':request,'errors':'You are already on our list. Thank you for your support.'}, context_instance=RequestContext(request)) 
        else:
		return render_to_response("main/teaser.html", {'request':request,'errors':'Please enter a valid e-mail address.'}, context_instance=RequestContext(request))
    return render_to_response("main/teaser.html", {'request':request,}, context_instance=RequestContext(request)) 

def submit(request):
    if request.method == 'POST':
    	    form = EntryForm(request.POST or None)
    	    if not request.POST['honeypot']:
		    try:
			    time_since_last_post = time() - float(request.session['submitted']) # Check if user has previously submitted an entry
		    except (KeyError, TypeError, ValueError): # Cookie does not exist
			    time_since_last_post = None
		    finally:    	    
			    if not time_since_last_post or time_since_last_post >= 10: #57600: # Prevent submission more than once in 16 hours
				    if form.is_valid():
					    e = form.save(commit=False)
					    e.upvotes = 1
					    e.downvotes = 0
					    e.published = 'A' # Change to "W" before launch
					    #e.notify = ''
					    #if e.solution == '' or e.solution[:46] == 'Have an idea of how your school can do better?':
					    #	    e.solution = 'I have no idea.'
					    e.thePost = unicode(e.thePost).encode('utf-8', 'ignore')
					    #e.problem = unicode(e.problem).encode('utf-8', 'ignore')
					    e.save()
					    form.save_m2m()
					    entry_id = str(e.id)
					    request.session[entry_id] = "up"
					    request.session['submitted'] = str(time())
					    if request.is_ajax():
						    return HttpResponse(status=200)
					    else:
						    request.session['errors'] = ''
						    messages.success(request, "Thank you for sending your thoughts to fixmyschool.net. Your submission is now awaiting moderation. Please check back in the next hour or two to see if your post has been approved.")
						    return HttpResponseRedirect('/')
				    else: 						      
					    html = form.errors.as_ul()
					    if request.is_ajax():
						    response = simplejson.dumps({'success':'False','html':html})
						    return HttpResponse(response,content_type="application/javascript")
					    else:
						    request.session['errors'] = html
						    return HttpResponseRedirect("/?showform=True#form")
					   
			    else: # User is trying a repeat submission in less than 16 hrs
				    html = "While we appreciate your dedication to fixmyschool.net,<br> only one submission per hour is permitted during the beta. Once the site launches, the limit will decrease to one submission per day. Please try again later."
				    response = simplejson.dumps({'success':'False','html':html})
				    return HttpResponse(response,content_type="application/javascript")
	    else:
	    	    return HttpResponse(status=403) #spambot trying to submit form
