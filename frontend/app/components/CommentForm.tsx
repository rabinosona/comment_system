import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (text: string) => Promise<void>;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setIsSubmitting(true);
      await onSubmit(text);
      setText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-4">
        <label htmlFor="comment" className="label">
          Add a Comment (as Admin)
        </label>
        <textarea
          id="comment"
          className={`input-field ${error ? 'border-red-500' : ''}`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          rows={4}
          placeholder="What are your thoughts?"
          required
        />
        {error && (
          <div className="text-red-500 text-sm mt-1">{error}</div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
} 