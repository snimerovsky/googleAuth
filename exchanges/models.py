from django.db import models
from django.contrib.postgres.fields import JSONField
from datetime import datetime

# Create your models here.
class ExchangeData(models.Model):
    date_time = models.DateTimeField(default=datetime.now())
    data = JSONField()

    def get_data(self):
        return self.data

    def __str__(self):
        return '{}'.format(self.date_time)

class ExchangeType(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name.title()

class Exchange(models.Model):
    typeExchange = models.ForeignKey(ExchangeType, on_delete=models.CASCADE)
    comment = models.CharField(max_length=255)
    key = models.CharField(max_length=255,unique=True)
    secret_key = models.CharField(max_length=255,unique=True)

    def __str__(self):
        return '{}{}'.format(self.typeExchange.name.title(),self.comment.title().replace(" ", ""))