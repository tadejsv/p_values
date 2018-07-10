from django.conf.urls import include, re_path
from . import views

app_name = '2players'
urlpatterns = [
    re_path(r'^$', views.TwoPlayerView.as_view(), name='main'),
    re_path(r'^calculation$', views.TwoPlayerCalculation.as_view(), name='calculation'),
]
