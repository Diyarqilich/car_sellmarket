from django.urls import path
from .views import RegisterView, MeView, PublicProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('users/<int:pk>/', PublicProfileView.as_view(), name='public-profile'),
]
