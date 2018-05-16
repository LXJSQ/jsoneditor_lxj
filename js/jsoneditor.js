window.onload = function() {
    JE.begin();
}
JE = {
        data: {},
        treeUI: null,
        number: 0,
        toTree: function() {
            /* JSON is converted to tree HTML, while formatting code */
            var draw = [],
                This = this;

            function notify(name /*节点名*/ , value /*节点值*/ , bool /*是否为最后一项*/ ) {
                if (value && value.constructor == Array) {
                    /* handle array nodes */
                    draw.push('<dl id="' + This.number + '_dl"><dt>', This.draw(name, value), '</dt><dd>');

                    for (var i = 0; i < value.length; i++) {
                        i == value.length - 1 ? notify(i, value[i], true) : notify(i, value[i], false);
                    }
                    var bracket = bool ? "]" : "],"
                    This.number++;
                    draw.push('<span oncopy="return false" contenteditable="false">' + This.number + '<span></dd><dt><em class="bracket">' + bracket + '</em></dt></dl>');
                } else if (value && typeof value == 'object') {
                    /* processing object node */
                    draw.push('<dl id="' + This.number + '_dl"><dt>', This.draw(name, value), ' </dt><dd>');
                    var len = 0,
                        i = 0;
                    for (var key in value) {
                        /* get the total number of object members */
                        len++;
                    }
                    for (var key in value) {
                        i++;
                        i == len ? notify(key, value[key], true) : notify(key, value[key], false);
                    }
                    var bracket = bool ? "}" : "},"
                    This.number++;
                    draw.push('<span oncopy="return false" contenteditable="false">' + This.number + '<span></dd><dt><em class="bracket">' + bracket + '</em></dt></dl>');
                } else {
                    /* processing leaf nodes (drawing file) */
                    draw.push('<dl><dt>', This.draw(name, value, bool), '</dt></dl>');
                };
            };
            if (typeof this.data == 'object') {
                notify("", this.data, true);
            };

            if (this.treeUI) this.treeUI.innerHTML = draw.join(''); /* shown in tree window */
        },
        draw: function(name, value, bool /* is it the last item */ ) {
            if (typeof name == "number") {
                if (value && value.constructor == Array)
                    return this.highlight('</b>', value, "[", bool);
                else
                    return this.highlight("</b>", value, "{", bool);
            } else if (typeof name == "string") {
                if (value && value.constructor == Array)
                    return this.highlight('"' + name + '"</b><code class="bracket"> : </code>', value, "[", bool);
                else
                    return name.length > 0 ?
                        this.highlight('"' + name + '"</b><code class="bracket"> : </code>', value, "{", bool) :
                        this.highlight('', value, "{", bool);
            }
        },
        highlight: function(nameStr, value, bracket, bool /*is it the last item*/ ) {
            this.number++;
            if (typeof value != "string")
                var valueStr = bool ? value : value + ",";
            switch (typeof value) {
                case "boolean":
                    return '<span  onselectstart="return false;" contenteditable="false">' + this.number + '</span><b  class="string">' + nameStr + ' <strong class="boolean">' + valueStr + '</strong>'
                    break;
                case "number":
                    return '<span  onselectstart="return false;" contenteditable="false">' + this.number + '</span><b  class="string">' + nameStr + ' <cite class="number">' + valueStr + '</cite>'
                    break;
                case "string":
                    {
                        if (bool) return '<span  onselectstart="return false;" contenteditable="false">' + this.number + '</span><b  class="string">' + nameStr +
                            '<b class ="string">"' + value + '"</b>';
                        else return '<span  onselectstart="return false;" contenteditable="false">' + this.number + '</span><b  class="string">' + nameStr +
                            '<b class ="string">"' + value + '" ,</b>';
                        break;
                    }
                case "object":
                    return '<span  onselectstart="return false;" contenteditable="false">' + this.number + '</span>\
                    <button onclick="closeObject()" id="' + (this.number - 1) + '_btn">\
                    <i class="triangle_border_down" id="' + (this.number - 1) + '_i" data="' + (this.number - 1) + '_1">\
                    </i></button><b class="string">' + nameStr + '</b><em class ="bracket">' + bracket + '</em>';
            }
        },

    }
    /*Initialize formatted upload download and other events.  */
JE.begin = function(data) {
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
            if (span) {
                for (var i = 0; i < span.length; i++) span[i].style.display = "none";
            }
            var codeText = document.getElementById("tree").innerText;
            if (codeText.length == 0) {
                alert("The content that needs to be saved is empty. Please edit the JSON file you want to download.");
                return;
            }
            try {
                JE.data = JSON.parse(formatStr(codeText));
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
            formatJson();

        }
        selectMethod.onchange = function() {
            formatJson();
        }
        fileIpt.onchange = function() {
            var topInput = document.getElementById("topInput");
            topInput.value = this.value;
        }
    }
    /* check that line is not in json format */
function jsonIntStr(str) {
    try {
        var result = jsonlint.parse(str);
        if (result) return result;
    } catch (e) {
        alert(e);
        return false;
    }
}
/*Select the code to format JSON or tree format JSON.*/
function formatJson() {
    var codeText = document.getElementById("tree").innerText;
    if (codeText.length == 0) {
        alert("The required formatting content is empty, please enter or upload the JSON formatted file!");
        return;
    }
    JE.number = 0;
    var span = document.getElementsByTagName("span");
    if (span) {
        for (let i = 0; i < span.length; i++) span[i].style.display = "none";
    }
    codeText = document.getElementById("tree").innerText;
    try {
        JE.data = JSON.parse(formatStr(codeText));
        if (selectMethod.value == 0) {
            var str = JSON.stringify(JE.data, undefined, 4);
            JE.treeUI.innerHTML = "<pre>" + str + "</pre>";
        } else {
            JE.toTree();
            showObject();
            initClopick();
            for (let i = 0; i < span.length; i++) {
                span[i].style.display = "inline-block";
            }
        }
    } catch (e) {
        jsonIntStr(codeText);
        for (let i = 0; i < span.length; i++) {
            span[i].style.display = "inline-block";
        }
    };
}
/*Changes the open state of an object or array.*/
function closeObject() {
    var dl = document.getElementById(event.target.id.split("_")[0] + "_dl");
    var i = document.getElementById(event.target.id.split("_")[0] + "_i");
    var eData = i.getAttribute("data");
    if (eData.split("_")[1] == "1") {
        var showI = eData.split("_")[0] + "_0";
        showOrClose(dl, i, showI, "[...],{...}", "none", "triangle_border_right");
    } else {
        var closeI = eData.split("_")[0] + "_1";
        showOrClose(dl, i, closeI, "[,{", "block", "triangle_border_down");
    }
}
/* the open state of an object or array is changed by parameters*/
function showOrClose(dl, ele, data, bracket, display, iClass) {
    ele.setAttribute("data", data);
    var firstChild = dl.childNodes[0].childNodes;
    for (let i = 0; i < firstChild.length; i++) {
        if (firstChild[i].nodeName == "EM") {
            firstChild[i].innerText.indexOf("[") > -1 ?
                firstChild[i].innerText = bracket.split(",")[0] :
                firstChild[i].innerText = bracket.split(",")[1];
        }
    }
    dl.childNodes[1].style.display = display;
    dl.childNodes[2].style.display = display;
    ele.setAttribute("class", iClass);
}

/*The default deployable object when formatted.*/
function showObject() {
    var dd = document.getElementsByTagName("dd");
    var dt = document.getElementsByTagName("dt");
    var iEle = document.getElementsByTagName("i");
    var em = document.getElementsByTagName("em");
    for (let i = 0; i < dd.length; i++) {
        dd[i].style.display = "block";
        dt[i].style.display = "block";
    }
    for (let k = 0; k < em.length; k++) {
        if (em[k].innerText.indexOf("[...]") > -1) {
            em[k].innerText = "[";
        } else if (em[k].innerText.indexOf("{...}") > -1) {
            em[k].innerText = "{";
        }
    }
    for (let j = 0; j < iEle.length; j++) {
        iEle[j].setAttribute("data", iEle[j].getAttribute("data").split("_")[0] + "_1");
        iEle[j].setAttribute("class", "triangle_border_down");
    }
}

/* upload the file in JSON format */
function submitJsonFile() {
    JE.number = 0;
    var objFile = document.getElementById("fileId");
    var data = null;
    var files = objFile.files; /*get the list of files.*/
    if (files.length == 0) {
        alert('Please select the JSON format file.');
    } else {

        var reader = new FileReader(); /* create a new FileReader.*/
        reader.readAsText(files[0], "UTF-8"); /* read the file*/
        reader.onload = function(evt) { /* it will come back here after reading the file.*/
            data = evt.target.result; /* read the file contents.*/
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
/* color string to initialize clopick color */
function initClopick() {
    var bEle = document.getElementsByTagName("b");
    for (var i = 0; i < bEle.length; i++) {
        var bEleText = bEle[i].innerHTML;
        bEleText = formatStr(bEleText);
        eText = bEleText.substr(bEleText.length - 1, 1) == ',' ?
            bEleText.substr(1, bEleText.length - 3) :
            bEleText.substr(1, bEleText.length - 2);
        if (CheckIsColor(eText)) {
            var ele = $(bEle[i]);
            ele.colpick({
                layout: "rgbhex",
                submitText: "ok",
                colorScheme: "light",
                onSubmit: function(hsb, hex, rgb, el) {
                    submitColor(hex, rgb, el);
                    $(el).colpickHide();
                }
            });
        }
    }
}
/* confirm the color selected by the colorer */
function submitColor(hex, rgb, el) {
    var val = $(el).html();
    if (val.match(/[rR][gG][Bb]/)) {
        var tempArr = val.split(",");
        var transparence = tempArr[tempArr.length - 2].split(")")[0];
        val.substr(val.length - 1, val.length) == "," ?
            $(el).html("\"rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + transparence + ")\",") :
            $(el).html("\"rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + transparence + ")\"")
    } else {
        val.substr(val.length - 1, val.length) == "," ?
            $(el).html("\"#" + hex + "\",") :
            $(el).html("\"#" + hex + "\"");
    }
}

/*Check if string color values */
function CheckIsColor(colorValue) {
    if (colorValue.match(/^#[0-9a-fA-F]{6}$/) == null) {
        type = "^[rR][gG][Bb]";
        /*color matching RGB and rgba. */
        re = new RegExp(type);
        if (colorValue.match(re) == null) {
            return 0;
        } else {
            return 2; /*return 2 is RGB color */
        }
    } else {
        return 1; /*return 1 is hexadecimal color value */
    }
}
/* go to string Spaces, line breaks and other tabs and comment */
function formatStr(str) {
    var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g;
    str = str.replace(reg, function(word) {
        return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
    });
    return str = str.replace(/\ +/g, '').replace(/[\r\n]/g, '').replace(/\s|\xA0/g, "");
}

$('[contenteditable]').each(function() {
    // 干掉IE http之类地址自动加链接
    try {
        document.execCommand("AutoUrlDetect", false, false);
    } catch (e) {}

    $(this).on('paste', function(e) {
        e.preventDefault();
        var text = null;

        if (window.clipboardData && clipboardData.setData) {
            // IE
            text = window.clipboardData.getData('text');
        } else {
            text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('在这里输入文本');
        }
        if (document.body.createTextRange) {
            if (document.selection) {
                textRange = document.selection.createRange();
            } else if (window.getSelection) {
                sel = window.getSelection();
                var range = sel.getRangeAt(0);

                // 创建临时元素，使得TextRange可以移动到正确的位置
                var tempEl = document.createElement("span");
                tempEl.innerHTML = "&#FEFF;";
                range.deleteContents();
                range.insertNode(tempEl);
                textRange = document.body.createTextRange();
                textRange.moveToElementText(tempEl);
                tempEl.parentNode.removeChild(tempEl);
            }
            textRange.text = text;
            textRange.collapse(false);
            textRange.select();
        } else {
            // Chrome之类浏览器
            document.execCommand("insertText", false, text);
        }
    });
});