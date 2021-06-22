function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log("get", val);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set", newVal);
        val = newVal;
      }
    },
  });
}

const obj = {};
defineReactive(obj, "foo", "bar");
obj.foo;
obj.foo = "foooo";
