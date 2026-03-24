import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WallwtCpocComponent } from './wallwt-cpoc.component';

describe('WallwtCpocComponent', () => {
  let component: WallwtCpocComponent;
  let fixture: ComponentFixture<WallwtCpocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WallwtCpocComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WallwtCpocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
