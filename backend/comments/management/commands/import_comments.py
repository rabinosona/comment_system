import json
import os
from django.core.management.base import BaseCommand
from comments.models import Comment
from datetime import datetime

class Command(BaseCommand):
    help = 'Import comments from the provided JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Path to the JSON file containing comments',
            default='comments.json'
        )

    def handle(self, *args, **options):
        file_path = options['file']
        self.stdout.write(f'Attempting to import comments from {file_path}...')
        
        try:
            if not os.path.exists(file_path):
                fixture_path = os.path.join('comments', 'fixtures', file_path)
                if os.path.exists(fixture_path):
                    file_path = fixture_path
                else:
                    raise FileNotFoundError(f"File not found at {file_path} or {fixture_path}")
            
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            if 'comments' in data:
                comments_data = data['comments']
            else:
                comments_data = data if isinstance(data, list) else [data]
            
            imported_count = 0
                
            for comment_data in comments_data:
                try:
                    comment = Comment(
                        text=comment_data.get('text', ''),
                        author=comment_data.get('author', 'Anonymous'),
                        likes=int(comment_data.get('likes', 0)),
                    )
                    
                    if 'date' in comment_data and comment_data['date']:
                        try:
                            comment.date = datetime.fromisoformat(comment_data['date'].replace('Z', '+00:00'))
                        except ValueError:
                            self.stdout.write(self.style.WARNING(f"Invalid date format for comment {comment_data.get('id', 'unknown')}, using current time"))
                            comment.date = datetime.now()
                    
                    if 'image' in comment_data and comment_data['image']:
                        comment.image_url = comment_data['image']
                    elif 'image_url' in comment_data and comment_data['image_url']:
                        comment.image_url = comment_data['image_url']
                    
                    comment.save()
                    imported_count += 1
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error importing comment {comment_data.get('id', 'unknown')}: {str(e)}"))
                
            self.stdout.write(self.style.SUCCESS(f'Successfully imported {imported_count} comments'))
                
        except FileNotFoundError as e:
            self.stdout.write(self.style.ERROR(f"{str(e)}. Please ensure the JSON file is available."))
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR('Invalid JSON format in the file.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing comments: {str(e)}')) 