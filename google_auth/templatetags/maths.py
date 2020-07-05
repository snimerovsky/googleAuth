from django import template
from exchanges.functions import ExchangeFunc
from exchanges.models import ExchangeType
import json

register = template.Library()

@register.filter
def subtract(value, arg):
    return value - arg

@register.filter
def get_item(dictionary, key):
    if isinstance(dictionary.get(key), float) and dictionary.get(key) != 0:
        return ExchangeFunc.remove_exponent(dictionary.get(key))
    else:
        return dictionary.get(key)

@register.filter
def get_item_array(dictionary, key):
    res  =dict(dictionary).get(key)
    if res == None: res = 0
    return res

@register.filter
def get_coin_name(dictionary, key):
    try:
        name = dictionary.get(key).get('name')
    except:
        name = key
    return name

@register.filter
def get_free_coin(dictionary, key):
    res = dictionary.get(key).get('free')
    if res == 0: return res
    else: return ExchangeFunc.remove_exponent(res)

@register.filter
def get_used_coin(dictionary, key):
    res = dictionary.get(key).get('used')
    if res == 0: return res
    else: return ExchangeFunc.remove_exponent(res)

@register.filter
def get_name(dictionary):
    _id = dictionary.get('typeExchange_id')
    _comment = dictionary.get('comment')
    name = ExchangeType.objects.get(pk=_id)
    res = name.name.title() + _comment.title().replace(' ','')
    return res

@register.filter
def get_id(dictionary):
    return dictionary.get('typeExchange_id')

@register.filter
def get_type_id(dictionary):
    _id = dictionary.get('typeExchange_id')
    name = ExchangeType.objects.get(pk=_id)
    res = '{}-{}'.format(name.name.title(),dictionary.get('id'))
    return res

@register.filter
def get_exchange_id(dictionary):
    return dictionary[0]['id']


@register.filter
def get_exchanges(dictionary):
    res = []
    for data in dictionary:
        _id = data.get('typeExchange_id')
        _comment = data.get('comment')
        name = ExchangeType.objects.get(pk=_id)
        res.append(name.name.title() + _comment.title().replace(' ',''))
        if name.name == 'binance':
            res.append(name.name.title() + _comment.title().replace(' ','')+'-margin')
    return res
    
@register.filter
def get_exchanges_details(dictionary):
    res = []
    for data in dictionary:
        _id = data.get('typeExchange_id')
        _comment = data.get('comment')
        name = ExchangeType.objects.get(pk=_id)
        res.append({'name':name.name.title() + _comment.title().replace(' ',''),'id':'{}-{}'.format(name.name.title(),data.get('id'))})
        if name.name == 'binance':
            res.append({'name':name.name.title() + _comment.title().replace(' ','')+'-margin','id':'{}Margin-{}'.format(name.name.title(),data.get('id'))})
    return res