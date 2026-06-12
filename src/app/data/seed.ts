import { Product } from '../models/product.model';
import { User } from '../models/user.model';

export const SEED_USERS: User[] = [
  {
    id: 'admin',
    fullName: 'Administrador El Cubo',
    username: 'admin',
    email: 'admin@elcubo.cl',
    password: 'Admin2026!',
    birthdate: '1990-01-01',
    address: 'Av. Providencia 1234, Santiago',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo',
    fullName: 'Cliente Demo',
    username: 'demo',
    email: 'demo@elcubo.cl',
    password: 'Demo2026!',
    birthdate: '2000-06-15',
    address: 'Av. Apoquindo 4501, Las Condes',
    role: 'cliente',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const SEED_PRODUCTS: Product[] = [
  { id: 'catan', name: 'Catan', category: 'estrategia', price: 34990, oldPrice: 44990, onSale: true, image: 'catan.jpg', description: 'El clásico de comercio y construcción en una isla recién descubierta. Negociaciones tensas y diplomacia improvisada en cada turno.', players: '3 – 4 jugadores', stock: 12 },
  { id: 'carcassonne', name: 'Carcassonne', category: 'estrategia', price: 29990, image: 'carcassonne.jpg', description: 'Construye un paisaje medieval pieza a pieza. Reglas mínimas, decisiones grandes y un aire elegante que envejece muy bien.', players: '2 – 5 jugadores', stock: 8 },
  { id: 'twilight-imperium', name: 'Twilight Imperium', category: 'estrategia', price: 104990, image: 'twilight-imperium.png', description: 'Civilizaciones galácticas, alianzas frágiles y partidas épicas que duran toda la tarde. La cima de los wargames diplomáticos.', players: '3 – 6 jugadores', stock: 3 },
  { id: 'ticket-to-ride', name: 'Aventureros al Tren: Europa', category: 'familiares', price: 44990, oldPrice: 54990, onSale: true, image: 'ticket-to-ride.jpg', description: 'Conecta ciudades europeas con líneas de tren. Reglas simples, picardía competitiva y partidas que no se alargan.', players: '2 – 5 jugadores', stock: 6 },
  { id: 'azul', name: 'Azul', category: 'familiares', price: 39990, image: 'azul.jpg', description: 'Decora un palacio portugués con azulejos. Estética impecable, componentes preciosos y una curva de aprendizaje suavísima.', players: '2 – 4 jugadores', stock: 10 },
  { id: 'dixit', name: 'Dixit', category: 'familiares', price: 31990, image: 'dixit.jpg', description: 'Cartas ilustradas, pistas en frases breves y un punto de complicidad lúdica. Perfecto para grupos creativos.', players: '3 – 6 jugadores', stock: 9 },
  { id: 'magic-ff-starter', name: 'Magic: The Gathering — Final Fantasy Starter Kit', category: 'cartas', price: 29990, image: 'magic-ff-starter.jpg', description: 'Dos mazos pre-construidos (Cloud y Sephiroth), listos para jugar el clásico TCG sin armar nada. Incluye códigos para MTG Arena.', players: '2 jugadores', stock: 15 },
  { id: 'exploding-kittens', name: 'Exploding Kittens', category: 'cartas', price: 20990, oldPrice: 24990, onSale: true, image: 'exploding-kittens.jpg', description: 'Un party irreverente que mezcla suerte, sabotaje y humor absurdo. Imposible terminar serio una partida.', players: '2 – 5 jugadores', stock: 20 },
  { id: '7-wonders-duel', name: '7 Wonders Duel', category: 'cartas', price: 26990, image: '7-wonders-duel.jpg', description: 'Versión a dos jugadores de 7 Wonders. Tres caminos para ganar, decisiones afiladas y partidas que no se atascan.', players: '2 jugadores', stock: 7 },
  { id: 'pandemic', name: 'Pandemic', category: 'cooperativos', price: 36990, oldPrice: 42990, onSale: true, image: 'pandemic.jpg', description: 'Equipo de epidemiólogos contra cuatro enfermedades a punto de salirse de control. Tensión real con cada turno.', players: '2 – 4 jugadores', stock: 11 },
  { id: 'spirit-island', name: 'Spirit Island', category: 'cooperativos', price: 79990, image: 'spirit-island.jpg', description: 'Espíritus ancestrales defienden su isla de la colonización. Cooperativo profundo, exigente, con identidad propia.', players: '1 – 4 jugadores', stock: 4 },
  { id: 'gloomhaven', name: 'Gloomhaven', category: 'cooperativos', price: 129990, image: 'gloomhaven.jpg', description: 'Campaña épica con decenas de horas de aventuras tácticas. Para grupos comprometidos que quieren un proyecto largo.', players: '1 – 4 jugadores', stock: 2 },
];

export const CATEGORY_LABELS: Record<string, { title: string; eyebrow: string; lead: string }> = {
  estrategia: {
    title: 'Estrategia',
    eyebrow: 'Categoría · Estrategia',
    lead: 'Juegos para sentarse con paciencia. Recursos, territorio y planes a varios turnos vista. Pensados para grupos que disfrutan tanto el viaje como la victoria.',
  },
  familiares: {
    title: 'Familiares',
    eyebrow: 'Categoría · Familiares',
    lead: 'Ligeros pero con chispa. Reglas accesibles, ritmo amable y suficiente decisión para no aburrir a los más jugones de la mesa.',
  },
  cartas: {
    title: 'Cartas',
    eyebrow: 'Categoría · Cartas',
    lead: 'Del TCG competitivo al party rápido. Mazos, manos y decisiones a contrarreloj.',
  },
  cooperativos: {
    title: 'Cooperativos',
    eyebrow: 'Categoría · Cooperativos',
    lead: 'Todos contra el juego. Ideal cuando el grupo prefiere conspirar antes que pelear.',
  },
};
