from rest_framework import serializers
from .models import Comment

class RecursiveCommentSerializer(serializers.Serializer):
    def to_representation(self, instance):
        serializer = self.parent.parent.__class__(instance, context=self.context)
        return serializer.data

class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    parent_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'text', 'author', 'date', 'likes', 'image_url', 'parent_id', 'depth', 'replies']
        read_only_fields = ['id', 'date', 'depth']
        
    def validate_text(self, value):
        """
        Check that the comment text is not empty.
        """
        if not value.strip():
            raise serializers.ValidationError("Comment text cannot be empty.")
        return value
        
    def get_replies(self, obj):
        # nesting limitation
        if obj.depth == 0:
            replies = obj.replies.all()
            return CommentSerializer(replies, many=True).data
        elif obj.depth == 1:
            replies = obj.replies.all()
            serializer = CommentSerializer(replies, many=True)
            for reply_data in serializer.data:
                reply_data['replies'] = []
            return serializer.data
        else:
            return []
            
    def create(self, validated_data):
        parent_id = validated_data.pop('parent_id', None)
        if parent_id:
            # Check if we've reached the maximum depth allowed
            parent = Comment.objects.get(id=parent_id)
            if parent.depth >= 2:  # Limiting to depth 2 (0->1->2)
                raise serializers.ValidationError("Maximum comment nesting depth reached.")
            validated_data['parent'] = parent
        return super().create(validated_data) 