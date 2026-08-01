import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';

@Component({
  selector: 'app-register',
  imports: [RouterLink, AuthLayout],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {}
