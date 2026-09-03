from rest_framework import serializers
from users.serializers import UserSerializer
from cars.serializers import CarListSerializer
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'sender', 'text', 'is_read', 'created_at')
        read_only_fields = ('id', 'sender', 'is_read', 'created_at')


class ConversationSerializer(serializers.ModelSerializer):
    car = CarListSerializer(read_only=True)
    buyer = UserSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            'id', 'car', 'buyer', 'seller', 'created_at', 'updated_at',
            'last_message', 'unread_count',
        )

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        return MessageSerializer(msg).data if msg else None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()


class ConversationCreateSerializer(serializers.Serializer):
    car_id = serializers.IntegerField()
    text = serializers.CharField(required=False, allow_blank=True)


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('text',)
