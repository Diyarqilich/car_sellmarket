from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'phone', 'city', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'phone', 'city')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('role', 'phone', 'avatar', 'bio', 'city')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Profile', {'fields': ('role', 'phone', 'city')}),
    )
