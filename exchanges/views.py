from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from .models import ExchangeData, Exchange, ExchangeType
from django.core import serializers
from threading import Thread
from decimal import Decimal
from django import forms
from users.models import Profile
from django.contrib import messages
from django.db import IntegrityError 
from ccxt.base.errors import AuthenticationError
import datetime
import time
import json
import ccxt

from .forms import NameForm, CommentForm, KeyForm
from .functions import SetTickersOften, AddExchangeDataOften, ExchangeFunc


@login_required
def add_exchange(request):
    profile_data_user = Profile.objects.filter(user=request.user).get()
    if request.method == 'POST':
        form = NameForm(request.POST)
        if form.is_valid():
            data = request.POST.copy()
            typeExchange = ExchangeType.objects.get(pk=data.get('exchanges'))
            try:
                yesterday = datetime.date.today() - datetime.timedelta(days=1)
                ExchangeFunc().is_valid_exchange(typeExchange.name.lower(),data.get('key'),data.get('secret_key'))
                exchange = Exchange(typeExchange=typeExchange,comment=data.get('comment'),key=data.get('key'),secret_key=data.get('secret_key'))
                exchange.save()
                profile_data = Profile.objects.filter(user=request.user).get()
                profile_data.exchange.add(exchange)
                exchange_obj = profile_data.exchange.filter(pk=exchange.id).values()[0]
                user_datas = ExchangeFunc().add_exchange_data_user(profile_data)
                user_exchanges = profile_data.exchanges_history.filter(date_time__gte=yesterday).values()
                if len(user_exchanges) > 0:
                  exchange_id = profile_data.exchanges_history.filter(date_time__gte=yesterday).first().pk
                  ExchangeData.objects.filter(pk=exchange_id).update(data=user_datas)
                else:
                  new_data = ExchangeData(data=user_datas)
                  new_data.save()
                  profile_data.exchanges_history.add(new_data)
                return HttpResponseRedirect('/')
            except IntegrityError:
                messages.error(request, "THIS KEY IS ALREADY EXISTS")
                form = NameForm()
            except AuthenticationError:
                messages.error(request, "API KEY IS NOT VALID")
                form = NameForm()
    else:
        form = NameForm()
    return render(request, 'exchanges/add_exchange.html', {
        'form': form, 
        'profile_data': profile_data_user.exchange.values(),
    })


@login_required
def edit_exchange(request,id):
    profile_data = Profile.objects.filter(user=request.user).get()
    exchange = Exchange.objects.get(pk=id)
    form_comment = CommentForm()

    if request.method == 'POST':
        form_key = KeyForm(request.POST)
        if form_key.is_valid():
            try:
                data = request.POST.copy()
                ExchangeFunc().is_valid_exchange(exchange.typeExchange.name.lower(),data.get('key'),data.get('secret_key'))
                Exchange.objects.filter(pk=id).update(key=data.get('key'),secret_key=data.get('secret_key'))
                return HttpResponseRedirect('/')
            except AuthenticationError:
                messages.error(request, "API KEY IS NOT VALID")
                form_key = KeyForm()
                return HttpResponseRedirect('/exchanges/edit_exchange/{}'.format(id))
    else:
        form_key = KeyForm()

    return render(request, 'exchanges/edit_exchange.html', {
        'form_comment': form_comment,
        'form_key':form_key,
        'id':id,
        'profile_data':profile_data.exchange.values(),
        'exchange':exchange
    })

@login_required
def edit_exchange_comment(request,id):
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            data = request.POST.copy()
            Exchange.objects.filter(pk=id).update(comment=data.get('comment'))
            return HttpResponseRedirect('/')
    else:
        return HttpResponseRedirect('/exchanges/edit_exchange/{}'.format(id))

@login_required
def remove_exchange(request,id):
    if request.method == 'POST':
        profile_data = Profile.objects.filter(user=request.user).get()
        exchange = profile_data.exchange.get(pk=id)
        exchange.delete()
        return HttpResponseRedirect('/')
    else:
        return HttpResponseRedirect('/exchanges/edit_exchange/{}'.format(id))

@login_required
def all_exchanges(request):
    return render(request, 'exchanges/all_exchanges.html')


add_often = AddExchangeDataOften(86400)  # one day = 86,400 seconds
add_often.start()
t = SetTickersOften(120)
t.start()