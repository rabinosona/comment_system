from django.db import models

# Create your models here.

class Comment(models.Model):
    text = models.TextField()
    author = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)
    image_url = models.URLField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    depth = models.IntegerField(default=0)  # 0 for root comments, increments for each level of nesting
    
    @property
    def image(self):
        return self.image_url
    
    @image.setter
    def image(self, value):
        self.image_url = value
    
    def save(self, *args, **kwargs):
        # Calculate depth based on parent
        if self.parent:
            self.depth = self.parent.depth + 1
        else:
            self.depth = 0
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Comment by {self.author} on {self.date.strftime('%Y-%m-%d %H:%M')}"
        
    class Meta:
        ordering = ['-date']
