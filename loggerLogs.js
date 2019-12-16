const vscode = require("vscode");
const logMessage = require("./log-message");

/**
 * Activation method
 * @param {ExtensionContext} context
 * @see {@link https://code.visualstudio.com/api/references/vscode-api#ExtensionContext
 */


async function registerMessage(editor, type, loggerNameParam = "logger") {
  const tabSize = editor.options.tabSize;
  const document = editor.document;
  const config = vscode.workspace.getConfiguration("loggerLogs");
  const wrapLogMessage = config.wrapLogMessage || false;
  const logMessagePrefix =
    config.logMessagePrefix.length > 0 ? config.logMessagePrefix : "LL";
  let loggerName =
    config.loggerName.length > 0 ? config.loggerName : "logger";
  loggerName =  loggerNameParam ? loggerNameParam : loggerName;
  const quote = config.quote;
  const addSemicolonInTheEnd = config.addSemicolonInTheEnd || false;
  const insertEnclosingClass = config.insertEnclosingClass;
  const insertEnclosingFunction = config.insertEnclosingFunction;
  for (let index = 0; index < editor.selections.length; index++) {
    const selection = editor.selections[index];
    const selectedVar = document.getText(selection);
    const lineOfSelectedVar = selection.active.line;
    // Check if the selection line is not the last one in the document and the selected variable is not empty
    if (selectedVar.trim().length !== 0) {
      await editor.edit(editBuilder => {
        const logMessageLine = logMessage.logMessageLine(
          document,
          lineOfSelectedVar,
          selectedVar
        );
        editBuilder.insert(
          new vscode.Position(
            logMessageLine >= document.lineCount
              ? document.lineCount
              : logMessageLine,
            0
          ),
          logMessage.message(
            document,
            selectedVar,
            lineOfSelectedVar,
            wrapLogMessage,
            logMessagePrefix,
            quote,
            addSemicolonInTheEnd,
            insertEnclosingClass,
            insertEnclosingFunction,
            tabSize,
            loggerName,
            type
          )
        );
      });
    }
  }
}
function activate(context) {
  vscode.commands.registerCommand(
    "loggerLogs.displayInfoLogMessage",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      await registerMessage(editor, 'info');
    }
  );
  vscode.commands.registerCommand(
    "loggerLogs.displayErrorLogMessage",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      await registerMessage(editor, 'error');
    }
  );
  vscode.commands.registerCommand(
    "loggerLogs.displayWarningLogMessage",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      await registerMessage(editor, 'warning');
    }
  );
  vscode.commands.registerCommand(
    "loggerLogs.displayLogMessage",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      await registerMessage(editor, 'log', 'console');
    }
  );
  vscode.commands.registerCommand(
    "loggerLogs.commentAllLogMessages",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize = editor.options.tabSize;
      const document = editor.document;
      const logMessagePrefix =
        vscode.workspace.getConfiguration("loggerLogs").logMessagePrefix ||
        "LL";
      const loggerName =
        config.loggerName.length > 0 ? config.loggerName : "logger";
      const logMessages = logMessage.detectAll(
        document,
        tabSize,
        logMessagePrefix,
        loggerName
      );
      editor.edit(editBuilder => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach(({ range }) => {
            editBuilder.delete(range);
            editBuilder.insert(
              new vscode.Position(range.start.line, 0),
              `${spaces}// ${document.getText(range).trim()}\n`
            );
            // editBuilder.insert(new vscode.Position(range.start.line, 80), `Good`)
          });
        });
      });
    }
  );
  vscode.commands.registerCommand(
    "loggerLogs.uncommentAllLogMessages",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize = editor.options.tabSize;
      const document = editor.document;
      const logMessagePrefix =
        vscode.workspace.getConfiguration("loggerLogs").logMessagePrefix ||
        "LL";
      const loggerName =
        config.loggerName.length > 0 ? config.loggerName : "logger";
      const logMessages = logMessage.detectAll(
        document,
        tabSize,
        logMessagePrefix,
        loggerName
      );
      editor.edit(editBuilder => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach(({ range }) => {
            editBuilder.delete(range);
            editBuilder.insert(
              new vscode.Position(range.start.line, 0),
              `${spaces}${document
                .getText(range)
                .replace(/\//g, "")
                .trim()}\n`
            );
          });
        });
      });
    }
  );
  vscode.commands.registerCommand(
    "loggerLogs.deleteAllLogMessages",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize = editor.options.tabSize;
      const document = editor.document;
      const logMessagePrefix =
        vscode.workspace.getConfiguration("loggerLogs").logMessagePrefix ||
        "LL";
      const logMessages = logMessage.detectAll(
        document,
        tabSize,
        logMessagePrefix,
        loggerName
      );
      editor.edit(editBuilder => {
        logMessages.forEach(({ lines }) => {
          lines.forEach(({ range }) => {
            editBuilder.delete(range);
          });
        });
      });
    }
  );
}

exports.activate = activate;
