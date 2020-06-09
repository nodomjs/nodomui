///<reference types='nodom'/>

/**
 * panel 插件
 */
class UILayout implements nodom.IDefineElement{
    tagName:string = 'UI-LAYOUT';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let oe:nodom.Element = new nodom.Element();
        oe.tagName = 'DIV';
        nodom.Compiler.handleAttributes(oe,el);
        nodom.Compiler.handleChildren(oe,el);
        oe.addClass('nd-layout');

        //增加middle 容器
        let middleCt:nodom.Element = new nodom.Element();
        middleCt.addClass('nd-layout-middle');
        middleCt.tagName = 'DIV';
        let items = {};
        //位置
        let locs = ['north','west','center','east','south'];
        for(let i=0;i<oe.children.length;i++){
            let item:nodom.Element = oe.children[i];
            if(!item.tagName){
                continue;
            }
            for(let l of locs){
                if(item.props.hasOwnProperty(l)){
                    item.addClass('nd-layout-' + l);
                    items[l] = item;
                    break;
                }
            }
        }
        oe.children = [];
        if(items['north']){
            oe.children.push(items['north']);
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

        oe.children.push(middleCt);

        if(items['south']){
            oe.children.push(items['south']);
        }
        
        oe.defineType='UI-LAYOUT';
        return oe;
    }
}

nodom.DefineElementManager.add(new UILayout());