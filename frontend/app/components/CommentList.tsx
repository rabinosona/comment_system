import { useState, useEffect } from 'react';
import Comment from './Comment';
import CommentForm from './CommentForm';
import { api, CommentType } from '~/services/api';

export default function CommentList() {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await api.getComments();
      setComments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, []);
  
  // Helper function to add or update a comment in the nested structure
  const updateCommentInTree = (
    commentsList: CommentType[], 
    updatedComment: CommentType
  ): CommentType[] => {
    return commentsList.map(comment => {
      // If this is the comment to update
      if (comment.id === updatedComment.id) {
        return { ...updatedComment, replies: comment.replies };
      }
      
      // Check replies recursively
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, updatedComment)
        };
      }
      
      return comment;
    });
  };
  
  // Helper function to remove a comment from the nested structure
  const removeCommentFromTree = (
    commentsList: CommentType[], 
    commentId: number
  ): CommentType[] => {
    return commentsList.filter(comment => {
      // Keep the comment if it's not the one to remove
      if (comment.id === commentId) {
        return false;
      }
      
      // For others, check their replies recursively
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = removeCommentFromTree(comment.replies, commentId);
      }
      
      return true;
    });
  };
  
  const handleAddComment = async (text: string): Promise<void> => {
    try {
      const newComment = await api.addComment(text);
      setComments([newComment, ...comments]);
      return Promise.resolve();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
      return Promise.reject(err);
    }
  };
  
  const handleReply = async (parentId: number, text: string): Promise<void> => {
    try {
      const newReply = await api.addComment(text, parentId);
      
      // Find the comment to update
      const updatedComments = [...comments];
      
      // Helper function to add the reply to the correct parent
      const addReplyToParent = (commentsList: CommentType[]): boolean => {
        for (let i = 0; i < commentsList.length; i++) {
          const comment = commentsList[i];
          
          // If this is the parent comment, add the reply
          if (comment.id === parentId) {
            comment.replies = [newReply, ...comment.replies];
            return true;
          }
          
          // Check if the reply is in nested replies
          if (comment.replies && comment.replies.length > 0) {
            if (addReplyToParent(comment.replies)) {
              return true;
            }
          }
        }
        
        return false;
      };
      
      addReplyToParent(updatedComments);
      setComments(updatedComments);
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to add reply. Please try again.');
      return Promise.reject(err);
    }
  };
  
  const handleEditComment = async (id: number, text: string): Promise<void> => {
    try {
      const updatedComment = await api.updateComment(id, text);
      setComments(updateCommentInTree(comments, updatedComment));
      return Promise.resolve();
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
      return Promise.reject(err);
    }
  };
  
  const handleDeleteComment = async (id: number): Promise<void> => {
    try {
      await api.deleteComment(id);
      setComments(removeCommentFromTree(comments, id));
      return Promise.resolve();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
      return Promise.reject(err);
    }
  };
  
  const clearError = () => setError(null);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Comments</h1>
      
      <CommentForm onSubmit={handleAddComment} />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="font-bold text-xl">&times;</button>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <Comment
              key={comment.id}
              id={comment.id}
              text={comment.text}
              author={comment.author}
              date={comment.date}
              likes={comment.likes}
              imageUrl={comment.image_url || undefined}
              depth={comment.depth}
              replies={comment.replies}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
} 