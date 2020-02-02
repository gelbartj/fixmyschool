from django import template

register = template.Library()
    
class CookieNode(template.Node):
    def __init__(self, target_dict, cookie_name):
        self.target_dict = template.Variable(target_dict)
        self.cookie_name = template.Variable(cookie_name)

    def render(self, context):
        try:
            actual_target = self.target_dict.resolve(context)
            actual_cookie_name = str(self.cookie_name.resolve(context))
            try:
            	    result = actual_target[actual_cookie_name]
            except TypeError:
            	    raise template.TemplateSyntaxError("First argument of %r tag must be a dictionary" % token.contents.split()[0])
            except KeyError:
            	    return ''
            context['cookie'] = result
	    return ''
        except template.VariableDoesNotExist:
            return ''
    
def cookie_array(parser, token):
    try:
        # split_contents() knows not to split quoted strings.
        tag_name, target_dict, cookie_name = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError("%r tag requires exactly two arguments" % token.contents.split()[0])
    return CookieNode(target_dict, cookie_name) 

register.tag('cookie_array', cookie_array)
