'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

export function FabWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <a
      href="https://wa.me/5516991359739?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20a%20Pudim%20%26%20CIA!"
      className={`fab-whatsapp ${isVisible ? 'is-visible' : ''}`}
      id="fab-whatsapp"
      data-testid="fab-whatsapp"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle size={26} />
      <span className="fab-tooltip">Fale conosco</span>
    </a>
  );
}
