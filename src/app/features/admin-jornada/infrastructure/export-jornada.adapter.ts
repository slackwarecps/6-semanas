import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Adapter for export jornada to Anki .colpkg format.
 * Handles HTTP communication with backend export endpoint.
 */
@Injectable({
  providedIn: 'root',
})
export class ExportJornadaAdapter {
  private readonly http = inject(HttpClient);

  /**
   * Exports jornada cards to Anki .colpkg format.
   *
   * @param jornadaId - ID of jornada to export
   * @returns Observable<Blob> - The .colpkg file as binary blob
   *
   * @throws Error 404 - Jornada not found for this user
   * @throws Error 400 - Jornada has no cards to export
   * @throws Error 500 - Server error during export
   */
  exportJornadaToAnki(jornadaId: string): Observable<Blob> {
    const url = `${environment.backendBaseUrl}/jornadas/${jornadaId}/export-anki`;
    return this.http.post(url, null, {
      responseType: 'blob',
    });
  }
}
