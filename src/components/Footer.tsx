'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle, Mail, Video } from 'lucide-react';

export function Footer() {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer className="footer-component">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image
            src="/assets/logo.png"
            alt="Pudim & CIA Logo"
            className="footer-logo"
            width={160}
            height={64}
          />
          <p className="footer-slogan">
            Sabor que aquece a alma,
            <br />
            feito com amor.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Navegação</h4>
          <ul>
            <li>
              <a
                href="#experiencia"
                className="smooth-scroll"
                data-testid="footer-link-essencia"
                onClick={(e) => handleSmoothScroll(e, '#experiencia')}
              >
                Nossa Essência
              </a>
            </li>
            <li>
              <a
                href="#catalogo"
                className="smooth-scroll"
                data-testid="footer-link-especialidades"
                onClick={(e) => handleSmoothScroll(e, '#catalogo')}
              >
                Especialidades
              </a>
            </li>
            <li>
              <a
                href="#catalogo"
                className="smooth-scroll"
                data-testid="footer-link-catalogo"
                onClick={(e) => handleSmoothScroll(e, '#catalogo')}
              >
                Catálogo Completo
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Visite-nos</h4>
          <address className="footer-address">
            Av. Principal, 1200
            <br />
            Centro — Araraquara, SP
            <br />
            CEP 14800-000
          </address>
          <p className="footer-hours">
            Seg–Sex: 9h às 18h
            <br />
            Sáb: 9h às 14h
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Contato</h4>
          <ul>
            <li>
              <a
                href="https://wa.me/5516991359739"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-whatsapp"
              >
                <MessageCircle className="footer-icon" size={15} />
                <span>WhatsApp</span>
              </a>
            </li>
            <li>
              <a href="mailto:contato@pudimecia.com.br" data-testid="footer-email">
                <Mail className="footer-icon" size={15} />
                <span>E-mail</span>
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/pudimecia"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-instagram"
              >
                <svg
                  className="footer-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span>@pudimecia</span>
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com/@pudimecia"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-tiktok"
              >
                <Video className="footer-icon" size={15} />
                <span>TikTok</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="copyright">&copy; 2026 Pudim &amp; CIA. Todos os direitos reservados.</p>
          <a href="#privacidade" className="privacy-link" data-testid="privacy-link">
            Política de Privacidade
          </a>
        </div>
      </div>
    </footer>
  );
}
