from django import forms
from .models import ExchangeType

class NameForm(forms.Form):
    exchanges = forms.ModelChoiceField(queryset = ExchangeType.objects.all(), initial=0)
    comment = forms.CharField(max_length=100)
    key = forms.CharField()
    secret_key = forms.CharField(widget=forms.PasswordInput)

class CommentForm(forms.Form):
    comment = forms.CharField(max_length=100)

class KeyForm(forms.Form):
    key = forms.CharField()
    secret_key = forms.CharField(widget=forms.PasswordInput)