///<reference types='nodomjs'/>
/**
 * loading
 */
class UILoading extends nodom.Plugin{
    tagName:string = 'UI-LOADING';

    /**
     * 显示字段
     */
    dataName:string;
    /**
     * 显示标志
     */
    showFlag:boolean;

    /**
     * canvas
     */
    canvas:HTMLCanvasElement;

    /**
     * 主题
     */
    theme:string;

    /**
     * 移动圆圈半径
     */
    private moveCircle:number;

    /**
     * 显示数，每open一次，+1，每close一次，-1。close时检查是否为0，为0则关闭
     */
    private openCount:number=0;
    /**
     * 开始角
     */
    startAngle:number;

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['startangle|number','movecircle|number'],
                    ['startAngle','moveCircle'],
                    [Math.PI/2,40]);
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

        rootDom.setProp('name','$ui-loading');

        this.dataName = '$ui_loading_' + nodom.Util.genId();
        rootDom.addClass('nd-loading');
        
        rootDom.addDirective(new nodom.Directive('class',"{'nd-loading-hide':'!" + this.dataName + "'}",rootDom));
        //蒙版
        let coverDom:nodom.Element = new nodom.Element('div');
        coverDom.addClass('nd-loading-cover');
        rootDom.add(coverDom);
        let body = new nodom.Element('div');
        body.addClass('nd-loading-body');
        let canvas = new nodom.Element('canvas');
        canvas.setProp('width',100);
        canvas.setProp('height',100);
        body.add(canvas);
        rootDom.add(body);
    }

    /**
     * 打开loading
     */
    public open(){
        const me = this;
        me.openCount++;
        nodom.ModuleFactory.getMain().model.set(this.dataName,true);
        let canvas:any = document.querySelector("[key='" + this.element.children[1].children[0].key + "']");
        let width = canvas.offsetWidth;
        let circleCount = 6;    
        me.showFlag = true;
        
        setTimeout(()=>{
            loop();    
        },500);
        
        function loop(){
            if(!me.showFlag){
                return;
            }
            
            let ctx = canvas.getContext('2d');
            
            let centerx = width/2;
            let centery = width/2;
            let radius1 = 6;
            let radius = me.moveCircle;
            let angle = me.startAngle;
            
            let circleArr = [];
            loop1();
            setTimeout(loop,1500);
            
            function loop1(){
                if(!me.showFlag){
                    return;
                }
                ctx.clearRect(0,0,width,width);
                ctx.fillStyle = 'gold';
            
                if(circleArr.length<circleCount){
                    circleArr.push(true);
                }
                angle+=Math.PI/8;
    
                let overNum = 0;
                
                for(let i=0;i<circleArr.length;i++){
                    let a = angle - i * Math.PI/8;
                    if(a > Math.PI*2 + me.startAngle){
                        overNum++;
                        a = Math.PI*2 + me.startAngle;
                    }
                    let r = radius1 - i;
                    
                    ctx.beginPath();
                    ctx.arc(centerx - radius * Math.cos(a),centery - radius*Math.sin(a),r,0,360);
                    ctx.closePath();    
                    ctx.fill();
                }
                if(overNum < circleCount){
                    setTimeout(loop1,60);
                }
            }
        }
    }

    /**
     * 关闭loading
     */
    public close(){
        if(--this.openCount === 0) {
            nodom.ModuleFactory.getMain().model.set(this.dataName,false);
            this.showFlag = false;
        }
    }
}

nodom.PluginManager.add('UI-LOADING',UILoading);

namespace nodom{
    /**
     * 显示loading
     */
    export function showLoading(){
        let manager:UILoading = <UILoading>nodom.ModuleFactory.getMain().getPlugin('$ui-loading');
        //新建manager
        if(manager){
            manager.open();    
        }
    }

    /**
     * 关闭loading
     */
    export function closeLoading(config:any){
        let module:nodom.Module = nodom.ModuleFactory.getMain();
        if(!module){
            return null;
        }
        let manager:UILoading = <UILoading>module.getPlugin('$ui-loading');
        //新建manager
        if(manager){
            manager.close();    
        }
    }
}