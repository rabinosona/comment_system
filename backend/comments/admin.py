from django.contrib import admin
from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'text', 'date', 'likes')
    list_filter = ('author', 'date')
    search_fields = ('text', 'author')
