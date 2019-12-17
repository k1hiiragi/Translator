import * as vscode from 'vscode';
import Translate from "@google-cloud/translate";

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.translator', () => {
        // 選択範囲の取得
        // https://qiita.com/RAWSEQ/items/7c53596754d2a102499f#%E3%82%A8%E3%83%87%E3%82%A3%E3%82%BF%E6%93%8D%E4%BD%9C
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

    if (!credential) {
        vscode.window.showInformationMessage('Credentialがないです');
        return;
    }

    // 設定からProject IDを取得
    // https://qiita.com/RAWSEQ/items/7c53596754d2a102499f#%E5%9F%BA%E6%9C%AC%E8%A8%AD%E5%AE%9A%E3%81%AB%E8%A8%AD%E5%AE%9A%E3%82%92%E8%BF%BD%E5%8A%A0%E3%81%97%E3%81%A6%E5%91%BC%E3%81%B3%E5%87%BA%E3%81%99
    const project_id: string | undefined = vscode.workspace.getConfiguration('translator').get('project_id');

    if (project_id === undefined) {
        vscode.window.showInformationMessage('Project_IDがないです');
        return;
    }

    // APIに投げるリクエスト作成
    // sourceLanguageを設定しなければ言語は自動判定される
    // https://googleapis.dev/nodejs/translate/latest/v3beta1.TranslationServiceClient.html#translateText
    const request = {
        parent: translationClient.locationPath(project_id, "global"),
        contents: [text],
        mimeType: "text/plain",
        targetLanguageCode: "ja-JP"
    };

    // 翻訳結果取得
    // https://cloud.google.com/translate/docs/quickstart-client-libraries-v3?hl=ja
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
