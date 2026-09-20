import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActivatedRoute } from '@angular/router';

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new AppComponent();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it(`debería tener como título 'front'`, () => {
    expect(component.title).toEqual('front');
  });
});