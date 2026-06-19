import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('crea el componente con el form Reactive', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeTruthy();
    expect(component.form.controls.login).toBeTruthy();
    expect(component.form.controls.password).toBeTruthy();
  });

  it('el form es inválido cuando los campos están vacíos', () => {
    component.form.setValue({ login: '', password: '' });
    expect(component.form.valid).toBeFalse();
    expect(component.form.controls.login.errors?.['required']).toBeTruthy();
    expect(component.form.controls.password.errors?.['required']).toBeTruthy();
  });

  it('el form es válido cuando ambos campos tienen valor', () => {
    component.form.setValue({ login: 'admin', password: 'Admin2026!' });
    expect(component.form.valid).toBeTrue();
  });

  it('submit con form inválido marca los campos como touched y no navega', () => {
    component.form.setValue({ login: '', password: '' });
    component.submit();
    expect(component.form.controls.login.touched).toBeTrue();
    expect(component.form.controls.password.touched).toBeTrue();
  });

  it('submit con credenciales inválidas asigna alertMsg', () => {
    component.form.setValue({ login: 'noexiste', password: 'xxx' });
    component.submit();
    expect(component.alertMsg).toMatch(/incorrectos/i);
  });
});
