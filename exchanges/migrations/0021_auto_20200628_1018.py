# Generated by Django 3.0.7 on 2020-06-28 10:18

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exchanges', '0020_auto_20200628_1013'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exchangedata',
            name='date_time',
            field=models.DateTimeField(default=datetime.datetime(2020, 6, 28, 10, 18, 15, 604177)),
        ),
    ]
