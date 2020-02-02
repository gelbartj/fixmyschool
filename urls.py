from django.conf.urls.defaults import *
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'^$', 'main.views.index'),
    (r'^bios/(?P<bio_year>\d*)(/(?P<bio_month>\d*)/(?P<bio_slug>[-\w]*)/)?$', 'main.views.bios'),
    (r'^share/$', 'main.views.share'),
    (r'^moderate/$', 'main.views.moderate'),
    ##(r'^topschools/$', 'main.views.topschools'),
    (r'^admin/', include(admin.site.urls)),
    (r'^top/$', 'main.views.top'),
    (r'^best/$', 'main.views.best'),
    (r'^vote/$', 'main.views.vote'),
    (r'^submit/$', 'main.views.submit'),
    (r'^comments/', include('django.contrib.comments.urls')),
    (r'^(?P<entry_id>\d+)/(?P<entry_slug>[-\w]*)/?$', 'main.views.detail'),
    (r'^teaser/$', 'main.views.teaser'),
    (r'^schoolreq/$', 'main.views.schoolreq'),
    (r'^contact/$', 'main.views.contact'),
    (r'^about/$', 'main.views.about'),
    (r'^beta/$', 'main.views.beta'),
    (r'^feedback/$', 'main.views.feedback'),
    (r'^terms/$', 'main.views.terms'),
    
)
