# Generated by Django 3.0.7 on 2020-06-26 10:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exchanges', '0008_auto_20200626_1047'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='exchange',
        ),
        migrations.AddField(
            model_name='profile',
            name='exchange',
            field=models.ManyToManyField(blank=True, to='exchanges.Exchange'),
        ),
    ]
