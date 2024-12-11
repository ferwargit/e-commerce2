// Configuración global para pruebas en JSDOM
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { expect } from 'vitest';

// Mock de localStorage
const localStorageMock = {
    store: {},
    getItem: vi.fn((key) => localStorageMock.store[key] || null),
    setItem: vi.fn((key, value) => {
        localStorageMock.store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
        delete localStorageMock.store[key];
    }),
    clear: vi.fn(() => {
        localStorageMock.store = {};
    })
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true
});

// Configuraciones adicionales de JSDOM si son necesarias
window.console.log = vi.fn();

// Add custom matchers if needed
expect.extend({
  // Custom matchers can be added here
});
