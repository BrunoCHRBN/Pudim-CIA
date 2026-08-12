'use client';

import React from 'react';
import { Cake, Leaf, Bike } from 'lucide-react';

export function Pillars() {
  return (
    <section className="pillars-section" id="diferenciais" data-testid="pillars-section">
      <div className="container">
        <div className="section-header reveal-fade revealed">
          <span className="section-tagline">O que nos move</span>
          <h2 className="section-title">Nossos Diferenciais</h2>
        </div>
        <div className="pillars-grid">
          <article className="pillar-item reveal-fade revealed" data-testid="pillar-feito-no-dia">
            <div className="pillar-icon" aria-hidden="true">
              <Cake size={28} />
            </div>
            <h3>Feito no dia</h3>
            <p>Produção diária para garantir frescor, cremosidade e aquele sabor de receita caseira.</p>
          </article>
          <article className="pillar-item reveal-fade delay-1 revealed" data-testid="pillar-ingredientes">
            <div className="pillar-icon" aria-hidden="true">
              <Leaf size={28} />
            </div>
            <h3>Ingredientes selecionados</h3>
            <p>Chocolate nobre, leite condensado de qualidade e matérias-primas escolhidas a dedo.</p>
          </article>
          <article className="pillar-item reveal-fade delay-2 revealed" data-testid="pillar-entrega">
            <div className="pillar-icon" aria-hidden="true">
              <Bike size={28} />
            </div>
            <h3>Entrega local em Araraquara</h3>
            <p>Receba no conforto da sua casa — ou retire na loja com a mesma atenção artesanal.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
