import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface CommentType {
  id: number;
  text: string;
  author: string;
  date: string;
  likes: number;
  image_url: string | null;
  depth: number;
  parent_id?: number | null;
  replies: CommentType[];
}

// Transform backend response data to frontend format if needed
const transformComment = (comment: any): CommentType => {
  return {
    id: comment.id,
    text: comment.text,
    author: comment.author,
    date: comment.date,
    likes: comment.likes,
    // Handle both image and image_url field names
    image_url: comment.image_url || comment.image || null,
    depth: comment.depth || 0,
    parent_id: comment.parent_id || null,
    replies: Array.isArray(comment.replies) ? comment.replies.map(transformComment) : []
  };
};

export const api = {
  // Get all comments
  async getComments() {
    const response = await axios.get<{ results: any[] }>(`${API_URL}/comments/`);
    const comments = response.data.results || [];
    return comments.map(transformComment);
  },
  
  // Add a new comment
  async addComment(text: string, parentId?: number) {
    const data: any = { text };
    if (parentId) {
      data.parent_id = parentId;
    }
    const response = await axios.post<any>(`${API_URL}/comments/`, data);
    return transformComment(response.data);
  },
  
  // Update an existing comment
  async updateComment(id: number, text: string) {
    const response = await axios.put<any>(`${API_URL}/comments/${id}/`, { text });
    return transformComment(response.data);
  },
  
  // Delete a comment
  async deleteComment(id: number) {
    await axios.delete(`${API_URL}/comments/${id}/`);
  }
}; 