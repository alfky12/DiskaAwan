// ==UserScript==
// @name         ASUSWRT Merlin: RequireJS Fix
// @namespace    asusrouter.tweak.fix
// @version      1.3.2
// @description  Patch for race condition.
// @match        *://*/Main_Analysis_Content.asp
// @match        *://*/GameBoost.asp
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';
  console.log('Patch for race condition.');

  let requireBlocked = false;

  const originalWrite = document.write;
  document.write = function (html) {
    if (/require(?:\.min)?\.js/i.test(html)) {
      requireBlocked = true;
      return;
    }
    return originalWrite.call(document, html);
  };

  window.addEventListener('DOMContentLoaded', () => {
    if (requireBlocked && typeof require === 'undefined') {
      const script = document.createElement('script');
      script.src = '/require/require.min.js';
      script.onload = () => {
        tryCallInitialWithDelay();
      };
      document.head.appendChild(script);
    } else {
      tryCallInitialWithDelay();
    }
  });

  Object.defineProperty(window, 'define', {
    configurable: true,
    enumerable: true,
    get() {
      return window._defineWrapper;
    },
    set(fn) {
      if (typeof fn === 'function' && fn.amd) {
        const original = fn;
        window._defineWrapper = function (...args) {
          if (typeof args[0] === 'function' || Array.isArray(args[0])) {
            const anonName = 'anon-' + Math.random().toString(36).slice(2);
            return original(anonName, ...args);
          }
          return original(...args);
        };
        window._defineWrapper.amd = original.amd;
      } else {
        window._defineWrapper = fn;
      }
    }
  });

  function tryCallInitialWithDelay() {
    const tryInit = () => {
      if (typeof initial === 'function') {
        try {
          initial();
        } catch (e) {}
      }
    };

    setTimeout(tryInit, 300);
  }
})();
