/* CrisisLens – main.js */
(function () {
    'use strict';
  
    var dropZone   = document.getElementById('dropZone');
    var fileInput  = document.getElementById('fileInput');
    var fileList   = document.getElementById('fileList');
    var uploadForm = document.getElementById('uploadForm');
    var analyzeBtn = document.getElementById('analyzeBtn');
    var btnIdle    = analyzeBtn ? analyzeBtn.querySelector('.btn-idle')    : null;
    var btnLoading = analyzeBtn ? analyzeBtn.querySelector('.btn-loading') : null;
  
    // ── Click on drop zone → open file picker ──────────────────────
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
      });
    }
  
    // ── Drag & Drop ────────────────────────────────────────────────
    if (dropZone) {
      dropZone.addEventListener('dragenter', function (e) { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragover',  function (e) { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragleave', function (e) { e.preventDefault(); dropZone.classList.remove('dragover'); });
      dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          renderFileList(fileInput.files);
        }
      });
    }
  
    // ── File input change ──────────────────────────────────────────
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        renderFileList(fileInput.files);
      });
    }
  
    // ── Submit validation ──────────────────────────────────────────
    if (uploadForm) {
      uploadForm.addEventListener('submit', function (e) {
        // Remove any existing error
        var existing = document.getElementById('emptyError');
        if (existing) existing.remove();
  
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
          e.preventDefault();
          showEmptyError();
          return;
        }
  
        // Show loading state
        if (analyzeBtn && btnIdle && btnLoading) {
          btnIdle.style.display    = 'none';
          btnLoading.style.display = 'flex';
          analyzeBtn.disabled      = true;
        }
      });
    }
  
    function showEmptyError() {
      var err = document.createElement('div');
      err.id = 'emptyError';
      err.className = 'empty-error';
      err.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please select at least one image before analyzing.';
      // Insert after drop zone
      var section = document.querySelector('.upload-section');
      if (section) {
        var btn = document.getElementById('analyzeBtn');
        section.insertBefore(err, btn);
      }
      // Shake the drop zone
      if (dropZone) {
        dropZone.classList.add('shake');
        setTimeout(function () { dropZone.classList.remove('shake'); }, 500);
      }
      // Auto-remove after 4s
      setTimeout(function () { if (err.parentNode) err.remove(); }, 4000);
    }
  
    // ── Render file confirmation ───────────────────────────────────
    function renderFileList(files) {
      if (!fileList) return;
      fileList.innerHTML = '';
  
      // Remove error if files now selected
      var existing = document.getElementById('emptyError');
      if (existing) existing.remove();
  
      if (!files || files.length === 0) return;
  
      // Green confirmation banner
      var banner = document.createElement('div');
      banner.className = 'upload-confirm-banner';
      banner.innerHTML =
        '<div class="ucb-left">' +
          '<div class="ucb-icon"><i class="fa-solid fa-circle-check"></i></div>' +
          '<div class="ucb-text">' +
            '<span class="ucb-title">' + files.length + ' file' + (files.length > 1 ? 's' : '') + ' ready to analyze</span>' +
            '<span class="ucb-sub">Review below, then click <b>Analyze Images</b></span>' +
          '</div>' +
        '</div>' +
        '<div class="ucb-count">' + files.length + '</div>';
      fileList.appendChild(banner);
  
      // Individual file rows
      var rows = document.createElement('div');
      rows.className = 'file-rows';
  
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var row  = document.createElement('div');
        row.className = 'file-row';
        row.style.animationDelay = (i * 0.07) + 's';
        row.innerHTML =
          '<div class="file-row-left">' +
            '<div class="file-row-icon"><i class="' + getFileIcon(file.name) + '"></i></div>' +
            '<div class="file-row-info">' +
              '<span class="file-row-name">' + truncate(file.name, 40) + '</span>' +
              '<span class="file-row-size">' + formatSize(file.size) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="file-row-badge"><i class="fa-solid fa-check"></i></div>';
        rows.appendChild(row);
      }
  
      fileList.appendChild(rows);
  
      // Pulse analyze button
      if (analyzeBtn) {
        analyzeBtn.classList.remove('btn-ready');
        void analyzeBtn.offsetWidth;
        analyzeBtn.classList.add('btn-ready');
      }
    }
  
    function getFileIcon(filename) {
      var ext = filename.split('.').pop().toLowerCase();
      var map = { jpg: 'fa-solid fa-image', jpeg: 'fa-solid fa-image',
                  png: 'fa-solid fa-image', webp: 'fa-solid fa-image',
                  gif: 'fa-solid fa-film' };
      return map[ext] || 'fa-solid fa-file';
    }
  
    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  
    function truncate(str, max) {
      return str.length > max ? str.slice(0, max - 3) + '...' : str;
    }
  
    // ── Result cards stagger ───────────────────────────────────────
    document.querySelectorAll('.result-card').forEach(function (card) {
      var i = parseInt(card.dataset.index || '0', 10);
      card.style.animationDelay = (i * 0.12) + 's';
    });
  
    // ── Image lightbox ─────────────────────────────────────────────
    document.querySelectorAll('.card-image-wrap').forEach(function (wrap) {
      wrap.style.cursor = 'pointer';
      wrap.addEventListener('click', function () {
        var img = wrap.querySelector('.card-img');
        if (img) openLightbox(img.src, img.alt);
      });
    });
  
    function openLightbox(src, alt) {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(5,13,26,0.93);display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
      var img = document.createElement('img');
      img.src = src; img.alt = alt;
      img.style.cssText = 'max-width:90vw;max-height:88vh;border-radius:12px;box-shadow:0 0 60px rgba(0,229,255,0.2);';
      overlay.appendChild(img);
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function () { overlay.remove(); });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
      });
    }
  
  })();