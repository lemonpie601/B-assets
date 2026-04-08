

// 데이터 저장소
let allItems = [];
let folderTree = {}; // 중첩된 폴더 구조
let currentPath = []; // 현재 경로 배열

// DOM 요소
const filtersContainer = document.getElementById('filters');
const gallery = document.getElementById('gallery');
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
    if (!response.ok) throw new Error('Failed to load assets.json');
    
    const data = await response.json();
    
    allItems = data.map((item, index) => ({
      ...item,
      index: index,
      tags: Array.isArray(item.tags) ? item.tags : [item.tags || '기타']
    }));

    buildFolderTree();
    renderFilters();
    renderGallery();
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    gallery.innerHTML = '<div class="empty-state">데이터를 불러오지 못했습니다 😢</div>';
  }
}

// ============================================
// 폴더 트리 구축 (다중 계층)
// ============================================

function buildFolderTree() {
  folderTree = { folders: {}, items: [] };

  allItems.forEach(item => {
    if (item.tags && item.tags.length > 0) {
      // 폴더 경로를 따라 트리를 만들어감
      let currentNode = folderTree;
      
      // 각 태그를 폴더 레벨로 처리
      item.tags.forEach((tag, index) => {
        if (!currentNode.folders) {
          currentNode.folders = {};
        }
        
        if (!currentNode.folders[tag]) {
          currentNode.folders[tag] = { folders: {}, items: [] };
        }
        
        currentNode = currentNode.folders[tag];
      });
      
      // 최종 폴더에 아이템 추가
      currentNode.items.push(item);
    }
  });
}

// ============================================
// 현재 경로의 노드 가져오기
// ============================================

function getCurrentNode() {
  let node = folderTree;
  
  for (let folder of currentPath) {
    if (node.folders && node.folders[folder]) {
      node = node.folders[folder];
    } else {
      return null;
    }
  }
  
  return node;
}

// ============================================
// 필터(폴더) UI 렌더링
// ============================================

function renderFilters() {
  filtersContainer.innerHTML = '';

  // 경로 표시 (Breadcrumb)
  const breadcrumb = document.createElement('div');
  breadcrumb.className = 'breadcrumb';

  const homeBtn = document.createElement('button');
  homeBtn.className = 'breadcrumb-btn';
  homeBtn.textContent = '📁 홈';
  homeBtn.addEventListener('click', () => {
    currentPath = [];
    renderFilters();
    renderGallery();
  });
  breadcrumb.appendChild(homeBtn);

  currentPath.forEach((folder, index) => {
    const separator = document.createElement('span');
    separator.className = 'breadcrumb-separator';
    separator.textContent = ' > ';
    breadcrumb.appendChild(separator);

    const btn = document.createElement('button');
    btn.className = 'breadcrumb-btn';
    btn.textContent = '📁 ' + folder;
    btn.addEventListener('click', () => {
      currentPath = currentPath.slice(0, index + 1);
      renderFilters();
      renderGallery();
    });
    breadcrumb.appendChild(btn);
  });

  filtersContainer.appendChild(breadcrumb);

  // 현재 노드의 폴더와 아이템 표시
  const currentNode = getCurrentNode();
  
  if (!currentNode) {
    gallery.innerHTML = '<div class="empty-state">폴더를 찾을 수 없습니다 🍋</div>';
    return;
  }

  const filterInner = document.createElement('div');
  filterInner.className = 'filter-inner';

  // 폴더 표시
  if (currentNode.folders && Object.keys(currentNode.folders).length > 0) {
    Object.keys(currentNode.folders).sort().forEach(folderName => {
      const subNode = currentNode.folders[folderName];
      const itemCount = countItems(subNode);
      
      const folderBtn = document.createElement('button');
      folderBtn.className = 'filter-btn folder-btn';
      folderBtn.innerHTML = `📁 ${folderName} <span class="folder-count">${itemCount}</span>`;
      folderBtn.addEventListener('click', () => {
        currentPath.push(folderName);
        renderFilters();
        renderGallery();
      });
      filterInner.appendChild(folderBtn);
    });
  }

  // 아이템이 있으면 안내 메시지
  if (currentNode.items && currentNode.items.length > 0) {
    const info = document.createElement('div');
    info.className = 'folder-info';
    info.textContent = `${currentNode.items.length}개의 이미지`;
    filterInner.appendChild(info);
  }

  filtersContainer.appendChild(filterInner);
}

// ============================================
// 노드의 모든 아이템 개수 계산
// ============================================

function countItems(node) {
  if (!node) return 0;
  
  let count = (node.items ? node.items.length : 0);
  
  if (node.folders) {
    Object.values(node.folders).forEach(subNode => {
      count += countItems(subNode);
    });
  }
  
  return count;
}

// ============================================
// 갤러리 렌더링
// ============================================

function renderGallery() {
  gallery.innerHTML = '';

  const currentNode = getCurrentNode();
  
  if (!currentNode) {
    gallery.innerHTML = '<div class="empty-state">폴더를 찾을 수 없습니다 🍋</div>';
    return;
  }

  // 아이템이 없으면 안내
  if (!currentNode.items || currentNode.items.length === 0) {
    if (!currentNode.folders || Object.keys(currentNode.folders).length === 0) {
      gallery.innerHTML = '<div class="empty-state">이 폴더는 비어있습니다 🍋</div>';
      return;
    } else {
      gallery.innerHTML = '<div class="empty-state">폴더를 열어서 이미지를 확인하세요 📁</div>';
      return;
    }
  }

  // 아이템 표시
  currentNode.items.forEach(item => {
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
// 라이트박스 기능
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
  setTimeout(() => {
    lightboxImg.src = '';
  }, 300);
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
