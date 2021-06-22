const orginalProto = Array.prototype;
const arrayProto = Object.create(orginalProto);

["push", "pop", "shift", "unshift"].forEach((method) => {
  arrayProto[method] = function() {
    orginalProto[method].apply(this, arguments);
    console.log("数组执行", method);
  };
});

function defineReactive(obj, key, val) {
  observe(val);
  const dep = new Dep();
  // 每执行异常就执行一个Dep实例
  Object.defineProperty(obj, key, {
    get() {
      console.log("get", val);
      Dep.target && dep.addDep(Dep.target);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set", newVal);
        observe(newVal);
        val = newVal;

        // 更新
        dep.notify();
        // 通知更新
        // watchers.forEach((w) => w.update());
      }
    },
  });
}
// 响应式
function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    return;
  }
  if (Array.isArray(obj)) {
    obj.__proto__ = arrayProto;
    // const keys = Object.keys(obj);
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i]);
    }
  }
  new Observer(obj);
}
function proxy(vm) {
  Object.keys(vm.$data).forEach((key) => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key];
      },
      set(newVal) {
        vm.$data[key] = newVal;
      },
    });
  });
}
class KVue {
  constructor(options) {
    this.$options = options;

    this.$data = options.data;

    observe(this.$data);

    // 代理
    proxy(this);
    new Compile("#app", this);
  }
}

class Observer {
  constructor(value) {
    this.value = value;

    this.walk(value);
  }

  walk(obj) {
    Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]));
  }
}

// 编译过程

class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);

    if (this.$el) {
      this.compile(this.$el);
    }
  }

  compile(el) {
    el.childNodes.forEach((node) => {
      if (this.isElement(node)) {
        console.log("编译元素", node.nodeName);
        this.compileElement(node);
      } else if (this.isInter(node)) {
        console.log("编译差值表达式", node.textContent);
        this.compileText(node);
      }

      if (node.childNodes) {
        this.compile(node);
      }
    });
  }
  // 编译差值表达式{{counter}}
  compileText(node) {
    this.update(node, RegExp.$1, "text");
  }
  // 编译属性值k-text="counter"
  compileElement(node) {
    const nodeAttrs = node.attributes;
    Array.from(nodeAttrs).forEach((attr) => {
      // 假设 k-xx="exp"
      const attrName = attr.name;
      const exp = attr.value;
      //
      if (this.isDirective(attrName)) {
        const dir = attrName.substring(2);
        this[dir] && this[dir](node, exp);
      }
      // 事件
      if (this.isEvent(attrName)) {
        // @click="onClik"
        const dir = attrName.substring(1);
        this.eventHandler(node, exp, dir);
      }
    });
  }
  text(node, exp) {
    this.update(node, exp, "text");
  }
  html(node, exp) {
    this.update(node, exp, "html");
  }
  // 双向数据绑定
  model(node, exp) {
    this.update(node, exp, "model");

    node.addEventListener("input", (e) => {
      this.$vm[exp] = e.target.value;
    });
  }
  // 判断是否是合格的属性
  isDirective(attrName) {
    return attrName.indexOf("k-") === 0;
  }
  // 判断是否是个原始
  isElement(node) {
    return node.nodeType === 1;
  }
  // 判断是否是{{}}这样的插值表达式
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
  isEvent(dir) {
    return dir.indexOf("@") === 0;
  }
  eventHandler(node, exp, dir) {
    const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp];
    node.addEventListener(dir, fn.bind(this.$vm));
  }
  htmlUpdater(node, value) {
    node.innerHTML = value;
  }
  textUpdater(node, value) {
    node.textContent = value;
  }
  modelUpdater(node, value) {
    node.value = value;
  }
  // 更新函数
  update(node, exp, dir) {
    // 初始化
    const fn = this[dir + "Updater"];
    fn && fn(node, this.$vm[exp]);
    // 更新
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val);
    });
  }
}

// Watcher：小秘书，界面钟的一个依赖对应一个小秘书
// const watchers = [];
class Watcher {
  constructor(vm, key, updateFn) {
    this.vm = vm;
    this.key = key;
    this.updateFn = updateFn;
    // watchers.push(this);

    // 读一次数据触发define里面的get()
    Dep.target = this;
    this.vm[this.key];

    Dep.target = null;
  }

  // 管家调用

  update() {
    this.updateFn.call(this.vm, this.vm[this.key]);
  }
}
// 小管家
class Dep {
  constructor() {
    this.deps = [];
  }

  addDep(watcher) {
    this.deps.push(watcher);
  }

  notify() {
    this.deps.forEach((watcher) => watcher.update());
  }
}
