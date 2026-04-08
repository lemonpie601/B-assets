/* ============================================
   레몬파이와 B컷 - 애플리케이션 로직
   ============================================ */

// ============================================
// 개발자 도구 감지 및 차단
// ============================================

(function() {
  // F12 키 차단
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Ctrl+Shift+I (개발자 도구)
    // Ctrl+Shift+J (콘솔)
    // Ctrl+Shift+C (검사)
    // Ctrl+Shift+K (네트워크)
    if (e.ctrlKey && e.shiftKey && [73, 74, 67, 75].indexOf(e.keyCode) !== -1) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Ctrl+U (소스 보기)
    // Ctrl+S (저장)
    // Ctrl+P (인쇄)
    if (e.ctrlKey && [85, 83, 80].indexOf(e.keyCode) !== -1) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // 개발자 도구 열림 감지 (창 크기 비교)
  var threshold = 160;
  function checkDevTools() {
    if ((window.outerWidth - window.innerWidth > threshold) ||
        (window.outerHeight - window.innerHeight > threshold)) {
      blockAccess();
    }
  }
  
  setInterval(checkDevTools, 500);

  // debugger 감지
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

  // 페이지 접근 차단
  function blockAccess() {
    document.documentElement.innerHTML = `
      <html style="background: #faf7f2; margin: 0; padding: 0;">
        <head>
          <meta charset="UTF-8">
          <title>접근 차단</title>
        </head>
        <body style="margin: 0; padding: 0; background: #faf7f2; font-family: 'Noto Sans KR', sans-serif;">
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100vh;
            color: #3a2e28;
            gap: 16px;
          ">
            <div style="font-size: 64px;">🔒</div>
            <div style="font-size: 24px; font-weight: 700;">접근이 차단되었습니다</div>
            <div style="font-size: 14px; color: #8b7355;">개발자 도구 사용이 감지되었습니다</div>
          </div>
        </body>
      </html>
    `;
  }
})();

// 데이터 저장소
let allItems = [];
let categoryHierarchy = {}; // { 카테고리: [서브카테고리, ...] }
let filters = {}; // { 카테고리: 선택된 서브카테고리 }

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
    
    // 데이터 처리
    allItems = data.map(item => ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags : [item.tags || '기타']
    }));

    // 카테고리 계층 구조 구축
    buildCategoryHierarchy();
    
    // UI 렌더링
    renderFilters();
    renderGallery();
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    gallery.innerHTML = '<div class="empty-state">데이터를 불러오지 못했습니다 😢</div>';
  }
}

// ============================================
// 카테고리 계층 구조 구축
// ============================================

function buildCategoryHierarchy() {
  categoryHierarchy = {};

  allItems.forEach(item => {
    if (item.tags && item.tags.length > 0) {
      const mainCategory = item.tags[0];
      
      if (!categoryHierarchy[mainCategory]) {
        categoryHierarchy[mainCategory] = new Set();
      }

      // 서브카테고리 추가 (2개 이상의 태그가 있으면)
      if (item.tags.length > 1) {
        item.tags.slice(1).forEach(subTag => {
          categoryHierarchy[mainCategory].add(subTag);
        });
      }
    }
  });

  // Set을 배열로 변환
  Object.keys(categoryHierarchy).forEach(key => {
    categoryHierarchy[key] = Array.from(categoryHierarchy[key]).sort();
  });

  // 초기 필터 상태
  filters = {};
  Object.keys(categoryHierarchy).forEach(category => {
    filters[category] = null; // null = 모두 선택
  });
}

// ============================================
// 필터 UI 렌더링
// ============================================

function renderFilters() {
  filtersContainer.innerHTML = '';

  Object.keys(categoryHierarchy).sort().forEach(category => {
    const subcategories = categoryHierarchy[category];
    
    // 필터 그룹 생성
    const filterGroup = document.createElement('div');
    filterGroup.className = 'filter-group';

    // 필터 버튼
    const filterBtn = document.createElement('button');
    filterBtn.className = 'filter-btn';
    filterBtn.textContent = category;
    filterBtn.setAttribute('data-category', category);

    // 드롭다운 메뉴
    const filterMenu = document.createElement('div');
    filterMenu.className = 'filter-menu';

    // "전체" 옵션
    const allOption = document.createElement('button');
    allOption.className = 'filter-option selected';
    allOption.textContent = '전체 보기';
    allOption.addEventListener('click', () => {
      selectSubcategory(category, null, filterBtn, filterMenu);
    });
    filterMenu.appendChild(allOption);

    // 서브카테고리 옵션
    subcategories.forEach(subcat => {
      const option = document.createElement('button');
      option.className = 'filter-option';
      option.textContent = subcat;
      option.addEventListener('click', () => {
        selectSubcategory(category, subcat, filterBtn, filterMenu);
      });
      filterMenu.appendChild(option);
    });

    // 메뉴 토글
    filterBtn.addEventListener('click', () => {
      const isOpen = filterMenu.classList.toggle('open');
      filterBtn.classList.toggle('open', isOpen);

      // 다른 메뉴 닫기
      document.querySelectorAll('.filter-menu.open').forEach(menu => {
        if (menu !== filterMenu) {
          menu.classList.remove('open');
          menu.previousElementSibling?.classList.remove('open');
        }
      });
    });

    // 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
      if (!filterGroup.contains(e.target)) {
        filterMenu.classList.remove('open');
        filterBtn.classList.remove('open');
      }
    });

    filterGroup.appendChild(filterBtn);
    filterGroup.appendChild(filterMenu);
    filtersContainer.appendChild(filterGroup);
  });
}

// ============================================
// 서브카테고리 선택
// ============================================

function selectSubcategory(category, subcategory, btn, menu) {
  filters[category] = subcategory;

  // UI 업데이트
  menu.querySelectorAll('.filter-option').forEach(option => {
    option.classList.remove('selected');
  });

  if (subcategory === null) {
    menu.querySelector('.filter-option').classList.add('selected');
    btn.textContent = category;
  } else {
    Array.from(menu.querySelectorAll('.filter-option')).find(
      o => o.textContent === subcategory
    )?.classList.add('selected');
    btn.textContent = subcategory;
  }

  menu.classList.remove('open');
  btn.classList.remove('open');

  // 갤러리 새로고침
  renderGallery();
}

// ============================================
// 필터링된 아이템 얻기
// ============================================

function getFilteredItems() {
  return allItems.filter(item => {
    if (!item.tags || item.tags.length === 0) return false;

    const mainCategory = item.tags[0];
    const selectedSubcategory = filters[mainCategory];

    // 메인 카테고리 확인
    if (item.tags[0] !== mainCategory) return false;

    // 서브카테고리 확인
    if (selectedSubcategory === null) {
      return true; // 전체 보기
    } else {
      return item.tags.includes(selectedSubcategory);
    }
  });
}

// ============================================
// 갤러리 렌더링
// ============================================

function renderGallery() {
  const filteredItems = getFilteredItems();
  gallery.innerHTML = '';

  if (filteredItems.length === 0) {
    gallery.innerHTML = '<div class="empty-state">해당하는 에셋이 없습니다 🍋</div>';
    return;
  }

  filteredItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    // 태그 HTML 생성
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
