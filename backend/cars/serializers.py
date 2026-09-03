from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Car, CarImage, Favorite


class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ('id', 'image', 'is_primary', 'order')


class CarListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = (
            'id', 'title', 'brand', 'model', 'year', 'price', 'mileage',
            'condition', 'fuel_type', 'transmission', 'color', 'city',
            'status', 'views_count', 'created_at', 'primary_image',
            'seller', 'seller_name', 'is_favorited',
        )

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            request = self.context.get('request')
            url = img.image.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, car=obj).exists()
        return False


class CarDetailSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    seller = UserSerializer(read_only=True)
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = (
            'id', 'title', 'brand', 'model', 'year', 'price', 'mileage',
            'condition', 'fuel_type', 'transmission', 'color', 'city',
            'description', 'status', 'views_count', 'created_at', 'updated_at',
            'images', 'seller', 'is_favorited',
        )

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, car=obj).exists()
        return False


class CarCreateUpdateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Car
        fields = (
            'title', 'brand', 'model', 'year', 'price', 'mileage',
            'condition', 'fuel_type', 'transmission', 'color', 'city',
            'description', 'status', 'images',
        )

    def create(self, validated_data):
        images = validated_data.pop('images', [])
        car = Car.objects.create(**validated_data)
        for i, image in enumerate(images):
            CarImage.objects.create(
                car=car, image=image, is_primary=(i == 0), order=i
            )
        return car

    def update(self, instance, validated_data):
        images = validated_data.pop('images', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if images is not None:
            start = instance.images.count()
            for i, image in enumerate(images):
                CarImage.objects.create(
                    car=instance,
                    image=image,
                    is_primary=(start == 0 and i == 0),
                    order=start + i,
                )
        return instance


class FavoriteSerializer(serializers.ModelSerializer):
    car = CarListSerializer(read_only=True)
    car_id = serializers.PrimaryKeyRelatedField(
        queryset=Car.objects.all(), source='car', write_only=True
    )

    class Meta:
        model = Favorite
        fields = ('id', 'car', 'car_id', 'created_at')
        read_only_fields = ('id', 'created_at')
