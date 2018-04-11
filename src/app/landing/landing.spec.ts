import {ComponentFixture, TestBed} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LandingComponent } from './landing.component'
import { RouterLinkStubDirective } from '../../testing'
describe('LandingComponent', () => {
  let comp: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingComponent, RouterLinkStubDirective ]
    }) 
    fixture = TestBed.createComponent(LandingComponent)
    de = fixture.debugElement.query(By.css('header a'))
    
  })
  it('title should be mindflow', () => {
    expect(de.nativeElement.textContent.trim()).toBe('MindFlow')
  })
})