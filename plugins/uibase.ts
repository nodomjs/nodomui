
//关闭右键菜单
document.oncontextmenu = function(e){
    e.preventDefault();
};

/**
 * 工具类
 */
class UITool{
    /**
     * 去掉字符串的空格
     * @param src 
     */
    static clearSpace(src:string):string{
        if(src && typeof src === 'string'){
            return src.replace(/\s+/g,'');
        }
    }
}

/**
 * 事件对象接口
 */
interface IEventObj{
    module:string;
    dom:string;
    handler:Function;
}

/**
 * window事件注册器
 */
class UIEventRegister{
    static listeners:Map<string,Array<IEventObj>> = new Map();
    static addEvent(eventName:string,moduleName:string,domKey:string,handler:Function){
        if(!this.listeners.has(eventName)){
            this.listeners.set(eventName,[]);
            window.addEventListener(eventName,(e)=>{
                let target:any = e.target;
                let key:string = target.getAttribute('key');
                
                let evts:IEventObj[] = this.listeners.get(eventName);
                for(let evt of evts){
                    
                    let module:nodom.Module = nodom.ModuleFactory.get(evt.module);
                    let dom:nodom.Element = module.renderTree.query(evt.dom);
                    //事件target在dom内则为true，否则为false
                    let inOrOut:boolean = dom.key===key || dom.query(key)?true:false;
                    if(typeof evt.handler === 'function'){
                        evt.handler.apply(dom,[module,dom,inOrOut,e]);
                    }
                }
            },false);
        }
        let arr = this.listeners.get(eventName);
        //同一个元素不注册相同事件
        let find = arr.find(item=>item.dom===domKey);
        if(find){
            return;
        }
        arr.push({
            module:moduleName,
            dom:domKey,
            handler:handler
        });
    }
}
