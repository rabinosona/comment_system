import { useState } from 'react';
import moment from 'moment';
import { CommentType } from '~/services/api';

interface CommentProps {
    id: number;
    text: string;
    author: string;
    date: string;
    likes: number;
    imageUrl?: string;
    depth: number;
    replies: CommentType[];
    onEdit: (id: number, text: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onReply: (parentId: number, text: string) => Promise<void>;
}

export default function Comment({
    id,
    text,
    author,
    date,
    likes,
    imageUrl,
    depth,
    replies,
    onEdit,
    onDelete,
    onReply,
}: CommentProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [editText, setEditText] = useState(text);
    const [replyText, setReplyText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [replyError, setReplyError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReplySubmitting, setIsReplySubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleEdit = async () => {
        if (!editText.trim()) {
            setError('Comment text cannot be empty');
            return;
        }

        try {
            setError(null);
            setIsSubmitting(true);
            await onEdit(id, editText);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating comment:', err);
            setError('Failed to update comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) {
            setReplyError('Reply text cannot be empty');
            return;
        }

        try {
            setReplyError(null);
            setIsReplySubmitting(true);
            await onReply(id, replyText);
            setIsReplying(false);
            setReplyText('');
        } catch (err) {
            console.error('Error replying to comment:', err);
            setReplyError('Failed to post reply. Please try again.');
        } finally {
            setIsReplySubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await onDelete(id);
            setShowDeleteModal(false);
        } catch (err) {
            console.error('Error deleting comment:', err);
            // We'll let the parent component handle this error
        }
    };

    const formattedDate = moment(date).format('MMMM D, YYYY [at] h:mm A');

    // Calculate padding for nested comments
    const paddingClass = depth === 0 
        ? 'ml-0' 
        : depth === 1 
            ? 'ml-8 border-l-4 border-blue-200 pl-4' 
            : 'ml-16 border-l-4 border-purple-200 pl-4';

    return (
        <>
            <div className={`comment-container ${paddingClass}`}>
                <div className="comment-header">
                    <div className="flex items-center">
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt={`${author}'s avatar`}
                                className="w-10 h-10 rounded-full mr-3"
                                onError={(e) => {
                                    e.currentTarget.src = '/ico.png';
                                }}
                            />
                        )}
                        <div>
                            <div className="comment-author">{author}</div>
                            <div className="comment-date">{formattedDate}</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2">❤️ {likes}</span>
                    </div>
                </div>

                {isEditing ? (
                    <div className="mt-2">
                        <textarea
                            className={`input-field ${error ? 'border-red-500' : ''}`}
                            value={editText}
                            onChange={(e) => {
                                setEditText(e.target.value);
                                if (error) setError(null);
                            }}
                            required
                            rows={3}
                        />
                        {error && (
                            <div className="text-red-500 text-sm mt-1">{error}</div>
                        )}
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditText(text);
                                    setError(null);
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleEdit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="comment-text">{text}</div>
                )}

                {isReplying && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Reply to {author}</h4>
                        <textarea
                            className={`input-field ${replyError ? 'border-red-500' : ''}`}
                            value={replyText}
                            onChange={(e) => {
                                setReplyText(e.target.value);
                                if (replyError) setReplyError(null);
                            }}
                            rows={3}
                            placeholder="Write your reply here..."
                        />
                        {replyError && (
                            <div className="text-red-500 text-sm mt-1">{replyError}</div>
                        )}
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setIsReplying(false);
                                    setReplyText('');
                                    setReplyError(null);
                                }}
                                disabled={isReplySubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleReply}
                                disabled={isReplySubmitting || !replyText.trim()}
                            >
                                {isReplySubmitting ? 'Posting...' : 'Post Reply'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="comment-footer">
                    <div className="space-x-2">
                        {!isEditing && (
                            <>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit
                                </button>
                                {!isReplying && depth < 2 && (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setIsReplying(true)}
                                    >
                                        Reply
                                    </button>
                                )}
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Render replies */}
            {replies.length > 0 && (
                <div className="mt-2">
                    {replies.map(reply => (
                        <Comment
                            key={reply.id}
                            id={reply.id}
                            text={reply.text}
                            author={reply.author}
                            date={reply.date}
                            likes={reply.likes}
                            imageUrl={reply.image_url || undefined}
                            depth={reply.depth}
                            replies={reply.replies}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onReply={onReply}
                        />
                    ))}
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this comment? 
                            {replies.length > 0 && " This will also delete all replies."}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 