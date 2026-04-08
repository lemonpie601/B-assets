(function() {
function _0x5fb1() {
document.getElementById(String.fromCharCode(98,108,111,99,107,101,100,79,118,101,114,108,97,121)).classList.add(String.fromCharCode(115,104,111,119));
}
document.addEventListener(String.fromCharCode(107,101,121,100,111,119,110), function(e) {
if (e.keyCode === 123) { e.preventDefault(); e.stopPropagation(); return false; }
if (e.ctrlKey && e.shiftKey && [73,74,67,75].indexOf(e.keyCode) !== -1) {
e.preventDefault(); e.stopPropagation(); return false;
}
if (e.ctrlKey && [85,83,80].indexOf(e.keyCode) !== -1) {
e.preventDefault(); e.stopPropagation(); return false;
}
}, true);
var _0xb02c = 160;
function _0x576d() {
if ((window.outerWidth - window.innerWidth > _0xb02c) ||
(window.outerHeight - window.innerHeight > _0xb02c)) {
_0x5fb1();
}
}
setInterval(_0x576d, 500);
var _0xaf0c = new Image();
Object.defineProperty(_0xaf0c, String.fromCharCode(105,100), {
get: function() { _0x5fb1(); }
});
setInterval(function() {
console.log(_0xaf0c);
console.clear();
}, 1000);
setInterval(function() { debugger; }, 100);
})();
var _0xa976 = document.getElementById(String.fromCharCode(115,99,114,111,108,108,98,97,114,84,104,117,109,98));
if (window.innerWidth >= 1024) {
var _0x5dfa = false;
var _0x35d2 = 0;
function _0xcb08() {
var _0x2f9b = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
var _0x1c36 = window.innerHeight - 60;
var _0xf461 = _0x1c36 * (_0x2f9b / 100);
_0xa976.style.top = _0xf461 + String.fromCharCode(112,120);
_0xa976.textContent = _0x2f9b > 50 ? '🥧' : '🍋';
}
window.addEventListener(String.fromCharCode(115,99,114,111,108,108), _0xcb08);
_0xa976.addEventListener(String.fromCharCode(109,111,117,115,101,100,111,119,110), function(e) {
_0x5dfa = true;
_0x35d2 = e.clientY - _0xa976.getBoundingClientRect().top;
e.preventDefault();
});
document.addEventListener(String.fromCharCode(109,111,117,115,101,109,111,118,101), function(e) {
if (!_0x5dfa) return;
var _0x1c36 = window.innerHeight - 60;
var _0xc329 = e.clientY - _0x35d2;
_0xc329 = Math.max(0, Math.min(_0xc329, _0x1c36));
var _0x2f9b = (_0xc329 / _0x1c36) * 100;
var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
window.scrollTo(0, (_0x2f9b / 100) * scrollHeight);
});
document.addEventListener(String.fromCharCode(109,111,117,115,101,117,112), function() {
_0x5dfa = false;
});
} else {
if(_0xa976) _0xa976.style.display = String.fromCharCode(110,111,110,101);
}
var _0xb206      = document.getElementById(String.fromCharCode(95,48,120,98,50,48,54));
var _0x52bc   = document.getElementById(String.fromCharCode(95,48,120,53,50,98,99));
var _0x9dce = document.getElementById(String.fromCharCode(95,48,120,57,100,99,101));
var _0xf995 = document.getElementById(String.fromCharCode(95,48,120,102,57,57,53));
function _0xcd2c(src, title) {
_0x52bc.src = src;
_0x9dce.textContent = title;
_0xb206.classList.add(String.fromCharCode(111,112,101,110));
document.body.style.overflow = String.fromCharCode(104,105,100,100,101,110);
}
function _0xa4f3() {
_0xb206.classList.remove(String.fromCharCode(111,112,101,110));
document.body.style.overflow = '';
setTimeout(function() { _0x52bc.src = ''; }, 300);
}
_0xf995.addEventListener(String.fromCharCode(99,108,105,99,107), _0xa4f3);
_0xb206.addEventListener(String.fromCharCode(99,108,105,99,107), function(e) {
if (e.target === _0xb206) _0xa4f3();
});
document.addEventListener(String.fromCharCode(107,101,121,100,111,119,110), function(e) {
if (e.key === String.fromCharCode(69,115,99,97,112,101)) _0xa4f3();
});
var _0x9866 = 'https:
var _0x22aa = [];
function _0x7d62() {
fetch(_0x9866)
.then(function(r) { return r.json(); })
.then(function(data) {
_0x22aa = data.map(function(item) {
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
_0xd3dc();
_0xfa5b('전체');
})
.catch(function() {
document.getElementById('gallery').innerHTML =
'<div class=String.fromCharCode(101,109,112,116,121,45,115,116,97,116,101)>데이터를 불러오지 못했습니다 😢</div>';
});
}
function _0xd3dc() {
var _0x90d8 = document.getElementById('tabsString.fromCharCode(41,59,10,32,32,32,32,32,32,118,97,114,32,95,48,120,97,99,57,55,32,61,32,91)전체'];
_0x22aa.forEach(function(i) {
i.tags.forEach(function(tag) {
if (_0xac97.indexOf(tag) === -1) _0xac97.push(tag);
});
});
_0x90d8.innerHTML = '';
_0xac97.forEach(function(cat) {
var _0x09d6 = document.createElement('button');
_0x09d6.className = 'tab-_0x09d6String.fromCharCode(32,43,32,40,99,97,116,32,61,61,61,32)전체String.fromCharCode(32,63,32) active' : '');
_0x09d6.textContent = cat;
_0x09d6.addEventListener('click', function() {
document.querySelectorAll('.tab-_0x09d6').forEach(function(b) { b.classList.remove('active'); });
_0x09d6.classList.add('active');
_0xfa5b(cat);
});
_0x90d8.appendChild(_0x09d6);
});
}
function _0xfa5b(category) {
var _0x902c = document.getElementById('gallery');
_0x902c.innerHTML = '';
var _0x42d0 = category === '전체' ? _0x22aa : _0x22aa.filter(function(i) {
return i.tags.indexOf(category) !== -1;
});
if (_0x42d0.length === 0) {
_0x902c.innerHTML = '<div class=String.fromCharCode(101,109,112,116,121,45,115,116,97,116,101)>아직 등록된 에셋이 없어요 🍋</div>';
return;
}
_0x42d0.forEach(function(item) {
var _0xfd3c = document.createElement('div');
_0xfd3c.className = '_0xfd3c';
var _0x0a7e = item.tags.map(function(tag) {
return '<span class=String.fromCharCode(95,48,120,102,100,51,99,45,116,97,103)>String.fromCharCode(32,43,32,116,97,103,32,43,32)</span>';
}).join('');
_0xfd3c.innerHTML =
'<img class=String.fromCharCode(95,48,120,102,100,51,99,45,95,48,120,97,57,55,54) src="' + item.img + '" loading=String.fromCharCode(108,97,122,121) alt="' + item.name + '">String.fromCharCode(32,43,10,32,32,32,32,32,32,32,32,32,32)<div class=String.fromCharCode(95,48,120,102,100,51,99,45,98,111,100,121)>String.fromCharCode(32,43,10,32,32,32,32,32,32,32,32,32,32)<div class=String.fromCharCode(95,48,120,102,100,51,99,45,116,97,103,115)>String.fromCharCode(32,43,32,95,48,120,48,97,55,101,32,43,32)</div>String.fromCharCode(32,43,10,32,32,32,32,32,32,32,32,32,32)<div class=String.fromCharCode(95,48,120,102,100,51,99,45,116,105,116,108,101)>' + item.name + '</div>String.fromCharCode(32,43,10,32,32,32,32,32,32,32,32,32,32)</div>';
_0xfd3c.addEventListener('click', function() {
_0xcd2c(item.img, item.name);
});
_0x902c.appendChild(_0xfd3c);
});
}
_0x7d62();
