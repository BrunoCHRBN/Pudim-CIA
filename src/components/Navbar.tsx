'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MessageCircle, ShoppingBag, Menu, X } from 'lucide-react';

import { useCart } from '@/context/CartContext';

interface NavbarProps {
  cartCount?: number;
  onOpenCart: () => void;
}

export function Navbar({ cartCount: passedCartCount, onOpenCart }: NavbarProps) {
  const { cartCount: contextCartCount } = useCart();
  const cartCount = passedCartCount ?? contextCartCount;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = href === '#' ? document.body : document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      closeMobileMenu();
    }
  };

  return (
    <nav
      className={`site-navbar ${isScrolled ? 'is-scrolled' : ''}`}
      id="site-navbar"
      data-testid="site-navbar"
    >
      <div className="container navbar-inner">
        <a
          href="#"
          className="navbar-brand smooth-scroll"
          data-testid="navbar-brand"
          aria-label="Pudim & CIA — início"
          onClick={(e) => handleSmoothScroll(e, '#')}
        >
          <Image
            src="/assets/logo.png"
            alt="Pudim & CIA"
            className="navbar-logo"
            width={120}
            height={48}
            priority
          />
        </a>

        <div className="navbar-actions">
          <ul className={`navbar-links ${isMobileMenuOpen ? 'is-open' : ''}`} id="navbar-links">
            <li>
              <a
                href="#experiencia"
                className="smooth-scroll"
                data-testid="nav-link-essencia"
                onClick={(e) => handleSmoothScroll(e, '#experiencia')}
              >
                Nossa Essência
              </a>
            </li>
            <li>
              <a
                href="#catalogo"
                className="smooth-scroll"
                data-testid="nav-link-especialidades"
                onClick={(e) => handleSmoothScroll(e, '#catalogo')}
              >
                Especialidades
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/5516991359739?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20na%20Pudim%20%26%20CIA!"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-nav-whatsapp"
                data-testid="nav-cta-whatsapp"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>
            </li>
          </ul>

          <button
            type="button"
            className="btn-cart-nav"
            id="btn-cart-nav"
            data-testid="btn-cart-nav"
            aria-label="Abrir carrinho"
            onClick={onOpenCart}
          >
            <ShoppingBag size={20} />
            <span
              className="cart-badge"
              id="cart-badge"
              data-testid="cart-badge"
              hidden={cartCount === 0}
            >
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            className={`btn-menu-toggle ${isMobileMenuOpen ? 'is-open' : ''}`}
            id="btn-menu-toggle"
            data-testid="btn-menu-toggle"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="navbar-links"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="icon-menu" size={20} />
            <X className="icon-close" size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
