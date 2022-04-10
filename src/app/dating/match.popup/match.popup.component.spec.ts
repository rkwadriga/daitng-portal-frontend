import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Match.PopupComponent } from './match.popup.component';

describe('Match.PopupComponent', () => {
  let component: Match.PopupComponent;
  let fixture: ComponentFixture<Match.PopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Match.PopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Match.PopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
