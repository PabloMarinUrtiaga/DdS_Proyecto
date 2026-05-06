import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from .models import Movie, Cart, CartItem


def catalogo(request):
    movies = Movie.objects.all()

    generos_set = set()
    for m in movies:
        for g in m.genero.split(','):
            generos_set.add(g.strip())
    generos = sorted(generos_set)

    # IDs de películas ya en el carrito del usuario
    carrito_ids = []
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        carrito_ids = list(cart.items.values_list('movie_id', flat=True))

    movies_json = json.dumps([
        {
            'id':            m.id,
            'titulo':        m.titulo,
            'director':      m.director,
            'año':           m.año,
            'genero':        m.genero,
            'poster':        m.poster or 'N/A',
            'imdb_rating':   str(m.imdb_rating),
            'precio_compra': str(m.precio_compra) if m.precio_compra else '',
        }
        for m in movies
    ])

    return render(request, 'movies/catalogo.html', {
        'movies_json':  movies_json,
        'generos':      generos,
        'carrito_ids':  json.dumps(carrito_ids),
    })


from django.http import JsonResponse

@login_required
def agregar_al_carrito(request, movie_id):
    if request.method != 'POST':
        return redirect('catalogo')
    movie = get_object_or_404(Movie, id=movie_id)
    cart, _ = Cart.objects.get_or_create(user=request.user)
    if CartItem.objects.filter(cart=cart, movie=movie).exists():
        return JsonResponse({'ok': False, 'msg': 'Ya está en el carrito'}, status=400)
    CartItem.objects.create(cart=cart, movie=movie)
    return JsonResponse({'ok': True, 'total': cart.items.count()})
    

@login_required
def eliminar_del_carrito(request, item_id):
    item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    item.delete()
    return redirect('carrito')


@login_required
def ver_carrito(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    return render(request, 'movies/carrito.html', {'cart': cart})


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