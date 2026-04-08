/* ============================================
   레몬파이와 B컷 - 새로운 네비게이션
   좌측 폴더 + 우측 이미지
   ============================================ */

// ============================================
// 개발자 도구 감지 및 차단
// ============================================

(function() {
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && e.shiftKey && [73, 74, 67, 75].indexOf(e.keyCode) !== -1) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && [85, 83, 80].indexOf(e.keyCode) !== -1) {
      e.preventDefault();
      return false;
    }
  }, true);

  var threshold = 160;
  function checkDevTools() {
    if ((window.outerWidth - window.innerWidth > threshold) ||
        (window.outerHeight - window.innerHeight > threshold)) {
      blockAccess();
    }
  }
  setInterval(checkDevTools, 500);

  var testImg = new Image();
  Object.defineProperty(testImg, 'id', {
    get: function() {
      blockAccess();
      return null;
    }
  });
  
  setInterval(function() {
    console.log(testImg);
    console.clear();
  }, 1000);

  function blockAccess() {
    document.documentElement.innerHTML = `
      <html style="background: #faf7f2;">
        <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Noto Sans KR';">
          <div style="font-size: 64px; margin-bottom: 16px;">🔒</div>
          <div style="font-size: 24px; font-weight: 700; color: #5d4037; margin-bottom: 8px;">접근이 차단되었습니다</div>
          <div style="font-size: 14px; color: #8b7355;">개발자 도구 사용이 감지되었습니다</div>
        </body>
      </html>
    `;
  }
})();

// 데이터
let allItems = [];
let folderTree = {};
let currentPath = [];

const folderTree_el = document.getElementById('folderTree');
const gallery = document.getElementById('gallery');
const galleryHeader = document.getElementById('galleryHeader');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxClose = document.getElementById('lightboxClose');
const scrollbarThumb = document.getElementById('scrollbarThumb');

// ============================================
// 이모지 맵핑 (폴더 차별화)
// ============================================

const emojiMap = {
  0: ['🥧', '🍋', '🔥'],
  1: ['🍯', '🎂', '🧁'],
  2: ['🍪', '🥐', '🍩']
};

function getEmoji(name, depth) {
  const hash = name.charCodeAt(0) % 3;
  return emojiMap[Math.min(depth, 2)][hash];
}

// ============================================
// 데이터 로드
// ============================================

async function loadData() {
  try {
    const response = await fetch('./assets.json');
    const data = await response.json();
    
    allItems = data.map((item, index) => ({
      ...item,
      index: index,
      tags: Array.isArray(item.tags) ? item.tags : [item.tags || '기타']
    }));

    buildFolderTree();
    renderFolderTree();
    selectFolder(Object.keys(folderTree)[0] || []);
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    gallery.innerHTML = '<div class="empty-state">데이터를 불러오지 못했습니다 😢</div>';
  }
}

// ============================================
// 폴더 트리 구축
// ============================================

function buildFolderTree() {
  folderTree = {};

  allItems.forEach(item => {
    if (item.tags && item.tags.length > 0) {
      const folderPath = item.tags.join('|');
      if (!folderTree[folderPath]) {
        folderTree[folderPath] = [];
      }
      folderTree[folderPath].push(item);
    }
  });
}

// ============================================
// 첫 번째 폴더들만 가져오기
// ============================================

function getFirstLevelFolders() {
  const folders = new Map();
  
  allItems.forEach(item => {
    if (item.tags && item.tags.length > 0) {
      const firstFolder = item.tags[0];
      if (!folders.has(firstFolder)) {
        folders.set(firstFolder, []);
      }
    }
  });

  return Array.from(folders.keys()).sort();
}

// ============================================
// 폴더의 서브폴더 가져오기
// ============================================

function getSubfolders(parentPath) {
  const subfolders = new Set();
  
  Object.keys(folderTree).forEach(path => {
    const tags = path.split('|');
    
    if (parentPath.length < tags.length) {
      let matches = true;
      for (let i = 0; i < parentPath.length; i++) {
        if (tags[i] !== parentPath[i]) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        subfolders.add(tags[parentPath.length]);
      }
    }
  });

  return Array.from(subfolders).sort();
}

// ============================================
// 폴더 트리 렌더링
// ============================================

function renderFolderTree() {
  folderTree_el.innerHTML = '';
  const firstLevelFolders = getFirstLevelFolders();

  firstLevelFolders.forEach(folderName => {
    renderFolderItem(folderName, 0, []);
  });
}

function renderFolderItem(folderName, depth, parentPath) {
  const folderItem = document.createElement('div');
  folderItem.className = 'folder-item';

  const currentPath_arr = [...parentPath, folderName];
  const subfolders = getSubfolders(currentPath_arr);
  const hasSubfolders = subfolders.length > 0;

  const btn = document.createElement('button');
  btn.className = 'folder-btn';
  btn.setAttribute('data-depth', depth);

  const toggle = document.createElement('span');
  toggle.className = 'folder-toggle';
  toggle.textContent = hasSubfolders ? '▶' : '';

  const emoji = document.createElement('span');
  emoji.className = 'folder-emoji';
  emoji.textContent = getEmoji(folderName, depth);

  btn.appendChild(toggle);
  btn.appendChild(emoji);
  btn.appendChild(document.createTextNode(' ' + folderName));

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectFolder(currentPath_arr);
    
    if (hasSubfolders) {
      const sublist = folderItem.querySelector('.subfolder-list');
      sublist.classList.toggle('open');
      toggle.classList.toggle('open');
    }
  });

  folderItem.appendChild(btn);

  if (hasSubfolders) {
    const sublist = document.createElement('div');
    sublist.className = 'subfolder-list';

    subfolders.forEach(subfolder => {
      renderFolderItem(subfolder, depth + 1, currentPath_arr);
    });

    // 재귀 대신 직접 렌더링
    subfolders.forEach(subfolder => {
      const subfolderItem = document.createElement('div');
      subfolderItem.className = 'folder-item';

      const subCurrentPath = [...currentPath_arr, subfolder];
      const subSubfolders = getSubfolders(subCurrentPath);
      const subHasSubfolders = subSubfolders.length > 0;

      const subBtn = document.createElement('button');
      subBtn.className = 'folder-btn';
      subBtn.setAttribute('data-depth', depth + 1);

      const subToggle = document.createElement('span');
      subToggle.className = 'folder-toggle';
      subToggle.textContent = subHasSubfolders ? '▶' : '';

      const subEmoji = document.createElement('span');
      subEmoji.className = 'folder-emoji';
      subEmoji.textContent = getEmoji(subfolder, depth + 1);

      subBtn.appendChild(subToggle);
      subBtn.appendChild(subEmoji);
      subBtn.appendChild(document.createTextNode(' ' + subfolder));

      subBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectFolder(subCurrentPath);
        
        if (subHasSubfolders) {
          const subSublist = subfolderItem.querySelector('.subfolder-list');
          if (subSublist) {
            subSublist.classList.toggle('open');
            subToggle.classList.toggle('open');
          }
        }
      });

      subfolderItem.appendChild(subBtn);

      if (subHasSubfolders) {
        const subSublist = document.createElement('div');
        subSublist.className = 'subfolder-list';

        subSubfolders.forEach(subsubfolder => {
          const subsubfolderItem = document.createElement('div');
          subsubfolderItem.className = 'folder-item';

          const subsubCurrentPath = [...subCurrentPath, subsubfolder];

          const subsubBtn = document.createElement('button');
          subsubBtn.className = 'folder-btn';
          subsubBtn.setAttribute('data-depth', depth + 2);

          const subsubEmoji = document.createElement('span');
          subsubEmoji.className = 'folder-emoji';
          subsubEmoji.textContent = getEmoji(subsubfolder, depth + 2);

          subsubBtn.appendChild(document.createElement('span')).textContent = '';
          subsubBtn.appendChild(subsubEmoji);
          subsubBtn.appendChild(document.createTextNode(' ' + subsubfolder));

          subsubBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectFolder(subsubCurrentPath);
          });

          subsubfolderItem.appendChild(subsubBtn);
          subSublist.appendChild(subsubfolderItem);
        });

        subfolderItem.appendChild(subSublist);
      }

      sublist.appendChild(subfolderItem);
    });

    folderItem.appendChild(sublist);
  }

  folderTree_el.appendChild(folderItem);
}

// ============================================
// 폴더 선택
// ============================================

function selectFolder(path) {
  currentPath = path;

  // 활성화 상태 업데이트
  document.querySelectorAll('.folder-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // 현재 경로의 버튼을 활성화
  const buttons = document.querySelectorAll('.folder-btn');
  buttons.forEach(btn => {
    const btnText = btn.textContent.trim();
    const btnPath = [];
    
    // 간단한 경로 추출 (개선 가능)
    if (path.length > 0 && btnText.includes(path[path.length - 1])) {
      btn.classList.add('active');
    }
  });

  renderGallery();
}

// ============================================
// 갤러리 렌더링
// ============================================

function renderGallery() {
  gallery.innerHTML = '';

  if (currentPath.length === 0) {
    galleryHeader.innerHTML = '<div class="gallery-header-title">📁 폴더를 선택하세요</div>';
    gallery.innerHTML = '<div class="empty-state">좌측 폴더를 클릭해주세요 🍋</div>';
    return;
  }

  const folderPath = currentPath.join('|');
  const items = folderTree[folderPath] || [];

  const title = currentPath[currentPath.length - 1];
  const emoji = getEmoji(title, currentPath.length - 1);
  galleryHeader.innerHTML = `<div class="gallery-header-title">${emoji} ${title}</div>`;

  if (items.length === 0) {
    gallery.innerHTML = '<div class="empty-state">이 폴더는 비어있습니다 🥧</div>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    const tagsHtml = item.tags
      .map(tag => `<span class="card-tag">${tag}</span>`)
      .join('');

    card.innerHTML = `
      <img class="card-thumb" src="${item.img}" loading="lazy" alt="${item.name}">
      <div class="card-body">
        <div class="card-tags">${tagsHtml}</div>
        <div class="card-title">${item.name}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      openLightbox(item.img, item.name);
    });

    gallery.appendChild(card);
  });
}

// ============================================
// 라이트박스
// ============================================

function openLightbox(src, title) {
  lightboxImg.src = src;
  lightboxTitle.textContent = title;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ============================================
// 커스텀 스크롤바
// ============================================

if (window.innerWidth >= 1024) {
  let isDragging = false;
  let dragOffset = 0;

  function updateScrollbar() {
    const scrollPercent =
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    const thumbHeight = window.innerHeight - 60;
    const thumbTop = thumbHeight * (scrollPercent / 100);
    scrollbarThumb.style.top = thumbTop + 'px';
    scrollbarThumb.textContent = scrollPercent > 50 ? '🥧' : '🍋';
  }

  window.addEventListener('scroll', updateScrollbar);

  scrollbarThumb.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragOffset = e.clientY - scrollbarThumb.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const thumbHeight = window.innerHeight - 60;
    let thumbPos = e.clientY - dragOffset;
    thumbPos = Math.max(0, Math.min(thumbPos, thumbHeight));
    const scrollPercent = (thumbPos / thumbHeight) * 100;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, (scrollPercent / 100) * scrollHeight);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// ============================================
// 초기화
// ============================================

loadData();
