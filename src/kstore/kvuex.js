// 插件
let KVue;
class Store {
  constructor(options) {
    // options 是传入的State，actions这些数据

    this._mutations = options.mutations;
    this._actions = options.actions;
    this._wrappedGetters = options.getters;

    const computed = {};
    this.getters = {};
    const store = this;
    Object.keys(this._wrappedGetters).forEach((key) => {
      // 获取用户定义的getter
      const fn = store._wrappedGetters[key];
      // 转换为computed的可以使用无参形式
      computed[key] = function() {
        return fn(store.state);
      };
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key],
      });
    });
    this._vm = new KVue({
      data: {
        $$state: options.state,
      },
      computed,
    });
    // 绑定this
    this.commit = this.commit.bind(store);
    this.dispatch = this.dispatch.bind(store);
    // 源码这样写的
    // const store = this;
    // const {commit, action} =store
    // this.commit = function boundCommit(type, payload) {
    // 	commit.call(store, type, payload)
    // }
    // this.dispatch = function boundDispatch(type, payload) {
    // 	return dispatch.call(store, type, payload)
    // }
    // this.action = function boundAction(type, payload) {
    // 	return action.call(store, type, payload)
    // }
  }
  get state() {
    return this._vm._data.$$state;
  }
  set state(v) {
    console.error("please use replaceState too reset state");
  }
  commit(type, payload) {
    const entry = this._mutations[type];
    if (!entry) {
      console.error("unKown");
    }
    entry(this.state, payload);
  }
  dispatch(type, payload) {
    const entry = this._actions[type];
    if (!entry) {
      console.error("unKown");
    }
    return entry(this, payload);
  }
}
function install(Vue) {
  KVue = Vue;
  // 混入
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store;
      }
    },
  });
}
export default {
  Store,
  install,
};
