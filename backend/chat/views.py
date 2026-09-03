from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from cars.models import Car
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer, ConversationCreateSerializer,
    MessageSerializer, MessageCreateSerializer,
)


class ConversationListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConversationCreateSerializer
        return ConversationSerializer

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(buyer=user) | Q(seller=user)
        ).select_related('car', 'buyer', 'seller').prefetch_related('car__images', 'messages')

    def create(self, request, *args, **kwargs):
        serializer = ConversationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        car_id = serializer.validated_data['car_id']
        text = serializer.validated_data.get('text', '')

        try:
            car = Car.objects.select_related('seller').get(pk=car_id)
        except Car.DoesNotExist:
            return Response({'detail': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)

        if car.seller_id == request.user.id:
            return Response(
                {'detail': 'Cannot chat with yourself'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        conv, created = Conversation.objects.get_or_create(
            car=car,
            buyer=request.user,
            defaults={'seller': car.seller},
        )
        if text:
            Message.objects.create(conversation=conv, sender=request.user, text=text)
            Conversation.objects.filter(pk=conv.pk).update(updated_at=timezone.now())

        return Response(
            ConversationSerializer(conv, context={'request': request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(buyer=user) | Q(seller=user))


class MessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

    def get_conversation(self):
        user = self.request.user
        return get_object_or_404(
            Conversation.objects.filter(Q(buyer=user) | Q(seller=user)),
            pk=self.kwargs['pk'],
        )

    def get_queryset(self):
        conv = self.get_conversation()
        Message.objects.filter(conversation=conv, is_read=False).exclude(
            sender=self.request.user
        ).update(is_read=True)
        return conv.messages.select_related('sender')

    def create(self, request, *args, **kwargs):
        conv = self.get_conversation()
        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        msg = Message.objects.create(
            conversation=conv,
            sender=request.user,
            text=serializer.validated_data['text'],
        )
        Conversation.objects.filter(pk=conv.pk).update(updated_at=timezone.now())
        return Response(
            MessageSerializer(msg, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class UnreadCountView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            conversation__in=Conversation.objects.filter(
                Q(buyer=request.user) | Q(seller=request.user)
            ),
            is_read=False,
        ).exclude(sender=request.user).count()
        return Response({'unread': count})
