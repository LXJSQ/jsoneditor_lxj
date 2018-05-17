window.onload = function() {
    JE.begin();
}
JE = {
        data: {},
        namePrompt: [],
        valuePrompt: [],
        treeUI: null,
        number: 0,
        editEle: "",
        /*正在编辑的元素 */
        promptbox: "",
        /*是否选则提示框里的内容*/
        selectPromptbox: false,
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
                    draw.push('<span oncopy="return false" contenteditable="false">' + This.number +
                        '<span></dd><dt><em class="bracket">' + bracket + '</em></dt></dl>');
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
                    draw.push('<span oncopy="return false" contenteditable="false">' + This.number +
                        '<span></dd><dt><em class="bracket">' + bracket + '</em></dt></dl>');
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
                if (value && value.constructor == Array) {
                    let nameStr = '"' + name + '"</b><code class="bracket"> : </code>';
                    return this.highlight(nameStr, value, "[", bool);
                } else {
                    let nameStr = '"' + name + '"</b><code class="bracket"> : </code>'
                    return name.length > 0 ?
                        this.highlight(nameStr, value, "{", bool) :
                        this.highlight('', value, "{", bool);
                }

            }
        },
        /*Highlight different data types.*/
        highlight: function(nameStr, value, bracket, bool /*is it the last item*/ ) {
            this.number++;
            if (typeof value != "string")
                var valueStr = bool ? value : value + "<em class='bracket'>,</em>";
            switch (typeof value) {
                case "boolean":
                    return '<span  onselectstart="return false;" contenteditable="false">' + this.number + '</span>\
                    <b  class="key">' + nameStr + ' <strong class="boolean">' + valueStr + '</strong>'
                    break;
                case "number":
                    return '<span  onselectstart="return false;" contenteditable="false">' + this.number + '</span>\
                    <b  class="key">' + nameStr + ' <cite class="number">' + valueStr + '</cite>'
                    break;
                case "string":
                    {
                        if (bool) return '<span  onselectstart="return false;" contenteditable="false">' + this.number +
                            '</span><b  class="key">' + nameStr + '<b class ="string">"' + value + '"</b>';
                        else return '<span  onselectstart="return false;" contenteditable="false">' + this.number +
                            '</span><b  class="key">' + nameStr + '<b class ="string">"' + value + '"</b><em class="bracket">,</em>';
                        break;
                    }
                case "object":
                    return '<span  onselectstart="return false;" contenteditable="false">' + this.number + '</span>\
                    <button onclick="JE.closeObject()" id="' + (this.number - 1) + '_btn">\
                    <i class="triangle_border_down" id="' + (this.number - 1) + '_i" data="' + (this.number - 1) + '_1">\
                    </i></button><b class="key">' + nameStr + '</b><em class ="bracket">' + bracket + '</em>';
            }
        },
        /*The default deployable object when formatted.*/
        showObject: function() {
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
        },
        /* color string to initialize clopick color */
        initClopick: function() {
            var bEle = document.getElementsByTagName("b");
            for (var i = 0; i < bEle.length; i++) {
                var bEleText = bEle[i].innerHTML;
                bEleText = this.formatStr(bEleText);
                eText = bEleText.substr(bEleText.length - 1, 1) == ',' ?
                    bEleText.substr(1, bEleText.length - 3) :
                    bEleText.substr(1, bEleText.length - 2);
                var ele = $(bEle[i]);
                if (this.CheckIsColor(eText)) {
                    ele.colpick({
                        layout: "rgbhex",
                        submitText: "ok",
                        colorScheme: "light",
                        onSubmit: function(hsb, hex, rgb, el) {
                            var val = $(el).html();
                            if (val.match(/[rR][gG][Bb]/)) {
                                var tempArr = val.split(",");
                                var transparence = tempArr[tempArr.length - 1].split(")")[0];

                                $(el).html("\"rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + transparence + ")\"")
                            } else {
                                $(el).html("\"#" + hex + "\"");
                            }
                            $(el).colpickHide();
                        }
                    });
                } else if (typeof ele.html() == "string") {
                    bEle[i].onclick = function(e) {
                        var width = event.target.innerText.length * 8 + "px";
                        if (event.target.localName == "b") {
                            JE.editEle = event.target;
                            event.target.innerHTML = "<input type='text' value=" + event.target.innerText +
                                " oninput='JE.showPromptBox()' onblur='JE.hiddenPromptbox()' style='width:" + width + "'/>";
                            event.target.childNodes[0].focus();
                        }
                    };
                }
            }
        },
        showPromptBox: function(e) {
            var width = event.target.value.length * 8 + "px";
            event.target.style.width = width;
            var cursurPosition = event.target.selectionStart;
            this.promptbox.style.top = event.target.offsetTop + 74;
            this.promptbox.style.left = event.target.offsetLeft;
            let newArr = [];
            let promptboxStr = ""
            for (let i = 0; i < JE.namePrompt.length; i++) {
                if (JE.namePrompt[i].indexOf(event.target.value.substring(0, cursurPosition)) == 0) {
                    newArr.push(JE.namePrompt[i]);
                }
            }
            for (let j = 0; j < newArr.length; j++) {
                promptboxStr += "<p onmousedown='JE.replaceOldStr()'>" + newArr[j] + "</p>"
            }
            this.promptbox.innerHTML = promptboxStr;
            this.promptbox.style.display = "block";
            if (parseInt(promptbox.offsetHeight) > 200) {
                promptbox.style.height = "200px";
                promptbox.style.overflowY = "scroll";
            } else {
                promptbox.style.height = "100px";
                promptbox.style.overflowY = "auto";
            }
        },
        replaceOldStr: function() {
            this.selectPromptbox = true;
            this.editEle.innerHTML = "\"" + event.target.innerText + "\"";
        },
        hiddenPromptbox: function() {
            if (!this.selectPromptbox) {
                JE.editEle.innerHTML = "\"" + event.target.value + "\"";
            }
            this.promptbox.style.display = "none";
            this.selectPromptbox = false;
        },
        /* confirm the color selected by the colorer */
        // submitColor: function(hex, rgb, el) {

        // },
        /*Check if string color values */
        CheckIsColor: function(colorValue) {
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
        },
        /* go to string Spaces, line breaks and other tabs and comment */
        formatStr: function(str) {
            var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g;
            str = str.replace(reg, function(word) {
                return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
            });
            return str = str.replace(/\ +/g, '').replace(/[\r\n]/g, '').replace(/\s|\xA0/g, "");
        },
        /* check that line is not in json format */
        jsonIntStr: function(str) {
            try {
                var result = jsonlint.parse(str);
                if (result) return result;
            } catch (e) {
                alert(e);
                return false;
            }
        },
        /*Select the code to format JSON or tree format JSON.*/
        formatJson: function() {
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
            this.showObject();
            codeText = document.getElementById("tree").innerText;
            try {
                JE.data = JSON.parse(this.formatStr(codeText));
                if (selectMethod.value == 0) {
                    var str = JSON.stringify(JE.data, undefined, 4);
                    JE.treeUI.innerHTML = "<pre>" + str + "</pre>";
                } else {
                    JE.toTree();
                    this.initClopick();
                    for (let i = 0; i < span.length; i++) {
                        span[i].style.display = "inline-block";
                    }
                }
            } catch (e) {
                this.jsonIntStr(codeText);
                for (let i = 0; i < span.length; i++) {
                    span[i].style.display = "inline-block";
                }
            };
        },
        closeObject: function() {
            var dl = document.getElementById(event.target.id.split("_")[0] + "_dl");
            var i = document.getElementById(event.target.id.split("_")[0] + "_i");
            var eData = i.getAttribute("data");
            if (eData.split("_")[1] == "1") {
                var showI = eData.split("_")[0] + "_0";
                this.showOrClose(dl, i, showI, "[...],{...}", "none", "triangle_border_right");
            } else {
                var closeI = eData.split("_")[0] + "_1";
                this.showOrClose(dl, i, closeI, "[,{", "block", "triangle_border_down");
            }
        },
        /* the open state of an object or array is changed by parameters*/
        showOrClose: function(dl, ele, data, bracket, display, iClass) {
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

    }
    /*Initialize formatted upload download and other events.  */
JE.begin = function(data) {
        var $ = function(id) {
            return document.getElementById(id)
        };
        JE.treeUI = $("tree");
        JE.promptbox = $("promptbox")
        var saveJson = $("save_as");
        var selectMethod = $("selectMethod");
        var clearTree = $("clear_txt");
        var formatTree = $("formatTree");
        var fileIpt = $("fileId");
        var upload = $("uploadBtn");
        /* upload the file in JSON format */
        upload.onclick = function() {
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
                        JE.data = JSON.parse(JE.formatStr(data));
                        JE.toTree();
                        JE.initClopick();
                    } catch (e) {
                        var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g;
                        data = data.replace(reg, function(word) {
                            return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
                        });
                        JE.jsonIntStr(data);
                    };

                }
                selectMethod.value = "1";
            }
        }
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
                JE.data = JSON.parse(JE.formatStr(codeText));
            } catch (e) {
                JE.jsonIntStr(codeText);
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
            JE.formatJson();
        }
        selectMethod.onchange = function() {
            JE.formatJson();
        }
        fileIpt.onchange = function() {
            var topInput = document.getElementById("topInput");
            topInput.value = this.value;
        }
    }
    /*Changes the open state of an object or array.*/



/*editable div to implement copy and paste  for plain text.*/
$('[contenteditable]').each(function() {
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

                /*Create temporary elements that allow TextRange to move to the correct location.*/
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
            /*Other browsers*/
            document.execCommand("insertText", false, text);
        }
    });
});
JE.namePrompt = [
    'polygon-brush-type',
    'visible',
    'polygon-rotate-angle',
    'polygon-dx',
    'polygon-dy',
    'polygon-fill',
    'polygon-foreground-fill',
    'polygon-gamma',
    'polygon-gamma',
    'polygon-geometry-transform',
    'polygon-hatch-style',
    'polygon-opacity',
    'polygon-outline-color',
    'polygon-outline-dasharray',
    'polygon-outline-opacity',
    'polygon-outline-width',
    'polygon-linear-gradient',
    'polygon-radial-gradient',
    'polygon-texture-file',
    'polygon-shadow-color',
    'polygon-shadow-dx',
    'polygon-shadow-dy',
    'line-cap',
    'line-color',
    'line-dasharray',
    'line-gamma',
    'line-geometry-transform',
    'line-join',
    'line-miterlimit',
    'line-offset',
    'line-opacity',
    'line-width',
    'line-cap-inner',
    'line-color-inner',
    'line-dasharray-inner',
    'line-join-inner',
    'line-miterlimit-inner',
    'line-width-inner',
    'line-cap-center',
    'line-color-center',
    'line-dasharray-center',
    'line-join-center',
    'line-miterlimit-center',
    'line-width-center',
    'line-oneway',
    'point-glyph',
    'point-linear-gradient',
    'point-radial-gradient',
    'point-fill',
    'point-glyph-name',
    'point-outline-color',
    'point-outline-width',
    'point-size',
    'point-rotate-angle',
    'point-dx',
    'point-dy',
    'point-file',
    'point-opacity',
    'point-symbol-type',
    'point-transform',
    'point-type',
    'shield-icon-type',
    'shield-icon-symbol-type',
    'shield-icon-size',
    'shield-icon-size',
    'shield-icon-src',
    'shield-icon-color',
    'shield-icon-outline-color',
    'shield-icon-outline-width',
    'this.iconSrc',
    'this.iconSrc',
    'shield-name',
    'shield-font',
    'shield-align',
    'shield-rotate-angle',
    'shield-avoid-edges',
    'shield-date-format',
    'shield-dx',
    'shield-dy',
    'shield-face-name',
    'shield-fill',
    'shield-force-horizontal -for-line',
    'shield-halo-fill',
    'shield-halo-fill',
    'shield-halo-radius',
    'shield-halo-radius',
    'shield-margin',
    'shield-max-char-angle-delta',
    'shield-min-distance',
    'shield-min-padding',
    'shield-name',
    'shield-numeric-format',
    'shield-opacity',
    'shield-orientation',
    'shield-placements',
    'shield-placements',
    'shield-placement-type',
    'shield-placement-type',
    'shield-size',
    'shield-spacing',
    'shield-text-format',
    'shield-wrap',
    'shield-wrap',
    'shield-wrap-character',
    'shield-wrap-width',
    'textalign',
    'textavoidedge',
    'textdx',
    'textdy',
    'textfont',
    'textfill',
    'textforcehorizontal -for-line',
    'texthalofill',
    'texthaloradius',
    'textmargin',
    'textmaskcolor',
    'textmaskmargin',
    'textmaskoutlinecolor',
    'textmaskoutlinewidth',
    'textmasktype',
    'textmaxcharangle',
    'textmindistance',
    'textminpadding',
    'textname',
    'textopacity',
    'textrotateangle',
    'textplacements',
    'textplacementtype',
    'textpolygonlabelinglocation',
    'textspacing',
    'textsplinetype',
    'textwrapbefore',
    'textwrapwidth',
    'texttextformat',
    'textdateformat',
    'textnumericformat',
    'filter'
];
JE.valuePrompt = [
    '@path',
    '@baseland_polygon_fill',
    '@baseland_text_fill',
    '@baseland_text_fill_lighter',
    '@landfill',
    '@baseland_text_halo_fill',
    '@water_text_fill',
    '@water_text_halo_fill',
    '@text_name',
    '@text_align',
    '@polygon_text',
    '@text_placements', '@countryLineColor', '@lineWidth', '@water', '@landbackgroundfill', '@park', '@wood', '@golf_courseborder', '@golf_course', '@protected_areaborder,@protected_area', '@aerodrome', '@national_park', '@reservoir', '@orchard,@vineyards', '@orchardbackground', '@vineyardsbackground', '@railway', '@cemetery', '@quarry', '@marina,@water_park', '@basin', '@basinbackground', '@wetland', '@village_green,@meadow,@common,@garden', '@recreation_ground', '@farmyard,@farm,@farmland', '@industrial', '@retail', '@commercial', '@oneway_file', '@forest', '@military', '@militarybackground', '@grass', '@residential', '@beach', '@grassland', '@heath', '@mud', '@mudbackground', '@sand', '@wetlandbackground', '@scrubborder', '@scrub', '@water_parkborder,@marinaborder', '@trackborder', '@track', '@pitchborder', '@pitch', '@stadiumborder', '@stadium', '@sports_centre', '@playgroundborder', '@playground', '@dog_park', '@nature_reserve', '@attractionborder', '@attraction', '@zoo', '@helipad', '@university,@college,@kindergarten,@school', '@parking', '@swimming_poolborder', '@swimming_pool', '@apronborder', '@apron', '@runway', '@building_fill', '@building_border', '@squareborder,@building_fillborder', '@squareborderwidth', '@radius', '@line_cap,@countryLineCap', '@shield_fill', '@shield_name', '@array1', '@array2', '@rail_inner,@tram_inner,@narrow_gauge_inner,@light_rail_inner,@miniature_inner', '@subway_center', '@monorail_inner', '@taxiway_outer', '@runway_outer', '@cable_car_outer', '@pier_outer,@pier', '@motorway6_9', '@motorway_outer', '@motorway_inner', '@motorway_link_outer', '@motorway_link_inner', '@trunk_outer'

]