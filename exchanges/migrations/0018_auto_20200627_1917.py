# Generated by Django 3.0.7 on 2020-06-27 19:17

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exchanges', '0017_auto_20200627_1916'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exchangedata',
            name='date',
            field=models.DateTimeField(default=datetime.datetime(2020, 6, 27, 19, 17, 8, 177700)),
        ),
    ]