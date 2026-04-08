/* ============================================
   레몬파이와 B컷 - 유연한 폴더 네비게이션
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
const emojiMap = ['🥧', '🍋', '🔥', '🍯', '🎂', '🧁', '🍪', '🥐', '🍩'];

// DOM
const navigation = document.getElementById('navigation');
const gallery = document.getElementById('gallery');
const galleryHeader = document.getElementById('galleryHeader');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxClose = document.getElementById('lightboxClose');
const scrollbarThumb = document.getElementById('scrollbarThumb');

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
    renderNavigation();
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
      const path = item.tags.join('|');
      if (!folderTree[path]) {
        folderTree[path] = [];
      }
      folderTree[path].push(item);
    }
  });
}

// ============================================
// 첫 번째 폴더들 가져오기 (유연함)
// ============================================

function getFirstLevelFolders() {
  const folders = new Map();
  
  allItems.forEach(item => {
    if (item.tags && item.tags.length > 0) {
      const firstFolder = item.tags[0];
      if (!folders.has(firstFolder)) {
        // 이 폴더의 최대 깊이 확인
        const maxDepth = Math.max(
          ...allItems
            .filter(i => i.tags && i.tags[0] === firstFolder)
            .map(i => i.tags.length)
        );
        
        folders.set(firstFolder, {
          depth: maxDepth,
          hasSubfolders: maxDepth > 1
        });
      }
    }
  });

  return Array.from(folders.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

// ============================================
// 경로별 서브폴더 가져오기
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
// 홈 화면 렌더링 (폴더 그리드)
// ============================================

function renderHomeScreen() {
  navigation.innerHTML = '';
  
  const folders = getFirstLevelFolders();
  
  folders.forEach((folder, index) => {
    const folderName = folder[0];
    const folderInfo = folder[1];
    const emoji = emojiMap[index % emojiMap.length];
    
    const folderCard = document.createElement('div');
    folderCard.className = 'folder-card';
    folderCard.innerHTML = `
      <div class="folder-card-emoji">${emoji}</div>
      <div class="folder-card-name">${folderName}</div>
    `;
    
    folderCard.addEventListener('click', () => {
      if (folderInfo.hasSubfolders) {
        // 서브폴더가 있으면 서브폴더 리스트로
        selectFolder([folderName]);
      } else {
        // 서브폴더가 없으면 바로 이미지 표시
        selectFolder([folderName]);
      }
    });
    
    navigation.appendChild(folderCard);
  });
}

// ============================================
// 서브폴더/이미지 렌더링
// ============================================

function renderContent() {
  navigation.innerHTML = '';
  
  const parentPath = currentPath.slice(0, -1);
  const currentLevel = currentPath.length;
  
  // 뒤로가기 버튼
  const backBtn = document.createElement('div');
  backBtn.className = 'nav-item back-btn';
  backBtn.innerHTML = `
    <div class="nav-item-left">
      <span class="nav-emoji">◀</span>
      <span class="nav-name">뒤로가기</span>
    </div>
  `;
  backBtn.addEventListener('click', () => {
    if (parentPath.length > 0) {
      selectFolder(parentPath);
    } else {
      selectFolder([]);
    }
  });
  navigation.appendChild(backBtn);
  
  // 다음 레벨의 서브폴더들
  const subfolders = getSubfolders(currentPath);
  
  if (subfolders.length > 0) {
    // 서브폴더가 있으면 리스트로 표시
    subfolders.forEach((subfolder, index) => {
      const emoji = emojiMap[(index + 1) % emojiMap.length];
      
      const navItem = document.createElement('div');
      navItem.className = 'nav-item';
      
      navItem.innerHTML = `
        <div class="nav-item-left">
          <span class="nav-emoji">${emoji}</span>
          <span class="nav-name">${subfolder}</span>
        </div>
        <div class="nav-toggle">▶</div>
      `;
      
      navItem.addEventListener('click', () => {
        selectFolder([...currentPath, subfolder]);
      });
      
      navigation.appendChild(navItem);
    });
  }
}

// ============================================
// 폴더 선택
// ============================================

function selectFolder(path) {
  currentPath = path;
  
  if (currentPath.length === 0) {
    renderHomeScreen();
  } else {
    renderContent();
  }
  
  renderGallery();
}

// ============================================
// 갤러리 렌더링
// ============================================

function renderGallery() {
  gallery.innerHTML = '';
  
  if (currentPath.length === 0) {
    galleryHeader.innerHTML = '<div class="gallery-header-title">📁 폴더를 선택하세요</div>';
    gallery.innerHTML = '<div class="empty-state">위의 폴더를 클릭해주세요 🍋</div>';
    return;
  }
  
  const path = currentPath.join('|');
  const items = folderTree[path] || [];
  
  if (items.length === 0) {
    // 이미지가 없으면 서브폴더 확인
    const subfolders = getSubfolders(currentPath);
    if (subfolders.length === 0) {
      const emoji = '🥧';
      const title = currentPath[currentPath.length - 1];
      galleryHeader.innerHTML = `<div class="gallery-header-title">${emoji} ${title}</div>`;
      gallery.innerHTML = '<div class="empty-state">이 폴더는 비어있습니다 🥧</div>';
    }
    return;
  }
  
  const emoji = '🥧';
  const title = currentPath[currentPath.length - 1];
  galleryHeader.innerHTML = `<div class="gallery-header-title">${emoji} ${title}</div>`;
  
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
