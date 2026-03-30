'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import "../../styles/news/index.scss";
import "../../styles/cms-conatiner/index.scss";

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setNews(data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    try {
      await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormData({ title: '', description: '' });
      fetchNews();
    } catch (error) {
      console.error('Failed to add news:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить новость?')) return;
    try {
      await fetch(`/api/news/${id}`, { method: 'DELETE' });
      fetchNews();
    } catch (error) {
      console.error('Failed to delete news:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="cms-container">
        <div className="news-loading">Загрузка новостей...</div>
      </div>
    );
  }

  return (
    <section id="news">
      <div className="cms-container">
        <div className="news">
          <motion.div 
            className="news-title"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Новости
          </motion.div>

          <div className="news-block">
            <motion.div 
              className="news-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {news.length === 0 ? (
                  <div className="news-empty">Нет новостей</div>
                ) : (
                  news.map((item) => (
                    <motion.div
                      key={item._id}
                      className="news-card"
                      variants={itemVariants}
                      transition={{ duration: 0.5 }}
                      whileHover={{ y: -2 }}
                      layout
                    >
                      <div className="news-card__header">
                        <div className="news-card__title">{item.title}</div>
                        <div className="news-card__right">
                          <span className="news-card__date">{formatDate(item.createdAt)}</span>
                          <motion.button
                            className="news-card__delete"
                            onClick={() => handleDelete(item._id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Удалить
                          </motion.button>
                        </div>
                      </div>
                      <div className="news-card__description">
                        {item.description}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="news-form"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="news-form__title">Добавить новость</div>

              <form onSubmit={handleSubmit} className="news-form__form">
                <div className="form-field">
                  <label>Заголовок</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Введите заголовок новости"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Описание</label>
                  <textarea
                    name="description"
                    placeholder="Введите текст новости"
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  className="submit-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Добавить новость
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default News;