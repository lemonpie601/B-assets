// 개발자 도구 감지 및 차단
(function() {
  function showBlockedOverlay() {
    document.getElementById('blockedOverlay').classList.add('show');
  }

  // F12 키 차단
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K 차단
    if (e.ctrlKey && e.shiftKey && [73, 74, 67, 75].indexOf(e.keyCode) !== -1) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl+U, Ctrl+S, Ctrl+P 차단
    if (e.ctrlKey && [85, 83, 80].indexOf(e.keyCode) !== -1) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // 개발자 도구 열림 감지
  var threshold = 160;
  function checkDevTools() {
    if ((window.outerWidth - window.innerWidth > threshold) ||
        (window.outerHeight - window.innerHeight > threshold)) {
      showBlockedOverlay();
    }
  }
  setInterval(checkDevTools, 500);

  // debugger 감지
  var testImage = new Image();
  Object.defineProperty(testImage, 'id', {
    get: function() {
      showBlockedOverlay();
    }
  });
  setInterval(function() {
    console.log(testImage);
    console.clear();
  }, 1000);

  setInterval(function() {
    debugger;
  }, 100);
})();

// 커스텀 스크롤바
var scrollbarThumb = document.getElementById('scrollbarThumb');
if (window.innerWidth >= 1024) {
  var isDragging = false;
  var dragOffset = 0;

  function updateScrollbar() {
    var scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    var thumbHeight = window.innerHeight - 60;
    var thumbTop = thumbHeight * (scrollPercent / 100);
    scrollbarThumb.style.top = thumbTop + 'px';
    scrollbarThumb.textContent = scrollPercent > 50 ? '🥧' : '🍋';
  }

  window.addEventListener('scroll', updateScrollbar);

  scrollbarThumb.addEventListener('mousedown', function(e) {
    isDragging = true;
    dragOffset = e.clientY - scrollbarThumb.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    var thumbHeight = window.innerHeight - 60;
    var thumbPos = e.clientY - dragOffset;
    thumbPos = Math.max(0, Math.min(thumbPos, thumbHeight));
    var scrollPercent = (thumbPos / thumbHeight) * 100;
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, (scrollPercent / 100) * scrollHeight);
  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
  });
} else {
  if (scrollbarThumb) scrollbarThumb.style.display = 'none';
}

// 라이트박스 기능
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightboxImg');
var lightboxTitle = document.getElementById('lightboxTitle');
var lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src, title) {
  lightboxImg.src = src;
  lightboxTitle.textContent = title;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(function() {
    lightboxImg.src = '';
  }, 300);
}

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', function(e) {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
});

// 데이터 로드 및 렌더링
var assetsUrl = 'https://raw.githubusercontent.com/lemonpie601/B-assets/main/assets.json';
var allItems = [];

function loadData() {
  fetch(assetsUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      allItems = data.map(function(item) {
        if (item.tags) {
          return item;
        } else if (item.tab) {
          return {
            tags: [item.tab],
            img: item.img,
            name: item.name
          };
        }
        return item;
      });
      renderTabs();
      renderGallery('전체');
    })
    .catch(function(error) {
      console.error('데이터 로드 실패:', error);
      document.getElementById('gallery').innerHTML =
        '<div class="empty-state">데이터를 불러오지 못했습니다 😢</div>';
    });
}

function renderTabs() {
  var tabsContainer = document.getElementById('tabs');
  var categories = ['전체'];

  allItems.forEach(function(item) {
    item.tags.forEach(function(tag) {
      if (categories.indexOf(tag) === -1) {
        categories.push(tag);
      }
    });
  });

  tabsContainer.innerHTML = '';
  categories.forEach(function(category) {
    var button = document.createElement('button');
    button.className = 'tab-btn' + (category === '전체' ? ' active' : '');
    button.textContent = category;
    button.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      renderGallery(category);
    });
    tabsContainer.appendChild(button);
  });
}

function renderGallery(category) {
  var gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  var items = category === '전체' ? allItems : allItems.filter(function(item) {
    return item.tags.indexOf(category) !== -1;
  });

  if (items.length === 0) {
    gallery.innerHTML = '<div class="empty-state">아직 등록된 에셋이 없어요 🍋</div>';
    return;
  }

  items.forEach(function(item) {
    var card = document.createElement('div');
    card.className = 'card';

    var tagsHtml = item.tags.map(function(tag) {
      return '<span class="card-tag">' + tag + '</span>';
    }).join('');

    card.innerHTML =
      '<img class="card-thumb" src="' + item.img + '" loading="lazy" alt="' + item.name + '">' +
      '<div class="card-body">' +
      '<div class="card-tags">' + tagsHtml + '</div>' +
      '<div class="card-title">' + item.name + '</div>' +
      '</div>';

    card.addEventListener('click', function() {
      openLightbox(item.img, item.name);
    });

    gallery.appendChild(card);
  });
}

// 초기 데이터 로드
loadData();
