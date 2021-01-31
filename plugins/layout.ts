///<reference types='nodomjs'/>

/**
 * panel 插件
 */
class UILayout extends nodom.Plugin{
    /**
     * tag name
     */
    tagName:string = 'UI-LAYOUT';

    /**
     * 附加数据名
     */
    extraDataName:string;

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
        //设置附加数据项名
        this.extraDataName = '$ui_layout_' + nodom.Util.genId();

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

                    //东西方
                    if(l === 'west'){  
                        this.handleEastAndWest(item,0);
                    }else if(l==='east'){
                        this.handleEastAndWest(item,1);
                    }
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

    /**
     * 前置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        super.beforeRender(module,dom);
        if(this.needPreRender){
            let model:nodom.Model = module.getModel(dom.modelId);
            model.set(this.extraDataName,{
                openWest:true,  //west是否展开
                openEast:true,  //east是否展开
                westWidth:0,   //west原始宽度
                eastWidth:0    //east原始宽度
            });
        }
    }
    /**
     * 处理东西方容器
     * @param dom   待处理东西方容器
     * @param loc   位置 0:west 1:east
     */
    private handleEastAndWest(dom:nodom.Element,loc:number){
        const me = this;
        if(dom.hasProp('title') || dom.hasProp('allowmin')){
            let header = new nodom.Element('div');
            header.addClass('nd-layout-header');
            dom.children.unshift(header);
            
            //标题
            let title:nodom.Element;
            if(dom.hasProp('title')){
                title = new nodom.Element('div');
                title.addClass('nd-layout-title');
                let txt:nodom.Element = new nodom.Element();
                txt.textContent = dom.getProp('title');
                title.add(txt);
                header.add(title);
            }
            //图标
            let icon:nodom.Element;
            if(dom.hasProp('allowmin')){
                icon = new nodom.Element('b');
                if(loc === 1){ //east
                    //隐藏时title不显示
                    if(title){
                        title.addDirective(new nodom.Directive('show',this.extraDataName + '.openEast',title));
                    }
                    icon.addDirective(new nodom.Directive('class',"{'nd-icon-arrow-right':'"+ this.extraDataName + ".openEast','nd-icon-arrow-left':'!"+ this.extraDataName + ".openEast'}",icon));
                    icon.addEvent(new nodom.NodomEvent('click',(dom,model,module,e,el)=>{
                        let data = model.query(me.extraDataName);
                        //east 容器
                        let eastEl:HTMLElement = el.parentNode.parentNode;
                        let compStyle:CSSStyleDeclaration = window.getComputedStyle(eastEl);
                        let width;
                        if(data.openEast){ //获取展开宽度
                            if(data.eastWidth === 0){
                                data.eastWidth = compStyle.width;
                            }
                            width = '40px';
                        }else{
                            width = data.eastWidth;
                        }
                        eastEl.style.width = width;
                        // 设置状态
                        data.openEast = !data.openEast;
                    }));
                    //添加到header
                    header.children.unshift(icon);
                }else{  //west
                    //隐藏时title不显示
                    if(title){
                        title.addDirective(new nodom.Directive('show',this.extraDataName + '.openWest',title));
                    }
                    
                    icon.addDirective(new nodom.Directive('class',"{'nd-icon-arrow-left':'"+ this.extraDataName + ".openWest','nd-icon-arrow-right':'!"+ this.extraDataName + ".openWest'}",icon));
                    icon.addEvent(new nodom.NodomEvent('click',(dom,model,module,e,el)=>{
                        let data = model.query(me.extraDataName);
                        //west 容器
                        let westEl:HTMLElement = el.parentNode.parentNode;
                        let compStyle:CSSStyleDeclaration = window.getComputedStyle(westEl);
                        let width;
                        if(data.openWest){ //获取展开宽度
                            if(data.westWidth === 0){
                                data.westWidth = compStyle.width;
                            }
                            width = '40px';
                        }else{
                            width = data.westWidth;
                        }
                        westEl.style.width = width;
                        data.openWest = !data.openWest;
                    }));
                    header.add(icon);
                }
            }
        }
    }
}

nodom.PluginManager.add('UI-LAYOUT',UILayout);