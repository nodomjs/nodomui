///<reference types='nodom'/>

/**
 * panel 插件
 */
class UILayout extends nodom.Plugin{
    tagName:string = 'UI-LAYOUT';
    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
            }else if(typeof params === 'object'){
                for(let o in params){
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom:nodom.Element){
        rootDom.addClass('nd-layout');

        //增加middle 容器
        let middleCt:nodom.Element = new nodom.Element();
        middleCt.addClass('nd-layout-middle');
        middleCt.tagName = 'DIV';
        let items = {};
        //位置
        let locs = ['north','west','center','east','south'];
        for(let i=0;i<rootDom.children.length;i++){
            let item:nodom.Element = rootDom.children[i];
            if(!item.tagName){
                continue;
            }
            for(let l of locs){
                if(item.hasProp(l)){
                    item.addClass('nd-layout-' + l);
                    items[l] = item;
                    break;
                }
            }
        }
        rootDom.children = [];
        if(items['north']){
            rootDom.children.push(items['north']);
        }

        if(items['west']){
            middleCt.children.push(items['west']);
        }
        if(items['center']){
            middleCt.children.push(items['center']);
        }
        if(items['east']){
            middleCt.children.push(items['east']);
        }

        rootDom.children.push(middleCt);

        if(items['south']){
            rootDom.children.push(items['south']);
        }
    }
}

nodom.PluginManager.add('UI-LAYOUT',UILayout);