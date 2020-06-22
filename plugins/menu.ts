///<reference types='nodom'/>

/**
 * panel 插件
 */
class UIMenu implements nodom.IDefineElement{
    tagName:string = 'UI-MENU';
    /**
     * 数据项字段名
     */
    dataName:string;
    /**
     * 激活字段名
     */
    activeName:string;
    /**
     * 菜单宽度（子菜单或popup菜单）
     */
    menuWidth:number;
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
     * 最大级数
     */
    maxLevels:number;
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let me = this;
        let menuDom:nodom.Element = new nodom.Element();
        //增加暂存数据
        nodom.Compiler.handleAttributes(menuDom,el);
        nodom.Compiler.handleChildren(menuDom,el);
        menuDom.tagName = ('div');
        this.popupMenu = menuDom.hasProp('pop');
        //数据字段名
        this.dataName = menuDom.getProp('dataname');
        //显示字段名，数组[显示字段，图标]
        let showName:string[];
        //激活字段名
        this.activeName = '$nui_menu_' + nodom.Util.genId();
        this.menuStyleName = '$nui_menu_' + nodom.Util.genId();
        //最大级数，默认3
        this.maxLevels = menuDom.hasProp('maxlevels')?parseInt(menuDom.getProp('maxlevels')):3;
        //宽度
        if(!menuDom.hasProp('width')){
            throw "menu插件缺少width参数";
        }
        this.menuWidth = parseInt(menuDom.getProp('width')) || 150;
        
        menuDom.addClass('nd-menu');
        if(this.popupMenu){
            menuDom.addClass('nd-menu-popup');
        }

        //菜单展开
        let openEvent:nodom.NodomEvent = new nodom.NodomEvent('mouseenter', 
            (dom,model,module,e,el:HTMLElement)=>{
                if(model){
                    let rows = model.query(this.dataName);
                    if(!rows || rows.length===0){
                        return;
                    }
                    let parent:nodom.Element = dom.getParent(module);
                    let top:number;
                    let left:number;
                    let w = this.menuWidth;
                    let h = rows.length * 30;
                    let firstNopop:boolean = parent.hasClass('nd-menu-first-nopop');
                    if(firstNopop){
                        left=0;
                        top=30;
                    }else{
                        top = 0;
                        left = w;    
                    }
                    
                    let cx = e.clientX;
                    let cy = e.clientY;
                    let x = e.offsetX;
                    let y = e.offsetY;

                    if(this.direction === 0){
                        if(cx + w - x + w > window.innerWidth){
                            this.direction = 1;
                        }
                    }
                    if(this.direction === 1 && !firstNopop){
                        left = -w;
                    }
                    

                    if(cy + h - y + h > window.innerHeight){
                        top = -h+30;
                    }
                    

                    model.set(this.menuStyleName,'width:' + me.menuWidth + 'px;left:' + left + 'px;top:' + top + 'px');
                    model.set(this.activeName,true);
                }
            }
        );

        //菜单关闭
        let closeEvent:nodom.NodomEvent = new nodom.NodomEvent('mouseleave', 
            (dom,model,module,e,el)=>{
                if(model){
                    let rows = model.query(this.dataName);
                    if(rows && rows.length>0){
                        //设置当前model的显示参数
                        model.set(me.activeName,false);
                    }
                }
            }
        );
        
        //menu 节点,menuDom 下第一个带tagName的节点
        let menuNode:nodom.Element;
        for(let i=0;i<menuDom.children.length;i++){
            if(menuDom.children[i].tagName){
                menuNode = menuDom.children[i];
                menuNode.addClass('nd-menu-node');
                break;
            }
        }

        menuDom.children = [];
        let parentCt:nodom.Element = new nodom.Element('div');
        parentCt.addClass('nd-menu-subct');
        if(this.popupMenu){
            parentCt.addClass('nd-menu-first');
            parentCt.setProp('style', new nodom.Expression(this.menuStyleName),true);
        }else{
            parentCt.addClass('nd-menu-first-nopop');
        }
        menuDom.add(parentCt);
        //popup 菜单，需要非激活状态下隐藏
        if(this.popupMenu){
            parentCt.addEvent(new nodom.NodomEvent('mouseleave',
                (dom,model,module,e)=>{
                    let parent = dom.getParent(module);
                    let pmodel = module.modelFactory.get(parent.modelId);
                    pmodel.set(me.activeName,false);
                    //第一级需要还原direction
                    console.log(dom.getProp('class'));
                    if(dom.hasClass('nd-menu-first')){
                        this.direction = 0;
                    }
                }
            ));
        }
        //增加显示指令
        if(this.popupMenu){
            parentCt.addDirective(new nodom.Directive('show',this.activeName,parentCt));
        }
        
        for(let i=0;i<this.maxLevels;i++){
            let itemCt:nodom.Element = new nodom.Element('div');
            itemCt.directives.push(new nodom.Directive('repeat',this.dataName,itemCt));
            itemCt.addClass('nd-menu-nodect');
            let item:nodom.Element = menuNode.clone();
            itemCt.add(item);
            
            //子菜单箭头图标
            if(this.popupMenu || i>0){
                let icon1 = new nodom.Element('b');
                icon1.addDirective(new nodom.Directive('class',
                    "{'nd-menu-subicon':'" + this.dataName + "&&" + this.dataName + ".length>0'}",
                    icon1
                ));
                item.add(icon1);
            }
            
            //绑定展开收起事件
            itemCt.addEvent(openEvent);
            itemCt.addEvent(closeEvent);

            parentCt.add(itemCt);
            
            let subCt:nodom.Element = new nodom.Element('div');
            subCt.addClass('nd-menu-subct');
            subCt.addEvent(new nodom.NodomEvent('mouseleave',
                (dom,model,module,e)=>{
                    let parent = dom.getParent(module);
                    let pmodel = module.modelFactory.get(parent.modelId);
                    pmodel.set(me.activeName,false);
                }
            ));
            subCt.setProp('style', new nodom.Expression(this.menuStyleName),true);
            subCt.addDirective(new nodom.Directive('show',this.activeName,parentCt));
            itemCt.add(subCt);
            parentCt = subCt;
        }
        menuDom.delProp(['dataname','width',,'maxlevels']);
            
        menuDom.defineElement=this;
        return menuDom;
    }
    
    /**
     * 渲染前执行
     * @param module 
     */
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        let me = this;
        
        if(this.popupMenu){
            UIEventRegister.addEvent('mousedown',module.name,uidom.key,
                (module,dom,inOrOut,e)=>{
                    //非右键不打开
                    if(e.button !== 2){
                        return;
                    }
                    let x = e.clientX;
                    let y = e.clientY;
                    let w = me.menuWidth;
                    let model:nodom.Model = module.modelFactory.get(uidom.modelId);
                    let rows = model.query(me.dataName);
                    if(rows && rows.length>0){
                        let h:number = rows * 30;
                        //根据最大级数计算pop方向
                        if(this.direction === 0){
                            if(x + w*this.maxLevels > window.innerWidth-10){
                                this.direction = 1;
                            }
                        }
                        if(this.direction === 1){
                            x -= w+2;
                        }else{
                            x += 2;
                        }
                        
                        if(y+h>window.innerHeight - 10){
                            y = window.innerHeight -h  - 10;
                        }
                    }
                    model.set(me.menuStyleName,'width:' + me.menuWidth + 'px;left:' + x + 'px;top:' + y + 'px');
                    model.set(me.activeName,true);
                }
            );
        }
    }

    /**
     * 计算位置
     * @param dom 
     * @param model 
     */
    cacPos(x:number,y:number,w:number,h:number):number[]{
        return [0,0];
        // if(x + w > window.innerWidth-10){

        // }

        // return [left,top];
    }
}

nodom.DefineElementManager.add('UI-MENU',UIMenu);