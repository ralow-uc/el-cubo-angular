import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('siembra 12 productos en localStorage en la primera carga', () => {
    expect(service.all().length).toBe(12);
  });

  it('byId() devuelve el producto correcto', () => {
    const catan = service.byId('catan');
    expect(catan).toBeTruthy();
    expect(catan?.name).toBe('Catan');
    expect(catan?.category).toBe('estrategia');
  });

  it('byId() devuelve null si no existe', () => {
    expect(service.byId('no-existe')).toBeNull();
  });

  it('byCategory() filtra por slug correctamente', () => {
    const cooperativos = service.byCategory('cooperativos');
    expect(cooperativos.length).toBe(3);
    cooperativos.forEach((p) => expect(p.category).toBe('cooperativos'));
  });

  it('create() agrega un producto y persiste', () => {
    service.create({
      id: 'test-prod',
      name: 'Test',
      category: 'estrategia',
      description: 'Test desc',
      price: 1000,
      stock: 5,
      players: '1-2',
      image: 'test.jpg',
    });
    expect(service.byId('test-prod')?.name).toBe('Test');
  });

  it('update() modifica un producto existente', () => {
    service.update('catan', { stock: 99 });
    expect(service.byId('catan')?.stock).toBe(99);
  });

  it('remove() borra un producto', () => {
    service.remove('catan');
    expect(service.byId('catan')).toBeNull();
  });

  it('discountStock() resta del stock sin bajar de 0', () => {
    const before = service.byId('catan')!.stock;
    service.discountStock('catan', 5);
    expect(service.byId('catan')?.stock).toBe(before - 5);
    service.discountStock('catan', 9999);
    expect(service.byId('catan')?.stock).toBe(0);
  });
});
