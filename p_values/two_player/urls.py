from django.conf.urls import include, url
from . import views

urlpatterns = [
    url(r'^$', views.TwoPlayerView.as_view(), name='main'),
    url(r'^calculation$', views.TwoPlayerCalculation.as_view(), name='calculation'),
]
