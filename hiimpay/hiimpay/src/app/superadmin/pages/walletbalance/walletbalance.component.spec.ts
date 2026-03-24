import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletbalanceComponent } from './walletbalance.component';

describe('WalletbalanceComponent', () => {
  let component: WalletbalanceComponent;
  let fixture: ComponentFixture<WalletbalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WalletbalanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletbalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
