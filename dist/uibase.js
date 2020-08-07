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
    /**
     * 处理ui参数
     * @param dom           待处理dom
     * @param defDom        自定义dom对象
     * @param paramArr      参数数组
     * @param props         自定义对象属性数组
     * @param defaultValues 自定义对象属性默认值
     */
    static handleUIParam(dom, defDom, paramArr, props, defaultValues) {
        let error = false;
        for (let i = 0; i < paramArr.length; i++) {
            let pName = props[i];
            let p = paramArr[i];
            //参数类型
            let type;
            let pa;
            if (p.includes('|')) {
                pa = p.split('|');
                p = pa[0];
                type = pa[1];
            }
            let v = dom.getProp(p);
            if (v) {
                //去掉空格
                v = this.clearSpace(v);
                if (v !== '') {
                    switch (type) {
                        case 'number':
                            if (!nodom.Util.isNumberString(v)) {
                                error = true;
                            }
                            else {
                                defDom[pName] = parseInt(v);
                            }
                            break;
                        case 'array':
                            let va = v.split(',');
                            if (pa.length === 3) {
                                if (nodom.Util.isNumberString(pa[2])) { //数组长度判断
                                    if (parseInt(pa[2]) > va.length) {
                                        error = true;
                                    }
                                }
                                else {
                                    if (pa[2] === 'number') {
                                        for (let i = 0; i < va.length; i++) {
                                            let v1 = va[i];
                                            if (!nodom.Util.isNumberString(v1)) {
                                                error = true;
                                                break;
                                            }
                                            va[i] = parseInt(v1);
                                        }
                                    }
                                }
                            }
                            if (!error) {
                                defDom[pName] = va;
                            }
                            break;
                        case 'bool':
                            //bool型可以不设置值，只需要设置该属性名即可
                            if (v === 'true') {
                                defDom[pName] = true;
                            }
                            break;
                        default:
                            defDom[pName] = v;
                    }
                }
            }
            //默认值
            if (!v || v === '') {
                if (defaultValues && defaultValues[i] !== null) {
                    defDom[pName] = defaultValues[i];
                }
                else {
                    //bool只要有这个属性，则设置为true
                    if (type === 'bool') {
                        if (dom.hasProp(p)) {
                            defDom[pName] = true;
                        }
                        else {
                            defDom[pName] = false;
                        }
                    }
                    else {
                        error = true;
                    }
                }
            }
            dom.delProp(p);
            if (error) {
                throw new nodom.NodomError('config1', defDom.tagName, p);
            }
        }
    }
}
/**
 * window事件注册器
 */
class UIEventRegister {
    static addEvent(eventName, moduleId, domKey, handler) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
            window.addEventListener(eventName, (e) => {
                let target = e.target;
                let key = target.getAttribute('key');
                let evts = this.listeners.get(eventName);
                for (let evt of evts) {
                    let module = nodom.ModuleFactory.get(evt.module);
                    let dom = module.renderTree.query(evt.dom);
                    if (!dom) {
                        continue;
                    }
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
            module: moduleId,
            dom: domKey,
            handler: handler
        });
    }
}
UIEventRegister.listeners = new Map();
/**
 * http请求（用户可根据自己的情况改写该方法）
 * @param config 	url 				请求地址
 *					method 			    请求类型 GET(默认) POST
 *					params 				参数，json格式
 *					async 				异步，默认true
 *  				timeout 			超时时间
 *					withCredentials 	同源策略，跨域时cookie保存，默认false
 *                  header              request header 对象
 *                  user                需要认证的情况需要用户名和密码
 *                  pwd                 密码
 *                  success             成功回调
 *                  failuer             失败回调
 */
function request(cfg) {
    return nodom.request(cfg);
}
//# sourceMappingURL=uibase.js.map