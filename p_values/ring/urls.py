from django.conf.urls import include, re_path
from . import views

app_name = 'ring'
urlpatterns = [
    re_path(r'^$', views.RingView.as_view(), name='main'),
    re_path(r'^calculation$', views.RingCalculation.as_view(), name='calculation'),
]
