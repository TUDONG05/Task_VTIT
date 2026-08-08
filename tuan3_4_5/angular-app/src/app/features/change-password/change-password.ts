import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';

@Component({
  selector: 'app-change-password',
  imports: [RouterLink, AuthLayout],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss'
})
export class ChangePassword {}
