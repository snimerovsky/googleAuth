from django.shortcuts import render
from users.models import Profile
from django.contrib import messages
from exchanges.models import ExchangeData
from django.http import JsonResponse, HttpResponseRedirect
from decimal import Decimal
from django.contrib.auth.decorators import login_required
from exchanges.models import Exchange, ExchangeType
from .forms import TelegramForm
import ccxt
import datetime
import threading
import json


def clear_messages(request):
    storage = messages.get_messages(request)
    storage.used = True
    if len(storage._loaded_messages) > 0:
        del storage._loaded_messages[0]

def index(request):
    clear_messages(request)
    if (not request.user.is_anonymous):
        profile_data = {}
        profile_data = Profile.objects.filter(user=request.user).get()
        if not len(profile_data.exchange.all()):
            return render(request, 'profile/welcome.html')
        else:
            return render(request, 'profile/index.html', {
                'profile_data': profile_data.exchange.values(),
            })
    else:
        return render(request, 'profile/login.html')

@login_required
def history_all(request):
    profile_data = Profile.objects.filter(user=request.user).get()
    return render(request, 'exchanges/history.html', {
                'profile_data': profile_data.exchange.values(),
                'exchanges_length': len(profile_data.exchange.values()),
            })

@login_required
def exchange(request,id):    
    profile_data = Profile.objects.filter(user=request.user).get()
    exchange = Exchange.objects.get(pk=id)
    exchange_obj = Exchange.objects.filter(pk=id).values()

    return render(request, 'exchanges/exchange.html', {
        'id':id,
        'profile_data': profile_data.exchange.values(),
        'exchange':exchange,
        'exchange_obj':exchange_obj
    })


def welcome(request):
    return render(request, 'profile/welcome.html')


def profile(request):
    form = TelegramForm()

    if request.method == 'POST':
        form_key = TelegramForm(request.POST)
        if form_key.is_valid():
            data = request.POST.copy()
            Profile.objects.filter(user=request.user).update(telegram=data.get('telegram'))
            return HttpResponseRedirect('/profile')
                
    profile_data = Profile.objects.filter(user=request.user).get()
    return render(request, 'profile/profile_info.html', {
        'profile_data':profile_data.exchange.values(), 
        "profile_data_user":profile_data,
        'form':form
        })

def not_found(request, exception):
    return render(request, '404.html')
