import * as vscode from 'vscode';
import Translate from "@google-cloud/translate";

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
        // 選択範囲の取得
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }

        const document = editor.document;
        const selection = editor.selection;

        const text = document.getText(selection);

        // 翻訳
        TranslateText(text);
    });

    context.subscriptions.push(disposable);
}

async function TranslateText(text: string) {
    const translationClient = new Translate.v3.TranslationServiceClient();

    const request = {
        parent: translationClient.locationPath("hoge", "global"),
        contents: [text],
        mimeType: "text/plain",
        sourceLanguageCode: "en-US",
        targetLanguageCode: "ja-JP"
    };

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
