///<reference types='nodomjs'/>

/**
 * panel 插件
 * 配置
 *  listField:  菜单数组数据项名，如rows，各级菜单的必须保持一致
 *  popup:      是否为popup菜单，不设置值
 *  maxLevel:   菜单最大级数，默认三级
 *  width:      菜单宽度(如果为非popup，则第一级不用这个宽度)
 * 
 * 子节点
 *  只能包括一个子节点(带tagname)
 *  icon:       菜单项图标对应数据字段名
 */
class UIMenu extends nodom.Plugin{
    tagName:string = 'UI-MENU';
    /**
     * 数据项字段名
     */
    listField:string;
    /**
     * 激活字段名
     */
    activeName:string;
    /**
     * 菜单宽度（子菜单或popup菜单）
     */
    menuWidth:number;

    /**
     * 菜单项高度
     */
    menuHeight:number = 30;
    /**
     * 子菜单样式名
     */
    menuStyleName:string;
    /**
     * 菜单类型
     */
    popupMenu:boolean;

    /**
     * 方向  0:右 1:左
     */
    direction:number=0;

    /**
     * 位置 top,left,right 默认top，popup时无效
     */
    position:string;
    /**
     * 最大级数
     */
    maxLevel:number;

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['popup|bool','position','listfield','maxlevel|number','menuwidth|number'],
                    ['popupMenu','position','listField','maxLevel','menuWidth'],
                    [null,'top',null,3,150]);
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
        let me = this;
            
        //激活字段名
        this.activeName = '$nui_menu_' + nodom.Util.genId();
        this.menuStyleName = '$nui_menu_' + nodom.Util.genId();
        rootDom.addClass('nd-menu');

        /**
         * popup
         */
        if(this.position === 'left' || this.position === 'right'){
            this.popupMenu = true;
        }
        
        //menu 节点,rootDom 下第一个带tagName的节点
        let menuNode:nodom.Element;
        for(let i=0;i<rootDom.children.length;i++){
            if(rootDom.children[i].tagName){
                menuNode = rootDom.children[i];
                menuNode.addClass('nd-menu-node');
                //如果没有图标，也需要占位
                let b:nodom.Element = new nodom.Element('b');
                menuNode.children.unshift(b);
                //构建class表达式
                if(menuNode.hasProp('icon')){
                    b.setProp('class',['nd-icon-',new nodom.Expression(menuNode.getProp('icon'))],true);
                    menuNode.delProp('icon');
                }
                break;
            }
        }
        //清空孩子节点
        rootDom.children = [];

        let parentCt:nodom.Element = new nodom.Element('div');
        parentCt.addClass('nd-menu-subct');
        if(this.popupMenu){
            if(this.position === 'left' || this.position === 'right'){
                rootDom.addClass('nd-menu-left');
                rootDom.addEvent(new nodom.NodomEvent('mouseleave',
                    (dom,model,module,e)=>{
                        dom.assets.set('style','width:30px');
                    }
                ));

                //mouse enter 事件
                parentCt.addEvent(new nodom.NodomEvent('mouseenter',
                    (dom,model,module,e)=>{
                        dom.assets.set('style','width:' + me.menuWidth + 'px');
                    }
                ));
            }else{
                rootDom.addClass('nd-menu-popup');
                parentCt.addClass('nd-menu-first');
                parentCt.setProp('style', new nodom.Expression(this.menuStyleName),true);
                parentCt.addEvent(new nodom.NodomEvent('mouseleave',
                    (dom,model,module,e)=>{
                        let parent = dom.getParent(module);
                        let pmodel = module.getModel(parent.modelId);
                        pmodel.set(me.activeName,false);
                        //第一级需要还原direction
                        if(dom.hasClass('nd-menu-first')){
                            this.direction = 0;
                        }
                    }
                ));
                //增加显示指令
                parentCt.addDirective(new nodom.Directive('show',this.activeName,parentCt));
            }
        }else{
            parentCt.addClass('nd-menu-first-nopop');
        }
        rootDom.add(parentCt);
        
        //初始化各级
        for(let i=0;i<this.maxLevel;i++){
            parentCt.setProp('level',i+1);
            let itemCt:nodom.Element = new nodom.Element('div');
            itemCt.directives.push(new nodom.Directive('repeat',this.listField,itemCt));
            itemCt.addClass('nd-menu-nodect');
            let item:nodom.Element = menuNode.clone(true);
            itemCt.add(item);
            
            //缓存item级
            itemCt.setProp('level',i+1);
            //子菜单箭头图标
            if(this.popupMenu || i>0){
                let icon1 = new nodom.Element('b');
                icon1.addDirective(new nodom.Directive('class',
                    "{'nd-menu-subicon':'" + this.listField + "&&" + this.listField + ".length>0'}",
                    icon1
                ));
                item.add(icon1);
            }
            //初始化菜单打开关闭
            let openClose = this.initOpenAndClose();
            //绑定展开收起事件
            itemCt.addEvent(openClose[0]);
            itemCt.addEvent(openClose[1]);

            parentCt.add(itemCt);
            
            let subCt:nodom.Element = new nodom.Element('div');
            subCt.addClass('nd-menu-subct');
            subCt.addEvent(new nodom.NodomEvent('mouseleave',
                (dom,model,module,e)=>{
                    let parent = dom.getParent(module);
                    let pmodel = module.getModel(parent.modelId);
                    pmodel.set(me.activeName,false);
                }
            ));
            subCt.setProp('style', new nodom.Expression(this.menuStyleName),true);
            subCt.addDirective(new nodom.Directive('show',this.activeName,subCt));
            itemCt.add(subCt);
            parentCt = subCt;
        }
        rootDom.delProp(['listField','width',,'maxlevels']);
    }
    
    /**
     * 渲染前执行
     * @param module 
     */
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        let me = this;
        super.beforeRender(module,uidom);
        
        //popup menu需要添加右键点击事件
        if(this.needPreRender && this.popupMenu && this.position !== 'left' && this.position !== 'right'){
            UIEventRegister.addEvent('mousedown',module.id,uidom.key,
                (module,dom,inOrOut,e)=>{
                    //非右键不打开
                    if(e.button !== 2){
                        return;
                    }
                    let x = e.clientX;
                    let w = me.menuWidth;
                    let model:nodom.Model = module.getModel(uidom.modelId);
                    let rows = model.query(me.listField);
                    if(rows && rows.length>0){
                        let h:number = rows.length * me.menuHeight;
                        //根据最大级数计算pop方向
                        // if(this.direction === 0){
                        //     if(x + w*this.maxLevel > window.innerWidth-10){
                        //         this.direction = 1;
                        //     }
                        // }
                        let loc = this.cacPos(null,e.clientX,e.clientY,this.menuWidth,h);
                        model.set(me.menuStyleName,'width:' + me.menuWidth + 'px;left:' + loc[0] + 'px;top:' + loc[1] + 'px');
                        model.set(me.activeName,true);
                    }
                }
            );
        }
    }

    /**
     * 初始化菜单打开和关闭
     * @returns     [mouseenter(打开子菜单),mouseleave(关闭自己)]  
     */
    private initOpenAndClose():nodom.NodomEvent[]{
        let me = this;
        //菜单展开
        let openEvent:nodom.NodomEvent = new nodom.NodomEvent('mouseenter', 
            (dom,model,module,e,el:HTMLElement)=>{
                if(model){
                    let rows = model.query(this.listField);
                    if(!rows || rows.length===0){
                        return;
                    }
                    let firstNopop:boolean = dom.tmpData.level === 1 && !me.popupMenu;
                    let h = rows.length * this.menuHeight;
                    let w = this.menuWidth;
                    let x:number,
                        y:number;
                    if(firstNopop){
                        x = e.clientX - e.offsetX;
                        y = e.clientY - e.offsetY + h;
                    }else{
                        x = e.clientX - e.offsetX + w;
                        y = e.clientY - e.offsetY;
                    }
                    let loc = this.cacPos(dom,x,y,w,h,el);
                    model.set(this.menuStyleName,'width:' + me.menuWidth + 'px;left:' + loc[0] + 'px;top:' + loc[1] + 'px');
                    model.set(this.activeName,true);
                }
            }
        );

        //菜单关闭
        let closeEvent:nodom.NodomEvent = new nodom.NodomEvent('mouseleave', 
            (dom,model,module,e,el)=>{
                if(model){
                    let rows = model.query(this.listField);
                    if(rows && rows.length>0){
                        //设置当前model的显示参数
                        model.set(me.activeName,false);
                        //重置direction，popmenu第一级，非popmenu第二级菜单关闭时需要重置direction
                        if(this.direction===1){
                            if(me.popupMenu){
                                if(dom.tmpData['level']===2){
                                    this.direction = 0;
                                }
                            }else if(dom.tmpData['level']===1){
                                this.direction = 0;
                            }
                        }
                    }
                }
            }
        );
        return[openEvent,closeEvent];
    }

    /**
     * 计算实际显示位置
     * @param dom           触发计算的当前菜单项
     * @param x             预定x坐标
     * @param y             预定y坐标
     * @param w             菜单宽度
     * @param h             子菜单高度
     */
     
    private cacPos(dom:nodom.Element,x:number,y:number,w:number,h:number,el?:HTMLElement):number[]{
        //非pop第一级菜单
        let firstNopop:boolean = dom && !this.popupMenu && dom.getProp('level') === 1;
        //超出宽度
        let widthOut:boolean = x + w > window.innerWidth;
        let heightOut:boolean = y + h > window.innerHeight;
        let top:number=dom?0:y;
        let left:number=dom?0:x;
        
        // 第一级非pop的子菜单是否需要左移动
        if(firstNopop){
            top = this.menuHeight;
        }else if(heightOut){
            if(dom){    //popup第一级
                top = -h+this.menuHeight;
            }else{      //二级菜单
                top = window.innerHeight - h;
            }
        }
        
        //计算二级菜单方向（左右）
        if(widthOut){
            this.direction = 1;
        }
        if(this.direction === 1){
            if(firstNopop){ //第一级非pop的子菜单
                if(widthOut){
                    left = el.offsetWidth-w;    
                }
            }else if(dom){ //第二级菜单的子菜单
                left -= w+1;
            }else if(widthOut){  //pop第一级右侧不够放
                left -= w + 3;
            } 
        }else{
            if(dom && !firstNopop){
                left = w;
            }
        }
        return[left,top+1];
    }
}

nodom.PluginManager.add('UI-MENU',UIMenu);