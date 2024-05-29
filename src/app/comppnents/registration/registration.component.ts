import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseConfigService } from '../../services/firebase-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    public firebaseConfigService: FirebaseConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      name: ['', Validators.required],
      firmName: ['', Validators.required],
      email: ['', [Validators.required]],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    });
  }

  register() {
    if (this.registrationForm.valid) {
      const registrationMap = {
        email: this.registrationForm.value.email,
        phone: this.registrationForm.value.phone,
        name: this.registrationForm.value.name,
        password: this.registrationForm.value.password,
        firmName: this.registrationForm.value.firmName
      };

      this.authService.SignUp(this.registrationForm.value.email, this.registrationForm.value.password)
        .then(async () => {
          await this.firebaseConfigService.registerUserInDb(registrationMap);
          this.router.navigate(['/login']);
        });
    } else {
      // Mark all fields as touched to display validation messages
      Object.values(this.registrationForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registrationForm.controls; }
}
