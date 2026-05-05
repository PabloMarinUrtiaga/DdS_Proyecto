import json
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from .models import Movie


def catalogo(request):
    movies = Movie.objects.all()

    # Géneros únicos para los botones de filtro
    generos_set = set()
    for m in movies:
        for g in m.genero.split(','):
            generos_set.add(g.strip())
    generos = sorted(generos_set)

    # Serializar películas a JSON para pasarlas al JS
    movies_json = json.dumps([
        {
            'id':              m.id,
            'titulo':          m.titulo,
            'director':        m.director,
            'año':             m.año,
            'genero':          m.genero,
            'poster':          m.poster or 'N/A',
            'imdb_rating':     str(m.imdb_rating),
            'precio_compra':   str(m.precio_compra)   if m.precio_compra   else '',
            'precio_alquiler': str(m.precio_alquiler) if m.precio_alquiler else '',
            'tipo':            m.tipo,
        }
        for m in movies
    ])

    return render(request, 'movies/catalogo.html', {
        'movies_json': movies_json,
        'generos':     generos,
    })


def registro(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('catalogo')
    else:
        form = UserCreationForm()
    return render(request, 'registration/registro.html', {'form': form})


def cerrar_sesion(request):
    logout(request)
    return redirect('catalogo')
