import re
from django.template.defaultfilters import stringfilter
from django.utils.safestring import mark_safe, SafeData

COMMON_WORDS = ('the','to','of','and','a','in','that','i','me','it','for','on','with','he','him','they','them','as','at','this','but','his','by','from','her','she','or','an','will','would','there','their','what','thier','wut','so','who','which','theres','id','ive','its','these','any','my','our','ours','your','yours','how','is','are','am','be','us','we','was','when','up','about','today','yesterday','tomorrow','have','can','do','all')
ENDINGS = ('\t','\n','\r','\f','\v',' ')

def inwordlist(element):
	return element in COMMON_WORDS

def customslugify(value,length=30):
	""" Remove most common English words from input and truncate to nearest space """
	import unicodedata
	value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore')
	value = unicode(re.sub('[^\w\s-]', '', value).strip().lower())
	split = value.split()
	cleaned = [x for x in split if not inwordlist(x)] # Remove common words from list
	full_result = ' '.join(cleaned) # Turn list back into a string
	
	# Begin portion to find nearest space or punctuation to user-defined length
	if length <= 0 or length != int(length):
		raise ValueError("Second argument must be a positive integer.")
	truncated = full_result[:length]
	remainder = full_result[length:]
	reverseposition = 0
	forwardposition = 0
	for i,e in reversed(list(enumerate(truncated))):
		if e in ENDINGS:
			reverseposition = i
			break
	for i,e in list(enumerate(remainder)):
		if e in ENDINGS:
			forwardposition = length + i
			break
	reversedistance = abs(length-reverseposition)
	forwarddistance = abs(forwardposition-length)
	crop = 0
	if cmp(reversedistance, forwarddistance) == 1:
		crop = forwardposition
	elif cmp(reversedistance, forwarddistance) == -1:
		crop = reverseposition
	elif cmp(reversedistance, forwarddistance) == 0:
		crop = forwardposition
	if reverseposition == 0:
		crop = forwardposition # Make sure that at least one word is always returned, even for length=1
	if forwardposition == 0:
		if length >= len(value): 
			crop = len(value) # Ensures that final words are included even if there is no ending punctuation
		else:
			crop = reverseposition # User-defined length cuts off word, so find closest punctuation behind it
	preslugified = full_result[:crop]
	if preslugified == '':
		preslugified = value[:length]
	return mark_safe(re.sub('[-\s]+', '-', preslugified))
customslugify.is_safe = True
customslugify = stringfilter(customslugify)
