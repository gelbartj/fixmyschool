from main.models import Entry, School, EmailList, Biography, SchoolReq
from django.contrib import admin

class EntryAdmin(admin.ModelAdmin):
    #prepopulated_fields = {'slug': ('problem',)}
    list_display = ('problem','solution', 'votes', 'usertype', 'school', 'created', 'slug')
    
admin.site.register(Entry, EntryAdmin)
admin.site.register(School)
admin.site.register(EmailList)
admin.site.register(Biography)
admin.site.register(SchoolReq)
