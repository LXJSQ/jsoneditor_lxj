window.onload = function() {
        JE.begin();
    }
    /*获取页面json格式区域字符串内容，并去标签，去空格，去换行符*/
    /*找出JSON格式错误出现在哪行*/
function jsonIntStr(str) {
    // var treeText = document.getElementById("tree").innerText;
    // if (/^\s*$/.test(treeText)) {
    //     alert('所需格式化内容为空，请输入或上传JSON格式的文件!');
    //     return false;
    // }
    // else
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
    var codeText = document.getElementById("tree").innerText;
    if (codeText.length == 0) {
        alert("所需格式化内容为空，请输入或上传JSON格式的文件!");
        return;
    }
    if (selectMethod.value == 0) {
        var str = JSON.stringify(JE.data, undefined, 4);
        JE.treeUI.innerHTML = "<pre>" + str + "</pre>";
    } else {
        try {
            JE.data = JSON.parse(formatStr(codeText));
            JE.toTree();
        } catch (e) {
            jsonIntStr(codeText);
        };
    }

}
/*改变对象或者数组的展开闭合状态 */
function closeObject() {
    var dl = document.getElementById(event.target.id.split("_")[0] + "_dl");
    var i = document.getElementById(event.target.id.split("_")[0] + "_i")
    var eData = i.getAttribute("data")
    if (eData.split("_")[1] == "1") {
        i.setAttribute("data", eData.split("_")[0] + "_0");
        var firstChild = dl.childNodes[0].childNodes;
        for (let i = 0; i < firstChild.length; i++) {
            if (firstChild[i].nodeName == "EM") {
                firstChild[i].innerText.indexOf("[") > -1 ? firstChild[i].innerText = "[...]" : firstChild[i].innerText = "{...}"
            }
        }
        dl.childNodes[1].style.display = "none";
        dl.childNodes[2].style.display = "none";
        i.setAttribute("class", "triangle_border_right");
    } else {
        i.setAttribute("data", eData.split("_")[0] + "_1");
        var firstChild = dl.childNodes[0].childNodes;
        for (let i = 0; i < firstChild.length; i++) {
            if (firstChild[i].nodeName == "EM") {
                firstChild[i].innerText.indexOf("[") > -1 ? firstChild[i].innerText = "[" : firstChild[i].innerText = "{"
            }
        }
        dl.childNodes[1].style.display = "block";
        dl.childNodes[2].style.display = "block";
        i.setAttribute("class", "triangle_border_down");
    }
}
/*上传JSON格式的文件*/
function submitJsonFile() { //提交
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
            } catch (e) {
                jsonIntStr(data);
            };

        }
        selectMethod.value = "1";
    }
    initClopick();
}
/*给颜色字符串初始化clopick取色器*/
function initClopick() {
    var bEle = document.getElementsByTagName("b");
    for (var i = 0; i < bEle.length; i++) {
        var bEleText = bEle[i].innerHTML;
        bEleText = formatStr(bEleText);
        if (bEleText) {
            bEleText = bEleText.indexOf(",") > -1 ? bEleText.split(",")[0] : bEleText;
            bEleText = bEleText.substr(1, bEleText.length - 2);
        } else {
            continue;
        }
        if (CheckIsColor(bEleText)) {
            var ele = $(bEle[i]);
            ele.colpick({
                layout: "rgbhex",
                submitText: "",
                onBeforeShow: function(color1, color2) {
                    console.log(color1, color2);
                },
                onChange: function(col1, col2) {
                    ele.html('"#' + col2 + '"');
                },
                colorScheme: "light"
            });
        }
    }
}
/*校验字符串是不是颜色值*/
function CheckIsColor(colorValue) {
    if (colorValue.match(/^#[0-9a-fA-F]{6}$/) == null) {
        type = "^[rR][gG][Bb][]([s]∗(2[0−4][0−9]|25[0−5]|[01]?[0−9][0−9]?)[s]∗,)2[s]∗(2[0−4]d|25[0−5]|[01]?dd?)[s]∗[]{1}$";
        re = new RegExp(type);
        if (colorValue.match(re) == null) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
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
                <i class="triangle_border_down" id="' + (this.number - 1) + '_i" data="' + (this.number - 1) + '_1"></i></button>\
                <b class="string">' + nameStr + '</b><em class ="bracket">' + bracket + '</em>';
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
        JE.number = 0;
        var span = document.getElementsByTagName("span");
        for (var i = 0; i < span.length; i++) {
            span[i].style.display = "none";
        }
        formatJson();
        for (var i = 0; i < span.length; i++) {
            span[i].style.display = "inline-block";
        }
        initClopick();
    }
    selectMethod.onchange = function() {
        formatJson();
    }
}