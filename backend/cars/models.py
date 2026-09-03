from django.conf import settings
from django.db import models


class Car(models.Model):
    class Condition(models.TextChoices):
        NEW = 'new', 'New'
        USED = 'used', 'Used'
        CERTIFIED = 'certified', 'Certified Pre-Owned'

    class FuelType(models.TextChoices):
        PETROL = 'petrol', 'Petrol'
        DIESEL = 'diesel', 'Diesel'
        ELECTRIC = 'electric', 'Electric'
        HYBRID = 'hybrid', 'Hybrid'
        GAS = 'gas', 'Gas'

    class Transmission(models.TextChoices):
        MANUAL = 'manual', 'Manual'
        AUTOMATIC = 'automatic', 'Automatic'
        CVT = 'cvt', 'CVT'
        ROBOT = 'robot', 'Robot'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        SOLD = 'sold', 'Sold'
        DRAFT = 'draft', 'Draft'
        ARCHIVED = 'archived', 'Archived'

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cars'
    )
    title = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    mileage = models.PositiveIntegerField(default=0)
    condition = models.CharField(max_length=20, choices=Condition.choices, default=Condition.USED)
    fuel_type = models.CharField(max_length=20, choices=FuelType.choices, default=FuelType.PETROL)
    transmission = models.CharField(
        max_length=20, choices=Transmission.choices, default=Transmission.AUTOMATIC
    )
    color = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.brand} {self.model} ({self.year}) — {self.title}'


class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='cars/')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'Image for {self.car_id}'


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites'
    )
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'car')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user_id} ♥ {self.car_id}'
