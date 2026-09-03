from django.contrib import admin
from .models import Car, CarImage, Favorite


class CarImageInline(admin.TabularInline):
    model = CarImage
    extra = 1


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'brand', 'model', 'year', 'price', 'city',
        'status', 'seller', 'views_count', 'created_at',
    )
    list_filter = ('status', 'brand', 'fuel_type', 'transmission', 'condition', 'city')
    search_fields = ('title', 'brand', 'model', 'description', 'seller__username')
    inlines = [CarImageInline]
    readonly_fields = ('views_count', 'created_at', 'updated_at')


@admin.register(CarImage)
class CarImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'car', 'is_primary', 'order', 'uploaded_at')
    list_filter = ('is_primary',)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'car', 'created_at')
    list_filter = ('created_at',)
