import {ComponentFixture, TestBed} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {ToastsManager, ToastOptions} from 'ng2-toastr';
import {AppComponent} from './app.component';
import {UserService} from './_services';
import { RouterOutletStubComponent } from '../testing'

describe('AppComponent', ()=> {
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(()=> {
    let userServiceStub = {
      user: {
        userId() {
          return 1
        }
      },
      isAdmin() {
        return false
      }
    }
    TestBed.configureTestingModule({
      declarations: [AppComponent, RouterOutletStubComponent],
      providers: [{provide: UserService, useValue: userServiceStub}, ToastsManager, ToastOptions]
    });
    fixture = TestBed.createComponent(AppComponent);
    de = fixture.debugElement.query(By.css('#wrapper'))
    el = de.nativeElement
  })
  it('shoud display wrapper', () => {
    fixture.detectChanges()
    expect(el).toBeDefined()
  })
})

