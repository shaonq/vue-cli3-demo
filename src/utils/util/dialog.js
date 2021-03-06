let attr = "data-u-dialog";
const isUndefined = value => typeof value === "undefined";
// dom.js
const dom = {
  ie: Number(document.documentMode) | 0,
  on: (function () {
    if (document.addEventListener) {
      return function (element, event, handler) {
        if (element && event && handler) {
          element.addEventListener(event, handler, false);
        }
      }
    } else {
      return function (element, event, handler) {
        if (element && event && handler) {
          element.attachEvent('on' + event, handler);
        }
      }
    }
  })(),
  off: (function () {
    if (document.removeEventListener) {
      return function (element, event, handler) {
        if (element && event) {
          element.removeEventListener(event, handler, false);
        }
      }
    } else {
      return function (element, event, handler) {
        if (element && event) {
          element.detachEvent('on' + event, handler);
        }
      }
    }
  })(),
  once: function (el, event, fn) {
    var off = this.off;
    var listener = function () {
      if (fn) fn.apply(this, arguments)
      off(el, event, listener);
    };
    this.on(el, event, listener)
  },
  // 位置信息
  position: function (el) {
    const box = el.getBoundingClientRect();
    // html元素对象的上/左边框的宽度
    const { clientTop, clientLeft } = document.documentElement;
    const { pageYOffset, pageXOffset } = window;
    return {
      top: box.top - clientTop,
      left: box.left - clientLeft,
      height: box.height,
      width: box.width,
      pageYOffset,
      pageXOffset,
    }
  },
  el: function (attr, doc) {
    if (!doc) doc = document;
    return doc.querySelector(attr)
  },
  els: function (attr, doc) {
    if (!doc) doc = document;
    return [].slice.call(doc.querySelectorAll(attr))
  },
  hasClass: function (el, cls) {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
    if (el.classList) {
      return el.classList.contains(cls);
    } else {
      return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
  },
  addClass: function (el, cls) {
    if (!el) return;
    var curClass = el.className;
    var classes = (cls || '').split(' ');

    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) {
        el.classList.add(clsName);
      } else if (!this.hasClass(el, clsName)) {
        curClass += ' ' + clsName;
      }
    }
    if (!el.classList) {
      el.className = curClass;
    }
  },
  removeClass: function (el, cls) {
    if (!el || !cls) return;
    var classes = cls.split(' ');
    var curClass = ' ' + el.className + ' ';

    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) {
        el.classList.remove(clsName);
      } else if (this.hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ');
      }
    }
    if (!el.classList) {
      el.className = curClass;
    }
  },
  append(el, doc) {
    if (!doc) doc = document.body;
    doc.appendChild(el);
  },
  remove(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el)
  },
  isHTMLElement(node) {
    return node instanceof window.HTMLElement || node instanceof HTMLElement;
  },
  getScrollParent(node) {
    try {
      function isScrollParent(node, type = "y") {
        // Firefox wants us to check `-x` and `-y` variations as well
        let _getComputedStyle = window.getComputedStyle(node),
          overflow = _getComputedStyle.overflow,
          overflowX = _getComputedStyle.overflowX,
          overflowY = _getComputedStyle.overflowY;
        let str = (type === "y" ? overflowY : overflowX) || overflow;
        // auto|scroll|overlay|hidden
        return /scroll|overlay|auto/.test(str);
      }
      let parentNode = node.parentNode;
      if (!this.isHTMLElement(parentNode)) return node;
      if (isScrollParent(parentNode)) {
        return parentNode;
      }
      return this.getScrollParent(parentNode)
    } catch (e) { }
    return window
  }
}

function dialog() {
  this.dom = dom;
  const open = (options = {}) => {
    // default options key
    if (isUndefined(options.shadow)) options.shadow = true;
    if (isUndefined(options.shadowClose)) options.shadowClose = true;
    if (isUndefined(options.showClose)) options.showClose = false;
    // created element
    const mel = document.createElement("div");
    const id = (+new Date).toString(32);
    mel.className = "u-dialog-mask";
    if (options.shadow) dom.addClass(mel, "is-show");
    if (options.shadow < 1 && options.shadow > 0) mel.style.opacity = options.shadow;
    mel.setAttribute("data-u-dialog", id);
    const el = document.createElement("div");
    el.className = "u-dialog " + (isUndefined(options.ani) || "u-dialog-ani");
    //before
    options.before && options.before(el);
    // after-id 
    options.after && (this['after' + id] = options.after);
    // add skin className
    const skin = options.skin || options.className;
    if (skin) dom.addClass(el, skin);
    // add extend
    if (options.extend) {
      dom.addClass(el, "is-extend"); dom.addClass(mel, "is-extend");
    }
    el.setAttribute("data-u-dialog", id);
    // change xss
    const filterXss = (value = "") => value.replace(/ipt>/g, "ipt&gt;")
    options.title = filterXss(options.title);
    options.content = filterXss(options.content);
    options.width = options.width ? options.width : "auto";
    options.height = options.height ? options.height : "auto";
    el.innerHTML = `
      <div class="u-dialog-content" style="width:${options.width};height:${options.height}">
        <div class="u-dialog-title ${options.title ? "is-show" : ""}"> ${options.title}</div>
        <div class="u-dialog-body">${options.content}</div>
        <div class="u-dialog-close ${options.showClose ? "is-show" : ""}">x</div>
      </div> `;
    mel.oncontextmenu = el.oncontextmenu = () => false;
    dom.append(mel);
    dom.append(el);
    const winHeight = window.innerHeight;
    const winWidth = window.innerWidth;
    // set position width/height
    {
      let offset = options.offset || ["auto", "auto"];
      el.style.top = offset[0] === "auto" ? Math.max((winHeight - el.clientHeight) / 2, 0) + "px" : offset[0];
      el.style.left = offset[1] === "auto" ? Math.max((winWidth - el.clientWidth) / 2, 0) + "px" : offset[1];
      dom.addClass(el, "is-show");
    }
    // add event
    if (options.shadowClose) mel.onclick = () => this.hideToast(mel.getAttribute(attr));
    if (options.showClose) dom.on(dom.el(".u-dialog-close", el), "click", () => this.hideToast(el.getAttribute(attr)));
    if (options.time) setTimeout(() => this.hideToast(el.getAttribute(attr)), options.time * 1e3);
    if (typeof options.success === "function") options.success(id, el);
    // @bug  IE not`s support vh
    try {
      let elc = dom.el(".u-dialog-content", el);
      let elam = dom.el(".u-dialog-title", el).clientHeight;
      let elect = winHeight - elam;
      elc.style.maxHeight = elect + 'px';
      dom.el(".u-dialog-body", el).style.maxHeight = (elect - elam) + 'px';
    } catch (e) { }
    // width height auto
    {
      let offsetTop = el.clientHeight + el.offsetTop;
      let offsetLeft = el.clientWidth + el.offsetLeft;
      if (offsetTop > (winHeight - 10)) el.style.top = Math.min((winHeight - el.clientHeight - 10), 0) + "px";
      if (offsetLeft > (winWidth - 10)) el.style.left = Math.min((winWidth - el.clientWidth - 10), 0) + "px";
    }
    // return close index
    return id;
  };

  this.hideToast = id => {
    let remove = el => {
      dom.removeClass(el, "is-show");
      if (!dom.hasClass(el, "u-dialog-mask") && this['after' + id]) {
        this['after' + id](el);
        this['after' + id] = null
      };
      let cl = () => dom.remove(el);
      setTimeout(cl, 300);
    }
    dom.els(`[${attr}]`).forEach(el => {
      id ? id == el.getAttribute(attr) && remove(el) : (!dom.hasClass(el, 'is-extend') && remove(el));
    })
  };

  this.toast = (content, time = 2) => {
    this.hideToast();
    return open({
      className: "u-dialog__toast",
      content,
      width: "auto",
      shadow: false,
      shadowClose: false,
      time
    });
  };

  this.showLoading = content => {
    let el = dom.el(".u-dialog__loading", el);
    if (!el) {
      this.hideToast();
      return open({
        className: "u-dialog__loading",
        content: `<i></i><p>${content || ""}</p>`,
        width: "120px",
        height: "120px",
        shadow: 0.3,
        shadowClose: false
      });
    } else {
      dom.el("p", el).innerHTML = content;
      return el.getAttribute(attr);
    }
  };

  this.showSuccess = (content, time = 2) => {
    this.hideToast();
    return open({
      className: "u-dialog__success",
      content: `<i></i><p>${content || ""}</p>`,
      width: "120px",
      height: "120px",
      shadow: false,
      shadowClose: false,
      time
    });
  };


  this.alert = content => {
    this.hideToast();
    typeof content === "string" && (content = { content });
    if (isUndefined(content.width)) content.width = "380px";
    if (isUndefined(content.time)) content.time = 0;
    if (isUndefined(content.title)) content.title = "提示";
    if (isUndefined(content.shadowClose)) content.shadowClose = true;
    if (isUndefined(content.showClose)) content.showClose = false;
    if (!content.cancel) content.cancel = { label: "取消" };
    let ok_html = '', cancelHtml = `<a class="u-btn">${content.cancel.label}</a>`;
    // ok:{label,onclick,skin}
    if (typeof content.ok === "function") { content.ok = { onclick: content.ok } }
    let isOk = typeof content.ok === "object";
    if (isOk) {
      let label = content.ok.label || "确认";
      ok_html = `<a class="u-btn u-btn--primary ${content.ok.skin ? content.ok.skin : 'u-btn--blue'}">${label}</a>`;
    }
    content.skin = "u-dialog__alert";
    content.content = `<div style="min-height:5em">${content.content}</div>${ok_html}${cancelHtml}<div></div>`;
    content.success = (index, el) => {
      dom.els(".u-btn", el).forEach(btn => {
        dom.on(btn, "click", () => {
          if (dom.hasClass(btn, 'u-btn--primary') && isOk) {
            let onclick = content.ok.onclick;
            typeof onclick === "function" ? onclick(index, btn) : this.hideToast(index)
          } else {
            let onclick = content.cancel.onclick;
            typeof onclick === "function" ? onclick(index, btn) : this.hideToast(index)
          }
        })
      })
    }


    return open(content);
  }


  this.showModal = content => {
    this.hideToast();
    typeof content === "string" && (content = { content });
    if (isUndefined(content.width)) content.width = "320px";
    if (isUndefined(content.height)) content.height = "240px";
    if (isUndefined(content.time)) content.time = 0;
    if (isUndefined(content.shadowClose)) content.shadowClose = false;
    if (isUndefined(content.showClose)) content.showClose = true;
    return open(content);
  }


  /**
   * 生成条目弹窗
   * offset 位置
   * skin 样式
   * @param {Array} list :[{  label: "文字", value: "remove", disabled: true, border: true   }]
   * @param {String} code :默认选中code
   * @param {Function} success : (index, el) = {}
   */


  /**
   * popover 弹出组件
   * popover
   * @param {Object} options  options.scrollEl 触发事件的element
   * @param {Element} options.el 触发事件的element
   * @param {Array} options.list :[{  label: "文字", value: "remove", disabled: true, border: true   }]
   * @param {Function} options.success ：(index, el) = {}
   */
  this.showPopover = options => {
    return this.showModal({
      content: options.content,
      shadow: false,
      width: "auto",
      height: "auto",
      skin: options.skin,
      showClose: false,
      extend: true,
      offset: options.offset,
      success: (index, el) => {
        dom.once(dom.getScrollParent(options.el), "scroll", () => this.hideToast(index));
        setTimeout(() => {
          dom.once(document, "contextmenu", () => this.hideToast(index))
          dom.once(document, "click", () => this.hideToast(index))
        }, 100)
        dom.on(el, "contextmenu", e => { e.stopPropagation(), e.preventDefault() })
        dom.on(el, "click", e => { e.stopPropagation(), e.preventDefault() })
        options.success && options.success(index, el);
      }
    })
  }

  /**
   * 创建列表模板
   * @param {Array} list: [{label,value}]
   * @param {Array} value: default value
   */
  this.createLabelValue = ({ skin, list, value = "" }) => {
    return list.reduce((html, item) => {
      let childrenHtml = '', isChildren = item.children && item.children.length
      if (isChildren) childrenHtml = render(item.children);
      html += `<div class="${skin}-item${item.border ? ' is-border' : ''}${item.disabled ? ' is-disabled' : ''}${isChildren ? ' is-children' : ''}${item.value == value ? ' is-active' : ''}" data-value="${item.value}">${item.label}${childrenHtml}</div>`
      return html
    }, "")
  }

  this.showDropdown = ({ offset, success, el, list, value }) => {
    const skin = "u-dialog--dropdown";
    return this.showPopover({
      offset, skin, list, el,
      content: this.createLabelValue({ skin, list, value }),
      success: (index, that) => {
        dom.els(`.${skin}-item`).forEach(self => {
          if (dom.hasClass(self, 'is-disabled')) return;
          if (dom.hasClass(self, 'is-children')) return;
          dom.on(self, "click", e => {
            success && success({ label: self.innerText, value: self.getAttribute("data-value") });
            this.hideToast(index);
          })
        })
      }
    })
  }

  this.showContextMenu = ({ offset, success, el, list }) => {
    const skin = "u-dialog--contextmenu";
    return this.showPopover({
      offset, skin, list, el,
      content: this.createLabelValue({ skin, list }),
      success: (index, that) => {
        let els = dom.els(`.${skin}-item`), isOne = els.length === 1;
        els.forEach(self => {
          if (dom.hasClass(self, 'is-disabled')) return;
          if (dom.hasClass(self, 'is-children')) return;
          if (isOne) self.style.lineHeight = (self.offsetHeight + 2) + "px";
          dom.on(self, "click", e => {
            success && success({ label: self.innerText, value: self.getAttribute("data-value") });
            this.hideToast(index);
          })
        })
      }
    })
  }

  /**
   ** 扩展:extend
   ** uploadAvatar 头像上传
   ** change : Function 读取图片信息 Object *
   ** success : Function 返回图片地址 String 
   */
  this.uploadAvatar = function (options = {}) {
    const showModal = this.showModal;
    function imageInit(callback) {
      let input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = e => {
        const file = (e.target || e.path[0]).files[0];
        /** 名称，大小，类型 */
        let { name, size, type } = file;
        if (typeof callback === "function") {
          /** 图片转base64 */
          const reader = new FileReader();
          reader.readAsDataURL(file);
          let img = new Image();
          reader.onload = ({ target }) => {
            img.onload = () => {
              callback(img, {
                width: img.width,
                height: img.height,
                size: size,
                MB: Math.ceil((size / 1024 / 1024) * 100) / 100,
                name,
                type
              });
            };
            img.src = target.result;
          };
        }
        input = null;
      };
      /* @bug   IE <= 10    */
      if (dom.ie && dom.ie <= 10) {
        input.style.clip = "rect(0px, 0px, 0px, 0px)";
        dom.append(input);
        setTimeout(a => dom.remove(input), 100)
      }
      input.click();
    }
    function canvasInit(callback) {
      showModal({
        extend: true,
        title: options.title || "上传头像",
        shadow: 0.8,
        width: "auto",
        height: "auto",
        content: `<div class="u-center u-nos">
                   <p style="margin: 20px 0;color: #888;">${options.desc || "调整头像位置"}</p>
                   <div style="padding: 10px 40px;"><canvas width="240" height="240" style="width: 240px; height: 240px; cursor: grab;"></canvas></div>
                   <p style="margin:40px 0"><button style="width:240px;" class="${options.btnClass || 'u-btn'}"> 保存</button></p>
                   </div> `,
        success(index, el) {
          let canvas = dom.el("canvas", el);
          const ctx = canvas.getContext("2d");
          if (typeof callback === "function") {
            callback(canvas, ctx);
            let button = dom.el("button", el);
            dom.on(button, "click", function () {
              let imgData = ctx.getImageData(40, 40, 160, 160);
              let _canvas = document.createElement("canvas");
              let _ctx = _canvas.getContext("2d");
              _canvas.width = _canvas.height = 160;
              _ctx.putImageData(imgData, 0, 0);
              let base64 = _canvas.toDataURL("image/png", 0.91);
              imgData = _canvas = _ctx = null;
              typeof options.success === "function" && options.success(base64, index);
            })
          }
        }
      });
    }
    // image 信息
    imageInit((img, info) => {
      /**
       * 模型设计
       * 横：40+160+40 = 240
       * 数：40+160+40 = 240
       */
      const cWidth = 240; // canvas 宽度
      const cLine = 40; // 遮罩层宽度
      const iWidth = cWidth - cLine * 2; // 图片宽度
      // 通过固定高度计算长度，反之亦可
      function h2w(width, height) {
        return width / (height / iWidth);
      }
      // 限制范围
      function m2m(min, max, value) {
        if (value > max) return max;
        if (value < min) return min;
        return value;
      }

      /**
       * 图片创建成功 开始创建画布       *
       * 如不满足条件可以阻断
       *
       */

      if (typeof options.change === "function" && !options.change(info)) return;

      canvasInit((canvas, ctx) => {
        const { width, height } = info;
        const drawImage = (offset = { left: 0, top: 0 }) => {
          // offset 临时移动数据
          ctx.clearRect(0, 0, cWidth, cWidth);
          ctx.fillStyle = "#ccc";
          ctx.fillRect(0, 0, cWidth, cWidth);
          ctx.fill();
          // 是否水平
          let isHorizontal = width >= height;
          // 记住上一次绘制的数据 鼠标松开后的偏移
          let dx = canvas.getAttribute("data-left") | 0;
          let dy = canvas.getAttribute("data-top") | 0;
          // dx, dy,
          let dWidth, dHeight, max = cLine;
          if (isHorizontal) {
            dWidth = h2w(width, height);
            dHeight = iWidth;
            dx = dx || (cWidth - dWidth) / 2;
            dy = dy || cLine;
            // 验证: 可移动范围
            let min = dHeight + cLine - dWidth;
            dx = dx + offset.left;
            dx = m2m(min, max, dx);
          } else {
            dWidth = iWidth;
            dHeight = h2w(height, width);
            dx = dx || cLine;
            dy = dy || (cWidth - dHeight) / 2;
            // 验证: 可移动范围
            let min = dWidth + cLine - dHeight;
            dy = dy + offset.top;
            dy = m2m(min, max, dy);
          }

          ctx.drawImage(img, dx, dy, dWidth, dHeight);
          ctx.stroke();
          ctx.fillStyle = "rgba(250,250,250,.88)";
          ctx.fillRect(0, 0, 40, 240);
          ctx.fillRect(200, 0, 40, 240);
          ctx.fillRect(40, 0, 160, 40);
          ctx.fillRect(40, 200, 160, 40);
          ctx.fill();

          return { left: dx, top: dy }
        }

        drawImage({ left: 0, top: 0 });
        this.addDargEvent({ el: canvas, success: drawImage })
      });
    });
  };


  this.addDargEvent = function ({ el, success, doc = document }) {
    dom.on(el, "mousedown", e => {
      let clientX = e.pageX || e.clientX;
      let clientY = e.pageY || e.clientY;
      el.style.cursor = "grabbing";
      let isMove = true;
      const fnMove = e => {
        if (isMove) {
          let cX = e.pageX || e.clientX;
          let cY = e.pageY || e.clientY;
          let left = cX - clientX;
          let top = cY - clientY;
          success({ left, top });
        }
      }
      const fnUp = e => {
        el.style.cursor = "grab";
        let cX = e.pageX || e.clientX;
        let cY = e.pageY || e.clientY;
        let left = cX - clientX;
        let top = cY - clientY;
        let o = success({ left, top });
        if (o) {
          el.setAttribute("data-left", o.left | 0)
          el.setAttribute("data-top", o.top | 0)
        }
        isMove = false;
        dom.off(doc, "mouseup", fnUp)
        dom.off(doc, "mousemove", fnMove)
      }
      dom.on(doc, "mousemove", fnMove)
      dom.on(doc, "mouseup", fnUp)
    })
  }

  this.imageView = function (node) {
    let { dom, showModal, hideToast } = this;
    if(!dom.isHTMLElement(node))throw "imageView , Please select an element"
    let oldImg = node;
    let { naturalWidth, naturalHeight } = oldImg;
    if (!oldImg) return;
    const p = dom.position(oldImg);
    let { width, height, left, top } = p;
    let scale = 1;
    {
      let w = Math.min(window.innerWidth, naturalWidth);
      w = (w * 0.8) / width;
      let h = Math.min(window.innerHeight, naturalHeight);
      h = (h * 0.8) / height;
      scale = Math.max(Math.min(w, h), 1);
    }
    showModal({
      content: '',
      shadowClose: true,
      showClose: false,
      ani: null,
      width: width + 'px',
      height: height + 'px',
      before(el) {
        el.style.transition = 'all 0.3s ease-in-out';
        el.style.left = p.left + 'px';
        el.style.top = p.top + 'px';
        el.style.width = p.width + 'px';
        el.style.height = p.height + 'px';
        el.style.transform = "scale(1)";
      },
      success(index, el) {
        let body = dom.el(".u-dialog-body", el);
        body.style.padding = "0";
        body.append(oldImg.cloneNode());
        el.style.transform = `scale(${scale})`;
      },
      after(el) {
        dom.addClass(el, "is-show");
        el.style.left = p.left + 'px';
        el.style.top = p.top + 'px';
        el.style.width = p.width + 'px';
        el.style.height = p.height + 'px';
        el.style.transform = "scale(1)";
      }
    })
  }
}

export default new dialog();