import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Footer global del sitio con enlaces a categorías y datos de contacto. */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent {}
