/**
 * Press Kit Download System
 * Generates ZIPs client-side using JSZip + FileSaver.
 * 
 * Reads file URLs directly from the DOM so adding new assets
 * to the HTML automatically includes them in downloads.
 */

(function () {
  'use strict';

  // ── Section Definitions ──────────────────────────────────────────
  // Each section maps a data-download key to:
  //   selector  – CSS selector scoping where to find assets
  //   folder    – folder name inside the full ZIP
  //   zipName   – filename for individual section download
  //   extract   – function that returns an array of URLs from the DOM scope
  const SECTIONS = {
    trailer: {
      selector: '[aria-labelledby="trailer-titulo"]',
      folder: '02_trailer',
      zipName: 'vem_exu_trailer.zip',
      extract(scope) {
        const urls = [];
        // video source elements
        scope.querySelectorAll('video source').forEach(s => urls.push(s.src));
        // direct download links to mp4
        scope.querySelectorAll('a[download]').forEach(a => urls.push(a.href));
        return [...new Set(urls)];
      }
    },
    screenshots: {
      selector: '[aria-labelledby="screenshots-titulo"]',
      folder: '03_screenshots',
      zipName: 'vem_exu_screenshots.zip',
      extract(scope) {
        return [...scope.querySelectorAll('.pk-gallery img')].map(img => img.src);
      }
    },
    gifs: {
      selector: '[aria-labelledby="gifs-titulo"]',
      folder: '06_gifs',
      zipName: 'vem_exu_gifs.zip',
      extract(scope) {
        return [...scope.querySelectorAll('.pk-gallery img')].map(img => img.src);
      }
    },
    logos: {
      selector: '[aria-labelledby="logos-titulo"]',
      folder: '04_logos',
      zipName: 'vem_exu_logos.zip',
      extract(scope) {
        return [...scope.querySelectorAll('.pk-gallery img')].map(img => img.src);
      }
    },
    keyart: {
      selector: '[aria-labelledby="keyart-titulo"]',
      folder: '01_keyart',
      zipName: 'vem_exu_keyart.zip',
      extract(scope) {
        return [...scope.querySelectorAll('.pk-gallery img')].map(img => img.src);
      }
    },
    characters: {
      selector: '[aria-labelledby="personagens-titulo"]',
      folder: '05_characters',
      zipName: 'vem_exu_characters.zip',
      extract(scope) {
        return [...scope.querySelectorAll('.pk-gallery img')].map(img => img.src);
      }
    },
    clips: {
      selector: '[aria-labelledby="clips-titulo"]',
      folder: '07_clips',
      zipName: 'vem_exu_clips.zip',
      extract(scope) {
        return [...scope.querySelectorAll('video source')].map(s => s.src);
      }
    },
    stickers: {
      selector: '#extras',
      folder: '08_stickers',
      zipName: 'vem_exu_stickers.zip',
      extract(scope) {
        return [...scope.querySelectorAll('.pk-sticker-grid img')].map(img => img.src);
      }
    },
    events: {
      selector: '[aria-labelledby="eventos-titulo"]',
      folder: '09_events',
      zipName: 'vem_exu_events.zip',
      extract(scope) {
        return [...scope.querySelectorAll('.pk-gallery img')].map(img => img.src);
      }
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────

  /** Extract filename from a URL */
  function filenameFromUrl(url) {
    return decodeURIComponent(url.split('/').pop().split('?')[0]);
  }

  /** Fetch a file as ArrayBuffer with error handling */
  async function fetchFile(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return { name: filenameFromUrl(url), data: await res.arrayBuffer() };
  }

  /** Get all URLs for a section by reading from the DOM */
  function getUrlsForSection(key) {
    const section = SECTIONS[key];
    if (!section) return [];
    const scope = document.querySelector(section.selector);
    if (!scope) return [];
    return section.extract(scope).filter(Boolean);
  }

  /** Set button loading state */
  function setLoading(btn, loading) {
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Preparando…';
      btn.classList.add('pk-download-loading');
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.originalText || btn.textContent;
      btn.classList.remove('pk-download-loading');
      btn.disabled = false;
    }
  }

  // ── Download: Single Section ─────────────────────────────────────

  async function downloadSection(key, btn) {
    const section = SECTIONS[key];
    if (!section) return;

    const urls = getUrlsForSection(key);
    if (urls.length === 0) return;

    // If only one file, download directly (no ZIP needed)
    if (urls.length === 1) {
      const a = document.createElement('a');
      a.href = urls[0];
      a.download = filenameFromUrl(urls[0]);
      a.click();
      return;
    }

    setLoading(btn, true);
    try {
      const zip = new JSZip();
      const files = await Promise.all(urls.map(fetchFile));
      files.forEach(f => zip.file(f.name, f.data));
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, section.zipName);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Erro ao preparar o download. Tente novamente.');
    } finally {
      setLoading(btn, false);
    }
  }

  // ── Download: Full Press Kit ─────────────────────────────────────

  async function downloadFull(btn) {
    setLoading(btn, true);
    try {
      const zip = new JSZip();

      // Collect all sections, organized in folders
      const fetchPromises = [];

      for (const [key, section] of Object.entries(SECTIONS)) {
        const urls = getUrlsForSection(key);
        for (const url of urls) {
          fetchPromises.push(
            fetchFile(url).then(f => ({
              folder: section.folder,
              name: f.name,
              data: f.data
            }))
          );
        }
      }

      const allFiles = await Promise.all(fetchPromises);
      allFiles.forEach(f => zip.file(`${f.folder}/${f.name}`, f.data));

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'vem_exu_presskit_full.zip');
    } catch (err) {
      console.error('Full download failed:', err);
      alert('Erro ao preparar o download completo. Tente novamente.');
    } finally {
      setLoading(btn, false);
    }
  }

  // ── Event Binding ────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-download]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.dataset.download;
        if (key === 'full') {
          downloadFull(btn);
        } else {
          downloadSection(key, btn);
        }
      });
    });
  });

})();
