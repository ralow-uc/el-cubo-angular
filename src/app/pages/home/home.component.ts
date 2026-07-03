import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { EventoService } from '../../services/evento.service';
import { Evento } from '../../models/evento.model';
import { imageUrl } from '../../services/storage.util';

interface CategoryCard {
  slug: string;
  title: string;
  blurb: string;
  image: string;
  alt: string;
  size: 'wide' | 'narrow';
}

/**
 * Página de inicio. Muestra el hero, las 4 categorías navegables, el conteo
 * dinámico de juegos y una vitrina de eventos destacados consumida desde el
 * archivo JSON a través de {@link EventoService}.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private products = inject(ProductService);
  private eventos = inject(EventoService);

  /** Eventos destacados para la vitrina del home (consumidos del JSON). */
  readonly destacados = signal<Evento[]>([]);

  readonly imageUrl = imageUrl;

  ngOnInit(): void {
    // Consumimos el JSON y nos quedamos con los eventos destacados.
    this.eventos.getDestacados().subscribe({
      next: (data) => this.destacados.set(data.slice(0, 3)),
      error: () => this.destacados.set([]),
    });
  }

  /** Formatea una fecha ISO `YYYY-MM-DD` como `12 de julio` (sin desfase de zona). */
  formatFechaCorta(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
  }

  readonly categories: CategoryCard[] = [
    {
      slug: 'estrategia',
      title: 'Estrategia',
      blurb: 'Decisiones largas, mapas, recursos y rivalidades que se cocinan a fuego lento.',
      image: 'cat-estrategia.jpg',
      alt: 'Partida de Catan en curso, con caminos y poblados sobre el tablero hexagonal',
      size: 'wide',
    },
    {
      slug: 'familiares',
      title: 'Familiares',
      blurb: 'Ligeros pero con chispa. Funcionan con niños, abuelos y todo lo que hay entre medio.',
      image: 'cat-familiares.jpg',
      alt: 'Partida de Aventureros al Tren con rutas de tren coloridas sobre el mapa',
      size: 'narrow',
    },
    {
      slug: 'cartas',
      title: 'Cartas',
      blurb: 'De los mazos competitivos a las partidas rápidas para esperar la pizza.',
      image: 'cat-cartas.jpg',
      alt: 'Cartas de Magic: The Gathering dispuestas en el campo de batalla durante una partida',
      size: 'narrow',
    },
    {
      slug: 'cooperativos',
      title: 'Cooperativos',
      blurb: 'Todos contra el juego. Ideal cuando el grupo prefiere conspirar antes que pelear.',
      image: 'cat-cooperativos.jpg',
      alt: 'Partida de Pandemic en curso, con el mapa mundial cubierto por fichas de enfermedades',
      size: 'narrow',
    },
  ];

  get totalGames(): number {
    return this.products.all().length;
  }
}
