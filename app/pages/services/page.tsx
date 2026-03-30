'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import "../../styles/services/index.scss";
import "../../styles/cms-conatiner/index.scss";

interface Service {
  _id: string;
  title: string;
  description: string;
  image: string;
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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null,
    imagePreview: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.image) {
      alert('Заполните все поля');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.image);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
      const { url } = await uploadRes.json();
      
      if (!url) throw new Error('Upload failed');
      
      const serviceRes = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          image: url
        })
      });
      
      if (serviceRes.ok) {
        fetchServices();
        setFormData({ title: '', description: '', image: null, imagePreview: '' });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при добавлении');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="cms-container">
        <div className="services-loading">Загрузка...</div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить услугу?')) return;
    
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
      } else {
        alert('Ошибка при удалении');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Ошибка при удалении');
    }
  };

  return (
    <section id="services">
      <div className="cms-container">
        <div className="services">
          <motion.div 
            className="services-title"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Услуги
          </motion.div>
          
          <div className="services-block">
            <motion.div 
              className="services-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {services.length === 0 ? (
                <div className="services-empty">Нет услуг</div>
              ) : (
                services.map((item, index) => (
                  <motion.div
                    key={item._id}
                    className="service-card"
                    variants={cardVariants}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -4 }}
                  >
                    <motion.div 
                      className="service-card__image"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Image src={item.image} alt={item.title} width={400} height={200} />
                    </motion.div>
                    <motion.div 
                      className="service-card__title"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                    >
                      {item.title}
                    </motion.div>
                    <motion.div 
                      className="service-card__description"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                    >
                      {item.description}
                    </motion.div>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="service-card__delete"
                    >
                      Удалить
                    </button>
                  </motion.div>
                ))
              )}
            </motion.div>

            <motion.div 
              className="services-form"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="services-form__title">Добавить услугу</div>
              
              <form onSubmit={handleSubmit} className="services-form__form">
                <div className="form-field">
                  <label>Название</label>
                  <input
                    type="text"
                    placeholder="Введите название услуги"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Описание</label>
                  <textarea
                    placeholder="Введите описание услуги"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Изображение</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <AnimatePresence>
                    {formData.imagePreview && (
                      <motion.div 
                        className="image-preview"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Image src={formData.imagePreview} alt="Preview" width={100} height={100} />
                        <motion.button 
                          type="button"
                          className="image-preview__remove"
                          onClick={() => setFormData({ ...formData, image: null, imagePreview: '' })}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ×
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Загрузка...' : 'Добавить услугу'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services;