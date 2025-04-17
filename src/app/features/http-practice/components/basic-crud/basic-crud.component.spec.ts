import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicCrudComponent } from './basic-crud.component';

describe('BasicCrudComponent', () => {
  let component: BasicCrudComponent;
  let fixture: ComponentFixture<BasicCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicCrudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
