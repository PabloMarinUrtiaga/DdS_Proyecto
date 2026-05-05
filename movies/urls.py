from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('',          views.catalogo,             name='catalogo'),
    path('login/',    auth_views.LoginView.as_view(), name='login'),
    path('logout/',   views.cerrar_sesion,         name='logout'),
    path('registro/', views.registro,              name='registro'),
]
