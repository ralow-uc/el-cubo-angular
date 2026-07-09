import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EventoService } from './evento.service';
import { ConfigService } from './config.service';
import { Evento, EventoInput } from '../models/evento.model';

/** URL de una Realtime Database de pruebas (fuerza el modo Firebase). */
const DB = 'https://elcubo-test-default-rtdb.firebaseio.com';
const COL = `${DB}/eventos.json`;
const item = (id: string) => `${DB}/eventos/${id}.json`;

/** Respuesta que imita el objeto indexado por push-id que devuelve Firebase. */
const MOCK_OBJ: Record<string, EventoInput> = {
  ev1: {
    nombre: 'Torneo de Catan',
    tipo: 'Torneo',
    categoria: 'estrategia',
    fecha: '2026-07-12',
    hora: '16:00',
    lugar: 'Tienda El Cubo',
    cupos: 16,
    precio: 8000,
    destacado: true,
    imagen: 'catan.jpg',
    descripcion: 'Clasificatorias y final.',
  },
  ev2: {
    nombre: 'Taller de Azul',
    tipo: 'Taller',
    categoria: 'familiares',
    fecha: '2026-07-26',
    hora: '11:30',
    lugar: 'Tienda El Cubo',
    cupos: 20,
    precio: 0,
    destacado: false,
    imagen: 'azul.jpg',
    descripcion: 'Para principiantes.',
  },
};

const NUEVO: EventoInput = {
  nombre: 'Noche de Pandemic',
  tipo: 'Noche de juegos',
  categoria: 'cooperativos',
  fecha: '2026-09-01',
  hora: '18:30',
  lugar: 'Tienda El Cubo',
  cupos: 10,
  precio: 5000,
  destacado: false,
  imagen: 'pandemic.jpg',
  descripcion: 'Todos contra el juego.',
};

describe('EventoService (API REST Firebase)', () => {
  let service: EventoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // El orden importa: el backend de pruebas debe sobrescribir al real.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(ConfigService).firebaseDbUrl = DB; // activa el modo Firebase
    service = TestBed.inject(EventoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente y detecta el backend', () => {
    expect(service).toBeTruthy();
    expect(service.usaFirebase).toBe(true);
  });

  it('getEventos() hace GET y convierte el objeto de Firebase a arreglo', () => {
    let res: Evento[] | undefined;
    service.getEventos().subscribe((d) => (res = d));

    const req = httpMock.expectOne(COL);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_OBJ);

    expect(res?.length).toBe(2);
    expect(res?.[0].id).toBe('ev1'); // la clave pasa a ser el id
    expect(res?.[0].nombre).toBe('Torneo de Catan');
  });

  it('getEventos() devuelve [] cuando Firebase responde null', () => {
    let res: Evento[] | undefined;
    service.getEventos().subscribe((d) => (res = d));
    httpMock.expectOne(COL).flush(null);
    expect(res).toEqual([]);
  });

  it('getDestacados() filtra solo los eventos destacados', () => {
    let res: Evento[] | undefined;
    service.getDestacados().subscribe((d) => (res = d));
    httpMock.expectOne(COL).flush(MOCK_OBJ);
    expect(res?.length).toBe(1);
    expect(res?.[0].id).toBe('ev1');
  });

  it('crear() hace POST y adopta la clave que asigna Firebase', () => {
    let res: Evento | undefined;
    service.crear(NUEVO).subscribe((d) => (res = d));

    const req = httpMock.expectOne(COL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(NUEVO);
    req.flush({ name: '-NnewKey' });

    expect(res?.id).toBe('-NnewKey');
    expect(res?.nombre).toBe('Noche de Pandemic');
  });

  it('actualizar() hace PUT sobre /eventos/{id}', () => {
    let res: Evento | undefined;
    service.actualizar('ev1', NUEVO).subscribe((d) => (res = d));

    const req = httpMock.expectOne(item('ev1'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(NUEVO);
    req.flush(NUEVO);

    expect(res?.id).toBe('ev1');
    expect(res?.nombre).toBe('Noche de Pandemic');
  });

  it('eliminar() hace DELETE sobre /eventos/{id}', () => {
    let completado = false;
    service.eliminar('ev1').subscribe(() => (completado = true));

    const req = httpMock.expectOne(item('ev1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completado).toBe(true);
  });
});

/**
 * Modo demo (sin Firebase): el servicio siembra desde el JSON local y persiste
 * el CRUD en localStorage. Aquí verificamos ese camino de respaldo.
 */
describe('EventoService (modo demo · localStorage)', () => {
  let service: EventoService;
  let httpMock: HttpTestingController;
  const LOCAL_URL = 'assets/data/eventos.json';

  beforeEach(() => {
    localStorage.removeItem('elcubo:eventos');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(ConfigService).firebaseDbUrl = ''; // fuerza el modo demo
    service = TestBed.inject(EventoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.removeItem('elcubo:eventos');
  });

  it('no usa Firebase cuando la URL está vacía', () => {
    expect(service.usaFirebase).toBe(false);
  });

  it('getEventos() siembra desde el JSON local la primera vez', () => {
    let res: Evento[] | undefined;
    service.getEventos().subscribe((d) => (res = d));

    const req = httpMock.expectOne(LOCAL_URL);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_OBJ); // objeto local → arreglo

    expect(res?.length).toBe(2);
    // Queda cacheado en localStorage.
    expect(localStorage.getItem('elcubo:eventos')).toContain('Torneo de Catan');
  });

  it('crear() persiste el nuevo evento en localStorage (sin HTTP de escritura)', () => {
    let creado: Evento | undefined;
    service.crear(NUEVO).subscribe((d) => (creado = d));
    // crear() llama a leerLocal(), que siembra desde el JSON local.
    httpMock.expectOne(LOCAL_URL).flush(MOCK_OBJ);

    expect(creado?.id).toBeTruthy();
    const guardado = JSON.parse(localStorage.getItem('elcubo:eventos') ?? '[]');
    expect(guardado.length).toBe(3); // 2 semilla + 1 nuevo
    httpMock.verify(); // no debe haber ninguna petición de escritura pendiente
  });
});
