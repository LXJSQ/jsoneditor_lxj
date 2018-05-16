window.onload = function() {
        JE.begin();
    }
function jsonIntStr(str) {
    try {
        var result = jsonlint.parse(str);
        if (result) return result;

    } catch (e) {
        alert(e);
        return false;
    }
}
/*去掉字符串制表符以及注释*/
function checkJsonStr(str) {
    if (!str.length > 0) {
        alert("请选择要上传的JSON文件");
        return true;
    } else {
        /*Remove annotation 去除注释后的文本*/
        try {
            var result = jsonlint.parse(str);
            if (result) return result;

        } catch (e) {
            alert(e);
            return false;
        }
    }
}

/*选择代码格式化JSON或树形格式化JSON*/
function formatJson() {
    if (selectMethod.value == 0) {
        var str = JSON.stringify(JE.data, undefined, 4);
        JE.treeUI.innerHTML = "<pre>" + str + "</pre>";
    } else {
        try {
            JE.data = JSON.parse(formatStr(codeText));
            JE.toTree();
            initClopick();
        } catch (e) {
            jsonIntStr(codeText);
        };
    }

}
/*改变对象或者数组的展开闭合状态 */
function closeObject() {
    var dl = document.getElementById(event.target.id.split("_")[0] + "_dl");
    var i = document.getElementById(event.target.id.split("_")[0] + "_i");
    var eData = i.getAttribute("data");
    if (eData.split("_")[1] == "1") {
        var showI=eData.split("_")[0]+"_0";
        showOrClose(dl,i,showI,"[...],{...}","none","triangle_border_right");
    } else {
        var closeI=eData.split("_")[0]+"_1";
        showOrClose(dl,i,closeI,"[,{","block","triangle_border_down");
    }
}

function showOrClose(dl,ele,data,bracket,display,iClass){
    ele.setAttribute("data",data);
    var firstChild = dl.childNodes[0].childNodes;
    for (let i = 0; i < firstChild.length; i++) {
        if (firstChild[i].nodeName == "EM") {
            firstChild[i].innerText.indexOf("[") > -1 
            ? firstChild[i].innerText = bracket.split(",")[0] 
            : firstChild[i].innerText =bracket.split(",")[1];
        }
    }
    dl.childNodes[1].style.display = display;
    dl.childNodes[2].style.display = display;
    ele.setAttribute("class", iClass);
}

/*格式化时默认展开对象 */
function showObject(){
    var dd=document.getElementsByTagName("dd");
    var dt=document.getElementsByTagName("dt");
    var iEle = document.getElementsByTagName("i");
    var em=document.getElementsByTagName("em");
    for(let i=0;i<dd.length;i++){
        dd[i].style.display="block";
        dt[i].style.display="block";
    }
    for(let k=0;k<em.length;k++){
        if(em[k].innerText.indexOf("[...]") > -1) {
            em[k].innerText = "[";
        }
        else if(em[k].innerText.indexOf("{...}") > -1)
        {
            em[k].innerText = "{";
        }
    }
    for(let j=0;j<iEle.length;j++){
        iEle[j].setAttribute("data",iEle[j].getAttribute("data").split("_")[0]+"_1");
        iEle[j].setAttribute("class","triangle_border_down");
    }
}


/*上传JSON格式的文件*/
function submitJsonFile() { //提交
    JE.number = 0;
    var objFile = document.getElementById("fileId");
    var data = null;
    var files = objFile.files; //获取到文件列表
    if (files.length == 0) {
        alert('请选择文件');
    } else {
        var reader = new FileReader(); //新建一个FileReader
        reader.readAsText(files[0], "UTF-8"); //读取文件 
        reader.onload = function(evt) { //读取完文件之后会回来这里
            data = evt.target.result; // 读取文件内容
            try {
                JE.data = JSON.parse(formatStr(data));
                JE.toTree();
                initClopick();
            } catch (e) {
                var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g;
                data = data.replace(reg, function(word) {
                    return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
                });
                jsonIntStr(data);
            };

        }
        selectMethod.value = "1";
    }
}
/*给颜色字符串初始化clopick取色器*/
function initClopick() {
    var bEle = document.getElementsByTagName("b");
    for (var i = 0; i < bEle.length; i++) {
        var bEleText = bEle[i].innerHTML;
        bEleText = formatStr(bEleText);
        eText = bEleText.substr(bEleText.length-1,1)==','?bEleText.substr(1, bEleText.length - 3):bEleText.substr(1, bEleText.length - 2);
        if (CheckIsColor(eText)) {
            var ele = $(bEle[i]);
            ele.colpick({
                layout: "rgbhex",
                submitText: "ok",
                colorScheme: "light",
                onSubmit:function(hsb,hex,rgb,el) {
                    submitColor(hex,rgb,el);
                    $(el).colpickHide();
                }
            });
        }
    }
}
/*确认取色器所选颜色*/
function submitColor(hex,rgb,el){
    var val=$(el).html();
    if(val.match(/[rR][gG][Bb]/))
    {
        var tempArr=val.split(",");
        var transparence=tempArr[tempArr.length-2].split(")")[0];
        val.substr(val.length-1,val.length)==","
        ?$(el).html("\"rgba("+rgb.r+","+rgb.g+","+rgb.b+","+transparence+")\",")
        :$(el).html("\"rgba("+rgb.r+","+rgb.g+","+rgb.b+","+transparence+")\"")
    }
    else{
        val.substr(val.length-1,val.length)==","
        ? $(el).html("\"#"+hex+"\",")
        : $(el).html("\"#"+hex+"\"");
    }
}

/*校验字符串是不是颜色值*/
function CheckIsColor(colorValue) {
    if (colorValue.match(/^#[0-9a-fA-F]{6}$/) == null) {
        type="^[rR][gG][Bb]";
        //匹配rgb和rgba的颜色
        re = new RegExp(type);
        if (colorValue.match(re) == null) {
            return 0;
        } else {
            return 2;/*rgb颜色*/
        }
    } else {
        return 1;/*十六进制颜色值*/
    }
}
/*去字符串空格，换行符等制表符以及注释*/
function formatStr(str) {
    var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g;
    str = str.replace(reg, function(word) {
        return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
    });
    return str = str.replace(/\ +/g, '').replace(/[\r\n]/g, '').replace(/\s|\xA0/g, "");
}
JE = {
    data: {},
    treeUI: null,
    number: 0,
    /* 格式化中(禁止重构树) */
    toTree: function() {
        /* JSON转换为树HTML,同时格式化代码 */
        var draw = [],
            This = this;
        JE.firstUp = false; /*完成首次自动构造*/
        function notify(name /*节点名*/ , value /*节点值*/ , bool /*是否为最后一项*/ ) {

            if (value && value.constructor == Array) {
                /* 处理数组节点 */
                draw.push('<dl id="' + This.number + '_dl"><dt>', This.draw(name, value), '</dt><dd>');

                for (var i = 0; i < value.length; i++) {
                    i == value.length - 1 ? notify(i, value[i], true) : notify(i, value[i], false);
                }
                var bracket = bool ? "]" : "],"
                This.number++;
                draw.push('<span>' + This.number + '<span></dd><dt><em class="bracket">' + bracket + '</em></dt></dl>');
            } else if (value && typeof value == 'object') {
                /* 处理对象节点 */
                draw.push('<dl id="' + This.number + '_dl"><dt>', This.draw(name, value), ' </dt><dd>');
                var len = 0,
                    i = 0;
                for (var key in value) {
                    /* 获取对象成员总数 */
                    len++;
                }
                for (var key in value) {
                    i++;
                    i == len ? notify(key, value[key], true) : notify(key, value[key], false);
                }
                var bracket = bool ? "}" : "},"
                This.number++;
                draw.push('<span>' + This.number + '<span></dd><dt><em class="bracket">' + bracket + '</em></dt></dl>');
            } else {
                /* 处理叶节点(绘制文件) */
                draw.push('<dl><dt>', This.draw(name, value, bool), '</dt></dl>');
            };
        };
        /* 不是[]或者{}不绘制 */

        if (typeof this.data == 'object') {
            notify("", this.data, true);
        };

        if (this.treeUI) this.treeUI.innerHTML = draw.join(''); /* 显示在树窗口 */
    },
    draw: function(name, value, bool /*是否为最后一项*/ ) {
        if (typeof name == "number") {
            if (value && value.constructor == Array) return this.highlight('</b>', value, "[", bool);
            else return this.highlight("</b>", value, "{", bool);
        } else if (typeof name == "string") {
            if (value && value.constructor == Array) return this.highlight('"' + name + '"</b><code class="bracket"> : </code>', value, "[", bool);
            else return name.length > 0 ?
                this.highlight('"' + name + '"</b><code class="bracket"> : </code>', value, "{", bool) :
                this.highlight('', value, "{", bool);
        }
    },
    highlight: function(nameStr, value, bracket, bool /*是否为最后一项*/ ) {
        this.number++;
        if (typeof value != "string")
            var valueStr = bool ? value : value + ",";
        switch (typeof value) {
            case "boolean":
                return '<span>' + this.number + '</span><b  class="string">' + nameStr + ' <strong class="boolean">' + valueStr + '</strong>'
                break;
            case "number":
                return '<span>' + this.number + '</span><b  class="string">' + nameStr + ' <cite class="number">' + valueStr + '</cite>'
                break;
            case "string":
                {
                    if (bool) return '<span>' + this.number + '</span><b  class="string">' + nameStr +
                        '<b class ="string">"' + value + '"</b>';
                    else return '<span>' + this.number + '</span><b  class="string">' + nameStr +
                        '<b class ="string">"' + value + '" ,</b>';
                    break;
                }
            case "object":
                return '<span>' + this.number + '</span>\
                <button onclick="closeObject()" id="' + (this.number - 1) + '_btn">\
                <i class="triangle_border_down" id="' + (this.number - 1) + '_i" data="' + (this.number - 1) + '_1">\
                </i></button><b class="string">' + nameStr + '</b><em class ="bracket">' + bracket + '</em>';
        }
    },

}
JE.begin = function(data) { /* 设置UI控件关联响应 */
    var $ = function(id) {
        return document.getElementById(id)
    };
    JE.treeUI = $("tree");
    var saveJson = $("save_as");
    var selectMethod = $("selectMethod");
    var clearTree = $("clear_txt");
    var formatTree = $("formatTree");
    var fileIpt = $("fileId");

    saveJson.onclick = function() {
        var span = document.getElementsByTagName("span");
        for (var i = 0; i < span.length; i++) {
            span[i].style.display = "none";
        }
        var codeText = document.getElementById("tree").innerText;
        if (codeText.length == 0) {
            alert("需要保存的内容为空，请编辑需要下载的JSON文件");
            return;
        }
        try {
            JSON.parse(formatStr(codeText));
        } catch (e) {
            jsonIntStr(codeText);
            return;
        };
        var datastr = "data:json;charset=utf-8," + encodeURIComponent(JSON.stringify(JE.data, undefined, 4));
        var downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", datastr);
        downloadAnchorNode.setAttribute("download", 'new.json')
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
    clearTree.onclick = function() {
        JE.treeUI.innerHTML = "";
    }
    formatTree.onclick = function() {
        var codeText = document.getElementById("tree").innerText;
        if (codeText.length == 0) {
            alert("所需格式化内容为空，请输入或上传JSON格式的文件!");
            return;
        }
        JE.number = 0;
        showObject();
        var span = document.getElementsByTagName("span");
        for (let i = 0; i < span.length; i++) {
            span[i].style.display = "none";
        }
        formatJson();
        for (let i = 0; i < span.length; i++) {
            span[i].style.display = "inline-block";
        }
    }
    selectMethod.onchange = function() {
        var codeText = document.getElementById("tree").innerText;
        if (codeText.length == 0) {
            alert("所需格式化内容为空，请输入或上传JSON格式的文件!");
            return;
        }
        JE.number = 0;
        showObject();
        formatJson();
    }
    fileIpt.onchange = function() {
        var topInput = document.getElementById("topInput");
        topInput.value = this.value;
    }
}