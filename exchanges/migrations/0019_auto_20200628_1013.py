# Generated by Django 3.0.7 on 2020-06-28 10:13

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exchanges', '0018_auto_20200627_1917'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exchangedata',
            name='date',
        ),
        migrations.RemoveField(
            model_name='exchangedata',
            name='name',
        ),
        migrations.RemoveField(
            model_name='exchangedata',
            name='pnl_data',
        ),
        migrations.RemoveField(
            model_name='exchangedata',
            name='pnl_percent_data',
        ),
        migrations.AddField(
            model_name='exchangedata',
            name='date_time',
            field=models.DateTimeField(default=datetime.datetime(2020, 6, 28, 10, 13, 11, 81478)),
        ),
    ]
