from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import datetime
from exchanges.models import Exchange,ExchangeData


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, default=None)
    telegram = models.CharField(max_length=100,blank=True, default='')
    access_until = models.DateTimeField(default=datetime.now, blank=True)
    exchange = models.ManyToManyField(Exchange,blank=True,default=None)
    exchanges_history = models.ManyToManyField(ExchangeData,blank=True,default=None)

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()