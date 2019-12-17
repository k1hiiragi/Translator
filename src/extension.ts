import * as vscode from 'vscode';
import Translate from "@google-cloud/translate";

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.translator', () => {
        // 選択範囲の取得
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }

        const document = editor.document;
        const selection = editor.selection;

        // 選択範囲のテキストを取得
        const text = document.getText(selection);

        // 翻訳
        TranslateText(text);
    });

    context.subscriptions.push(disposable);
}

async function TranslateText(text: string) {
    const translationClient = new Translate.v3.TranslationServiceClient();

    // Credential情報が無いとAPI実行時エラーが出るためCredential情報をチェックするために取得
    const credential = await translationClient.auth.getCredentials();

    // 設定からProject IDを取得
    const project_id: string | undefined = vscode.workspace.getConfiguration('translator').get('project_id');

    if (!credential) {
        vscode.window.showInformationMessage('Credentialがないです');
        return;
    }

    if (project_id === undefined) {
        vscode.window.showInformationMessage('Project_IDがないです');
        return;
    }

    // APIに投げるリクエスト作成
    // sourceLanguageをせってしなければ自動判定する
    const request = {
        parent: translationClient.locationPath(project_id, "global"),
        contents: [text],
        mimeType: "text/plain",
        targetLanguageCode: "ja-JP"
    };

    // 翻訳結果取得
    const [response] = await translationClient.translateText(request);

    if (!response.translations) {
        return;
    }

    for (const translation of response.translations) {
        if (!(typeof translation.translatedText === 'string')) {
            return;
        }
        vscode.window.showInformationMessage(translation.translatedText);
    }
}

// this method is called when your extension is deactivated
export function deactivate() { }
