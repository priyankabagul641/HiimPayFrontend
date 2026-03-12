import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualbrandComponent } from './manualbrand.component';

describe('ManualbrandComponent', () => {
  let component: ManualbrandComponent;
  let fixture: ComponentFixture<ManualbrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManualbrandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManualbrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
