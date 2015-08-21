// Extending object by another
function extend() {
  var a = arguments, target = a[0] || {}, i = 1, l = a.length, deep = false, options;

  if (typeof target === 'boolean') {
    deep = target;
    target = a[1] || {};
    i = 2;
  }

  if (typeof target !== 'object' && !isFunction(target)) target = {};

  for (; i < l; ++i) {
    if ((options = a[i]) != null) {
      for (var name in options) {
        var src = target[name], copy = options[name];

        if (target === copy) continue;

        if (deep && copy && typeof copy === 'object' && !copy.nodeType) {
          target[name] = extend(deep, src || (copy.length != null ? [] : {}), copy);
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  return target;
};

// create element 
function ce(tagName, attr, style) {
  var el = document.createElement(tagName);
  if (attr) extend(el, attr);
  if (style) setStyle(el, style);
  return el;
}

// create element from html
function se(html) { return ce('div', {innerHTML: html}).firstChild; };

// get element by id
function ge(el) {
  return (typeof el == 'string' || typeof el == 'number') ? document.getElementById(el) : el;
}

// remove all children  of el
function cl(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}


// query selector
function qs(selector) { return document.querySelector(selector); }
// query selector all 
function qsa(selector) { return document.querySelectorAll(selector); }
function show(el) { return el.style.display = 'block'; }
function hide(el) { return el.style.display = 'none'; }

// Main Class


function Qa (arg) {
	var self = this;
  var bg;

  self.search = function() {
    var str = self.inp.value.trim()
    if(str.length <= 1) return;
    var options = {
        extract: function(element) {
          return element.title + "~~" + element.url;
        }
    }; 
    var res = fuzzy.filter(str, self.tabs, options)
      .map(function(item) { return item.original });
    self.renderResult(res);
    console.log('searching');
  };

  self.renderResult = function(tabs) {
    cl(self.items);
    for(var i = 0; i < Math.min(tabs.length, 5); i++) {
      var tab = tabs[i];
      var item = se('<div class="item">' + tab.title + '</div>');
      item.tab = tab;
      self.items.appendChild(item);
    };
  };

  self.nav = function(k) {
    var items = qsa('.qa-res-bx .item');
    for(var i = 0; i < items.length; i++ ) {
      if (items[i].classList.contains('active') && items[i + k]) {
        items[i + k].classList.add('active');
        items[i].classList.remove('active');
        return;
      };
    };
    // if nothing active, set first
    if (items[0] && !qs('.qa-res-bx .item.active'))  items[0].classList.add('active');
  } 

  self.go = function() {
      var selected = !qs('.qa-res-bx .item.active') || qsa('.qa-res-bx .item')[0];
      if (!selected) return;
      var tab = selected.tab;
      self.hide();
      chrome.runtime.sendMessage({ action: 'activate_tab', data: {tab: tab}});
  };

	self.create = function() {
		self.bg = se('<div class="qa-bg" id="qa_bg"></div>');
		self.wn = se('<div class="qa-wn" id="qa_wn"> \
        <div class="qa-se-bx"><input id="qa_se_inp" type="text"></div> \
        <div class="qa-res-bx" id="qa_res_bx"></div>\
      </div>');
		qs('body').appendChild(self.bg);
		qs('body').appendChild(self.wn);		
		setTimeout(function() {
			self.inp = ge('qa_se_inp');
      self.items = ge('qa_res_bx');
		});			
	}

	self.hide = function()  {
		hide(self.bg);
		hide(self.wn);
		self.shows = false;
	}

	self.show = function() {
		show(self.bg);
		show(self.wn);
		setTimeout(function() {
			self.inp.value = '';
			self.inp.focus();
      cl(self.items);
		});		
		chrome.runtime.sendMessage({ action: 'get_tabs' });
		self.shows = true;
	};

  // bind events 
	self.bind = function() {

		// recive tabs array
		chrome.runtime.onMessage.addListener(function(message) {
		    self.tabs = message;
		});
		// on press ESC
		document.onkeydown = function(e) {
		    e = e || window.event;
        if (!self.shows) return;
        console.log(e);
        // escp press
		    if (e.keyCode === 27 && self.shows) self.hide();
        // navigation
        if (e.keyCode === 40 ) self.nav(1);
        if (e.keyCode === 38 ) self.nav(-1);
        // go
        if (e.keyCode === 13 ) self.go(-1);
		};
    // on search input typing
    document.onkeyup = function(e) {
        e = e || window.event;
        if (!self.shows || e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 13) return;
        if (e.target.id  === self.inp.id)  self.search();
    };    
	};

	function __constructor(arg) {
		self.create();
		self.bind();
	};
	__constructor.apply(arg);
};


// Run 
if (!document.qa) document.qa = new Qa();
var qa = document.qa;
if(qa.shows) {
	qa.hide();
} else {
	qa.show();
}


