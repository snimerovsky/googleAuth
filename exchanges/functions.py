from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.sessions.backends.db import SessionStore
from .models import ExchangeData,ExchangeType
from users.models import Profile
from threading import Thread
from decimal import Decimal, getcontext
import time
import json
import ccxt
import datetime

session_key = ''

class ExchangeFunc:
    def get_exchange_type(self, _type,key,secret):
        exchange_id = _type.lower()
        exchange_class = getattr(ccxt, exchange_id)
        exchange = exchange_class({
            'apiKey': key,
            'secret': secret,
            'verbose': True,
            'enableRateLimit': True,
        })
        return exchange


    def get_exchanges_data(self, _type,key,secret):
        exchange = self.get_exchange_type(_type,key,secret)
        data = exchange.fetch_balance()
        return json.dumps(data)

    def get_exchanges_data_margin(self, _type,key,secret):
        exchange = self.get_exchange_type(_type,key,secret)
        data = exchange.fetch_balance(params={'type': 'margin'})
        return json.dumps(data)

    def is_valid_exchange(self, _type,key,secret):
        exchange_id = _type.lower()
        exchange_class = getattr(ccxt, exchange_id)
        exchange = exchange_class({
            'apiKey': key,
            'secret': secret,
            'verbose': True,
            'enableRateLimit': True,
        })
        print(exchange)
        data = exchange.fetch_balance()

    def get_values_data(self):
        global session_key
        try:
            s = SessionStore(session_key=session_key)
            currency = s['tickers']
        except:
            self.set_tickers()
            s = SessionStore(session_key=session_key)
            currency = s['tickers']
        return json.dumps(currency)


    def set_tickers(self):
        global session_key
        if session_key:
            s = SessionStore(session_key=session_key)
            s.delete()
        exchange = ccxt.binance()
        s = SessionStore()
        s['tickers'] = exchange.fetch_tickers()
        s.create()
        session_key = s.session_key


    def get_last_user_data(self):
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        last_exchange = ExchangeData.objects.filter(
            date__gte=yesterday).first().get_data()
        return last_exchange


    def get_bitmex_positions(self, _type,key,secret):
        exchange = self.get_exchange_type(_type,key,secret)
        data = [i for i in exchange.private_get_position() if i['isOpen'] == True]
        return data

    def get_user_exchange_date(self, date,user):
        exchanges = user.exchanges_history.all()
        exchange = exchanges.filter(date_time__gte=date).first().get_data()
        return json.dumps(exchange)

    def get_last_pnl_coin(self, val,_type,date,user,_id):
        exchanges = user.exchanges_history.all()
        pnl_value = 0
        try:
            exchange = exchanges.filter(date_time__gte=date).first().get_data()
            value = exchange[_id]['coins'][_type]['total']
            pnl_value = self.remove_exponent(float(val)-float(value))      
        except:
            pnl_value = val
        return pnl_value

    def get_last_pnl(self, val, benchmark,_type,date,user,_id):
        exchanges = user.exchanges_history.all()
        pnl_value = 0
        try:
            exchange = exchanges.filter(date_time__gte=date).first().get_data()
            value = exchange[_id]['coins'][_type]['{}_value'.format(benchmark)]
            pnl_value = self.remove_exponent(float(val)-float(value))     
        except:
            pnl_value = val
        return pnl_value

    def get_last_pnl_percent(self, val, benchmark,_type,date,user,_id):
        exchanges = user.exchanges_history.all()
        pnl_value = 0
        try:
            exchange = exchanges.filter(date_time__gte=date).first().get_data()
            value = exchange[_id]['coins'][_type]['{}_value'.format(benchmark)]
            pnl_value = self.remove_exponent(float((float(val)-float(value))/float(value))*100)   
        except:
            pnl_value = val
        return pnl_value

    def get_last_total_pnl(self, val, benchmark,date,user,_id):
        exchanges = user.exchanges_history.all()
        pnl_value = 0
        try:
            exchange = exchanges.filter(date_time__gte=date).first().get_data()
            value = exchange[_id]['total{}'.format(benchmark)]
            pnl_value = self.remove_exponent(
                float(val)-float(value)
            )
        except:
            pnl_value = val
        return pnl_value

    def get_last_total_pnl_percent(self, val, benchmark,date,user,_id):
        exchanges = user.exchanges_history.all()
        pnl_value = 0
        try:
            exchange = exchanges.filter(date_time__gte=date).first().get_data()
            value = exchange[_id]['total{}'.format(benchmark)]
            pnl_value = self.remove_exponent(
                float((float(val)-float(value))/float(value))*100
            )      
        except:
            pnl_value = val
        return pnl_value

    def remove_exponent(self, value):
        decimal_places = 16
        max_digits = 16

        if isinstance(value, Decimal):
            context = getcontext().copy()
            context.prec = max_digits
            return "{0:f}".format(value.quantize(Decimal(".1") ** decimal_places, context=context))
        else:
            return "%.*f" % (decimal_places, value)

    def get_names(self):
        cmc = ccxt.bittrex()
        names = cmc.fetchCurrencies()
        return names

    def get_benchmark_values(self, type_currency, value_currency,benchmark,res_values):
        res = 0
        try:
            btc = res_values['{}/{}'.format(type_currency,benchmark)]["last"]
            res = self.remove_exponent(float(value_currency) * float(btc))
        except:
            try:
                btc = res_values['{}/{}'.format(benchmark,type_currency)]["last"]
                res = self.remove_exponent(float(value_currency) / float(btc))
            except:
                if type_currency == benchmark:
                    res = self.remove_exponent(float(value_currency))
        return res

    def add_exchange_data(self):
        profiles = Profile.objects.all()
        for user in profiles:
            if len(user.exchange.values()) > 0:
                res_data = self.add_exchange_data_user(user)
                new_data = ExchangeData(
                    data=res_data
                )
                new_data.save()
                user.exchanges_history.add(new_data)

    def add_exchange_data_user(self, user):
        values_data = self.get_values_data()
        values_data = json.loads(values_data)
        currencies = ['BTC','USDT']
        res_data = {}
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        totalBTC = 0
        totalUSDT = 0
        for data in user.exchange.values():
            yesterday = datetime.date.today() - datetime.timedelta(days=1)
            totalBTC = 0
            totalUSDT = 0
            typeExchange = ExchangeType.objects.get(pk=data['typeExchange_id'])
            res_data['{}-{}'.format(typeExchange,data['id'])] = {'coins':{},'allocate':{}}
            if typeExchange.name == 'binance':
                exchange_data_margin = self.get_exchanges_data_margin(typeExchange.name,data['key'],data['secret_key'])
                exchange_data_margin = json.loads(exchange_data_margin)
                res_data['{}Margin-{}'.format(typeExchange,data['id'])] = {'coins':{},'allocate':{}}
                for i in exchange_data_margin['total']:
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i] = exchange_data_margin[i]
                    btc_res = self.get_benchmark_values(i,exchange_data_margin[i]['total'],'BTC',values_data)
                    usdt_res = self.get_benchmark_values("BTC",btc_res,"USDT",values_data)
                    totalBTC += float(self.remove_exponent(float(btc_res)))
                    totalUSDT += float(self.remove_exponent(float(usdt_res)))
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalBTC'] = totalBTC
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalUSDT'] = totalUSDT
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_value'] = btc_res
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['USDT_value'] = usdt_res
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['pnl'] = self.get_last_pnl_coin(
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['total'],
                    i,
                    yesterday,
                    user,
                    '{}Margin-{}'.format(typeExchange,data['id'])
                    )   
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_pnl'] = self.get_last_pnl(
                        res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_value'],
                        'BTC',
                        i,
                        yesterday,
                        user,
                        '{}Margin-{}'.format(typeExchange,data['id'])
                    )
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['USDT_pnl'] = self.get_last_pnl(
                        res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['USDT_value'],
                        'USDT',
                        i,
                        yesterday,
                        user,
                        '{}Margin-{}'.format(typeExchange,data['id'])
                    )
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_pnl_percent'] = self.get_last_pnl_percent(
                        res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_value'],
                        'BTC',
                        i,
                        yesterday,
                        user,
                        '{}Margin-{}'.format(typeExchange,data['id'])
                    )
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['USDT_pnl_percent'] = self.get_last_pnl_percent(
                        res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['USDT_value'],
                        'USDT',
                        i,
                        yesterday,
                        user,
                        '{}Margin-{}'.format(typeExchange,data['id'])
                    )
                res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalBTC_pnl'] = self.get_last_total_pnl(
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalBTC'],
                    'BTC',
                    yesterday,
                    user,
                    '{}Margin-{}'.format(typeExchange,data['id'])
                )
                res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalUSDT_pnl'] = self.get_last_total_pnl(
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalUSDT'],
                    'USDT',
                    yesterday,
                    user,
                    '{}Margin-{}'.format(typeExchange,data['id'])
                )
                res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalBTC_pnl_percent'] = self.get_last_total_pnl_percent(
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalBTC'],
                    'BTC',
                    yesterday,
                    user,
                    '{}Margin-{}'.format(typeExchange,data['id'])
                )
                res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalUSDT_pnl_percent'] = self.get_last_total_pnl_percent(
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalUSDT'],
                    'USDT',
                    yesterday,
                    user,
                    '{}Margin-{}'.format(typeExchange,data['id'])
                )
                for i in exchange_data_margin['total']:
                    res = float(res_data['{}Margin-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_value']) / float(res_data['{}Margin-{}'.format(typeExchange,data['id'])]['totalBTC']) * 100
                    res_data['{}Margin-{}'.format(typeExchange,data['id'])]['allocate'][i] = self.remove_exponent(res)
            if typeExchange.name == 'bitmex':
                positions = self.get_bitmex_positions(typeExchange.name,data['key'],data['secret_key'])
                res_data['{}-{}'.format(typeExchange,data['id'])]['positions'] = positions
            exchange_data = self.get_exchanges_data(typeExchange.name,data['key'],data['secret_key'])
            exchange_data = json.loads(exchange_data)
            for i in exchange_data['total']:
                res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i] = exchange_data[i]
                btc_res = self.get_benchmark_values(i,exchange_data[i]['total'],'BTC',values_data)
                usdt_res = self.get_benchmark_values("BTC",btc_res,"USDT",values_data)
                totalBTC += float(self.remove_exponent(float(btc_res)))
                totalUSDT += float(self.remove_exponent(float(usdt_res)))
                res_data['{}-{}'.format(typeExchange,data['id'])]['totalBTC'] = totalBTC
                res_data['{}-{}'.format(typeExchange,data['id'])]['totalUSDT'] = totalUSDT
                res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_value'] = btc_res
                res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['USDT_value'] = usdt_res
                res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['pnl'] = self.get_last_pnl_coin(
                    res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['total'],
                    i,
                    yesterday,
                    user,
                    '{}-{}'.format(typeExchange,data['id'])
                )
                res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_pnl'] = self.get_last_pnl(
                    res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_value'],
                    'BTC',
                    i,
                    yesterday,
                    user,
                    '{}-{}'.format(typeExchange,data['id'])
                )
                res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['USDT_pnl'] = self.get_last_pnl(
                    res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['USDT_value'],
                    'USDT',
                    i,
                    yesterday,
                    user,
                    '{}-{}'.format(typeExchange,data['id'])
                )
                res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_pnl_percent'] = self.get_last_pnl_percent(
                    res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_value'],
                    'BTC',
                    i,
                    yesterday,
                    user,
                    '{}-{}'.format(typeExchange,data['id'])
                )
                res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['USDT_pnl_percent'] = self.get_last_pnl_percent(
                    res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['USDT_value'],
                    'USDT',
                    i,
                    yesterday,
                    user,
                    '{}-{}'.format(typeExchange,data['id'])
                )
            res_data['{}-{}'.format(typeExchange,data['id'])]['totalBTC_pnl'] = self.get_last_total_pnl(
                res_data['{}-{}'.format(typeExchange,data['id'])]['totalBTC'],
                'BTC',
                yesterday,
                user,
                '{}-{}'.format(typeExchange,data['id'])
            )
            res_data['{}-{}'.format(typeExchange,data['id'])]['totalUSDT_pnl'] = self.get_last_total_pnl(
                res_data['{}-{}'.format(typeExchange,data['id'])]['totalUSDT'],
                'USDT',
                yesterday,
                user,
                '{}-{}'.format(typeExchange,data['id'])
            )
            res_data['{}-{}'.format(typeExchange,data['id'])]['totalBTC_pnl_percent'] = self.get_last_total_pnl_percent(
                res_data['{}-{}'.format(typeExchange,data['id'])]['totalBTC'],
                'BTC',
                yesterday,
                user,
                '{}-{}'.format(typeExchange,data['id'])
            )
            res_data['{}-{}'.format(typeExchange,data['id'])]['totalUSDT_pnl_percent'] = self.get_last_total_pnl_percent(
                res_data['{}-{}'.format(typeExchange,data['id'])]['totalUSDT'],
                'USDT',
                yesterday,
                user,
                '{}-{}'.format(typeExchange,data['id'])
            )
            for i in exchange_data['total']:
                res = float(res_data['{}-{}'.format(typeExchange,data['id'])]['coins'][i]['BTC_value']) / float(res_data['{}-{}'.format(typeExchange,data['id'])]['totalBTC']) * 100
                res_data['{}-{}'.format(typeExchange,data['id'])]['allocate'][i] = self.remove_exponent(res)
        return res_data

class AddExchangeDataOften(Thread):
    def __init__(self, seconds):
        super().__init__()
        self.delay = seconds
        self.is_done = False

    def done(self):
        self.is_done = True

    def run(self):
        while not self.is_done:
            time.sleep(self.delay)
            ExchangeFunc().add_exchange_data()
        print('thread done')

class SetTickersOften(Thread):
    def __init__(self, seconds):
        super().__init__()
        self.delay = seconds
        self.is_done = False

    def done(self):
        self.is_done = True

    def run(self):
        while not self.is_done:
            time.sleep(self.delay)
            ExchangeFunc().set_tickers()
