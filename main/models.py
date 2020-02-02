from django.db import models
from datetime import datetime, timedelta
from math import sqrt, log
from exceptions import ValueError
from main.custom import customslugify
from django.template.defaultfilters import slugify


epoch = datetime(1970, 1, 1)

def epoch_seconds(date):
    """Returns the number of seconds from the epoch to date."""
    td = date - epoch
    return td.days * 86400 + td.seconds + (float(td.microseconds) / 1000000)

def reddit_ranking(ups, downs, date):
    s = ups - downs
    order = log(max(abs(s), 1), 10)
    sign = 1 if s > 0 else -1 if s < 0 else 0
    seconds = epoch_seconds(date) - 1305853140
    return round(order + sign * seconds / 45000, 7) 
    
def frontpage_ranking(ups, downs, date):
    total = ups + downs
    age = datetime.now() - date
    age_in_hours = age.days * 24 + age.seconds / 3600
    return  round((total - 1) / (age_in_hours + 2)**1.3, 7)
  
def best_ranking(ups, downs):
    if ups == 0:
        return -downs
    n = ups + downs
    z = 1.64485 #1.0 = 85%, 1.6 = 95% confidence interval
    phat = float(ups) / n
    return (phat+z*z/(2*n)-z*sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n)


class School(models.Model):
	STATE_CHOICES = (
		('AZ', 'Arizona'),
	)
	PUBLISH_CHOICES = (
		('A', 'Approved'),
		('W', 'Waiting'),
	)
	published = models.CharField(max_length=1, choices=PUBLISH_CHOICES)
	name = models.CharField(max_length=40)
	city = models.CharField(max_length=25)
	state = models.CharField(max_length=2, choices=STATE_CHOICES)
	def __unicode__(self):
		return self.name

class Entry(models.Model):
	USER_CHOICES = (
		('S', 'Student'),
		('T', 'Teacher'),
		('A', 'Administrator')
	)
	""" ENTRY_CHOICES = (
		('S', 'Suggestion'),
		('A', 'Anecdote'),
		('C', 'Complaint')
	) """
	PUBLISH_CHOICES = (
		('W', 'Waiting'),
		('A', 'Approved'),
		('R', 'Rejected')
	)
	problemvotes = models.PositiveIntegerField()
	solutionvotes = models.PositiveIntegerField()
	created = models.DateTimeField(auto_now_add=True)
	usertype = models.CharField(max_length=1, choices=USER_CHOICES)
	school = models.ForeignKey(School)
	problem = models.CharField(max_length=400)
	solution = models.CharField(max_length=400,blank=True)
	notify = models.EmailField(blank=True,null=True) #email notification, to be implemented later
	published = models.CharField(max_length=1, choices=PUBLISH_CHOICES)
	slug = models.SlugField(editable=False)
	def best_rank(self):
		return best_ranking(float(self.problemvotes),float(self.solutionvotes))
	def frontpage_rank(self):
		return frontpage_ranking(self.problemvotes,self.solutionvotes,self.created)
	def votes(self):
		return self.problemvotes + self.solutionvotes
	def excerpt(self):
		if self.solution != "I have no idea.":
			return "Problem: %s... Sol\'n: %s.." % (self.problem[:40], self.solution[:40])
		else:
			return "Problem: %s..." % (self.problem[:80])
	def save(self, *args, **kwargs):
		if not self.id:
			self.slug = customslugify(self.problem,30)
		super(Entry, self).save(*args, **kwargs)
	def __unicode__(self):
		return 'Prob: %s... Sol\'n: %s...' % (self.problem[:40],self.solution[:40])
	
	class Meta:
		verbose_name_plural = "Entries"

class Biography(models.Model):
	USER_CHOICES = (
	('S', 'Student'),
	('T', 'Teacher'),
	('A', 'Administrator'),
	('G', 'Recent graduate or former student'),
	)
	EXP_CHOICES = (
	('N', 'Students leave blank'),
	('1', '1-5 years'),
	('5', '5-10 years'),
	('10', 'More than 10 years'),
	)
	PUBLISH_CHOICES = (
		('W', 'Waiting'),
		('A', 'Approved'),
		('R', 'Rejected')
	)
	MONTHS = {
		'1': 'January',
		'2': 'February',
		'3': 'March',
		'4': 'April',
		'5': 'May',
		'6': 'June',
		'7': 'July',
		'8': 'August',
		'9': 'September',
		'10': 'October',
		'11': 'November',
		'12': 'December'
	}
	published = models.CharField(max_length=1, choices=PUBLISH_CHOICES)
	usertype = models.CharField(max_length=1, choices=USER_CHOICES)
	experience = models.CharField(max_length=2, choices=EXP_CHOICES, blank=True, null=True)
	school = models.CharField(max_length=40) # Not using a foreignkey because I want every school to be able to participate
	school_city = models.CharField(max_length=25, blank=True, null=True) 
	bio = models.TextField()
	notify = models.EmailField(blank=True, null=True)
	headline = models.CharField(max_length=100, blank=True, null=True)
	slug = models.SlugField(editable=False,blank=True,null=True)
	featured = models.DateField(blank=True, null=True)
	image = models.CharField(max_length=20, blank=True, null=True)
	def month(self):
		try:
			return self.MONTHS[str(self.featured.month)]
		except KeyError:
			return ''
	def save(self, *args, **kwargs):
		if self.featured and not self.slug:
			if self.headline:
				self.slug = slugify(self.headline)
			else:
				self.slug = customslugify(self.bio, 30)
		super(Biography, self).save(*args, **kwargs)
	def __unicode__(self):
		return self.bio[:50]	
	class Meta:
		verbose_name_plural = "Biographies"
	
class EmailList(models.Model):
	email = models.EmailField()
	def __unicode__(self):
		return self.email

class SchoolReq(models.Model):
	school = models.CharField(max_length=40)
	def __unicode__(self):
		return self.school


