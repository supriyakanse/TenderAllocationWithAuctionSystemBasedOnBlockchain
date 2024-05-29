// login.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  isFieldInvalid(field: string): boolean {
    return (
      this.loginForm.get(field).invalid &&
      (this.loginForm.get(field).dirty || this.loginForm.get(field).touched)
    );
  }
  ngOnInit(): void {
  }

  async login() {
    sessionStorage.clear();
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email').value;
      const password = this.loginForm.get('password').value;
      
      if (email === "admin" && password === "admin") {
        window.alert("Admin Logged in Successfully!");
        sessionStorage.setItem('user', "admin@grblock.com");
        this.router.navigate(['/adminHomePage'], { relativeTo: this.route });
      } else {
        console.log("Logging in User");
        await this.authService.SignIn(email, password);
      }
      this.loginForm.reset();
    } else {
      alert("something went wrong")
    }
  }
}
