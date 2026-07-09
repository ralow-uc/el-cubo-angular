import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventoService } from '../../../services/evento.service';
import { CategoriaEvento, Evento, EventoInput, TipoEvento } from '../../../models/evento.model';
import { ToastService } from '../../../services/toast.service';
import { formatCLP, imageUrl } from '../../../services/storage.util';

/**
 * Mantenedor de eventos (rol admin). Lista la agenda en una tabla y abre un
 * modal con Reactive Form para crear o editar. A diferencia del mantenedor de
 * productos (síncrono, localStorage), aquí el CRUD es **asíncrono contra la
 * API REST** (`EventoService` → Firebase): cada operación devuelve un
 * `Observable`, y al completarse se recarga la lista y se avisa con un toast.
 */
@Component({
  selector: 'app-admin-eventos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-eventos.component.html',
})
export class AdminEventosComponent implements OnInit {
  private eventoService = inject(EventoService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly eventos = signal<Evento[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);

  readonly formatCLP = formatCLP;
  readonly imageUrl = imageUrl;

  readonly tipos: TipoEvento[] = [
    'Torneo',
    'Lanzamiento',
    'Taller',
    'Noche de juegos',
    'Aprende a jugar',
  ];
  readonly categorias: CategoriaEvento[] = [
    'estrategia',
    'familiares',
    'cartas',
    'cooperativos',
    'general',
  ];

  open = signal(false);
  editingId: string | null = null;
  alertMsg: string | null = null;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    tipo: ['Torneo' as TipoEvento, [Validators.required]],
    categoria: ['general' as CategoriaEvento, [Validators.required]],
    fecha: ['', [Validators.required]],
    hora: ['', [Validators.required]],
    lugar: ['', [Validators.required]],
    cupos: [10, [Validators.required, Validators.min(1)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    imagen: [''],
    destacado: [false],
    descripcion: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  /** (GET) Recarga la lista de eventos desde el servicio. */
  private cargar(): void {
    this.cargando.set(true);
    this.eventoService.getEventos().subscribe({
      next: (data) => {
        this.eventos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.toast.show('No se pudo cargar la agenda de eventos.', 'error');
      },
    });
  }

  openNew(): void {
    this.editingId = null;
    this.alertMsg = null;
    this.form.reset({
      nombre: '',
      tipo: 'Torneo',
      categoria: 'general',
      fecha: '',
      hora: '',
      lugar: 'Tienda El Cubo · Providencia',
      cupos: 10,
      precio: 0,
      imagen: '',
      destacado: false,
      descripcion: '',
    });
    this.open.set(true);
  }

  openEdit(e: Evento): void {
    this.editingId = e.id;
    this.alertMsg = null;
    this.form.reset({
      nombre: e.nombre,
      tipo: e.tipo,
      categoria: e.categoria,
      fecha: e.fecha,
      hora: e.hora,
      lugar: e.lugar,
      cupos: e.cupos,
      precio: e.precio,
      imagen: e.imagen ?? '',
      destacado: !!e.destacado,
      descripcion: e.descripcion,
    });
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  /** (DELETE) Elimina el evento tras confirmar. */
  remove(e: Evento): void {
    if (!confirm(`¿Eliminar el evento "${e.nombre}"?`)) return;
    this.eventoService.eliminar(e.id).subscribe({
      next: () => {
        this.toast.show('Evento eliminado.', 'success');
        this.cargar();
      },
      error: () => this.toast.show('No se pudo eliminar el evento.', 'error'),
    });
  }

  errorOf(name: keyof typeof this.form.controls): string | null {
    const ctrl = this.form.controls[name];
    if (ctrl.valid || (!ctrl.touched && !ctrl.dirty)) return null;
    const e = ctrl.errors;
    if (!e) return null;
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['min'] && name === 'cupos') return 'Debe haber al menos 1 cupo.';
    if (e['min'] && name === 'precio') return 'Precio inválido.';
    return 'Valor inválido.';
  }

  /** (POST / PUT) Crea o actualiza el evento según `editingId`. */
  submit(): void {
    this.alertMsg = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const input: EventoInput = {
      nombre: v.nombre.trim(),
      tipo: v.tipo,
      categoria: v.categoria,
      fecha: v.fecha,
      hora: v.hora,
      lugar: v.lugar.trim(),
      cupos: Number(v.cupos),
      precio: Number(v.precio),
      destacado: v.destacado,
      imagen: v.imagen.trim() || 'hero-board-games.jpg',
      descripcion: v.descripcion.trim(),
    };

    this.guardando.set(true);
    const op$ = this.editingId
      ? this.eventoService.actualizar(this.editingId, input)
      : this.eventoService.crear(input);

    op$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.show(this.editingId ? 'Evento actualizado.' : 'Evento creado.', 'success');
        this.close();
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.alertMsg = (err as Error)?.message ?? 'No se pudo guardar el evento.';
      },
    });
  }

  /** Formatea `YYYY-MM-DD` como `12 de julio de 2026` (sin desfase de zona). */
  formatFecha(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
