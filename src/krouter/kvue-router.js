import Vue from "vue";

// 插件
// let KVue;
class KVueRouter {
  constructor(options) {
    // KVue
    this.$options = options;
    const initial = window.location.hash.slice(1) || "/";
    // KVue.util.defineReactive(this, 'current', initial);
    this.current = initial;
    // 设置个router的数组
    Vue.util.defineReactive(this, "matched", []);

    this.match();

    window.addEventListener("hashchange", this.onHashChange.bind(this));
    window.addEventListener("load", this.onHashChange.bind(this));
    this.routeMap = {};
    this.$options.routes.forEach((route) => {
      this.routeMap[route.path] = route;
    });
  }
  onHashChange() {
    this.current = window.location.hash.slice(1);
    this.matched = [];
    this.match();
  }
  // 设置不同层级的路由数据
  match(router) {
    const routes = router || this.$options.routes;

    for (const route of routes) {
      if (route.path === "/" && this.current === "/") {
        this.matched.push(route);
        return;
      }

      if (route.path !== "/" && this.current.indexOf(route.path) != -1) {
        this.matched.push(route);
        if (route.children) {
          this.match(route.children);
        }
        return;
      }
    }
  }
}
KVueRouter.install = function(Vue) {
  // KVue = Vue;
  // 1、挂载
  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router;
      }
    },
  });
  // 实现两个全局组件
  Vue.component("router-link", {
    props: {
      to: {
        type: String,
        default: "/",
      },
    },
    render(h) {
      return h("a", { attrs: { href: "#" + this.to } }, this.$slots.default);
    },
  });
  Vue.component("router-view", {
    render(h) {
      // const routes = this.$router.$options.routes;
      // const current = this.$router.current;
      // const route = routes.find(route => route.path === current);
      // const comp = route ? route.component : null;
      // return h(comp);

      // 要标记当前router-view的深度
      this.$vnode.data.routerView = true; // 每个view加个routerView属性
      let depth = 0;
      let parent = this.$parent;
      while (parent) {
        const vnodeData = parent.$vnode && parent.$vnode.data;
        if (vnodeData) {
          if (vnodeData.routerView) {
            depth++;
          }
        }
        parent = parent.$parent;
      }
      let component = null;
      const route = this.$router.matched[depth];
      if (route) {
        component = route.component;
      }
      return h(component);

      // // 这个只是一层的
      // const {routeMap, current} =this.$router
      // const component=routeMap[current] ?routeMap[current].component : null;
      // return h(component);
    },
  });
};

export default KVueRouter;
