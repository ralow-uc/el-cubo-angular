import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

interface CategoryCard {
  slug: string;
  title: string;
  blurb: string;
  image: string;
  alt: string;
  size: 'wide' | 'narrow';
}

/**
 * Página de inicio. Muestra el hero, las 4 categorías navegables y el
 * conteo dinámico de juegos en el catálogo.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private products = inject(ProductService);

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
