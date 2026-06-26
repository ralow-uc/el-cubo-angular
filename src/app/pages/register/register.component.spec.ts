import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('rechaza un correo con formato inválido', () => {
    component.form.controls.email.setValue('no-es-un-email');
    expect(component.form.controls.email.errors?.['email']).toBeTruthy();
  });

  it('acepta una contraseña de 6 caracteres con mayúscula y número (mínimo pauta)', () => {
    component.form.controls.password.setValue('Abc123');
    expect(component.form.controls.password.errors).toBeNull();
  });

  it('rechaza una fecha de nacimiento de menos de 13 años', () => {
    const today = new Date();
    const tenYearsAgo = new Date(
      today.getFullYear() - 10,
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .split('T')[0];
    component.form.controls.birthdate.setValue(tenYearsAgo);
    expect(component.form.controls.birthdate.errors?.['age']).toBeTruthy();
  });

  it('clear() limpia todos los campos del formulario', () => {
    component.form.setValue({
      fullName: 'Raúl Low',
      username: 'raullow',
      email: 'raul@example.com',
      password: 'Abc123',
      passwordConfirm: 'Abc123',
      birthdate: '2000-01-01',
      address: 'Av. Providencia 1234',
    });
    component.clear();
    expect(component.form.controls.fullName.value).toBe('');
    expect(component.form.controls.username.value).toBe('');
    expect(component.form.controls.email.value).toBe('');
    expect(component.form.controls.password.value).toBe('');
    expect(component.form.controls.address.value).toBe('');
  });

  it('la dirección de despacho es opcional (sin valor el form puede ser válido)', () => {
    component.form.setValue({
      fullName: 'Raúl Low',
      username: 'raullow',
      email: 'raul@example.com',
      password: 'Abc123',
      passwordConfirm: 'Abc123',
      birthdate: '2000-01-01',
      address: '',
    });
    expect(component.form.valid).toBeTrue();
  });
});
