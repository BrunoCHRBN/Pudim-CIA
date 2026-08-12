'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export function ProductsCTA() {
  return (
    <div className="products-cta reveal-fade delay-3 revealed">
      <p className="products-cta-text">
        Gostou? Faça seu pedido diretamente pelo WhatsApp — rápido e sem complicação.
      </p>
      <a
        href="https://wa.me/5516991359739?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20na%20Pudim%20%26%20CIA!"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp"
        id="whatsapp-cta"
        data-testid="whatsapp-cta"
      >
        <MessageCircle className="btn-icon" size={20} />
        <span>Encomendar via WhatsApp</span>
      </a>
    </div>
  );
}
