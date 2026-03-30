'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import "../../styles/bids/index.scss";
import "../../styles/cms-conatiner/index.scss";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'contacted' | 'processed';
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

const Bids = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'processed'>('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Lead['status']) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchLeads();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Удалить заявку?')) return;
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      fetchLeads();
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return '#f2c94c';
      case 'contacted': return '#60a5fa';
      case 'processed': return '#ccff00';
      default: return '#888';
    }
  };

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filter);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    processed: leads.filter(l => l.status === 'processed').length
  };

  if (loading) {
    return (
      <div className="cms-container">
        <div className="bids-loading">Загрузка заявок...</div>
      </div>
    );
  }

  return (
    <section id="bids">
      <div className="cms-container">
        <motion.div 
          className="bids"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bids-header">
            <motion.div 
              className="bids-title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Заявки
            </motion.div>

            <div className="bids-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Все ({counts.all})
              </button>
              <button 
                className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
                onClick={() => setFilter('new')}
              >
                Новые ({counts.new})
              </button>
              <button 
                className={`filter-btn ${filter === 'contacted' ? 'active' : ''}`}
                onClick={() => setFilter('contacted')}
              >
                В работе ({counts.contacted})
              </button>
              <button 
                className={`filter-btn ${filter === 'processed' ? 'active' : ''}`}
                onClick={() => setFilter('processed')}
              >
                Обработаны ({counts.processed})
              </button>
            </div>
          </div>

          <motion.div 
            className="bids-block"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredLeads.length === 0 ? (
                <div className="bids-empty">Нет заявок</div>
              ) : (
                filteredLeads.map((lead, index) => (
                  <motion.div
                    key={lead._id}
                    className="bid-item"
                    variants={itemVariants}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -4 }}
                    layout
                  >
                    <div className="bid-item-header">
                      <div className="bid-item-left">
                        <motion.div 
                          className="bid-item-avatar"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                        >
                          {lead.name[0].toUpperCase()}
                        </motion.div>
                        <div className="bid-item-info">
                          <div className="bid-item-name">{lead.name}</div>
                          <div className="bid-item-contact">
                            <span>{lead.email}</span>
                            <span>•</span>
                            <span>{lead.phone}</span>
                          </div>
                          <div className="bid-item-date">{formatDate(lead.createdAt)}</div>
                        </div>
                      </div>
                      <div className="bid-item-status">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead._id, e.target.value as Lead['status'])}
                          style={{ borderColor: getStatusColor(lead.status) }}
                        >
                          <option value="new">Новая</option>
                          <option value="contacted">В работе</option>
                          <option value="processed">Обработана</option>
                        </select>
                      </div>
                    </div>
                    <div className="bid-item-body">
                      <p className='bid-user-text'>{lead.message}</p>
                    </div>
                    <div className="bid-item-footer">
                      <motion.button
                        className="delete-btn"
                        onClick={() => deleteLead(lead._id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Удалить
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Bids;