import { escape, isServer, createComponent, spread, renderToString, Dynamic, generateHydrationScript, ssr as ssr$1, ssrHydrationKey } from "solid-js/web";
import { setupProgress, router, mergeDataIntoQueryString, shouldIntercept } from "@inertiajs/core";
import { createContext, sharedConfig, createUniqueId, useContext, createRenderEffect, onCleanup, mergeProps, splitProps, createSignal } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import "lodash.clonedeep";
import "lodash.isequal";
import { decode } from "html-entities";
const MetaContext = createContext();
const cascadingTags = ["title", "meta"];
const getTagType = (tag) => tag.tag + (tag.name ? `.${tag.name}"` : "");
const MetaProvider = (props) => {
  if (!isServer && !sharedConfig.context) {
    const ssrTags = document.head.querySelectorAll(`[data-sm]`);
    Array.prototype.forEach.call(ssrTags, (ssrTag) => ssrTag.parentNode.removeChild(ssrTag));
  }
  const cascadedTagInstances = /* @__PURE__ */ new Map();
  function getElement(tag) {
    if (tag.ref) {
      return tag.ref;
    }
    let el = document.querySelector(`[data-sm="${tag.id}"]`);
    if (el) {
      if (el.tagName.toLowerCase() !== tag.tag) {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
        el = document.createElement(tag.tag);
      }
      el.removeAttribute("data-sm");
    } else {
      el = document.createElement(tag.tag);
    }
    return el;
  }
  const actions = {
    addClientTag: (tag) => {
      let tagType = getTagType(tag);
      if (cascadingTags.indexOf(tag.tag) !== -1) {
        if (!cascadedTagInstances.has(tagType)) {
          cascadedTagInstances.set(tagType, []);
        }
        let instances = cascadedTagInstances.get(tagType);
        let index = instances.length;
        instances = [...instances, tag];
        cascadedTagInstances.set(tagType, instances);
        if (!isServer) {
          let element = getElement(tag);
          tag.ref = element;
          spread(element, tag.props);
          let lastVisited = null;
          for (var i = index - 1; i >= 0; i--) {
            if (instances[i] != null) {
              lastVisited = instances[i];
              break;
            }
          }
          if (element.parentNode != document.head) {
            document.head.appendChild(element);
          }
          if (lastVisited && lastVisited.ref) {
            document.head.removeChild(lastVisited.ref);
          }
        }
        return index;
      }
      if (!isServer) {
        let element = getElement(tag);
        tag.ref = element;
        spread(element, tag.props);
        if (element.parentNode != document.head) {
          document.head.appendChild(element);
        }
      }
      return -1;
    },
    removeClientTag: (tag, index) => {
      const tagName = getTagType(tag);
      if (tag.ref) {
        const t = cascadedTagInstances.get(tagName);
        if (t) {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
            for (let i = index - 1; i >= 0; i--) {
              if (t[i] != null) {
                document.head.appendChild(t[i].ref);
              }
            }
          }
          t[index] = null;
          cascadedTagInstances.set(tagName, t);
        } else {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
          }
        }
      }
    }
  };
  if (isServer) {
    actions.addServerTag = (tagDesc) => {
      const {
        tags = []
      } = props;
      if (cascadingTags.indexOf(tagDesc.tag) !== -1) {
        const index = tags.findIndex((prev) => {
          const prevName = prev.props.name || prev.props.property;
          const nextName = tagDesc.props.name || tagDesc.props.property;
          return prev.tag === tagDesc.tag && prevName === nextName;
        });
        if (index !== -1) {
          tags.splice(index, 1);
        }
      }
      tags.push(tagDesc);
    };
    if (Array.isArray(props.tags) === false) {
      throw Error("tags array should be passed to <MetaProvider /> in node");
    }
  }
  return createComponent(MetaContext.Provider, {
    value: actions,
    get children() {
      return props.children;
    }
  });
};
const MetaTag = (tag, props, setting) => {
  const id = createUniqueId();
  const c = useContext(MetaContext);
  if (!c)
    throw new Error("<MetaProvider /> should be in the tree");
  useHead({
    tag,
    props,
    setting,
    id,
    get name() {
      return props.name || props.property;
    }
  });
  return null;
};
function useHead(tagDesc) {
  const {
    addClientTag,
    removeClientTag,
    addServerTag
  } = useContext(MetaContext);
  createRenderEffect(() => {
    if (!isServer) {
      let index = addClientTag(tagDesc);
      onCleanup(() => removeClientTag(tagDesc, index));
    }
  });
  if (isServer) {
    addServerTag(tagDesc);
    return null;
  }
}
function renderTags(tags) {
  return tags.map((tag) => {
    var _a;
    const keys = Object.keys(tag.props);
    const props = keys.map((k) => k === "children" ? "" : ` ${k}="${escape(tag.props[k], true)}"`).join("");
    if (tag.props.children) {
      const children = Array.isArray(tag.props.children) ? tag.props.children.join("") : tag.props.children;
      if (((_a = tag.setting) == null ? void 0 : _a.escape) && typeof children === "string") {
        return `<${tag.tag} data-sm="${tag.id}"${props}>${escape(children)}</${tag.tag}>`;
      }
      return `<${tag.tag} data-sm="${tag.id}"${props}>${children}</${tag.tag}>`;
    }
    return `<${tag.tag} data-sm="${tag.id}"${props}/>`;
  }).join("");
}
const Title = (props) => MetaTag("title", props, {
  escape: true
});
var m = () => {
};
function B(o) {
  let [e, p] = splitProps(o, ["children", "as", "data", "href", "method", "preserveScroll", "preserveState", "replace", "only", "headers", "queryStringArrayFormat", "onCancelToken", "onBefore", "onStart", "onProgress", "onFinish", "onCancel", "onSuccess", "onError"]);
  e = mergeProps({ as: "a", data: {}, method: "get", preserveScroll: false, preserveState: null, replace: false, only: [], headers: {}, queryStringArrayFormat: "brackets" }, e), e = mergeProps(e, { as: e.as.toLowerCase(), method: e.method.toLowerCase() });
  let [s, a] = mergeDataIntoQueryString(e.method, e.href || "", e.data, e.queryStringArrayFormat);
  e = mergeProps(e, { data: a }), e.as === "a" && (p = mergeProps(p, { href: s }), e.method !== "get" && console.warn(`Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.

Please specify a more appropriate element using the "as" attribute. For example:

<Link href="${s}" method="${e.method}" as="button">...</Link>`));
  let u = (l) => {
    isServer || shouldIntercept(l) && (l.preventDefault(), router.visit(e.href, { data: e.data, method: e.method, preserveScroll: e.preserveScroll, preserveState: e.preserveState ?? e.method === "get", replace: e.replace, only: e.only, headers: e.headers, onCancelToken: e.onCancelToken || m, onBefore: e.onBefore || m, onStart: e.onStart || m, onProgress: e.onProgress || m, onFinish: e.onFinish || m, onCancel: e.onCancel || m, onSuccess: e.onSuccess || m, onError: e.onError || m }));
  };
  return createComponent(Dynamic, mergeProps(p, { get component() {
    return e.as;
  }, get children() {
    return e.children;
  }, onClick: (l) => u(l) }));
}
var ie = createContext(), b = ie;
function q(o) {
  return o ? typeof o.layout == "function" ? [o.layout] : Array.isArray(o.layout) ? o.layout : [] : [];
}
function R(o) {
  let [e, p] = createStore({ component: o.initialComponent || null, layouts: q(o.initialComponent || null), page: o.initialPage, key: null });
  isServer || router.init({ initialPage: o.initialPage, resolveComponent: o.resolveComponent, async swapComponent({ component: a, page: u, preserveState: l }) {
    p(reconcile({ component: a, layouts: q(a), page: u, key: l ? e.key : Date.now() }));
  } });
  let s = (a = 0) => {
    let u = e.layouts[a];
    return u ? createComponent(u, mergeProps(() => e.page.props, { get children() {
      return s(a + 1);
    } })) : createComponent(e.component, mergeProps({ key: e.key }, () => e.page.props));
  };
  return createComponent(MetaProvider, { tags: o.head, get children() {
    return createComponent(b.Provider, { get value() {
      return e.page;
    }, get children() {
      return s();
    } });
  } });
}
async function G({ id: o = "app", page: e = void 0, title: p = void 0, resolve: s, setup: a, progress: u = {} }) {
  let l = isServer ? null : document.getElementById(o), c = e || JSON.parse(l.dataset.page), F = (f) => Promise.resolve(s(f)).then((S) => S.default || S), d = { initialPage: c, initialComponent: await F(c.component), resolveComponent: F, head: [] };
  if (isServer) {
    let f = renderToString(() => createComponent(Dynamic, { component: "div", children: createComponent(R, d), id: o, "data-page": JSON.stringify(c) }));
    return { head: renderTags(d.head).concat(generateHydrationScript()), body: f };
  }
  u && setupProgress(u), a({ el: l, App: R, props: d });
}
const _tmpl$$2 = ["<nav", "><ul><li>", "</li><li>", "</li></ul></nav>"];
function Layout(props) {
  return [ssr$1(_tmpl$$2, ssrHydrationKey(), escape(createComponent(B, {
    href: "/",
    children: "Welcome"
  })), escape(createComponent(B, {
    href: "/about",
    children: "About"
  }))), props.children];
}
const _tmpl$$1 = ["<div", "><!--#-->", "<!--/--><h1>About</h1><p>This is the about page.</p></div>"];
function About() {
  return ssr$1(_tmpl$$1, ssrHydrationKey(), escape(createComponent(Title, {
    children: "About SSR"
  })));
}
About.layout = Layout;
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: About
}, Symbol.toStringTag, { value: "Module" }));
const _tmpl$ = ["<div", "><!--#-->", "<!--/--><h1>Hello world!!!!</h1><div><button>-</button><span>", "</span><button>+</button></div></div>"];
function Welcome() {
  const [count, setCount] = createSignal(0);
  return ssr$1(_tmpl$, ssrHydrationKey(), escape(createComponent(Title, {
    children: "Hello SSR!"
  })), escape(count()));
}
Welcome.layout = Layout;
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Welcome
}, Symbol.toStringTag, { value: "Module" }));
const ssr = {
  async fetch(request) {
    var _a;
    let response = await fetch(request);
    if (!((_a = response.headers.get("content-type")) == null ? void 0 : _a.includes("text/html"))) {
      return response;
    }
    let head = void 0;
    response = await new HTMLRewriter().on("#app", {
      async element(element) {
        if (!element.hasAttribute("data-page")) {
          return;
        }
        const encodedData = element.getAttribute("data-page");
        const pageData = JSON.parse(decode(encodedData));
        const { head: renderedHead, body } = await G({
          id: "app",
          page: pageData,
          resolve(name) {
            const pages = /* @__PURE__ */ Object.assign({ "./pages/About.tsx": __vite_glob_0_0, "./pages/Welcome.tsx": __vite_glob_0_1 });
            return pages[`./pages/${name}.tsx`];
          }
        });
        head = renderedHead;
        element.replace(body, { html: true });
      }
    }).transform(response);
    response = new HTMLRewriter().on("head", {
      element(element) {
        if (!head)
          return;
        element.append(head, { html: true });
      }
    }).transform(response);
    return response;
  }
};
export {
  ssr as default
};
