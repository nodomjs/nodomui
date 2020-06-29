///<reference types='nodom'/>

import { spawn } from "child_process";

/**
 * 分页插件
 */
class UIPagination extends nodom.DefineElement{
    tagName:string = 'UI-PAGINATION';
    /**
     * 绑定字段名
     */
    fieldName:string;
    /**
     * 总条数字段名
     */
    totalName:string;
    /**
     * 页面大小
     */
    pageSize:number;
    /**
     * 是否显示total
     */
    showTotal:boolean;
    /**
     * 是否显示第几页
     */
    showGo:boolean;

    /**
     * 页面数名(model自动生成)
     */
    pageCountName:string;
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement):nodom.Element{
        let rootDom:nodom.Element = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom,el);
        nodom.Compiler.handleChildren(rootDom,el);
        rootDom.tagName = 'div';

        UITool.handleUIParam(rootDom,this,
            ['field','totalname','pagesize|number','showtotal|bool','showgo|bool'],
            ['fieldName','totalName','pageSize','showTotal','showGo'],
            [null,null,10,null,null]);
        
        rootDom.addClass('nd-pagination');
        rootDom.children = [];
        this.pageCountName = '$ui-pagination_' + nodom.Util.genId();
        //显示共x条
        if(this.showTotal){
            let totalDom:nodom.Element = new nodom.Element('div');
            totalDom.addClass('nd-pagination-total');
            let txt:nodom.Element = new nodom.Element();
            txt.expressions = [TipWords.total,new nodom.Expression(this.totalName),TipWords.record];
            totalDom.add(txt);
            rootDom.add(totalDom);
        } 
        //分页内容
        let pageCt:nodom.Element = new nodom.Element('div');
        pageCt.addClass('nd-pagination-pagect');
        //左双箭头
        let left1:nodom.Element = new nodom.Element('b');
        left1.addClass('nd-pagination-leftarrow1');
        pageCt.add(left1);
        //左箭头
        let left:nodom.Element = new nodom.Element('b');
        left.addClass('nd-pagination-leftarrow');
        pageCt.add(left);
        //页面数字
        let page:nodom.Element = new nodom.Element('span');
        page.addClass('nd-pagination-page');
        page.addDirective(new nodom.Directive('repeat',this.pageCountName,page));
        let txt:nodom.Element = new nodom.Element();
        txt.expressions = [new nodom.Expression('no')];
        page.add(txt);
        pageCt.add(page);
        //右箭头
        let right:nodom.Element = new nodom.Element('b');
        right.addClass('nd-pagination-rightarrow');
        pageCt.add(right);
        //右双箭头
        let right1:nodom.Element = new nodom.Element('b');
        right1.addClass('nd-pagination-rightarrow1');
        pageCt.add(right1);

        rootDom.add(pageCt);
        //显示第x页
        if(this.showGo){
            let goDom:nodom.Element = new nodom.Element('div');
            goDom.addClass('nd-pagination-go');
            let txt:nodom.Element = new nodom.Element();
            txt.textContent = TipWords.NO;
            goDom.add(txt);
            let input:nodom.Element = new nodom.Element('input');
            goDom.add(input);
            txt = new nodom.Element();
            txt.textContent = TipWords.page;
            goDom.add(txt);
            rootDom.add(goDom);
        }
        
        rootDom.defineElement = this;
        return rootDom;
    }

    /**
     * 渲染前置方法
     * @param module 
     * @param uidom 
     */
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        
        let model = module.modelFactory.get(uidom.modelId);
        let data = model.query(this.fieldName);
        if(data){
            if(data[this.totalName]){
                let total = data[this.totalName];
                if(total > 0){
                    let pageSize = this.pageSize;
                    let count = Math.ceil(total/pageSize);
                    let a = [];
                    for(let i=1;i<=count;i++){
                        a.push({no:i});
                    }
                    console.log(a);
                    model.set(this.pageCountName,a);
                }
                
            }
        }
    }
}

nodom.DefineElementManager.add('UI-PAGINATION',UIPagination);