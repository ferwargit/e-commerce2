import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Contacto Form', () => {
  let dom;

  beforeEach(() => {
    // Configurar un DOM virtual para las pruebas
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <input id="name" value="Test Name">
          <input id="email" value="test@example.com">
          <input id="message" value="Test Message">
        </body>
      </html>
    `, {
      url: 'http://localhost',
      runScripts: 'dangerously'
    });

    global.document = dom.window.document;
    global.window = dom.window;
  });

  it('debería limpiar los campos del formulario después de 50ms', async () => {
    // Importar el script de contacto
    await import('../api/contacto.js');

    // Esperar 100ms para asegurar que el setTimeout se ha ejecutado
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verificar que los campos estén vacíos
    expect(document.getElementById('name').value).toBe('');
    expect(document.getElementById('email').value).toBe('');
    expect(document.getElementById('message').value).toBe('');
  });
});
