'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "p2r" is now active!');
    // 通过文档变更事件为入口处理
    vscode.workspace.onDidChangeTextDocument((event)=>{
        px2Rem(event);
    });
    // convert px to rem
    function px2Rem (event1: vscode.TextDocumentChangeEvent) {
        const editor: vscode.TextEditor|undefined = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        /**
         * 处理文档中是否存在需要转换的内容
         */
        let text = editor.document.getText();
        const reg = /([\d.]+)p2r/;
        let regr = reg.exec(text);
        console.log('regr',regr);
        // 判断是否匹配上。
        if(!regr){
            return ;
        }

        /**
         * 针对配置文件进行处理
         */
        let config = vscode.workspace.getConfiguration('p2r',editor.document.uri);
        const postfix:Array<string>|undefined = config.get('postfix');
        const ratio:Number|undefined  = config.get("ratio");
        // 判断配置项是否匹配
        if(!filterFile(postfix,editor.document)&&ratio){
            return ;
        }

        const originNum = regr[1];
        const remMum = parseFloat(originNum)/parseFloat(ratio+"");
        const dvalue = (remMum + 'rem;').length-(originNum + 'px').length;
        const result = text.replace(reg, remMum+'rem;');

        editor.edit((builder:vscode.TextEditorEdit) => {
            const start = new vscode.Position(0, 0);
            const raw = editor.document.getText();
            const lines = raw.split(/\n|\r\n/);
            const end = new vscode.Position(lines.length, lines[lines.length - 1].length);
            const allRange = new vscode.Range(start, end);
            const selection = editor.selection;
            // 更细文档内容到rem
            builder.replace(allRange, result);
            
            //更新光标位置
            setTimeout(function(){
                const newSelection = changeSelection(selection, dvalue);
                editor.selection = newSelection;
            },0);
            
          }).then(success=> {
        });
    }
    // 根据配置文件判断是否处理当前文档
    function filterFile (postfix:Array<string>|undefined, document:vscode.TextDocument):Boolean{
        const fileName = document.fileName;
        if(!postfix) {return false; }
        for (let index = 0; index < postfix.length; index++) {
            const element = postfix[index];
            if(fileName.endsWith(element)){
                return true;
            }
        }
        return false;
    }
    // 变换光标位置，通过给出的具体偏移量
    function changeSelection(oldSelection:vscode.Selection,dvalue:number ):vscode.Selection{
        const active = oldSelection.active;
        const newPosition = active.translate(0, dvalue);
        const newSelection = new vscode.Selection(newPosition,newPosition);
        return newSelection;
    }
    // 将光标设置在行的末尾，要注意行的内容发生变化。
    function selectionToLineEnd(oldSelection:vscode.Selection,lineLength:number ):vscode.Selection{
        const active = oldSelection.active;
        const newPosition = new vscode.Position(active.line,lineLength>=0?lineLength:0);
        const newSelection = new vscode.Selection(newPosition,newPosition);
        return newSelection;
    }
    //将光标移动到行的最右侧
    function selectionToLineRight(oldSelection:vscode.Selection):vscode.Selection{
        const active = oldSelection.active;
        const sp = active.translate(0,-active.character);
        const newSelection = new vscode.Selection(sp,sp);
        return newSelection;
    }

}

// this method is called when your extension is deactivated
export function deactivate() {
}