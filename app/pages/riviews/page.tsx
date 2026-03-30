'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import "../../styles/reviews/index.scss";
import "../../styles/cms-conatiner/index.scss";

interface Review {
  _id: string;
  name: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Reviews = () => {
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [publishedReviews, setPublishedReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    text: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setPendingReviews(data.filter((r: Review) => r.status === 'pending'));
      setPublishedReviews(data.filter((r: Review) => r.status === 'approved'));
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) return;

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          rating: formData.rating,
          text: formData.text
        })
      });
      setFormData({ name: '', rating: 5, text: '' });
      fetchReviews();
    } catch (error) {
      console.error('Failed to add review:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      fetchReviews();
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      fetchReviews();
    } catch (error) {
      console.error('Failed to reject review:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      fetchReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`star ${i < rating ? 'star--filled' : ''}`}>★</span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="cms-container">
        <div className="reviews-loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <section id="reviews">
      <div className="cms-container">
        <div className="reviews">
          <motion.div 
            className="reviews-title"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Управление отзывами
          </motion.div>

          <div className="reviews-block">
            <div className="reviews-left">
              <motion.div 
                className="review-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="review-form__title">Добавить отзыв</div>
                <form onSubmit={handleAddReview} className="review-form__form">
                  <div className="form-field">
                    <label>Имя пользователя</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Введите имя"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Оценка</label>
                    <select name="rating" value={formData.rating} onChange={handleFormChange}>
                      <option value={5}>5 ★</option>
                      <option value={4}>4 ★</option>
                      <option value={3}>3 ★</option>
                      <option value={2}>2 ★</option>
                      <option value={1}>1 ★</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Текст отзыва</label>
                    <textarea
                      name="text"
                      placeholder="Введите текст отзыва"
                      rows={4}
                      value={formData.text}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="submit-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Добавить отзыв
                  </motion.button>
                </form>
              </motion.div>

              <motion.div 
                className="reviews-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="reviews-section__title">
                  На модерацию ({pendingReviews.length})
                </div>
                <motion.div 
                  className="reviews-list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {pendingReviews.map((review) => (
                      <motion.div
                        key={review._id}
                        className="review-card review-card--pending"
                        variants={itemVariants}
                        exit={{ opacity: 0, x: -100 }}
                        layout
                      >
                        <div className="review-card__header">
                          <div className="review-card__user">
                            <div className="review-card__avatar">{review.name[0]}</div>
                            <div className="review-card__info">
                              <div className="review-card__name">{review.name}</div>
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <div className="review-card__text">{review.text}</div>
                        <div className="review-card__actions">
                          <motion.button
                            className="review-card__approve"
                            onClick={() => handleApprove(review._id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Добавить на сайт
                          </motion.button>
                          <motion.button
                            className="review-card__reject"
                            onClick={() => handleReject(review._id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Отклонить
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {pendingReviews.length === 0 && (
                    <div className="reviews-empty">Нет отзывов на модерацию</div>
                  )}
                </motion.div>
              </motion.div>
            </div>

            <motion.div 
              className="reviews-right"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="reviews-section">
                <div className="reviews-section__title">
                  На сайте ({publishedReviews.length})
                </div>
                <motion.div 
                  className="reviews-list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {publishedReviews.map((review) => (
                      <motion.div
                        key={review._id}
                        className="review-card review-card--published"
                        variants={itemVariants}
                        exit={{ opacity: 0, x: 100 }}
                        layout
                      >
                        <div className="review-card__header">
                          <div className="review-card__user">
                            <div className="review-card__avatar">{review.name[0]}</div>
                            <div className="review-card__info">
                              <div className="review-card__name">{review.name}</div>
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <div className="review-card__text">{review.text}</div>
                        <div className="review-card__actions review-card__actions--single">
                          <motion.button
                            className="review-card__delete"
                            onClick={() => handleDelete(review._id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Удалить
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {publishedReviews.length === 0 && (
                    <div className="reviews-empty">Нет опубликованных отзывов</div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;