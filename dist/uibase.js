//关闭右键菜单
document.oncontextmenu = function (e) {
    e.preventDefault();
};
/**
 * 工具类
 */
class UITool {
    /**
     * 去掉字符串的空格
     * @param src
     */
    static clearSpace(src) {
        if (src && typeof src === 'string') {
            return src.replace(/\s+/g, '');
        }
    }
}
/**
 * window事件注册器
 */
let UIEventRegister = /** @class */ (() => {
    class UIEventRegister {
        static addEvent(eventName, moduleName, domKey, handler) {
            if (!this.listeners.has(eventName)) {
                this.listeners.set(eventName, []);
                window.addEventListener(eventName, (e) => {
                    let target = e.target;
                    let key = target.getAttribute('key');
                    let evts = this.listeners.get(eventName);
                    for (let evt of evts) {
                        let module = nodom.ModuleFactory.get(evt.module);
                        let dom = module.renderTree.query(evt.dom);
                        //事件target在dom内则为true，否则为false
                        let inOrOut = dom.key === key || dom.query(key) ? true : false;
                        if (typeof evt.handler === 'function') {
                            evt.handler.apply(dom, [module, dom, inOrOut, e]);
                        }
                    }
                }, false);
            }
            let arr = this.listeners.get(eventName);
            //同一个元素不注册相同事件
            let find = arr.find(item => item.dom === domKey);
            if (find) {
                return;
            }
            arr.push({
                module: moduleName,
                dom: domKey,
                handler: handler
            });
        }
    }
    UIEventRegister.listeners = new Map();
    return UIEventRegister;
})();
//# sourceMappingURL=uibase.js.map