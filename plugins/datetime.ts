///<reference types='nodom'/>

/**
 * panel 插件
 */
class UIDatetime extends nodom.DefineElement{
    tagName:string = 'UI-DATETIME';

    year:number;
    month:number;
    date:number;
    hour:number;
    minute:number;
    second:number;

    fieldName:string;
    /**
     * 类型 date time datetime
     */
    type:string;
    /**
     * 当前日期
     */
    currentDate:Date;
    /**
     * 附加数据项名
     */
    extraDataName:string;
    /**
     * modelId
     */
    modelId:number;

    /**
     * 日期选择器modelId
     */
    pickerModelId:number;
    /**初始化标志 */
    initFlag:boolean;

    /**
     * 编译后执行代码
     */
    init(el:HTMLElement):nodom.Element{
        let me = this;
        let rootDom:nodom.Element = new nodom.Element('div');
        nodom.Compiler.handleAttributes(rootDom,el);
        nodom.Compiler.handleChildren(rootDom,el);
        rootDom.addClass('nd-datetime');

        UITool.handleUIParam(rootDom,this,
            ['type'],
            ['type'],
            ['date']);

        let fieldDom:nodom.Element = new nodom.Element('div');
        fieldDom.addClass('nd-datetime-field');
        let dateIco:nodom.Element = new nodom.Element('b');
        dateIco.addClass('nd-datetime-date');
        fieldDom.add(dateIco);
        let input:nodom.Element = new nodom.Element('input');
        let directive:nodom.Directive = rootDom.getDirective('field');
        input.addDirective(directive);
        input.setProp('value',new nodom.Expression(directive.value),true);
        this.fieldName = directive.value;

        fieldDom.add(input);
        
        //点击事件
        fieldDom.addEvent(new nodom.NodomEvent('click',(dom,model,module,e,el)=>{
            let data = model.query(this.extraDataName);
            if(data){
                data.show = true;
            }
            me.setDate(module,model.query(this.fieldName));
            pickerDom.assets.set('style','left:'+el.offsetLeft + 'px;' + 'top:' + (el.offsetHeight+10) + 'px');

            function setLoc(){
                let x = el.offsetLeft;
                let h = el.offsetHeight;
                return [x,h];
            }
        }));

        this.extraDataName = '$ui_datetime_' + nodom.Util.genId();

        let pickerDom:nodom.Element = new nodom.Element('div');
        pickerDom.addClass('nd-datetime-picker');
        pickerDom.addDirective(new nodom.Directive('model',this.extraDataName));
        pickerDom.addDirective(new nodom.Directive('show','show'));
        
        //日期事件输入框
        if(this.type === 'datetime'){
            let inputDom:nodom.Element = new nodom.Element('div');
            inputDom.addClass('nd-datetime-inputct');
            let inputDate:nodom.Element = new nodom.Element('input');
            let inputTime:nodom.Element = new nodom.Element('input');
            inputDom.add(inputDate);
            inputDom.add(inputTime);
            pickerDom.add(inputDom);
        }
        
        //年月
        let ymDom:nodom.Element = new nodom.Element('div');
        ymDom.addClass('nd-datetime-ymct');
        pickerDom.add(ymDom);

        let leftDom1:nodom.Element = new nodom.Element('b');
        leftDom1.addClass('nd-datetime-leftarrow1');
        
        let leftDom:nodom.Element = new nodom.Element('b');
        leftDom.addClass('nd-datetime-leftarrow');
        let rightDom:nodom.Element = new nodom.Element('b');
        rightDom.addClass('nd-datetime-rightarrow');
        let rightDom1:nodom.Element = new nodom.Element('b');
        rightDom1.addClass('nd-datetime-rightarrow1');

        let contentDom:nodom.Element = new nodom.Element('span');
        contentDom.addClass('nd-datetime-ym');
        let txtDom:nodom.Element = new nodom.Element();
        txtDom.expressions = [new nodom.Expression('year'),'/',new nodom.Expression('month')];
        contentDom.add(txtDom);
        
        leftDom1.addEvent(new nodom.NodomEvent('click',(dom,model,module)=>{
            me.changeMonth(module,-12);
        }));

        leftDom.addEvent(new nodom.NodomEvent('click',(dom,model,module)=>{
            me.changeMonth(module,-1);
        }));

        rightDom.addEvent(new nodom.NodomEvent('click',(dom,model,module)=>{
            me.changeMonth(module,1);
        }));

        rightDom1.addEvent(new nodom.NodomEvent('click',(dom,model,module)=>{
            me.changeMonth(module,12);
        }));

        ymDom.children = [leftDom1,leftDom,contentDom,rightDom,rightDom1]

        //周
        let weekDom:nodom.Element = new nodom.Element('div');
        weekDom.addClass('nd-datetime-weekdays');
        let days:string[] = Object.getOwnPropertyNames(NUITipWords.weekday);

        for(let d of days){
            let span:nodom.Element = new nodom.Element('span');
            let txt:nodom.Element = new nodom.Element();
            txt.textContent = NUITipWords.weekday[d];
            span.add(txt);
            weekDom.add(span);
        }

        pickerDom.add(weekDom);

        let dateDom:nodom.Element = new nodom.Element('div');
        dateDom.addClass('nd-datetime-dates');
        let daySpan:nodom.Element = new nodom.Element('span');
        daySpan.addDirective(new nodom.Directive('repeat','days'));
        daySpan.addDirective(new nodom.Directive('class',"{'nd-datetime-today':'today','nd-datetime-disable':'disable','nd-datetime-selected':'selected'}"));
        let txt:nodom.Element = new nodom.Element();
        txt.expressions = [new nodom.Expression('date')];
        daySpan.add(txt);
        
        daySpan.addEvent(new nodom.NodomEvent('click',':delg',(dom,model,module)=>{
            let data = model.data;
            if(data.disable){
                return;
            }
            me.selectDate(module,model);
        }));
        dateDom.add(daySpan);
        pickerDom.add(dateDom);
        //按钮
        let btnCt:nodom.Element = new nodom.Element('div');
        btnCt.addClass('nd-datetime-btnct');
        let btnToday:nodom.Element = new nodom.Element('button');
        btnToday.assets.set('innerHTML',NUITipWords.buttons.today);
        let btnOk:nodom.Element = new nodom.Element('button');
        btnOk.assets.set('innerHTML',NUITipWords.buttons.ok);
        btnCt.add(btnToday);
        btnCt.add(btnOk);
        
        //确定按钮
        btnOk.addEvent(new nodom.NodomEvent('click',(dom,model,module,e)=>{
            e.preventDefault();
            model.set('show',false);
            let pmodel:nodom.Model = module.modelFactory.get(me.modelId);
            pmodel.set(this.fieldName,this.year + '-' + this.month + '-' + this.date);
        }));

        //当天按钮
        btnToday.addEvent(new nodom.NodomEvent('click',(dom,model,module,e)=>{
            e.preventDefault();
            let nda:Date = new Date();
            me.setDate(module,nda.getFullYear() + '-' + (nda.getMonth()+1) + '-' + nda.getDate());
        }));

        pickerDom.add(btnCt);

        rootDom.children = [fieldDom,pickerDom];
        rootDom.defineElement=this;
        return rootDom;
    }

    /**
     * 渲染前置方法
     * @param module 
     * @param uidom 
     */
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        let me = this;
        if(!this.currentDate){
            this.currentDate = new Date();
        }
        this.modelId = uidom.modelId;
        let model:nodom.Model = module.modelFactory.get(uidom.modelId);
        
        if(!this.initFlag){
            this.initFlag = true;
            //设置附加数据项
            model.set(this.extraDataName,{
                show:false,
                year:this.currentDate.getFullYear(),
                month:this.currentDate.getMonth() + 1,
                day:this.currentDate.getDate(),
                days:[]
            });

            this.pickerModelId = model.query(this.extraDataName).$modelId;
            this.genDates(module);

            //增加外部点击隐藏
            UIEventRegister.addEvent('click',module.name,uidom.children[1].key,(module,dom,inOrOut,e)=>{
                if(!inOrOut){
                    model.query(me.extraDataName).show = false;
                }
            });
        
        }else{
            this.pickerModelId = model.query(this.extraDataName).$modelId;
        }
        
    }


    /**
     * 产生日期数组
     * @param module    模块
     * @param year      年
     * @param month     月 
     */
    genDates(module:nodom.Module,year?:number,month?:number){
        if(!year || !month){
            if(!this.currentDate){
                this.currentDate = new Date();
            }
            year = this.currentDate.getFullYear();
            month = this.currentDate.getMonth() + 1;
        }
        //获取当日
        let cda:Date = new Date();
        let cy = cda.getFullYear();
        let cm = cda.getMonth() + 1;
        let cd = cda.getDate();
        
        let days:number = this.cacMonthDays(year,month);
        let dayArr = [];
        let date = new Date(year + '-' + month + '-1');
        //周几
        let wd = date.getDay();
        let lastMonthDays = this.cacMonthDays(year,month,-1);
        //补充1号对应周前几天日期
        for(let d=lastMonthDays,i=0;i<wd;i++,d--){
            dayArr.unshift({
                disable:true,
                selected:false,
                date:d
            });
        }
        //当月日期
        for(let i=1;i<=days;i++){
            dayArr.push({
                date:i,
                selected:this.year===year&&this.month===month&&this.date===i,
                today:cy === year && cm === month && cd === i
            });
        }
        //下月日期
        date = new Date(year + '-' + month + '-' + days);
        //周几
        wd = date.getDay();
        for(let i=wd+1;i<=6;i++){
            dayArr.push({
                disable:true,
                selected:false,
                date:i-wd
            });
        }
        
        let model:nodom.Model = module.modelFactory.get(this.pickerModelId);
        model.set('year',year);
        model.set('month',month);
        model.set('days',dayArr);

        
    }

    
    /**
     * 计算一个月的天数
     * @param year      年
     * @param month     月
     * @param disMonth  相差月数
     */
    cacMonthDays(year:number,month:number,disMonth?:number):number{
        if(disMonth){
            month += disMonth;
        }
        if(month <= 0){
            year--;
            month += 12;
        }else if(month > 12){
            year++;
            month-=12;
        }

        if([1,3,5,7,8,10,12].includes(month)){
            return 31;
        }else if(month !== 2){
            return 30;
        }else if(year%400===0 || year%4===0 && year%100!==0){
            return 29;
        }else{
            return 28;
        }
    }

    /**
     * 修改月份
     * @param module 
     * @param distance 
     */
    changeMonth(module:nodom.Module,distance:number){
        let model = module.modelFactory.get(this.pickerModelId);
        let year = model.query('year');
        let month = model.query('month');
        
        month += distance;
        if(month <= 0){
            year--;
            month += 12;
        }else if(month > 12){
            year++;
            month-=12;
        }
        if(month <= 0){
            year--;
            month += 12;
        }else if(month > 12){
            year++;
            month-=12;
        }

        this.genDates(module,year,month);
    }

    /**
     * 设置日期
     * @param dateStr 
     */
    setDate(module:nodom.Module,dateStr:string){
        if(dateStr){
            let date:Date;
            try{
                date = new Date(dateStr);
                if(date.toTimeString() !== 'Invalid Date'){
                    this.year = date.getFullYear();
                    this.month = date.getMonth() + 1;
                    this.date = date.getDate();    
                    this.genDates(module,this.year,this.month);
                }
            }catch(e){
    
            }
        }
    }
    /**
     * 选中日期
     * @param module 
     * @param model     被点击dom绑定的model
     */
    selectDate(module:nodom.Module,model?:any){
        //把selected的项置false
        let pmodel = module.modelFactory.get(this.pickerModelId);
        if(pmodel){
            let days = pmodel.query('days');
            for(let d of days){
                if(d.selected){
                    d.selected = false;
                    break;
                }
            }
            this.year = pmodel.query('year');
            this.month = pmodel.query('month');
        }
        if(model){
            model.set('selected',true);
            this.date = model.query('date');
        }
    }
}

nodom.DefineElementManager.add('UI-DATETIME',UIDatetime);