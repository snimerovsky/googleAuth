# Generated by Django 3.0.7 on 2020-06-26 10:36

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exchanges', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exchangedata',
            name='date',
            field=models.DateTimeField(default=datetime.datetime(2020, 6, 26, 10, 36, 19, 23200)),
        ),
    ]
