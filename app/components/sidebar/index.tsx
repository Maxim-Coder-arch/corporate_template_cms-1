'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import "../../styles/sidebar/index.scss";
import { dataSidebar as data } from "@/data/data.sidebar";

const SideBar = () => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const isMenuOpen = (label: string) => openMenus.includes(label);

  return (
    <nav className="sidebar">
      <div className="sidebar__content">
        {(data.logotypeCompany || data.companyName) && (
          <div className="sidebar__logo">
            {data.logotypeCompany && (
              <div 
                className="sidebar__logo-image" 
                style={{backgroundImage: `url(${data.logotypeCompany})`}}
              />
            )}
            {data.companyName && (
              <span className="sidebar__logo-name">{data.companyName}</span>
            )}
          </div>
        )}

        <div className="sidebar__nav">
          {data.points.map((item) => {
            const hasSubmenu = item.points && item.points.length > 0;
            const isOpen = isMenuOpen(item.label);
            const isActive = pathname === item.link;

            if (hasSubmenu) {
              return (
                <div key={item.label} className="sidebar__item">
                  <button
                    className={`sidebar__link sidebar__link--parent ${isOpen ? 'sidebar__link--open' : ''}`}
                    onClick={() => toggleMenu(item.label)}
                  >
                    <span className="sidebar__link-label">{item.label}</span>
                    <span className="sidebar__link-arrow">{isOpen ? '−' : '+'}</span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        className="sidebar__submenu"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.points?.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.link}
                            className={`sidebar__sublink ${pathname === sub.link ? 'sidebar__sublink--active' : ''}`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <div key={item.label} className="sidebar__item">
                <Link
                  href={item.link}
                  className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                >
                  <span className="sidebar__link-label">{item.label}</span>
                </Link>
              </div>
            );
          })}
        </div>

        {data.website && (
          <div className="sidebar__footer">
            <a 
              href={data.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="sidebar__website"
            >
              Перейти на сайт →
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default SideBar;