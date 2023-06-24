import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {ASharedInterface} from '@rps-firebase/shared';
import {CommonModule} from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'rps-firebase-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  something: ASharedInterface = {
    name: 'Phong Angular App',
    isSomething: true,
    amount: 6
  }
}
