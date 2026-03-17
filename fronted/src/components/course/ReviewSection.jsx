import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import StarRating from '../common/StarRating';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, User } from 'lucide-react';

const ReviewSection = ({ courseId, isEnrolled }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/courses/${courseId}/reviews/`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchReviews();
    }
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/api/courses/${courseId}/reviews/`, {
        rating,
        comment,
      });
      toast.success('Review posted successfully!');
      setRating(0);
      setComment('');
      fetchReviews();
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to post review';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 space-y-8">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <MessageSquare className="text-purple-400" />
        Student Reviews
      </h3>

      {isEnrolled && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-card p-6 rounded-2xl border border-white/10"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Leave a Review</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Rating</label>
              <StarRating rating={rating} setRating={setRating} />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this course..."
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Review'}
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-400 italic">No reviews yet. Be the first to share your thoughts!</p>
        ) : (
          <AnimatePresence>
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-6 rounded-2xl border border-white/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{review.user_email || 'Student'}</p>
                      <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} interactive={false} size={16} />
                </div>
                <p className="text-gray-300 leading-relaxed">{review.comment}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
