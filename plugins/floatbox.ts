///<reference types='nodomjs'/>
/**
 * 悬浮框
 */
class UIFloatBox extends nodom.Plugin{
    tagName:string = 'UI-FLOATBOX';
 
    //绑定数据项
    dataName:string;

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
            rootDom.setProp('name','$ui_floatbox');
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
        this.dataName = '$ui_floatbox' + nodom.Util.genId();
        rootDom.addClass('nd-floatbox');
        new nodom.Directive('show',this.dataName+'.show',rootDom);
        rootDom.setProp('style',['left:',new nodom.Expression(this.dataName + '.left'),
                'px;top:',new nodom.Expression(this.dataName + '.top'),'px;'],true);
        let innerCt:nodom.Element = new nodom.Element('div');
        rootDom.add(innerCt);
    }

    /**
     * 渲染前事件
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        super.beforeRender(module,dom);
        if(this.needPreRender){
            let model = module.model;
            model.set(this.dataName,{
                left:0,
                top:0,
                show:false
            })
        }
    }

    /**
     * 打开floatbox
     * @param evt   事件对象
     */
    public show(evt,loc){
        let module:nodom.Module = nodom.ModuleFactory.getMain();
        if(!module){
            return;
        }
        if(module){
            let model:nodom.Model = module.model;
            model.set(this.dataName,{
                show:true,
                left:0,
                top:0
            })
            if(model){
                model.set(this.dataName,{
                    show:true,
                    left:0,
                    top:0
                });
                this.updateLoc(module,evt,loc);
            }
        }
    }

    /**
     * 计算位置
     * @param evt 
     */
    private updateLoc(module,evt,loc):any{
        let ex = evt.pageX;
        let ey = evt.pageY;
        let eox = evt.offsetX;
        let eoy = evt.offsetY;
        let ow = evt.target.offsetWidth;
        let oh = evt.target.offsetHeight;
        let x = ex - eox - 3;
        let y = ey - eoy + oh - 15;
        let el = module.getNode(this.element.key);

        if(!el){
            setTimeout(()=>{
                this.updateLoc(module,evt,loc)
            },0);
            return;
        }
        let width = el.offsetWidth;
        let height = el.offsetHeight;
        if(x + width > window.innerWidth){
            x = window.innerWidth - width;
        }
        if(y + height > window.innerHeight){
            if(y - height - oh > 0 ){
                y -= height+oh;
            }
        }
        module.model.set(this.dataName + '.left',x);
        module.model.set(this.dataName + '.top',y);
    }
}

namespace nodom{
    /**
     * 显示floatbox
     * @param dom   待加入的子节点
     * @param evt   事件对象
     * @param loc   位置 0:上下(下面放不下，则放上面)  1:左右(右侧放不下则放左边)
     */
    export function floatbox(dom:nodom.Element,evt:Event,loc?:number){
        let module:nodom.Module = nodom.ModuleFactory.getMain();
        if(!module){
            return null;
        }
        let floatBox:UIFloatBox = <UIFloatBox>module.getPlugin('$ui_floatbox');
        
        //把传递的dom加入到源虚拟dom树
        let vDom = module.getElement(floatBox.element.key,true);
        vDom.children[0].children = [dom];
        //新建manager
        if(floatBox){
            floatBox.show(evt,loc);
        }
    }
}
//添加到元素库
nodom.PluginManager.add('UI-FLOATBOX',UIFloatBox);