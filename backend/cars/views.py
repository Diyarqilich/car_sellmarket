from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from .models import Car, CarImage, Favorite
from .serializers import (
    CarListSerializer, CarDetailSerializer,
    CarCreateUpdateSerializer, FavoriteSerializer,
)
from .filters import CarFilter
from .permissions import IsSellerOrReadOnly, IsOwnerOrReadOnly


class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.select_related('seller').prefetch_related('images').all()
    filterset_class = CarFilter
    search_fields = ['title', 'brand', 'model', 'description', 'city', 'color']
    ordering_fields = ['price', 'year', 'mileage', 'created_at', 'views_count']
    ordering = ['-created_at']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ('create',):
            return [permissions.IsAuthenticated(), IsSellerOrReadOnly()]
        if self.action in ('update', 'partial_update', 'destroy'):
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action == 'list':
            return CarListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return CarCreateUpdateSerializer
        return CarDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == 'list':
            mine = self.request.query_params.get('mine')
            if mine and self.request.user.is_authenticated:
                return qs.filter(seller=self.request.user)
            return qs.filter(status=Car.Status.ACTIVE)
        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Car.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        car = serializer.instance
        return Response(
            CarDetailSerializer(car, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(CarDetailSerializer(instance, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def favorite(self, request, pk=None):
        car = self.get_object()
        fav, created = Favorite.objects.get_or_create(user=request.user, car=car)
        if not created:
            fav.delete()
            return Response({'favorited': False})
        return Response({'favorited': True}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def remove_image(self, request, pk=None):
        car = self.get_object()
        image_id = request.data.get('image_id') or request.query_params.get('image_id')
        try:
            img = car.images.get(pk=image_id)
            img.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CarImage.DoesNotExist:
            return Response({'detail': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def brands(self, request):
        brands = (
            Car.objects.filter(status=Car.Status.ACTIVE)
            .values_list('brand', flat=True)
            .distinct()
            .order_by('brand')
        )
        return Response(list(brands))

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def cities(self, request):
        cities = (
            Car.objects.filter(status=Car.Status.ACTIVE)
            .values_list('city', flat=True)
            .distinct()
            .order_by('city')
        )
        return Response(list(cities))


class FavoriteListView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related(
            'car', 'car__seller'
        ).prefetch_related('car__images')
