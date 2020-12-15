///<reference types='nodomjs'/>
/**
 * panel 插件
 */
class UIPanel extends nodom.Plugin{
    tagName:string = 'UI-PANEL';
    /**
     * panel 标题
     */
    title:string;
    /**
     * button 串
     */
    buttons:string[];

    /**
     * 头部图标按钮dom
     */
    headerBtnDom:nodom.Element;

    /**
     * 关闭按钮操作
     */
    closeHandler:Function|string;

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['title','buttons|array'],
                    ['title','buttons'],
                    ['Panel',[]]);
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
        rootDom.addClass('nd-panel');
        
        //处理body
        this.handleBody(rootDom);
        //处理头部
        //header
        let headerDom:nodom.Element = new nodom.Element('div');
        headerDom.addClass('nd-panel-header');
        if(this.title){
            //title
            let titleCt:nodom.Element = new nodom.Element('span');
            titleCt.addClass('nd-panel-title');
            titleCt.assets.set('innerHTML',this.title);
            headerDom.add(titleCt);
        }
        
        let headbarDom:nodom.Element = new nodom.Element('div');
        headbarDom.addClass('nd-panel-header-bar');
        this.headerBtnDom = headbarDom;
        headerDom.add(headbarDom);
        rootDom.children.unshift(headerDom);

        //头部按钮
        for(let btn of this.buttons){
            let a = btn.split('|');
            this.addHeadBtn(a[0],a[1]);
        }
    }

    /**
     * 处理body
     * @param panelDom  panel dom
     * @param oe        原始dom
     */
    private handleBody(panelDom:nodom.Element){
        //panel body
        let bodyDom:nodom.Element = new nodom.Element('div');
        bodyDom.addClass('nd-panel-body');
        
        //toolbar，放在panel body前
        let tbar:nodom.Element;
        //button group，，放在panel body后
        let btnGrp:nodom.Element;
        
        for(let i=0;i<panelDom.children.length;i++){
            let item = panelDom.children[i];
            
            if(item.plugin){
                if(item.plugin.tagName ==='UI-TOOLBAR'){
                    tbar = item;
                }else if(item.plugin.tagName ==='UI-BUTTONGROUP'){
                    btnGrp = item;
                }else{
                    bodyDom.add(item);
                }
            }else{ //普通节点，放入panelbody
                bodyDom.add(item);
            }
        }
        
        panelDom.children = [];
        if(tbar){
            panelDom.add(tbar);
        }
        panelDom.add(bodyDom);
        if(btnGrp){
            panelDom.add(btnGrp);
        }
    }

    /**
     * 添加头部图标
     * @param icon      icon名 
     * @param handler   处理函数
     */
    addHeadBtn(icon:string,handler:string|Function){
        let btn:nodom.Element = new nodom.Element('b');
        btn.addClass('nd-icon-' + icon);
        btn.addClass('nd-canclick');
        this.headerBtnDom.add(btn);
        if(handler){
            btn.addEvent(new nodom.NodomEvent('click',handler));
        }
    }
}

nodom.PluginManager.add('UI-PANEL',UIPanel);