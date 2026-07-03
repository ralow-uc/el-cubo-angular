import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EventoService } from './evento.service';
import { Evento } from '../models/evento.model';

/** Datos de prueba que imitan la estructura de `eventos.json`. */
const MOCK_EVENTOS: Evento[] = [
  {
    id: 1,
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
  {
    id: 2,
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
];

const JSON_URL = 'assets/data/eventos.json';

describe('EventoService', () => {
  let service: EventoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // El orden importa: el backend de pruebas debe sobrescribir al real.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EventoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getEventos() hace GET al JSON y devuelve la lista', () => {
    let resultado: Evento[] | undefined;
    service.getEventos().subscribe((data) => (resultado = data));

    const req = httpMock.expectOne(JSON_URL);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_EVENTOS);

    expect(resultado).toEqual(MOCK_EVENTOS);
    expect(resultado?.length).toBe(2);
  });

  it('getDestacados() devuelve solo los eventos destacados', () => {
    let resultado: Evento[] | undefined;
    service.getDestacados().subscribe((data) => (resultado = data));

    httpMock.expectOne(JSON_URL).flush(MOCK_EVENTOS);

    expect(resultado?.length).toBe(1);
    expect(resultado?.[0].id).toBe(1);
  });

  it('getPorTipo() filtra por el tipo indicado', () => {
    let resultado: Evento[] | undefined;
    service.getPorTipo('Taller').subscribe((data) => (resultado = data));

    httpMock.expectOne(JSON_URL).flush(MOCK_EVENTOS);

    expect(resultado?.length).toBe(1);
    expect(resultado?.[0].tipo).toBe('Taller');
  });

  it('getPorTipo("todos") no filtra la lista', () => {
    let resultado: Evento[] | undefined;
    service.getPorTipo('todos').subscribe((data) => (resultado = data));

    httpMock.expectOne(JSON_URL).flush(MOCK_EVENTOS);

    expect(resultado?.length).toBe(2);
  });
});
