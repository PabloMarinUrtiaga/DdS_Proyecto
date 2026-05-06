import requests
from django.contrib import admin
from django.conf import settings
from django.shortcuts import render, redirect
from django.urls import path
from django.contrib import messages
from .models import Movie, Cart, CartItem


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display  = ['titulo', 'director', 'año', 'genero', 'imdb_rating', 'precio_compra']
    list_filter   = ['genero']
    search_fields = ['titulo', 'director']
    change_list_template = 'admin/movies/movie_changelist.html'

    def get_urls(self):
        urls = super().get_urls()
        extra = [
            path('importar-omdb/', self.admin_site.admin_view(self.importar_view), name='importar_omdb'),
        ]
        return extra + urls

    def importar_view(self, request):
        resultados = []
        query = ''

        if request.method == 'POST' and 'buscar' in request.POST:
            query = request.POST.get('query', '').strip()
            resp  = requests.get('https://www.omdbapi.com/', params={
                's': query, 'type': 'movie', 'apikey': settings.OMDB_API_KEY
            })
            data = resp.json()
            if data.get('Response') == 'True':
                resultados = data.get('Search', [])
            else:
                messages.error(request, f"OMDb: {data.get('Error', 'Sin resultados')}")

        elif request.method == 'POST' and 'importar' in request.POST:
            imdb_id = request.POST.get('imdb_id')
            resp = requests.get('https://www.omdbapi.com/', params={
                'i': imdb_id, 'apikey': settings.OMDB_API_KEY
            })
            data = resp.json()

            if data.get('Response') == 'True':
                titulo = data['Title']
                año    = int(data['Year'][:4])
                if Movie.objects.filter(titulo=titulo, año=año).exists():
                    messages.warning(request, f"'{titulo}' ya existe en la BD.")
                else:
                    rating = data.get('imdbRating', 'N/A')
                    Movie.objects.create(
                        titulo        = titulo,
                        director      = data.get('Director', 'N/A'),
                        año           = año,
                        genero        = data.get('Genre', 'N/A'),
                        poster        = data.get('Poster', ''),
                        imdb_rating   = float(rating) if rating != 'N/A' else 0.0,
                        precio_compra = None,
                    )
                    messages.success(request, f"✓ '{titulo}' agregada correctamente.")
            else:
                messages.error(request, "No se pudo obtener el detalle de la película.")
            return redirect('../')

        context = {
            **self.admin_site.each_context(request),
            'title':      'Importar película desde OMDb',
            'resultados': resultados,
            'query':      query,
        }
        return render(request, 'admin/movies/importar_omdb.html', context)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'total']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'movie', 'quantity', 'subtotal']