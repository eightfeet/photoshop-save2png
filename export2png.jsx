// enable double-clicking from Mac Finder or Windows Explorer
#target photoshop // this command only works in Photoshop CS2 and higher
// bring application forward for double-click events
app.bringToFront();
// Save the current preferences
var startRulerUnits = app.preferences.rulerUnits;
// Set Photoshop to use pixels
app.preferences.rulerUnits = Units.PIXELS;
// 定义全局路径变量存放历史路径
var Path = $.getenv("Path") || activeDocument.path.fsName;
// 1为选择，2为不选择

try {
    var cDoc = activeDocument.activeLayer;

    // 创建png导出面板
    var dlg = new Window('dialog', '导出为Png');
    var G1 = dlg.add('group', undefined);
    dlg.msgSt = G1.add('statictext', undefined, '保存路径:');
    dlg.msgEt = G1.add('edittext', [0, 0, 300, 20],  Path, { name: "path", multiline: false, noecho: false, readonly: false });
    dlg.msgStName = G1.add('statictext', undefined, '/' + activeDocument.activeLayer.name + '.png');

    // 定制UI
    dlg.checkbox = dlg.add('checkbox',undefined,'拷贝图层css和内容');   
    if ($.getenv("checkbox") === 'true') {
        dlg.checkbox.value = true;
    }
    if ($.getenv("checkbox") === 'false' || $.getenv("checkbox") === null) {
        dlg.checkbox.value = false;
    }

    dlg.msgFoot = dlg.add('group', undefined, '');
    dlg.msgFoot.orientation = "row";
    dlg.msgFoot.btn = dlg.msgFoot.add('button', undefined, '导出', { name: "export" });
    dlg.msgFoot.buildBtn = dlg.msgFoot.add('button', undefined, '取消');

    // 事件处理
    dlg.msgFoot.btn.onClick = actionDo

    dlg.msgFoot.buildBtn.onClick = function () {
        dlg.close();
    }

    function actionDo(){
        $.setenv("Path", dlg.findElement("path").text)
        quick_export_png($.getenv("Path"), true);
        dlg.close();
        if (dlg.checkbox.value === true) {
            $.setenv("checkbox", true)
        } else {
            $.setenv("checkbox", false)
            return;
        }
        // 文字图层时，拷贝文字基本样式和文字内容
        if (cDoc.kind === LayerKind.TEXT) {
            copyTextToClipboard(
                '.text' + '{\n  font-size: ' + Math.floor(cDoc.textItem.size) + 'px; \n  ' +
                'color: ' + '#' + cDoc.textItem.color.rgb.hexValue + '; \n  ' +
                // content + '\n' +
                '}\n' +
                cDoc.textItem.contents
            )
        } else {
            // 其他类型直接拷贝css
            copyLayerCSS();
        }
    }

    function key_handle(e) {
        switch (e.keyIdentifier) {
            case "Enter":
                actionDo();
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

// 拷贝css
function copyLayerCSS(){
    try {
        //code
        var idcopyLayerCSS = stringIDToTypeID( "copyLayerCSS" );
        var desc396 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var ref83 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref83.putEnumerated( idLyr, idOrdn, idTrgt );
        desc396.putReference( idnull, ref83 );
        executeAction( idcopyLayerCSS, desc396, DialogModes.NO );
    }
    catch(x_x){
        alert("当前图层不支持拷贝图层样式！")
    }
}