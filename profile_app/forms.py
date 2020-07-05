from django import forms

class TelegramForm(forms.Form):
    telegram = forms.CharField(max_length=100)