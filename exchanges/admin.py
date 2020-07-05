from django.contrib import admin
from .models import ExchangeData, ExchangeType, Exchange

admin.site.register(ExchangeData)
admin.site.register(ExchangeType)
admin.site.register(Exchange)