'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';

export function Hero() {
  const handleScrollToCatalog = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector('#catalogo');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="hero-section" id="topo">
      <div className="container hero-container">
        <div className="hero-copy">
          <div className="logo-container reveal-fade revealed">
            <Image
              src="/assets/logo.png"
              alt="Pudim & CIA Logo"
              className="main-logo"
              width={280}
              height={112}
              priority
            />
          </div>
          <p className="hero-slogan reveal-fade delay-1 revealed">
            Acolhimento e Sabor Artesanal
            <br />
            em cada detalhe
          </p>
          <div className="cta-container reveal-fade delay-2 revealed">
            <a
              href="#catalogo"
              className="btn-hero smooth-scroll"
              id="hero-cta"
              data-testid="hero-cta"
              onClick={handleScrollToCatalog}
            >
              <span>Ver Nosso Catálogo</span>
              <ArrowDown className="btn-icon" size={20} />
            </a>
          </div>
        </div>
        <div className="hero-visual reveal-fade delay-1 revealed">
          <div className="hero-frame">
            <Image
              src="/assets/pudim_classico.png"
              alt="Pudim Clássico de Leite Moça"
              className="hero-image"
              width={640}
              height={640}
              priority
            />
          </div>
        </div>
      </div>
    </header>
  );
}
