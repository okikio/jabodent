const getTheme = () => {
  const theme = window.localStorage.getItem("theme");
  if (typeof theme === "string")
    return theme;
  return null;
};
const setTheme = (theme) => {
  if (typeof theme === "string")
    window.localStorage.setItem("theme", theme);
};
const mediaTheme = () => {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const hasMediaQueryPreference = typeof mql.matches === "boolean";
  if (hasMediaQueryPreference)
    return mql.matches ? "dark" : "light";
  return null;
};

const CONFIG_DEFAULTS = {
  wrapperAttr: "wrapper",
  noAjaxLinkAttr: "no-ajax-link",
  noPrefetchAttr: "no-prefetch",
  headers: [
    ["x-partial", "true"]
  ],
  preventSelfAttr: `prevent="self"`,
  preventAllAttr: `prevent="all"`,
  transitionAttr: "transition",
  blockAttr: `block`,
  timeout: 3e4
};
class CONFIG {
  constructor(config) {
    this.config = Object.assign({...CONFIG_DEFAULTS}, config);
  }
  toAttr(value, brackets = true) {
    let {prefix} = this.config;
    let attr = `data${prefix ? "-" + prefix : ""}-${value}`;
    return brackets ? `[${attr}]` : attr;
  }
  getConfig(value, brackets = true) {
    if (typeof value !== "string")
      return this.config;
    let config = this.config[value];
    if (typeof config === "string")
      return this.toAttr(config, brackets);
    return config;
  }
}

class d{constructor(a){this.map=new Map(a);}getMap(){return this.map}get(a){return this.map.get(a)}keys(){return Array.from(this.map.keys())}values(){return Array.from(this.map.values())}set(a,b){return this.map.set(a,b),this}add(a){let b=this.size,c=b;return this.set(c,a),this}get size(){return this.map.size}last(a=1){let b=this.keys()[this.size-a];return this.get(b)}prev(){return this.last(2)}delete(a){return this.map.delete(a),this}clear(){return this.map.clear(),this}has(a){return this.map.has(a)}entries(){return this.map.entries()}forEach(a=(...c)=>{},b){return this.map.forEach(a,b),this}[Symbol.iterator](){return this.entries()}methodCall(a,...b){return this.forEach(c=>{c[a](...b);}),this}async asyncMethodCall(a,...b){for(let[,c]of this.map)await c[a](...b);return this}}

class ManagerItem {
  constructor() {
  }
  getConfig(value, brackets = true) {
    return this.manager.getConfig(value, brackets);
  }
  install() {
  }
  register(manager2) {
    this.manager = manager2;
    this.install();
    return this;
  }
}
class AdvancedManager extends d {
  constructor(app2) {
    super();
    this.app = app2;
  }
  set(key, value) {
    super.set(key, value);
    typeof value.register === "function" && value.register(this);
    return this;
  }
  getApp() {
    return this.app;
  }
  getConfig(value, brackets = true) {
    return this.app.getConfig(value, brackets);
  }
}

class _URL extends URL {
  constructor(url = window.location.href) {
    super(url instanceof URL ? url.href : url, window.location.origin);
  }
  getFullPath() {
    return `${this.pathname}${this.hash}`;
  }
  getHash() {
    return this.hash.slice(1);
  }
  clean() {
    return this.toString().replace(/(\/#.*|\/|#.*)$/, "");
  }
  getPathname() {
    return this.pathname;
  }
  equalTo(url) {
    return this.clean() == url.clean();
  }
  static equal(a, b) {
    let urlA = a instanceof _URL ? a : new _URL(a);
    let urlB = b instanceof _URL ? b : new _URL(b);
    return urlA.equalTo(urlB);
  }
}

class Coords {
  constructor(x = window.scrollX, y = window.scrollY) {
    this.x = x;
    this.y = y;
  }
}
class State {
  constructor(state = {
    url: new _URL(),
    index: 0,
    transition: "default",
    data: {
      scroll: new Coords(),
      trigger: "HistoryManager"
    }
  }) {
    this.state = state;
  }
  getIndex() {
    return this.state.index;
  }
  setIndex(index) {
    this.state.index = index;
    return this;
  }
  getURL() {
    return this.state.url;
  }
  getURLPathname() {
    return this.state.url.getPathname();
  }
  getTransition() {
    return this.state.transition;
  }
  getData() {
    return this.state.data;
  }
  toJSON() {
    const {url: url2, index, transition, data} = this.state;
    return {
      url: url2.getFullPath(),
      index,
      transition,
      data
    };
  }
}
class HistoryManager extends d {
  constructor() {
    super();
  }
  add(value) {
    let state = value;
    let index = this.size;
    super.add(state);
    state.setIndex(index);
    return this;
  }
  addState(value) {
    let state = value instanceof State ? value : new State(value);
    this.add(state);
    return this;
  }
}

const PARSER = new DOMParser();
class Page extends ManagerItem {
  constructor(url2 = new _URL(), dom = document) {
    super();
    this.url = url2;
    if (typeof dom === "string") {
      this.dom = PARSER.parseFromString(dom, "text/html");
    } else
      this.dom = dom || document;
    const {title, head, body} = this.dom;
    this.title = title;
    this.head = head;
    this.body = body;
  }
  install() {
    this.wrapper = this.body.querySelector(this.getConfig("wrapperAttr"));
  }
  getURL() {
    return this.url;
  }
  getPathname() {
    return this.url.pathname;
  }
  getTitle() {
    return this.title;
  }
  getHead() {
    return this.head;
  }
  getBody() {
    return this.body;
  }
  getWrapper() {
    return this.wrapper;
  }
  getDOM() {
    return this.dom;
  }
}
class PageManager extends AdvancedManager {
  constructor(app2) {
    super(app2);
    this.loading = new d();
    let URLString = new _URL().getPathname();
    this.set(URLString, new Page());
  }
  getLoading() {
    return this.loading;
  }
  async load(_url = new _URL()) {
    let url2 = _url instanceof URL ? _url : new _URL(_url);
    let urlString = url2.getPathname();
    let page, request;
    if (this.has(urlString)) {
      page = this.get(urlString);
      return Promise.resolve(page);
    }
    if (!this.loading.has(urlString)) {
      request = this.request(urlString);
      this.loading.set(urlString, request);
    } else
      request = this.loading.get(urlString);
    let response = await request;
    this.loading.delete(urlString);
    page = new Page(url2, response);
    this.set(urlString, page);
    return page;
  }
  async request(url2) {
    const headers = new Headers(this.getConfig("headers"));
    const timeout = window.setTimeout(() => {
      window.clearTimeout(timeout);
      throw "Request Timed Out!";
    }, this.getConfig("timeout"));
    try {
      let response = await fetch(url2, {
        mode: "same-origin",
        method: "GET",
        headers,
        cache: "default",
        credentials: "same-origin"
      });
      window.clearTimeout(timeout);
      if (response.status >= 200 && response.status < 300) {
        return await response.text();
      }
      const err = new Error(response.statusText || "" + response.status);
      throw err;
    } catch (err) {
      window.clearTimeout(timeout);
      throw err;
    }
  }
}

class k{constructor(a){this.map=new Map(a);}getMap(){return this.map}get(a){return this.map.get(a)}keys(){return Array.from(this.map.keys())}values(){return Array.from(this.map.values())}set(a,b){return this.map.set(a,b),this}add(a){let b=this.size,d=b;return this.set(d,a),this}get size(){return this.map.size}last(a=1){let b=this.keys()[this.size-a];return this.get(b)}prev(){return this.last(2)}delete(a){return this.map.delete(a),this}clear(){return this.map.clear(),this}has(a){return this.map.has(a)}entries(){return this.map.entries()}forEach(a=(...d)=>{},b){return this.map.forEach(a,b),this}[Symbol.iterator](){return this.entries()}methodCall(a,...b){return this.forEach(d=>{d[a](...b);}),this}async asyncMethodCall(a,...b){for(let[,d]of this.map)await d[a](...b);return this}}class j{constructor({callback:a=()=>{},scope:b=null,name:d="event"}){this.listener={callback:a,scope:b,name:d};}getCallback(){return this.listener.callback}getScope(){return this.listener.scope}getEventName(){return this.listener.name}toJSON(){return this.listener}}class i extends k{constructor(a="event"){super();this.name=a;}}class l extends k{constructor(){super();}getEvent(a){let b=this.get(a);return b instanceof i?b:(this.set(a,new i(a)),this.get(a))}newListener(a,b,d){let c=this.getEvent(a);return c.add(new j({name:a,callback:b,scope:d})),c}on(a,b,d){if(typeof a=="undefined")return this;typeof a=="string"&&(a=a.trim().split(/\s/g));let c,e,f=typeof a=="object"&&!Array.isArray(a),h=f?b:d;return f||(e=b),Object.keys(a).forEach(g=>{f?(c=g,e=a[g]):c=a[g],this.newListener(c,e,h);},this),this}removeListener(a,b,d){let c=this.get(a);if(c instanceof i&&b){let e=new j({name:a,callback:b,scope:d});c.forEach((f,h)=>{if(f.getCallback()===e.getCallback()&&f.getScope()===e.getScope())return c.delete(h)});}return c}off(a,b,d){if(typeof a=="undefined")return this;typeof a=="string"&&(a=a.trim().split(/\s/g));let c,e,f=typeof a=="object"&&!Array.isArray(a),h=f?b:d;return f||(e=b),Object.keys(a).forEach(g=>{f?(c=g,e=a[g]):c=a[g],typeof e==="function"?this.removeListener(c,e,h):this.delete(c);},this),this}once(a,b,d){if(typeof a=="undefined")return this;typeof a=="string"&&(a=a.trim().split(/\s/g));let c,e,f=typeof a==="object"&&!Array.isArray(a),h=f?b:d;return f||(e=b),Object.keys(a).forEach(g=>{f?(c=g,e=a[g]):c=a[g];let m=(...n)=>{f?(c=g,e=a[g]):c=a[g],this.off(c,m,h),e.apply(h,n);};this.on(c,m,h);},this),this}emit(a,...b){return typeof a=="undefined"?this:(typeof a=="string"&&(a=a.trim().split(/\s/g)),a.forEach(d=>{let c=this.get(d);c instanceof i&&c.forEach(e=>{let{callback:f,scope:h}=e.toJSON();f.apply(h,b);});},this),this)}}

class Service extends ManagerItem {
  install() {
    let app2 = this.manager.getApp();
    this.PageManager = app2.getPages();
    this.EventEmitter = app2.getEmitter();
    this.HistoryManager = app2.getHistory();
    this.ServiceManager = app2.getServices();
    this.TransitionManager = app2.getTransitions();
  }
  init(...args) {
  }
  boot() {
    this.initEvents();
  }
  initEvents() {
  }
  stopEvents() {
  }
  stop() {
    this.stopEvents();
  }
}
class ServiceManager extends AdvancedManager {
  constructor(app2) {
    super(app2);
  }
  init() {
    this.methodCall("init", this.getApp());
    return this;
  }
  boot() {
    this.methodCall("boot");
    return this;
  }
  stop() {
    this.methodCall("stop");
    return this;
  }
}

class Transition extends Service {
  constructor() {
    super();
    this.name = "Transition";
  }
  init({
    oldPage,
    newPage,
    trigger
  }) {
    super.init();
    this.oldPage = oldPage;
    this.newPage = newPage;
    this.trigger = trigger;
  }
  getName() {
    return this.name;
  }
  getOldPage() {
    return this.oldPage;
  }
  getNewPage() {
    return this.newPage;
  }
  getTrigger() {
    return this.trigger;
  }
  out({done}) {
    done();
  }
  in({done}) {
    done();
  }
  async start(EventEmitter2) {
    let fromWrapper = this.oldPage.getWrapper();
    let toWrapper = this.newPage.getWrapper();
    document.title = this.newPage.getTitle();
    if (!(fromWrapper instanceof Node) || !(toWrapper instanceof Node))
      throw `[Wrapper] the wrapper from the ${!(toWrapper instanceof Node) ? "next" : "current"} page cannot be found. The wrapper must be an element that has the attribute ${this.getConfig("wrapperAttr")}.`;
    EventEmitter2.emit("BEFORE_TRANSITION_OUT");
    await new Promise((done) => {
      let outMethod = this.out({
        from: this.oldPage,
        trigger: this.trigger,
        done
      });
      if (outMethod.then)
        outMethod.then(done);
    });
    EventEmitter2.emit("AFTER_TRANSITION_OUT");
    await new Promise((done) => {
      fromWrapper.insertAdjacentElement("beforebegin", toWrapper);
      fromWrapper.remove();
      EventEmitter2.emit("CONTENT_REPLACED");
      done();
    });
    EventEmitter2.emit("BEFORE_TRANSITION_IN");
    await new Promise((done) => {
      let inMethod = this.in({
        from: this.oldPage,
        to: this.newPage,
        trigger: this.trigger,
        done
      });
      if (inMethod.then)
        inMethod.then(done);
    });
    EventEmitter2.emit("AFTER_TRANSITION_IN");
    return this;
  }
}
class TransitionManager extends AdvancedManager {
  constructor(app2) {
    super(app2);
  }
  add(value) {
    let name = value.getName();
    this.set(name, value);
    return this;
  }
  async boot({name, oldPage, newPage, trigger}) {
    let transition = this.get(name);
    transition.init({
      oldPage,
      newPage,
      trigger
    });
    let EventEmitter2 = this.getApp().getEmitter();
    return await transition.start(EventEmitter2);
  }
}

class Block extends Service {
  init({name, rootElement, selector, index, length}) {
    this.rootElement = rootElement;
    this.name = name;
    this.selector = selector;
    this.index = index;
    this.slideLen = length;
  }
  getRootElement() {
    return this.rootElement;
  }
  getSelector() {
    return this.selector;
  }
  getLength() {
    return this.slideLen;
  }
  getIndex() {
    return this.index;
  }
  getID() {
    return this.id;
  }
  setID(id) {
    this.id = id;
    return this;
  }
  getName() {
    return this.name;
  }
}
class BlockIntent extends ManagerItem {
  constructor({name, block}) {
    super();
    this.name = name;
    this.block = block;
  }
  getName() {
    return this.name;
  }
  getBlock() {
    return this.block;
  }
}
class BlockManager extends AdvancedManager {
  constructor(app2) {
    super(app2);
    this.activeBlocks = new d();
    this.activeIDs = new d();
  }
  build(full) {
    let app2 = this.getApp();
    for (let [, intent] of this) {
      let name = intent.getName();
      let selector = `[${this.getConfig("blockAttr", false)}="${name}"]`;
      let rootElements = [
        ...document.querySelectorAll(selector)
      ];
      if (!Array.isArray(this.activeIDs[name]))
        this.activeIDs[name] = [];
      let manager2 = new AdvancedManager(app2);
      let block = intent.getBlock();
      for (let i = 0, len = rootElements.length; i < len; i++) {
        let rootElement = rootElements[i];
        let id = rootElement.id;
        let activeID = this.activeIDs[name][i];
        if (activeID !== "" && activeID !== id || full) {
          let newInstance = new block();
          newInstance.init({name, rootElement, selector, index: i, length: len});
          newInstance.setID(id);
          this.activeIDs[name][i] = id;
          manager2.set(i, newInstance);
        }
      }
      this.activeBlocks.set(name, manager2);
    }
  }
  init() {
    this.build(true);
    return this;
  }
  initEvents() {
    let app2 = this.getApp();
    const EventEmitter = app2.getEmitter();
    EventEmitter.on("CONTENT_REPLACED", this.reload, this);
    return this;
  }
  flush() {
    this.activeBlocks.forEach((blockManager) => {
      blockManager.methodCall("stop");
    });
    this.activeBlocks.clear();
    return this;
  }
  reload() {
    this.flush();
    this.init();
    this.bootBlocks();
    return this;
  }
  observe(rootElement) {
  }
  bootBlocks() {
    this.activeBlocks.forEach((blockManager) => {
      blockManager.methodCall("boot");
    });
    return this;
  }
  boot() {
    this.initEvents();
    this.bootBlocks();
    return this;
  }
  stopEvents() {
    this.activeBlocks.forEach((blockManager) => {
      blockManager.methodCall("stopEvents");
    });
    let app2 = this.getApp();
    const EventEmitter = app2.getEmitter();
    EventEmitter.off("BEFORE_TRANSITION_IN", this.reload, this);
    return this;
  }
  stop() {
    this.flush();
    this.stopEvents();
    return this;
  }
  getActiveBlocks() {
    return this.activeBlocks;
  }
}

class App {
  constructor(config2 = {}) {
    this.register(config2);
  }
  register(config2 = {}) {
    this.config = config2 instanceof CONFIG ? config2 : new CONFIG(config2);
    this.transitions = new TransitionManager(this);
    this.services = new ServiceManager(this);
    this.blocks = new BlockManager(this);
    this.history = new HistoryManager();
    this.pages = new PageManager(this);
    this.emitter = new l();
    let handler = (() => {
      document.removeEventListener("DOMContentLoaded", handler);
      window.removeEventListener("load", handler);
      this.emitter.emit("READY ready");
    }).bind(this);
    document.addEventListener("DOMContentLoaded", handler);
    window.addEventListener("load", handler);
    return this;
  }
  getConfig(value, brackets = true) {
    return this.config.getConfig(value, brackets);
  }
  getEmitter() {
    return this.emitter;
  }
  getBlocks() {
    return this.blocks;
  }
  getServices() {
    return this.services;
  }
  getPages() {
    return this.pages;
  }
  getTransitions() {
    return this.transitions;
  }
  getHistory() {
    return this.history;
  }
  getBlock(key) {
    return this.blocks.get(key);
  }
  getActiveBlock(name, key) {
    return this.blocks.getActiveBlocks().get(name).get(key);
  }
  getService(key) {
    return this.services.get(key);
  }
  getTransition(key) {
    return this.transitions.get(key);
  }
  getState(key) {
    return this.history.get(key);
  }
  get(type, key) {
    switch (type.toLowerCase()) {
      case "service":
        return this.getService(key);
      case "transition":
        return this.getTransition(key);
      case "state":
        return this.getState(key);
      default:
        throw `Error: can't get type '${type}', it is not a recognized type. Did you spell it correctly.`;
    }
  }
  async loadPage(url) {
    return await this.pages.load(url);
  }
  async load(type, key) {
    switch (type.toLowerCase()) {
      case "page":
        return await this.loadPage(key);
      default:
        return Promise.resolve(this.get(type, key));
    }
  }
  addBlock(blockIntent) {
    this.blocks.add(blockIntent);
    return this;
  }
  addService(service2) {
    this.services.add(service2);
    return this;
  }
  setService(key, service2) {
    this.services.set(key, service2);
    return this;
  }
  addTransition(transition2) {
    this.transitions.add(transition2);
    return this;
  }
  addState(state) {
    this.history.addState(state);
    return this;
  }
  add(type, value) {
    switch (type.toLowerCase()) {
      case "service":
        this.addService(value);
        break;
      case "transition":
        this.addTransition(value);
        break;
      case "state":
        this.addState(value);
        break;
      case "block":
        this.addBlock(value);
        break;
      default:
        throw `Error: can't add type '${type}', it is not a recognized type. Did you spell it correctly.`;
    }
    return this;
  }
  boot() {
    this.services.init();
    this.services.boot();
    this.blocks.init();
    this.blocks.boot();
    return this;
  }
  stop() {
    this.services.stop();
    this.blocks.stop();
    return this;
  }
  currentPage() {
    let currentState = this.history.last();
    return this.pages.get(currentState.getURLPathname());
  }
  on(events, callback) {
    this.emitter.on(events, callback, this);
    return this;
  }
  off(events, callback) {
    this.emitter.off(events, callback, this);
    return this;
  }
  once(events, callback) {
    this.emitter.once(events, callback, this);
    return this;
  }
  emit(events, ...args) {
    this.emitter.emit(events, ...args);
    return this;
  }
}

class PJAX extends Service {
  constructor() {
    super(...arguments);
    this.ignoreURLs = [];
    this.prefetchIgnore = false;
    this.isTransitioning = false;
    this.stopOnTransitioning = false;
    this.stickyScroll = true;
    this.forceOnError = false;
    this.autoScrollOnHash = true;
  }
  transitionStart() {
    this.isTransitioning = true;
  }
  transitionStop() {
    this.isTransitioning = false;
  }
  boot() {
    super.boot();
    let current = new State();
    this.HistoryManager.add(current);
    this.changeState("replace", current);
  }
  getTransitionName(el) {
    if (!el || !el.getAttribute)
      return null;
    let transitionAttr = el.getAttribute(this.getConfig("transitionAttr", false));
    if (typeof transitionAttr === "string")
      return transitionAttr;
    return null;
  }
  validLink(el, event, href) {
    let pushStateSupport = !window.history.pushState;
    let exists = !el || !href;
    let eventMutate = event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    let newTab = el.hasAttribute("target") && el.target === "_blank";
    let crossOrigin = el.protocol !== location.protocol || el.hostname !== location.hostname;
    let download = typeof el.getAttribute("download") === "string";
    let preventSelf = el.hasAttribute(this.getConfig("preventSelfAttr", false));
    let preventAll = Boolean(el.closest(this.getConfig("preventAllAttr")));
    let prevent = preventSelf && preventAll;
    let sameURL = new _URL().getFullPath() === new _URL(href).getFullPath();
    return !(exists || pushStateSupport || eventMutate || newTab || crossOrigin || download || prevent || sameURL);
  }
  getHref(el) {
    if (el && el.tagName && el.tagName.toLowerCase() === "a" && typeof el.href === "string")
      return el.href;
    return null;
  }
  getLink(event) {
    let el = event.target;
    let href = this.getHref(el);
    while (el && !href) {
      el = el.parentNode;
      href = this.getHref(el);
    }
    if (!el || !this.validLink(el, event, href))
      return;
    return el;
  }
  onClick(event) {
    let el = this.getLink(event);
    if (!el)
      return;
    if (this.isTransitioning && this.stopOnTransitioning) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    let href = this.getHref(el);
    this.EventEmitter.emit("ANCHOR_CLICK CLICK", event);
    this.go({href, trigger: el, event});
  }
  getDirection(value) {
    if (Math.abs(value) > 1) {
      return value > 0 ? "forward" : "back";
    } else {
      if (value === 0) {
        return "popstate";
      } else {
        return value > 0 ? "back" : "forward";
      }
    }
  }
  force(href) {
    window.location.assign(href);
  }
  go({href, trigger = "HistoryManager", event}) {
    if (this.isTransitioning && this.stopOnTransitioning) {
      this.force(href);
      return;
    }
    let url2 = new _URL(href);
    let currentState = this.HistoryManager.last();
    let currentURL = currentState.getURL();
    if (currentURL.equalTo(url2)) {
      this.hashAction(url2.hash);
      return;
    }
    let transitionName;
    if (event && event.state) {
      this.EventEmitter.emit("POPSTATE", event);
      let {state} = event;
      let {index, transition, data} = state;
      let currentIndex = currentState.getIndex();
      let difference = currentIndex - index;
      trigger = this.getDirection(difference);
      transitionName = transition;
      if (trigger !== "popstate") {
        let {x, y} = data.scroll;
        window.scroll({
          top: y,
          left: x,
          behavior: "smooth"
        });
      }
      if (trigger === "back") {
        this.HistoryManager.delete(currentIndex);
        this.EventEmitter.emit(`POPSTATE_BACK`, event);
      } else if (trigger === "forward") {
        this.HistoryManager.addState({url: url2, transition, data});
        this.EventEmitter.emit(`POPSTATE_FORWARD`, event);
      }
    } else {
      transitionName = this.getTransitionName(trigger) || "default";
      const scroll = new Coords();
      const index = this.HistoryManager.size;
      const state = new State({
        url: url2,
        index,
        transition: transitionName,
        data: {scroll}
      });
      if (this.stickyScroll) {
        let {x, y} = scroll;
        window.scroll({
          top: y,
          left: x,
          behavior: "smooth"
        });
      } else {
        window.scroll({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
      }
      this.HistoryManager.add(state);
      this.changeState("push", state);
      this.EventEmitter.emit("HISTORY_NEW_ITEM", event);
    }
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.EventEmitter.emit("GO", event);
    return this.load({oldHref: currentURL.getPathname(), href, trigger, transitionName});
  }
  changeState(action, state) {
    let url2 = state.getURL();
    let href = url2.getFullPath();
    let json = state.toJSON();
    let args = [json, "", href];
    if (window.history) {
      switch (action) {
        case "push":
          window.history.pushState.apply(window.history, args);
          break;
        case "replace":
          window.history.replaceState.apply(window.history, args);
          break;
      }
    }
  }
  async load({oldHref, href, trigger, transitionName = "default"}) {
    try {
      let oldPage = this.PageManager.get(oldHref);
      let newPage;
      this.EventEmitter.emit("PAGE_LOADING", {href, oldPage, trigger});
      try {
        try {
          newPage = await this.PageManager.load(href);
          this.transitionStart();
          this.EventEmitter.emit("PAGE_LOAD_COMPLETE", {newPage, oldPage, trigger});
        } catch (err) {
          throw `[PJAX] page load error: ${err}`;
        }
        this.EventEmitter.emit("NAVIGATION_START", {oldPage, newPage, trigger, transitionName});
        try {
          this.EventEmitter.emit("TRANSITION_START", transitionName);
          let transition = await this.TransitionManager.boot({
            name: transitionName,
            oldPage,
            newPage,
            trigger
          });
          this.hashAction();
          this.EventEmitter.emit("TRANSITION_END", {transition});
        } catch (err) {
          throw `[PJAX] transition error: ${err}`;
        }
        this.EventEmitter.emit("NAVIGATION_END", {oldPage, newPage, trigger, transitionName});
      } catch (err) {
        this.transitionStop();
        throw err;
      }
      this.transitionStop();
    } catch (err) {
      if (this.forceOnError)
        this.force(href);
      else
        console.error(err);
    }
  }
  hashAction(hash = window.location.hash) {
    if (this.autoScrollOnHash) {
      let hashID = hash.slice(1);
      if (hashID.length) {
        let el = document.getElementById(hashID);
        if (el) {
          if (el.scrollIntoView) {
            el.scrollIntoView({behavior: "smooth"});
          } else {
            let {left, top} = el.getBoundingClientRect();
            window.scroll({left, top, behavior: "smooth"});
          }
        }
      }
    }
  }
  ignoredURL({pathname}) {
    return this.ignoreURLs.length && this.ignoreURLs.some((url2) => {
      return typeof url2 === "string" ? url2 === pathname : url2.exec(pathname) !== null;
    });
  }
  onHover(event) {
    let el = this.getLink(event);
    if (!el)
      return;
    const url2 = new _URL(this.getHref(el));
    const urlString = url2.getPathname();
    if (this.ignoredURL(url2) || this.PageManager.has(urlString))
      return;
    this.EventEmitter.emit("ANCHOR_HOVER HOVER", event);
    (async () => {
      try {
        await this.PageManager.load(url2);
      } catch (err) {
        console.warn("[PJAX] prefetch error,", err);
      }
    })();
  }
  onStateChange(event) {
    this.go({href: window.location.href, trigger: "popstate", event});
  }
  bindEvents() {
    this.onHover = this.onHover.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
  }
  initEvents() {
    this.bindEvents();
    if (this.prefetchIgnore !== true) {
      document.addEventListener("mouseover", this.onHover);
      document.addEventListener("touchstart", this.onHover);
    }
    document.addEventListener("click", this.onClick);
    window.addEventListener("popstate", this.onStateChange);
  }
  stopEvents() {
    if (this.prefetchIgnore !== true) {
      document.removeEventListener("mouseover", this.onHover);
      document.removeEventListener("touchstart", this.onHover);
    }
    document.removeEventListener("click", this.onClick);
    window.removeEventListener("popstate", this.onStateChange);
  }
}

class Router extends Service {
  constructor(routes = []) {
    super();
    this.routes = new d();
    for (const route of routes) {
      this.add(route);
    }
  }
  add({path, method}) {
    const key = this.parse(path);
    this.routes.set(key, method);
    return this;
  }
  parsePath(path) {
    if (typeof path === "string")
      return new RegExp(path, "i");
    else if (path instanceof RegExp)
      return path;
    throw "[Router] only regular expressions and strings are accepted as paths.";
  }
  isPath(input) {
    return typeof input === "string" || input instanceof RegExp;
  }
  parse(input) {
    let route = input;
    let toFromPath = {
      from: /(.*)/g,
      to: /(.*)/g
    };
    if (this.isPath(input))
      toFromPath = {
        from: input,
        to: /(.*)/g
      };
    else if (this.isPath(route.from) && this.isPath(route.to))
      toFromPath = route;
    else
      throw "[Router] path is neither a string, regular expression, or a { from, to } object.";
    let {from, to} = toFromPath;
    return {
      from: this.parsePath(from),
      to: this.parsePath(to)
    };
  }
  route() {
    let from = this.HistoryManager.last().getURLPathname();
    let to = window.location.pathname;
    this.routes.forEach((method, path) => {
      let fromRegExp = path.from;
      let toRegExp = path.to;
      if (fromRegExp.test(from) && toRegExp.test(to)) {
        let fromExec = fromRegExp.exec(from);
        let toExec = toRegExp.exec(to);
        method({from: fromExec, to: toExec});
      }
    });
  }
  initEvents() {
    this.EventEmitter.on("READY", this.route, this);
    this.EventEmitter.on("PAGE_LOADED", this.route, this);
  }
  stopEvents() {
    this.EventEmitter.off("READY", this.route, this);
    this.EventEmitter.off("PAGE_LOADED", this.route, this);
  }
}

class t{constructor(a){this.map=new Map(a);}getMap(){return this.map}get(a){return this.map.get(a)}keys(){return Array.from(this.map.keys())}values(){return Array.from(this.map.values())}set(a,b){return this.map.set(a,b),this}add(a){let b=this.size,c=b;return this.set(c,a),this}get size(){return this.map.size}last(a=1){let b=this.keys()[this.size-a];return this.get(b)}prev(){return this.last(2)}delete(a){return this.map.delete(a),this}clear(){return this.map.clear(),this}has(a){return this.map.has(a)}entries(){return this.map.entries()}forEach(a=(...c)=>{},b){return this.map.forEach(a,b),this}[Symbol.iterator](){return this.entries()}methodCall(a,...b){return this.forEach(c=>{c[a](...b);}),this}async asyncMethodCall(a,...b){for(let[,c]of this.map)await c[a](...b);return this}}class u{constructor({callback:a=()=>{},scope:b=null,name:c="event"}){this.listener={callback:a,scope:b,name:c};}getCallback(){return this.listener.callback}getScope(){return this.listener.scope}getEventName(){return this.listener.name}toJSON(){return this.listener}}class m extends t{constructor(a="event"){super();this.name=a;}}class E extends t{constructor(){super();}getEvent(a){let b=this.get(a);return b instanceof m?b:(this.set(a,new m(a)),this.get(a))}newListener(a,b,c){let d=this.getEvent(a);return d.add(new u({name:a,callback:b,scope:c})),d}on(a,b,c){if(typeof a=="undefined")return this;typeof a=="string"&&(a=a.trim().split(/\s/g));let d,e,f=typeof a=="object"&&!Array.isArray(a),h=f?b:c;return f||(e=b),Object.keys(a).forEach(g=>{f?(d=g,e=a[g]):d=a[g],this.newListener(d,e,h);},this),this}removeListener(a,b,c){let d=this.get(a);if(d instanceof m&&b){let e=new u({name:a,callback:b,scope:c});d.forEach((f,h)=>{if(f.getCallback()===e.getCallback()&&f.getScope()===e.getScope())return d.delete(h)});}return d}off(a,b,c){if(typeof a=="undefined")return this;typeof a=="string"&&(a=a.trim().split(/\s/g));let d,e,f=typeof a=="object"&&!Array.isArray(a),h=f?b:c;return f||(e=b),Object.keys(a).forEach(g=>{f?(d=g,e=a[g]):d=a[g],typeof e==="function"?this.removeListener(d,e,h):this.delete(d);},this),this}once(a,b,c){if(typeof a=="undefined")return this;typeof a=="string"&&(a=a.trim().split(/\s/g));let d,e,f=typeof a==="object"&&!Array.isArray(a),h=f?b:c;return f||(e=b),Object.keys(a).forEach(g=>{f?(d=g,e=a[g]):d=a[g];let n=(...r)=>{f?(d=g,e=a[g]):d=a[g],this.off(d,n,h),e.apply(h,r);};this.on(d,n,h);},this),this}emit(a,...b){return typeof a=="undefined"?this:(typeof a=="string"&&(a=a.trim().split(/\s/g)),a.forEach(c=>{let d=this.get(c);d instanceof m&&d.forEach(e=>{let{callback:f,scope:h}=e.toJSON();f.apply(h,b);});},this),this)}}const v=a=>typeof a==="string"?Array.from(document.querySelectorAll(a)):[a],w=a=>Array.isArray(a)?a:typeof a=="string"||a instanceof Node?v(a):a instanceof NodeList||a instanceof HTMLCollection?Array.from(a):[],p=(a,b)=>typeof a==="function"?a(...b):a,q=(a,b)=>{let c,d,e={},f=Object.keys(a);for(let h=0,g=f.length;h<g;h++)c=f[h],d=a[c],e[c]=p(d,b);return e},x={ease:"ease",in:"ease-in",out:"ease-out","in-out":"ease-in-out","in-sine":"cubic-bezier(0.47, 0, 0.745, 0.715)","out-sine":"cubic-bezier(0.39, 0.575, 0.565, 1)","in-out-sine":"cubic-bezier(0.445, 0.05, 0.55, 0.95)","in-quad":"cubic-bezier(0.55, 0.085, 0.68, 0.53)","out-quad":"cubic-bezier(0.25, 0.46, 0.45, 0.94)","in-out-quad":"cubic-bezier(0.455, 0.03, 0.515, 0.955)","in-cubic":"cubic-bezier(0.55, 0.055, 0.675, 0.19)","out-cubic":"cubic-bezier(0.215, 0.61, 0.355, 1)","in-out-cubic":"cubic-bezier(0.645, 0.045, 0.355, 1)","in-quart":"cubic-bezier(0.895, 0.03, 0.685, 0.22)","out-quart":"cubic-bezier(0.165, 0.84, 0.44, 1)","in-out-quart":"cubic-bezier(0.77, 0, 0.175, 1)","in-quint":"cubic-bezier(0.755, 0.05, 0.855, 0.06)","out-quint":"cubic-bezier(0.23, 1, 0.32, 1)","in-out-quint":"cubic-bezier(0.86, 0, 0.07, 1)","in-expo":"cubic-bezier(0.95, 0.05, 0.795, 0.035)","out-expo":"cubic-bezier(0.19, 1, 0.22, 1)","in-out-expo":"cubic-bezier(1, 0, 0, 1)","in-circ":"cubic-bezier(0.6, 0.04, 0.98, 0.335)","out-circ":"cubic-bezier(0.075, 0.82, 0.165, 1)","in-out-circ":"cubic-bezier(0.785, 0.135, 0.15, 0.86)","in-back":"cubic-bezier(0.6, -0.28, 0.735, 0.045)","out-back":"cubic-bezier(0.175, 0.885, 0.32, 1.275)","in-out-back":"cubic-bezier(0.68, -0.55, 0.265, 1.55)"},y=a=>/^(ease|in|out)/.test(a)?x[a]:a,z={keyframes:[],loop:1,delay:0,speed:1,endDelay:0,easing:"ease",autoplay:!0,duration:1e3,onfinish(){},fillMode:"auto",direction:"normal"};class A{constructor(a={}){this.options={},this.targets=[],this.properties={},this.animations=new Map(),this.duration=0,this.emitter=new E();let{options:b,...c}=a;this.options=Object.assign({},z,b,c),this.loop=this.loop.bind(this);let{loop:d,delay:e,speed:f,easing:h,endDelay:g,duration:n,direction:r,fillMode:F,onfinish:G,target:H,keyframes:I,autoplay:J,...K}=this.options;this.mainElement=document.createElement("span"),this.targets=w(H),this.properties=K;let o;for(let i=0,l=this.targets.length;i<l;i++){let k=this.targets[i],j={easing:y(h),iterations:d===!0?Infinity:d,direction:r,endDelay:g,duration:n,delay:e,fill:F},s=p(I,[i,l,k]);o=s.length?s:this.properties,j=q(j,[i,l,k]),s.length>0||(o=q(o,[i,l,k]));let C=j.delay+j.duration*j.iterations+j.endDelay;this.duration<C&&(this.duration=C);let D=k.animate(o,j);D.onfinish=()=>{G(k,i,l);},this.animations.set(k,D);}this.mainAnimation=this.mainElement.animate([{opacity:"0"},{opacity:"1"}],{duration:this.duration,easing:"linear"}),this.setSpeed(f),J?this.play():this.pause(),this.promise=this.newPromise(),this.mainAnimation.onfinish=()=>{this.finish(this.options),window.cancelAnimationFrame(this.animationFrame);};}getTargets(){return this.targets}newPromise(){return new Promise((a,b)=>{try{this.finish=c=>(this.emit("finish",c),a(c));}catch(c){b(c);}})}then(a,b){return this.promise.then(a,b)}catch(a){return this.promise.catch(a)}finally(a){return this.promise.finally(a)}loop(){this.animationFrame=window.requestAnimationFrame(this.loop),this.emit("tick change",this.getCurrentTime());}on(a,b,c){return this.emitter.on(a,b,c),this}off(a,b,c){return this.emitter.off(a,b,c),this}emit(a,...b){return this.emitter.emit(a,...b),this}getAnimation(a){return this.animations.get(a)}play(){return this.mainAnimation.playState!=="finished"&&(this.mainAnimation.play(),this.animationFrame=requestAnimationFrame(this.loop),this.animations.forEach(a=>{a.playState!=="finished"&&a.play();}),this.emit("play")),this}pause(){return this.mainAnimation.playState!=="finished"&&(this.mainAnimation.pause(),window.cancelAnimationFrame(this.animationFrame),this.animations.forEach(a=>{a.playState!=="finished"&&a.pause();}),this.emit("pause")),this}getDuration(){return this.duration}getCurrentTime(){return this.mainAnimation.currentTime}setCurrentTime(a){return this.mainAnimation.currentTime=a,this.animations.forEach(b=>{b.currentTime=a;}),this}getProgress(){return this.getCurrentTime()/this.duration}setProgress(a){return this.mainAnimation.currentTime=a*this.duration,this.animations.forEach(b=>{b.currentTime=a*this.duration;}),this}getSpeed(){return this.mainAnimation.playbackRate}setSpeed(a=1){return this.mainAnimation.playbackRate=a,this.animations.forEach(b=>{b.playbackRate=a;}),this}reset(){this.setCurrentTime(0),this.promise=this.newPromise(),this.options.autoplay?this.play():this.pause();}getPlayState(){return this.mainAnimation.playState}getOptions(){return this.options}toJSON(){return this.getOptions()}}const B=(a={})=>new A(a);

class IntroAnimation extends Service {
  init() {
    super.init();
    this.elements = [...document.querySelectorAll(".intro-animation")];
  }
  newPage() {
    this.init();
    this.prepareToShow();
  }
  initEvents() {
    this.EventEmitter.on("BEFORE_SPLASHSCREEN_HIDE", this.prepareToShow, this);
    this.EventEmitter.on("CONTENT_REPLACED", this.newPage, this);
    this.EventEmitter.on("START_SPLASHSCREEN_HIDE BEFORE_TRANSITION_IN", this.show, this);
  }
  stopEvents() {
    this.EventEmitter.off("BEFORE_SPLASHSCREEN_HIDE", this.prepareToShow, this);
    this.EventEmitter.off("CONTENT_REPLACED", this.newPage, this);
    this.EventEmitter.off("START_SPLASHSCREEN_HIDE BEFORE_TRANSITION_IN", this.show, this);
  }
  stop() {
    for (let el of this.elements) {
      el.style.opacity = "1";
    }
    super.stop();
  }
  prepareToShow() {
    for (let el of this.elements) {
      el.style.opacity = "0";
    }
    window.scroll(0, 0);
  }
  async show() {
    return await B({
      target: this.elements,
      keyframes: [
        {opacity: 0},
        {opacity: 1}
      ],
      delay(i) {
        return 200 * (i + 1);
      },
      onfinish(el) {
        el.style.opacity = "1";
      },
      easing: "out-cubic",
      duration: 500
    });
  }
}

class Navbar extends Service {
  constructor() {
    super();
    this.navbar = document.getElementsByClassName("navbar")[0];
    this.elements = [...this.navbar.getElementsByClassName("navbar-item")];
    this.menu = document.getElementsByClassName("navbar-menu")[0];
    this.click = this.click.bind(this);
  }
  validLink(el) {
    return el && el.tagName && el.tagName.toLowerCase() === "a";
  }
  getLink({target}) {
    let el = target;
    while (el && !this.validLink(el)) {
      el = el.parentNode;
    }
    if (!el)
      return;
    return el;
  }
  click(event) {
    let el = this.getLink(event);
    if (!el)
      return;
    if (el.classList.contains("navbar-menu")) {
      this.navbar.classList.toggle("active");
    } else if (el.classList.contains("navbar-link")) {
      this.navbar.classList.remove("active");
    }
  }
  activateLink() {
    let {href} = window.location;
    for (let item of this.elements) {
      let itemHref = item.href;
      if (!itemHref || itemHref.length < 1)
        continue;
      let URLmatch = _URL.equal(itemHref, href);
      let isActive = item.classList.contains("active");
      if (!(URLmatch && isActive)) {
        item.classList[URLmatch ? "add" : "remove"]("active");
      }
    }
  }
  initEvents() {
    this.EventEmitter.on("READY", this.activateLink, this);
    this.EventEmitter.on("GO", this.activateLink, this);
    this.navbar.addEventListener("click", this.click);
  }
  stopEvents() {
    this.EventEmitter.off("READY", this.activateLink, this);
    this.EventEmitter.off("GO", this.activateLink, this);
    this.navbar.removeEventListener("click", this.click);
  }
}

function _getClosest(item, array, getDiff) {
  var closest, diff;
  if (!Array.isArray(array)) {
    throw new Error("Get closest expects an array as second argument");
  }
  array.forEach(function(comparedItem, comparedItemIndex) {
    var thisDiff = getDiff(comparedItem, item);
    if (thisDiff >= 0 && (typeof diff == "undefined" || thisDiff < diff)) {
      diff = thisDiff;
      closest = comparedItemIndex;
    }
  });
  return closest;
}
function number(item, array) {
  return _getClosest(item, array, function(comparedItem, item2) {
    return Math.abs(comparedItem - item2);
  });
}
function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}
class Carousel extends Block {
  constructor() {
    super(...arguments);
    this.ease = 0.1;
    this.speed = 1.5;
  }
  init(value) {
    super.init(value);
    this.widths = [];
    this.dots = [];
    this.container = this.rootElement.getElementsByClassName("carousel-container")[0];
    this.viewport = this.rootElement.getElementsByClassName("carousel-viewport")[0];
    this.slides = [...this.rootElement.getElementsByClassName("carousel-item")];
    this.dots = [...this.rootElement.getElementsByClassName("carousel-dot")];
    this.dotContainer = this.rootElement.getElementsByClassName("carousel-dots")[0];
    this.dot = this.dots[0];
    this.slideLen = this.slides.length;
    this.centerX = window.innerWidth / 2;
    this.viewportWidth = 0;
    this.currentX = 0;
    this.index = 0;
    this.lastX = 0;
    this.maxX = 0;
    this.minX = 0;
    this.offX = 0;
    this.onX = 0;
    this.isDragging = false;
    this.clearDots();
    this.setDots();
    this.setBounds();
    this.setPos = this.setPos.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.run = this.run.bind(this);
    this.resize = this.resize.bind(this);
  }
  setDots() {
    for (let i = 0; i < this.slideLen; i++) {
      const newDot = this.dot.cloneNode();
      if (i === this.index)
        newDot.classList.add("active");
      this.dotContainer.appendChild(newDot);
      this.dots[i] = newDot;
    }
  }
  clearDots() {
    for (let i = this.dots.length; --i >= 0; ) {
      this.dots[i].classList.remove("active");
      this.dots[i].remove();
      this.dots.pop();
    }
  }
  setBounds() {
    this.viewportWidth = 0;
    for (let i = 0; i < this.slideLen; i++) {
      const slide = this.slides[i];
      const {width} = slide.getBoundingClientRect();
      this.widths[i] = width;
      this.viewportWidth += width;
    }
    this.maxX = -(this.viewportWidth - window.innerWidth);
  }
  setPos(e) {
    if (!this.isDragging)
      return;
    this.currentX = this.offX + (e.clientX - this.onX) * this.speed;
    this.clamp();
  }
  clamp() {
    this.currentX = Math.max(Math.min(this.currentX, this.minX), this.maxX);
  }
  run() {
    this.lastX = lerp(this.lastX, this.currentX, this.ease);
    this.lastX = Math.floor(this.lastX * 100) / 100;
    this.viewport.style.transform = `translate3d(${this.lastX}px, 0, 0)`;
    this.requestAnimationFrame();
  }
  requestAnimationFrame() {
    this.rAF = requestAnimationFrame(this.run);
  }
  on(e) {
    this.isDragging = true;
    this.onX = e.clientX;
    this.rootElement.classList.add("is-grabbing");
  }
  closest() {
    const numbers = [];
    this.slides.forEach((slide, index) => {
      const bounds = slide.getBoundingClientRect();
      const diff = this.currentX - this.lastX;
      const center = bounds.x + diff + bounds.width / 2;
      const fromCenter = this.centerX - center;
      numbers.push(fromCenter);
    });
    let closest = number(0, numbers);
    closest = numbers[closest];
    return closest;
  }
  snap() {
    this.currentX = this.currentX + this.closest();
    this.clamp();
  }
  off(e) {
    this.snap();
    this.isDragging = false;
    this.offX = this.currentX;
    this.rootElement.classList.remove("is-grabbing");
  }
  cancelAnimationFrame() {
    cancelAnimationFrame(this.rAF);
  }
  resize() {
    this.setBounds();
  }
  initEvents() {
    this.run();
    this.rootElement.addEventListener("mousemove", this.setPos, {passive: true});
    this.rootElement.addEventListener("mousedown", this.on, false);
    this.rootElement.addEventListener("mouseup", this.off, false);
    window.addEventListener("resize", this.resize, false);
  }
  stopEvents() {
    this.cancelAnimationFrame();
    this.rootElement.removeEventListener("mousemove", this.setPos, {passive: true});
    this.rootElement.removeEventListener("mousedown", this.on, false);
    this.rootElement.removeEventListener("mouseup", this.off, false);
  }
}
const CarouselBlockIntent = new BlockIntent({
  name: "Carousel",
  block: Carousel
});

class Fade extends Transition {
  constructor() {
    super(...arguments);
    this.name = "default";
    this.duration = 500;
  }
  out({from}) {
    let {duration} = this;
    let fromWrapper = from.getWrapper();
    window.scroll({
      top: 0,
      behavior: "smooth"
    });
    return new Promise(async (resolve) => {
      await B({
        target: fromWrapper,
        opacity: [1, 0],
        duration,
        onfinish(el) {
          el.style.opacity = "0";
        }
      });
      window.scrollTo(0, 0);
      resolve();
    });
  }
  in({to}) {
    let {duration} = this;
    let toWrapper = to.getWrapper();
    toWrapper.style.transform = "translateX(0%)";
    return B({
      target: toWrapper,
      opacity: [0, 1],
      duration,
      onfinish(el) {
        el.style.opacity = "1";
      }
    });
  }
}

const app = new App();
let navbar, router;
app.addService(new IntroAnimation()).add("service", new PJAX()).addService(navbar = new Navbar()).addService(router = new Router()).add("block", CarouselBlockIntent).add("transition", new Fade());
const html = document.querySelector("html");
try {
  let theme2 = getTheme();
  if (theme2 === null)
    theme2 = mediaTheme();
  theme2 && html.setAttribute("theme", theme2);
} catch (e) {
  console.warn("Theming isn't available on this browser.");
}
let themeSet = (theme2) => {
  html.setAttribute("theme", theme2);
  setTheme(theme2);
};
window.matchMedia("(prefers-color-scheme: dark)").addListener((e) => {
  themeSet(e.matches ? "dark" : "light");
});
try {
  let layer, top, navHeight = navbar.navbar.getBoundingClientRect().height;
  app.on("CONTENT_REPLACED READY", () => {
    let layers = document.getElementsByClassName("layer") || [];
    layer = layers[0] || null;
    top = layer ? layer.getBoundingClientRect().y : null;
    if (/(index(.html)?|\/$)/.test(window.location.pathname))
      navbar.navbar.classList.add("light");
    else
      navbar.navbar.classList.remove("light");
    navbar.navbar.classList.remove("focus");
    navbar.navbar.classList.remove("active");
    let backToTop = document.getElementsByClassName("back-to-top")[0];
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
    let scrollBtn = document.getElementsByClassName("scroll-btn");
    if (scrollBtn[0]) {
      scrollBtn[0].addEventListener("click", () => {
        let scrollPt = document.getElementsByClassName("scroll-point");
        if (scrollPt[0])
          scrollPt[0].scrollIntoView({behavior: "smooth"});
      });
    }
  });
  app.boot();
  window.addEventListener("scroll", () => {
    let scrollTop = window.scrollY;
    requestAnimationFrame(() => {
      if (top && scrollTop + 10 + navHeight >= top) {
        navbar.navbar.classList.add("focus");
      } else
        navbar.navbar.classList.remove("focus");
    });
  });
} catch (err) {
  console.warn("[App] boot failed,", err);
}
