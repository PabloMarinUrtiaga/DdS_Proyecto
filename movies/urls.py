from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('',                              views.catalogo,            name='catalogo'),
    path('carrito/',                      views.ver_carrito,         name='carrito'),
    path('carrito/agregar/<int:movie_id>/', views.agregar_al_carrito, name='agregar_al_carrito'),
    path('carrito/eliminar/<int:item_id>/', views.eliminar_del_carrito, name='eliminar_del_carrito'),
    path('login/',    auth_views.LoginView.as_view(), name='login'),
    path('logout/',   views.cerrar_sesion,             name='logout'),
    path('registro/', views.registro,                  name='registro'),
    path('mis-peliculas/',views.mis_peliculas,name='mis_peliculas'),
    path('pago-exitoso/', views.pago_exitoso, name='pago_exitoso'),
]