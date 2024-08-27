const vscode = require('vscode');

function activate(context) {
  const config = vscode.workspace.getConfiguration('commentsHighlight');
  const fullLine = config.get('fullLine', false);
  const configurations = config.get('configurations', []);

  const decorationTypes = configurations.map(config => {
    return {
      text: config.text,
      decoration: vscode.window.createTextEditorDecorationType({
        backgroundColor: config.backgroundColor,
        border: config.border,
        borderRadius: config.borderRadius,
        color: config.color,
        before: {
          contentText: config.prefixicon,
          margin: '0 3px 0 0'
        }
      })
    };
  });

  function updateDecorations() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const text = editor.document.getText();
    const decorationsArray = decorationTypes.map(type => ({
      decoration: type.decoration,
      ranges: []
    }));

    const lines = text.split(/\r?\n/);

    lines.forEach((line, i) => {
      decorationTypes.forEach((type, index) => {
        const regex = new RegExp(`(//|#|<!--|<!--\\s*)?${type.text}.*?(-->|\n|$)`, 'g');
        let match;
        while ((match = regex.exec(line)) !== null) {
          const startIndex = match.index;
          const endIndex = match.index + match[0].length;
          const range = new vscode.Range(
            new vscode.Position(i, fullLine ? 0 : startIndex),
            new vscode.Position(i, fullLine ? line.length : endIndex)
          );
          decorationsArray[index].ranges.push(range);
        }
      });
    });

    decorationsArray.forEach(decoration => {
      editor.setDecorations(decoration.decoration, decoration.ranges);
    });
  }

  vscode.window.onDidChangeActiveTextEditor(updateDecorations, null, context.subscriptions);
  vscode.workspace.onDidChangeTextDocument(updateDecorations, null, context.subscriptions);
  updateDecorations();
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
