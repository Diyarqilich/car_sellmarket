from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarViewSet, FavoriteListView

router = DefaultRouter()
router.register('cars', CarViewSet, basename='car')

urlpatterns = [
    path('', include(router.urls)),
    path('favorites/', FavoriteListView.as_view(), name='favorites'),
]
