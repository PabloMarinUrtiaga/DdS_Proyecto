from django.db import models


class Movie(models.Model):
    TIPO_CHOICES = [
        ('compra',          'Solo Compra'),
        ('alquiler',        'Solo Alquiler'),
        ('compra_alquiler', 'Compra y Alquiler'),
    ]

    titulo          = models.CharField(max_length=200)
    director        = models.CharField(max_length=200)
    año             = models.IntegerField()
    genero          = models.CharField(max_length=200)          # ej: "Drama, Thriller"
    poster          = models.URLField(blank=True, default='N/A')
    imdb_rating     = models.DecimalField(max_digits=3, decimal_places=1)
    precio_compra   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    precio_alquiler = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tipo            = models.CharField(max_length=20, choices=TIPO_CHOICES, default='compra_alquiler')

    class Meta:
        ordering = ['titulo']
        verbose_name = 'Película'
        verbose_name_plural = 'Películas'

    def __str__(self):
        return f"{self.titulo} ({self.año})"
