'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import "../../styles/main/index.scss";

interface Note {
  _id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

const Main = () => {
  const [stats, setStats] = useState({
    activeBids: 0,
    servicesCount: 0,
    newsCount: 0,
    activeReviews: 0,
    pendingReviews: 0,
    usersToday: 0,
    usersWeek: 0,
    usersMonth: 0
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNotePriority, setNewNotePriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [loading, setLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  useEffect(() => {
    fetchStats();
    fetchNotes();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNoteText, priority: newNotePriority })
      });
      setNewNoteText('');
      setShowAddNote(false);
      fetchNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await fetch('/api/notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

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


  return (
    <div className="admin-main">
      <div className="admin-header">
        <h1>Панель управления</h1>
        <p>Добро пожаловать в систему управления сайтом</p>
      </div>
      <motion.div 
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.activeBids}</span>
            <span className="stat-card__label">заявок</span>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.servicesCount}</span>
            <span className="stat-card__label">услуг</span>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.newsCount}</span>
            <span className="stat-card__label">новостей</span>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.activeReviews}</span>
            <span className="stat-card__label">отзывов</span>
            {stats.pendingReviews > 0 && (
              <span className="stat-card__badge">{stats.pendingReviews} на модерации</span>
            )}
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="stats-row"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="stats-block visitors-block">
          <h2>Посещаемость сайта</h2>
          <div className="visitors-grid">
            <div className="visitor-item">
              <span className="visitor-period">Сегодня</span>
              <span className="visitor-value">{stats.usersToday}</span>
            </div>
            <div className="visitor-item">
              <span className="visitor-period">Неделя</span>
              <span className="visitor-value">{stats.usersWeek}</span>
            </div>
            <div className="visitor-item">
              <span className="visitor-period">Месяц</span>
              <span className="visitor-value">{stats.usersMonth}</span>
            </div>
          </div>
        </div>

        <div className="stats-block notes-block">
          <div className="notes-header">
            <h2>Заметки</h2>
            <button className="add-note-btn" onClick={() => setShowAddNote(!showAddNote)}>
              {showAddNote ? '−' : '+'}
            </button>
          </div>

          <AnimatePresence>
            {showAddNote && (
              <motion.div 
                className="add-note-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <textarea
                  placeholder="Текст заметки"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  rows={2}
                />
                <select 
                  value={newNotePriority} 
                  onChange={(e) => setNewNotePriority(e.target.value as any)}
                >
                  <option value="high">Высокий приоритет</option>
                  <option value="medium">Средний приоритет</option>
                  <option value="low">Низкий приоритет</option>
                </select>
                <button onClick={addNote}>Добавить</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="notes-list">
            {notes.map(note => (
              <div key={note._id} className={`note-item priority-${note.priority}`}>
                <span className="note-text">{note.text}</span>
                <button 
                  className="note-delete"
                  onClick={() => deleteNote(note._id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="quick-actions"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2>Быстрые действия</h2>
        <div className="actions-grid">
          <a href="/admin/reviews" className="action-card">
            <span>Модерация отзывов</span>
            {stats.pendingReviews > 0 && (
              <span className="action-badge">{stats.pendingReviews}</span>
            )}
          </a>
          <a href="/admin/services" className="action-card">
            <span>Управление услугами</span>
          </a>
          <a href="/admin/news" className="action-card">
            <span>Управление новостями</span>
          </a>
          <a href="/admin/bids" className="action-card">
            <span>Просмотр заявок</span>
            <span className="action-badge">{stats.activeBids}</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Main;