from django.conf import settings
from django.db import models
from cars.models import Car


class Conversation(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='conversations')
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buyer_conversations'
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='seller_conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('car', 'buyer')
        ordering = ['-updated_at']

    def __str__(self):
        return f'Chat #{self.pk}: {self.buyer} ↔ {self.seller} about {self.car}'


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages'
    )
    text = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Msg {self.pk} in conv {self.conversation_id}'
