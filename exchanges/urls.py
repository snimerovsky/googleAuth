from django.urls import path, include

from . import views,api
from profile_app import views as profile_views

urlpatterns = [
    path('add_exchange/', views.add_exchange, name='add_exchange'),
    path('edit_exchange/<int:id>', views.edit_exchange, name='edit_exchange'),
    path('edit_exchange/comment/<int:id>', views.edit_exchange_comment, name='edit_exchange_comment'),
    path('remove_exchange/<int:id>', views.remove_exchange, name='remove_exchange'),
    path('all_exchanges/<int:id>', views.all_exchanges, name='all_exchanges'),
    path('exchange/<int:id>', profile_views.exchange, name='exchange_url'),
    path('api/get_all_exchanges/', api.get_all_exchanges, name='get_all_exchanges'),
    path('api/get_user_exchanges/', api.get_user_exchanges, name='get_user_exchanges'),
    path('api/get_user_exchange/', api.get_user_exchange_api, name='get_user_exchange'),
    path('api/get_range_exchange/', api.get_range_exchange_api, name='get_range_exchange'),
    path('api/get_values', api.get_values, name='get_values'),
    path('api/get_last_pnl', api.get_last_pnl_api, name='get_last_pnl_api'),
    path('api/get_last_user_data', api.get_last_user_data_api, name='get_last_user_data'),
    path('api/get_names', api.get_names_api, name='get_names'),
    path('api/get_bitmex_positions_api/', api.get_bitmex_positions_api, name='get_bitmex_positions_api'),
    path('api/get_exchanges_data_api/', api.get_exchanges_data_api, name='get_exchanges_data_api'),
    path('api/get_exchanges_data_margin_api/', api.get_exchanges_data_margin_api, name='get_exchanges_data_margin_api'),
    path('api/get_last_pnl_coin_api/', api.get_last_pnl_coin_api, name='get_last_pnl_coin_api'),
    path('api/get_last_pnl_api/', api.get_last_pnl_api, name='get_last_pnl_api'),
    path('api/get_last_pnl_percent_api/', api.get_last_pnl_percent_api, name='get_last_pnl_percent_api'),
    path('api/get_last_total_pnl_api/', api.get_last_total_pnl_api, name='get_last_total_pnl_api'),
    path('api/get_last_total_pnl_percent_api/', api.get_last_total_pnl_percent_api, name='get_last_total_pnl_percent_api'),
    path('api/get_user_exchange_date_api/', api.get_user_exchange_date_api, name='get_user_exchange_date_api'),
    path('api/get_all_user_history_api/', api.get_all_user_history_api, name='get_all_user_history_api'),
]
