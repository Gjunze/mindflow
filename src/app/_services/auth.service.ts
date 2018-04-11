import { Injectable } from '@angular/core'
@Injectable()
export class AuthService {
  _token;
  set token(value) {
    this._token = value;
  }
  get token() {
    return this._token;
  }
}