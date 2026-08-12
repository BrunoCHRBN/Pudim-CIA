'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Keyboard } from 'swiper/modules';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface EssenceCarouselProps {
  isOverlayOpen?: boolean;
}

const slidesData = [
  {
    image: '/assets/pudim_classico.png',
    alt: 'Pudim Clássico de Leite Moça',
    title: 'Pudim de Leite Moça',
    description: 'A receita tradicional que atravessa gerações — cremosa, com calda dourada e sabor inconfundível.',
  },
  {
    image: '/assets/cones_trufados.png',
    alt: 'Cones Trufados Variados',
    title: 'Cones Trufados',
    description: 'Casquinhas crocantes recheadas até a borda com ganache nobre nos sabores Tradicional, Ninho e Nutella.',
  },
  {
    image: '/assets/caixa_trufas.png',
    alt: 'Caixa de Trufas Gourmet',
    title: 'Trufas Gourmet',
    description: 'Seleção especial de sabores intensos — ideal para presentear ou saborear a qualquer momento.',
  },
  {
    image: '/assets/doceria_ambiente.png',
    alt: 'Ambiente acolhedor da Doceria',
    title: 'Nosso Cantinho',
    description: 'Feito com amor — onde cada aroma conta uma história de afeto, cuidado e aconchego genuíno.',
  },
];

export function EssenceCarousel({ isOverlayOpen = false }: EssenceCarouselProps) {
  return (
    <section className="essence-section" id="experiencia">
      <div className="container">
        <div className="section-header reveal-fade revealed">
          <span className="section-tagline">Uma experiência em camadas</span>
          <h2 className="section-title">Nossa Essência</h2>
        </div>

        <div className="essence-swiper reveal-fade delay-1 revealed" data-testid="essence-carousel">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, Keyboard]}
            loop={true}
            speed={650}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              el: '.essence-swiper .swiper-pagination',
              clickable: true,
            }}
            navigation={{
              nextEl: '.carousel-btn--next',
              prevEl: '.carousel-btn--prev',
            }}
            keyboard={{
              enabled: !isOverlayOpen,
              onlyInViewport: true,
            }}
            breakpoints={{
              0: {
                slidesPerView: 1.12,
                spaceBetween: 14,
                centeredSlides: false,
              },
              768: {
                slidesPerView: 1,
                spaceBetween: 0,
                centeredSlides: false,
              },
            }}
          >
            {slidesData.map((slide, index) => (
              <SwiperSlide key={index} className="carousel-slide">
                <div className="carousel-img-wrap">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    className="carousel-img"
                    width={800}
                    height={600}
                    loading="lazy"
                  />
                </div>
                <div className="carousel-caption">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </div>
              </SwiperSlide>
            ))}

            <button
              className="carousel-btn carousel-btn--prev"
              type="button"
              aria-label="Slide anterior"
              data-testid="carousel-prev"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              className="carousel-btn carousel-btn--next"
              type="button"
              aria-label="Próximo slide"
              data-testid="carousel-next"
            >
              <ArrowRight size={20} />
            </button>
            <div className="swiper-pagination" data-testid="carousel-pagination"></div>
          </Swiper>
        </div>
      </div>
    </section>
  );
}
