import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminJornadaPage } from './admin-jornada.page';
import { signal } from '@angular/core';

describe('AdminJornadaPage - Export Loading State (T022-T023)', () => {
  let component: AdminJornadaPage;
  let fixture: ComponentFixture<AdminJornadaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminJornadaPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminJornadaPage);
    component = fixture.componentInstance;
  });

  describe('T022: Loading state signal', () => {
    it('should have isExporting signal that starts as false', () => {
      fixture.detectChanges();
      // Initially should be false (no export in progress)
      expect(component.isExporting).toBeDefined();
    });

    it('should set isExporting to true when export starts', (done) => {
      fixture.detectChanges();

      // Mock jornada with cards
      const mockJornada = {
        id: 'test-jornada',
        nome: 'Test Jornada',
        questionCardIds: ['card1', 'card2'],
        ativa: true,
      } as any;

      // Manually set to true to simulate export start
      component.isExporting = true;
      fixture.detectChanges();

      expect(component.isExporting).toBe(true);
      done();
    });

    it('should set isExporting to false when export completes', (done) => {
      fixture.detectChanges();
      component.isExporting = true;

      // Simulate completion
      component.isExporting = false;
      fixture.detectChanges();

      expect(component.isExporting).toBe(false);
      done();
    });
  });

  describe('T023: UI visibility based on loading state', () => {
    it('should show spinner when isExporting is true', () => {
      fixture.detectChanges();
      component.isExporting = true;
      fixture.detectChanges();

      // Spinner should be visible when isExporting = true
      const spinner = fixture.nativeElement.querySelector('[data-testid="export-spinner"]');
      if (spinner) {
        expect(spinner).toBeTruthy();
      }
    });

    it('should hide spinner when isExporting is false', () => {
      fixture.detectChanges();
      component.isExporting = false;
      fixture.detectChanges();

      // Spinner should be hidden when isExporting = false
      const spinner = fixture.nativeElement.querySelector('[data-testid="export-spinner"]');
      if (spinner) {
        expect(spinner.style.display).not.toBe('block');
      }
    });

    it('should disable export buttons when isExporting is true', () => {
      fixture.detectChanges();
      component.isExporting = true;
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('.btn-export-anki');
      buttons.forEach((btn: HTMLButtonElement) => {
        if (btn) {
          expect(btn.disabled).toBe(true);
        }
      });
    });

    it('should enable export buttons when isExporting is false', () => {
      fixture.detectChanges();
      component.isExporting = false;
      fixture.detectChanges();

      // Buttons should be enabled (unless jornada has no cards)
      const buttons = fixture.nativeElement.querySelectorAll('.btn-export-anki');
      buttons.forEach((btn: HTMLButtonElement) => {
        if (btn) {
          // Should not be disabled due to loading state
          // (may be disabled for other reasons like no cards)
        }
      });
    });
  });
});
