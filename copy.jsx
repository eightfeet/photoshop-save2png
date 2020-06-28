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
catch (e) { alert(e + "Requires a layer targered"); }

// 拷贝到剪切板
function copyTextToClipboard(txt) {
    try {
        const keyTextData = app.charIDToTypeID("TxtD");
        const ktextToClipboardStr = app.stringIDToTypeID("textToClipboard");
        var textStrDesc = new ActionDescriptor();
        textStrDesc.putString(keyTextData, txt);
        executeAction(ktextToClipboardStr, textStrDesc, DialogModes.NO);
    } catch (error) {
        alert(error)
    }
    
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
