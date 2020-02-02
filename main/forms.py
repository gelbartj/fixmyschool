from django import forms
from main.models import School, Entry, Biography, EmailList
from django.contrib.comments.forms import CommentForm

class SlimCommentForm(CommentForm):	
        def __init__(self, *args, **kwargs):
        	super(SlimCommentForm, self).__init__(*args, **kwargs) # Call to ModelForm constructor
		self.fields['comment'].widget.attrs['cols'] = 60
		self.fields['comment'].widget.attrs['rows'] = 6

#SlimCommentForm.base_fields.pop('url')
#SlimCommentForm.base_fields.pop('email')


class EntryForm(forms.ModelForm):
    USER_CHOICES = (
    	    	('', 'Pick one'),
		('S', 'Student'),
		('T', 'Teacher'),
		('A', 'Administrator')
    )
    usertype = forms.ChoiceField(label='I am a')
    usertype.choices = USER_CHOICES
    #entrytype = ChoiceField(label='I have a')
    #entrytype.choices = ENTRY_CHOICES
    school = forms.ModelChoiceField(queryset=School.objects.filter(published='A').order_by('name'), label='I go to or work at', empty_label='Pick one')
    
    class Meta:
        model = Entry
        fields = ('usertype','school','problem', 'solution')
        widgets = {
            'problem': forms.Textarea(attrs={'cols': 75, 'rows': 5, 'onFocus':'if(this.value.substr(0,39)==\'Try to give specific examples of issues\'){this.value = \'\';this.style.color=\'#000000\';}'}),
            'solution': forms.Textarea(attrs={'cols': 75, 'rows': 5, 'onFocus':'if(this.value.substr(0,46)==\'Have an idea of how your school can do better?\'){this.value = \'\';this.style.color=\'#000000\';}'}),
        }
	
class BiographyForm(forms.ModelForm):
	USER_CHOICES = (
	('', 'Pick one'),
	('S', 'Student'),
	('T', 'Teacher'),
	('A', 'Administrator'),
	('G', 'Recent grad or former student'),
	)
	EXP_CHOICES = (
	('', 'Students leave blank'),
	('1', '1-5 years'),
	('5', '5-10 years'),
	('10', 'More than 10 years'),
	)
	usertype = forms.ChoiceField(label='My status')
	usertype.choices = USER_CHOICES
	experience = forms.ChoiceField(label='My experience', required=False)
	experience.choices = EXP_CHOICES
	class Meta:
		model = Biography
		fields = ('usertype','experience','school', 'bio')
		widgets = {'bio': forms.Textarea(attrs={'cols':75,'rows':20}),'school':forms.TextInput(attrs={'size':40})}
	#def clean_bio(self):
	#	data = self.cleaned_data['bio']
	#	if data == "<br>":
	#		raise forms.ValidationError("This field is required.")
	#	if data == "<span style='font-family:serif;'>Write your story here.</span>":
	#		raise forms.ValidationError('Please enter your story in the field below.')
	#	if len(data) > 4000:
	#		raise forms.ValidationError('Your story exceeds 4000 characters. Please shorten it to that limit or email the full text to <a class="red" href="mailto:biography&#64;fixmyschool&#46.net">biography@fixmyschool.net</a>')
	#	if len(data) < 350:
	#		raise forms.ValidationError('Your story is a bit short. Could you add some more detail?')
	#	return data
		
class EmailListForm(forms.ModelForm):
	email = forms.EmailField(max_length=75, min_length=7)
	class Meta:
		model = EmailList

