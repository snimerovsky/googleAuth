from django.urls import path, include

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('profile', views.profile, name='profile'),
    path('history', views.history_all, name='history'),
]
