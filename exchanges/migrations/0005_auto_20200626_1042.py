# Generated by Django 3.0.7 on 2020-06-26 10:42

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exchanges', '0004_auto_20200626_1041'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exchangedata',
            name='date',
            field=models.DateTimeField(default=datetime.datetime(2020, 6, 26, 10, 42, 23, 757359)),
        ),
    ]
