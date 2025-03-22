from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from datetime import datetime
from .models import Comment
from .serializers import CommentSerializer
from rest_framework.decorators import action


class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows comments to be viewed or edited.
    """
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        if self.action == 'list':
            return Comment.objects.filter(parent=None).order_by('-date')
        return Comment.objects.all().order_by('-date')
    
    def create(self, request, *args, **kwargs):
        # For new comments, always set author to "Admin" as per requirements
        data = request.data.copy()
        data['author'] = 'Admin'
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        data = request.data.copy()
        instance = self.get_object()
        
        if 'author' not in data:
            data['author'] = instance.author
        
        # Prevent changing parent on update
        if 'parent_id' in data and data['parent_id'] != getattr(instance.parent, 'id', None):
            return Response(
                {"detail": "Cannot change the parent of an existing comment."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    # not super restful but it will wipe the comments if we would like to
    # expand the "delete existing comments" definition
    @action(detail=False, methods=['delete'], url_path='wipe')
    def wipe_comments(self, request):
        count, _ = Comment.objects.all().delete()
        return Response({'deleted': count}, status=200)