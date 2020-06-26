// enable double-clicking from Mac Finder or Windows Explorer
#target photoshop // this command only works in Photoshop CS2 and higher
// bring application forward for double-click events
app.bringToFront();
// Save the current preferences
var startRulerUnits = app.preferences.rulerUnits;
// Set Photoshop to use pixels
app.preferences.rulerUnits = Units.PIXELS;
// 定义全局路径变量
var Path = $.getenv("Path") || activeDocument.path.fsName;

try {
    var cDoc = activeDocument.activeLayer;

    // 获取基本属性
    var FILLOPA = activeDocument.activeLayer.fillOpacity; // 填充透明度
    var OPA = activeDocument.activeLayer.opacity; // 透明度
    var LB = activeDocument.activeLayer.bounds;
    var LWidth = (LB[2].value) - (LB[0].value); // 宽度
    var LHeight = (LB[3].value) - (LB[1].value); // 高度
    var LTop = LB[0].value; // 左边
    var LLeft = LB[1].value; // 右边

    var content = 'width: ' + LWidth + 'px; \n' +
    'height: ' + LHeight + 'px; \n' +
    'top : ' + LTop + 'px; \n' +
    'left : ' + LLeft + 'px;';

    var info ='width: ' + LWidth + 'px;  ' +
    'height: ' + LHeight + 'px;  ' +
    'top : ' + LTop + 'px;  ' +
    'left : ' + LLeft + 'px;';

    // 角弧度
    var radius = getBorderRadius();
    if (radius) {
        content = content + '\nborder-radius: ' + radius;
        info = info + '  border-radius: ' + radius + ';'
    }

    // 背景色
    var bgcolor = getFillColor();
    if (bgcolor) {
        content = content + '\nbackground-color: #' + bgcolor;
        info = info + '  background-color: #' + bgcolor + ';'
    }

    // 文字类型时
    if (cDoc.kind === LayerKind.TEXT) {
        // cDoc.textItem.contents 文本内容
        // cDoc.textItem.size 字体大小
        // cDoc.textItem.color.rgb.hexValue hex色彩值
        content = 'font-size: ' + Math.floor(cDoc.textItem.size) + 'px; \n' +
        'color: ' + '#' + cDoc.textItem.color.rgb.hexValue + '; \n' +
        content + '\n' +
        cDoc.textItem.contents;

        info = info + '  font-size: ' + Math.floor(cDoc.textItem.size) + 'px; ' +
        ' color: ' + '#' + cDoc.textItem.color.rgb.hexValue + ';';
    }

    // 拷贝属性
    copyTextToClipboard(content)

    // png导出面板
    var dlg = new Window('dialog', '导出为Png');
    var G1 = dlg.add('group', undefined);
    dlg.msgSt = G1.add('statictext', undefined, '保存路径:');
    dlg.msgEt = G1.add('edittext', [0, 0, 300, 20],  Path, { name: "path", multiline: false, noecho: false, readonly: false });
    dlg.msgStName = G1.add('statictext', undefined, '/' + activeDocument.activeLayer.name + '.png');

    // 定制UI
    dlg.msgPnl = dlg.add('panel', undefined, '属性');
    dlg.msgPnl = dlg.msgPnl.add('statictext', undefined, info);
    dlg.msgPnl.orientation = "column";

    dlg.msgFoot = dlg.add('group', undefined, '');
    dlg.msgFoot.orientation = "row";
    dlg.msgFoot.btn = dlg.msgFoot.add('button', undefined, '导出', { name: "export" });
    dlg.msgFoot.buildBtn = dlg.msgFoot.add('button', undefined, '取消');

    // 事件处理
    dlg.msgFoot.btn.onClick = function () {
        $.setenv("Path", dlg.findElement("path").text)
        quick_export_png($.getenv("Path"), true);
        dlg.close();
    }

    dlg.msgFoot.buildBtn.onClick = function () {
        dlg.close();
    }

    function key_handle(e) {
        switch (e.keyIdentifier) {
            case "Enter":
                $.setenv("Path", dlg.findElement("path").text)
                quick_export_png($.getenv("Path"), true);
                dlg.close();
                break;
        }
    }

    dlg.msgEt.active = true;
    dlg.addEventListener("keydown", key_handle);

    dlg.show();
}
catch (e) { alert(e + "Requires a layer targered"); }


// 导出图片到png

// quick_export_png(activeDocument.path.fsName)

// 导出选中图层

// quick_export_png(activeDocument.path.fsName, true);

function quick_export_png(path, layer) {

    try {

        if (layer == undefined) layer = false;
        var d = new ActionDescriptor();
        var r = new ActionReference();

        r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
        d.putReference(stringIDToTypeID("null"), r);
        d.putString(stringIDToTypeID("fileType"), "png");
        d.putInteger(stringIDToTypeID("quality"), 32);
        d.putInteger(stringIDToTypeID("metadata"), 0);
        d.putString(stringIDToTypeID("destFolder"), path);
        d.putBoolean(stringIDToTypeID("sRGB"), true);
        d.putBoolean(stringIDToTypeID("openWindow"), false);
        executeAction(stringIDToTypeID(layer ? "exportSelectionAsFileTypePressed" : "exportDocumentAsFileTypePressed"), d, DialogModes.NO);

    }

    catch (e) { throw (e); }

}

// 拷贝到剪切板
function copyTextToClipboard(txt) {
    const keyTextData = app.charIDToTypeID("TxtD");
    const ktextToClipboardStr = app.stringIDToTypeID("textToClipboard");
    var textStrDesc = new ActionDescriptor();
    textStrDesc.putString(keyTextData, txt);
    executeAction(ktextToClipboardStr, textStrDesc, DialogModes.NO);
}

// 获取圆角
function getBorderRadius() {
    try {
        var layer = activeDocument.activeLayer;
        var r = new ActionReference();    
        r.putIdentifier(stringIDToTypeID("layer"), layer.id);
        var d = executeActionGet(r);
        var idkeyOriginType = stringIDToTypeID( "keyOriginType" );
        var idkeyOriginRRectRadii = stringIDToTypeID( "keyOriginRRectRadii" );
        var rad = d.getList(idkeyOriginType).getObjectValue(0).getObjectValue(idkeyOriginRRectRadii);

        var tl = rad.getUnitDoubleValue(stringIDToTypeID("topLeft"));
        var tr = rad.getUnitDoubleValue(stringIDToTypeID("topRight"));
        var br = rad.getUnitDoubleValue(stringIDToTypeID("bottomRight"));
        var bl = rad.getUnitDoubleValue(stringIDToTypeID("bottomLeft"));
        var result = null;
        if (tl === br && tl === tr && tl === bl) {
            result = tl + 'px';
        } else if (tl === br && tr === bl && tr !== br) {
            result = tl + 'px ' + tr + 'px';
        } else if (tl !== br && tr === bl) {
            result = tl + 'px ' + tr + 'px ' + br + 'px';
        }
        else {
            result = tl + 'px ' + tr + 'px ' + br + 'px ' + bl + 'px';
        }
        return (result)
    }
    catch(err){
        return (false)
    }
}

// 获取填充色
function getFillColor(){
   try {
        var ref = new ActionReference();
        ref.putEnumerated( stringIDToTypeID( "contentLayer" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
        var ref1= executeActionGet( ref );
        var list =  ref1.getList( charIDToTypeID( "Adjs" ) ) ;
        var solidColorLayer = list.getObjectValue(0);       
        var color = solidColorLayer.getObjectValue(charIDToTypeID('Clr '));
        var fillcolor = new SolidColor;
            fillcolor.rgb.red = color.getDouble(charIDToTypeID('Rd  '));
            fillcolor.rgb.green = color.getDouble(charIDToTypeID('Grn '));
            fillcolor.rgb.blue = color.getDouble(charIDToTypeID('Bl  '));
        return fillcolor.rgb.hexValue;
   }
   catch(err){
     return false
   }
}
