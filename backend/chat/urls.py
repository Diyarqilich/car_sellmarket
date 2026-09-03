from django.urls import path
from .views import (
    ConversationListCreateView, ConversationDetailView,
    MessageListCreateView, UnreadCountView,
)

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversations'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:pk>/messages/', MessageListCreateView.as_view(), name='messages'),
    path('messages/unread/', UnreadCountView.as_view(), name='unread'),
]
