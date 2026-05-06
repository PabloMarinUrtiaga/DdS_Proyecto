from django.db import models
from django.contrib.auth.models import User


class Movie(models.Model):
    titulo        = models.CharField(max_length=200)
    director      = models.CharField(max_length=200)
    año           = models.IntegerField()
    genero        = models.CharField(max_length=200)
    poster        = models.URLField(blank=True, default='N/A')
    imdb_rating   = models.DecimalField(max_digits=3, decimal_places=1)
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ['titulo']
        verbose_name = 'Película'
        verbose_name_plural = 'Películas'

    def __str__(self):
        return f"{self.titulo} ({self.año})"


class Cart(models.Model):
    user       = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def total(self):
        return sum(item.subtotal() for item in self.items.all())

    def __str__(self):
        return f"Carrito de {self.user.username}"


class CartItem(models.Model):
    cart     = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    movie    = models.ForeignKey(Movie, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def subtotal(self):
        return self.movie.precio_compra * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.movie.titulo}"