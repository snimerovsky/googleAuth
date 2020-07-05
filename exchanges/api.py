from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .models import ExchangeData, ExchangeType
from users.models import Profile
from django.core import serializers
import json
from django.views.decorators.csrf import csrf_exempt
from .functions import ExchangeFunc

def get_all_exchanges(request):
    user = Profile.objects.filter(user=request.user).get()
    exchanges = serializers.serialize("json", user.exchanges_history.all())
    data = {"exchanges": exchanges}
    exchange_data = json.dumps(data)
    return HttpResponse(exchange_data, content_type='application/json')

def get_user_exchanges(request):
    profile_data = Profile.objects.filter(user=request.user).get()
    data = list(profile_data.exchange.values())
    types = dict()
    for i in data:
        types[i['typeExchange_id']] = ExchangeType.objects.get(pk=i['typeExchange_id']).name
    res = {'data':data,'types':types}
    return JsonResponse(res, safe=False)

@csrf_exempt
def get_user_exchange_api(request):
    body = json.loads(request.body.decode("utf-8"))
    profile_data = Profile.objects.filter(user=request.user).get()
    data = list(profile_data.exchange.filter(id=body['id']).values())
    types = dict()
    for i in data:
        types[i['typeExchange_id']] = ExchangeType.objects.get(pk=i['typeExchange_id']).name
    res = {'data':data,'types':types}
    return JsonResponse(res, safe=False)

@csrf_exempt
def get_range_exchange_api(request):
    user = Profile.objects.filter(user=request.user).get()
    body = json.loads(request.body.decode("utf-8"))
    if body['to'] != '':
        exchanges = serializers.serialize("json", user.exchanges_history.filter(date_time__gte=body['from'],date_time__lte=body['to']).all())
    else:
        exchanges = serializers.serialize("json", user.exchanges_history.filter(date_time__gte=body['from']).all())
    data = {"exchanges": exchanges}
    exchange_data = json.dumps(data)
    return HttpResponse(exchange_data, content_type='application/json')

def get_all_user_history_api(request):
    user = Profile.objects.filter(user=request.user).get()
    exchanges = serializers.serialize("json", user.exchanges_history.all())
    data = {"exchanges": exchanges}
    exchange_data = json.dumps(data)
    return HttpResponse(exchange_data, content_type='application/json')

def get_names_api(request):
    names = ExchangeFunc().get_names()
    data_json = json.dumps(names)
    return HttpResponse(data_json,content_type='application/json')

def get_values(request):
    types = ExchangeFunc().get_values_data()
    return HttpResponse(types,content_type='application/json')

def get_last_user_data_api(request):
    data = ExchangeFunc().get_last_user_data()
    data_json = json.dumps(data)
    return HttpResponse(data_json,content_type='application/json')

@csrf_exempt
def get_last_pnl_api(request):
    body = json.loads(request.body.decode("utf-8"))
    pnl = ExchangeFunc().get_last_pnl(body['pnl_val'],body['benchmark'])
    data_json = json.dumps({'pnl':pnl})
    return HttpResponse(data_json,content_type='application/json')

@csrf_exempt
def get_exchanges_data_api(request):
    body = json.loads(request.body.decode("utf-8"))
    data = ExchangeFunc().get_exchanges_data(body['type'],body['key'],body['secret_key'])
    return HttpResponse(data,content_type='application/json')

@csrf_exempt
def get_exchanges_data_margin_api(request):
    body = json.loads(request.body.decode("utf-8"))
    data = ExchangeFunc().get_exchanges_data_margin(body['type'],body['key'],body['secret_key'])
    return HttpResponse(data,content_type='application/json')

@csrf_exempt
def get_bitmex_positions_api(request):
    body = json.loads(request.body.decode("utf-8"))
    data = ExchangeFunc().get_bitmex_positions(body['type'],body['key'],body['secret_key'])
    data_json = json.dumps(data)
    return HttpResponse(data_json,content_type='application/json')


@csrf_exempt
def get_last_pnl_coin_api(request):
    user = Profile.objects.filter(user=request.user).get()
    body = json.loads(request.body.decode("utf-8"))
    res = ExchangeFunc().get_last_pnl_coin(body['value'],body['type'],body['date'],user,body['id'])
    data_json = json.dumps({'data': res})
    return HttpResponse(data_json,content_type='application/json')

@csrf_exempt
def get_last_pnl_api(request):
    user = Profile.objects.filter(user=request.user).get()
    body = json.loads(request.body.decode("utf-8"))
    res = ExchangeFunc().get_last_pnl(body['value'],body['benchmark'],body['type'],body['date'],user,body['id'])
    data_json = json.dumps({'data': res})
    return HttpResponse(data_json,content_type='application/json')

@csrf_exempt
def get_last_pnl_percent_api(request):
    user = Profile.objects.filter(user=request.user).get()
    body = json.loads(request.body.decode("utf-8"))
    res = ExchangeFunc().get_last_pnl_percent(body['value'],body['benchmark'],body['type'],body['date'],user,body['id'])
    data_json = json.dumps({'data': res})
    return HttpResponse(data_json,content_type='application/json')

@csrf_exempt
def get_last_total_pnl_api(request):
    user = Profile.objects.filter(user=request.user).get()
    body = json.loads(request.body.decode("utf-8"))
    res = ExchangeFunc().get_last_total_pnl(body['value'],body['benchmark'],body['date'],user,body['id'])
    data_json = json.dumps({'data': res})
    return HttpResponse(data_json,content_type='application/json')

@csrf_exempt
def get_last_total_pnl_percent_api(request):
    user = Profile.objects.filter(user=request.user).get()
    body = json.loads(request.body.decode("utf-8"))
    res = ExchangeFunc().get_last_total_pnl_percent(body['value'],body['benchmark'],body['date'],user,body['id'])
    data_json = json.dumps({'data': res})
    return HttpResponse(data_json,content_type='application/json')

@csrf_exempt
def get_user_exchange_date_api(request):
    user = Profile.objects.filter(user=request.user).get()
    body = json.loads(request.body.decode("utf-8"))
    res = ExchangeFunc().get_user_exchange_date(body['date'],user)
    return HttpResponse(res,content_type='application/json')
