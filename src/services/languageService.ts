//
// Copyright (c) Microsoft Corporation.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

///<reference path='typescriptServices.ts' />
///<reference path='diagnosticServices.ts' />

module TypeScript.Services {

    //
    // Public interface of the host of a language service instance.
    //
    export interface ILanguageServiceHost extends TypeScript.ILogger, TypeScript.IReferenceResolverHost {
        getCompilationSettings(): TypeScript.CompilationSettings;

        getScriptFileNames(): string[];
        getScriptVersion(fileName: string): string;
        getScriptIsOpen(fileName: string): boolean;
        getScriptByteOrderMark(fileName: string): TypeScript.ByteOrderMark;
        getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot;
        getDiagnosticsObject(): TypeScript.Services.ILanguageServicesDiagnostics;
        getLocalizedDiagnosticMessages(): any;
    }

    //
    // Public services of a language service instance associated
    // with a language service host instance
    //
    export interface ILanguageService {
        // Note: refresh is a no-op now.  It is only around for back compat purposes.
        refresh(): void;

        cleanupSemanticCache(): void;

        getSyntacticDiagnostics(fileName: string): TypeScript.Diagnostic[];
        getSemanticDiagnostics(fileName: string): TypeScript.Diagnostic[];
        getCompilerOptionsDiagnostics(): TypeScript.Diagnostic[];

        getCompletionsAtPosition(fileName: string, position: number, isMemberCompletion: boolean): CompletionInfo;
        getCompletionEntryDetails(fileName: string, position: number, entryName: string): CompletionEntryDetails;

        getTypeAtPosition(fileName: string, position: number): TypeInfo;

        getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): TextSpan;

        getBreakpointStatementAtPosition(fileName: string, position: number): TextSpan;

        getSignatureAtPosition(fileName: string, position: number): SignatureInfo;

        getRenameInfo(fileName: string, position: number): RenameInfo;
        getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[];
        getReferencesAtPosition(fileName: string, position: number): ReferenceEntry[];
        getOccurrencesAtPosition(fileName: string, position: number): ReferenceEntry[];
        getImplementorsAtPosition(fileName: string, position: number): ReferenceEntry[];

        getNavigateToItems(searchValue: string): NavigateToItem[];
        getNavigationBarItems(fileName: string): NavigationBarItem[];

        getOutliningSpans(fileName: string): OutliningSpan[];
        getBraceMatchingAtPosition(fileName: string, position: number): TypeScript.TextSpan[];
        getIndentationAtPosition(fileName: string, position: number, options: TypeScript.Services.EditorOptions): number;

        getFormattingEditsForRange(fileName: string, start: number, end: number, options: FormatCodeOptions): TextChange[];
        getFormattingEditsForDocument(fileName: string, options: FormatCodeOptions): TextChange[];
        getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions): TextChange[];

        getEmitOutput(fileName: string): TypeScript.EmitOutput;

        getSyntaxTree(fileName: string): TypeScript.SyntaxTree;
    }

    export function logInternalError(logger: TypeScript.ILogger, err: Error) {
        logger.log("*INTERNAL ERROR* - Exception in typescript services: " + err.message);
    }

    export class ReferenceEntry {
        public fileName: string = ""
        public textSpan: TextSpan;
        public isWriteAccess: boolean = false;

        constructor(fileName: string, textSpan: TextSpan, isWriteAccess: boolean) {
            this.fileName = fileName;
            this.textSpan = textSpan;
            this.isWriteAccess = isWriteAccess;
        }
    }

    export class OutliningSpan {
        /** 
         * @param textSpan The span of the document to actually collapse.
         * @param hintSpan The span of the document to display when the user hovers over the 
         *       collapsed span.
         * @param bannerText The text to display in the editor for the collapsed region.
         * @param autoCollapse Whether or not this region should be automatically collapsed when 
         *        the 'Collapse to Definitions' command is invoked.
         */
        constructor(public textSpan: TextSpan,
                    public hintSpan: TextSpan,
                    public bannerText: string,
                    public autoCollapse: boolean) {
        }
    }

    export class NavigationBarItem {
        constructor(public text: string, 
            public kind: string, 
            public kindModifiers: string,
            public spans: TextSpan[], 
            public childItems: NavigationBarItem[] = null,
            public indent = 0,
            public bolded = false,
            public grayed = false) {
        }
    }

    export class NavigateToItem {
        public name: string = "";
        public kind: string = "";            // see ScriptElementKind
        public kindModifiers: string = "";   // see ScriptElementKindModifier, comma separated
        public matchKind: string = "";
        public fileName: string = "";
        public textSpan: TextSpan;
        public containerName: string = "";
        public containerKind: string = "";  // see ScriptElementKind
    }

    export class TextChange {
        constructor(public span: TextSpan, public newText: string) {
        }

        static createInsert(pos: number, newText: string): TextChange {
            return new TextChange(new TextSpan(pos, 0), newText);
        }
        static createDelete(minChar: number, limChar: number): TextChange {
            return new TextChange(TextSpan.fromBounds(minChar, limChar), "");
        }
        static createReplace(minChar: number, limChar: number, newText: string): TextChange {
            return new TextChange(TextSpan.fromBounds(minChar, limChar), newText);
        }
    }

    export class EditorOptions {
        public IndentSize: number = 4;
        public TabSize: number = 4;
        public NewLineCharacter: string = "\r\n";
        public ConvertTabsToSpaces: boolean = true;

        public static clone(objectToClone: EditorOptions): EditorOptions {
            var editorOptions = new EditorOptions();
            editorOptions.IndentSize = objectToClone.IndentSize;
            editorOptions.TabSize = objectToClone.TabSize;
            editorOptions.NewLineCharacter = objectToClone.NewLineCharacter;
            editorOptions.ConvertTabsToSpaces = objectToClone.ConvertTabsToSpaces;
            return editorOptions;
        }
    }

    export class FormatCodeOptions extends EditorOptions {
        public InsertSpaceAfterCommaDelimiter: boolean = true;
        public InsertSpaceAfterSemicolonInForStatements: boolean = true;
        public InsertSpaceBeforeAndAfterBinaryOperators: boolean = true;
        public InsertSpaceAfterKeywordsInControlFlowStatements: boolean = true;
        public InsertSpaceAfterFunctionKeywordForAnonymousFunctions: boolean = false;
        public InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: boolean = false;
        public PlaceOpenBraceOnNewLineForFunctions: boolean = false;
        public PlaceOpenBraceOnNewLineForControlBlocks: boolean = false;

        public static clone(objectToClone: FormatCodeOptions ): FormatCodeOptions {
            var formatCodeOptions = <FormatCodeOptions>EditorOptions.clone(objectToClone);
            formatCodeOptions.InsertSpaceAfterCommaDelimiter = objectToClone.InsertSpaceAfterCommaDelimiter;
            formatCodeOptions.InsertSpaceAfterSemicolonInForStatements = objectToClone.InsertSpaceAfterSemicolonInForStatements;
            formatCodeOptions.InsertSpaceBeforeAndAfterBinaryOperators = objectToClone.InsertSpaceBeforeAndAfterBinaryOperators;
            formatCodeOptions.InsertSpaceAfterKeywordsInControlFlowStatements = objectToClone.InsertSpaceAfterKeywordsInControlFlowStatements;
            formatCodeOptions.InsertSpaceAfterFunctionKeywordForAnonymousFunctions = objectToClone.InsertSpaceAfterFunctionKeywordForAnonymousFunctions;
            formatCodeOptions.InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis = objectToClone.InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis;
            formatCodeOptions.PlaceOpenBraceOnNewLineForFunctions = objectToClone.PlaceOpenBraceOnNewLineForFunctions;
            formatCodeOptions.PlaceOpenBraceOnNewLineForControlBlocks = objectToClone.PlaceOpenBraceOnNewLineForControlBlocks;
            return formatCodeOptions;
        }
    }

    export class RenameInfo {
        constructor(public canRename: boolean,
                    public localizedErrorMessage: string,
                    public displayName: string,
                    public fullDisplayName: string,
                    public kind: string,
                    public kindModifiers: string,
                    public triggerSpan: TextSpan) {
        }

        public static CreateError(localizedErrorMessage: string) {
            return new RenameInfo(false, localizedErrorMessage, null, null, null, null, null);
        }

        public static Create(displayName: string,
                             fullDisplayName: string,
                             kind: string,
                             kindModifiers: string,
                             triggerSpan: TextSpan) {
            return new RenameInfo(true, null, displayName, fullDisplayName, kind, kindModifiers, triggerSpan);
        }
    }

    export class DefinitionInfo {
        constructor(
            public fileName: string,
            public textSpan: TextSpan,
            public kind: string,
            public name: string,
            public containerKind: string,
            public containerName: string) {
        }
    }

    export class TypeInfo {
        constructor(
            public memberName: TypeScript.MemberName,
            public docComment: string,
            public fullSymbolName: string,
            public kind: string,
            public textSpan: TextSpan) {
        }
    }

    export class SignatureInfo {
        public actual: ActualSignatureInfo;
        public formal: FormalSignatureItemInfo[] = []; // Formal signatures
        public activeFormal: number; // Index of the "best match" formal signature
    }

    export class FormalSignatureItemInfo {
        public signatureInfo: string;
        public typeParameters: FormalTypeParameterInfo[] = [];
        public parameters: FormalParameterInfo[] = [];   // Array of parameters
        public docComment: string; // Help for the signature
    }

    export class FormalTypeParameterInfo {
        public name: string;        // Type parameter name
        public docComment: string;  // Comments that contain help for the parameter
        public minChar: number;     // minChar for parameter info in the formal signature info string
        public limChar: number;     // lim char for parameter info in the formal signature info string
    }

    export class FormalParameterInfo {
        public name: string;        // Parameter name
        public isVariable: boolean; // true if parameter is var args
        public docComment: string;  // Comments that contain help for the parameter
        public minChar: number;     // minChar for parameter info in the formal signature info string
        public limChar: number;     // lim char for parameter info in the formal signature info string
    }

    export class ActualSignatureInfo {
        public parameterMinChar: number;
        public parameterLimChar: number;
        public currentParameterIsTypeParameter: boolean; // current parameter is a type argument or a normal argument
        public currentParameter: number;        // Index of active parameter in "parameters" or "typeParamters" array
    }

    export class CompletionInfo {
        public maybeInaccurate = false;
        public isMemberCompletion = false;
        public entries: CompletionEntry[] = [];
    }

    export interface CompletionEntry {
        name: string;
        kind: string;            // see ScriptElementKind
        kindModifiers: string;   // see ScriptElementKindModifier, comma separated
    }

    export interface CompletionEntryDetails {
        name: string;
        kind: string;            // see ScriptElementKind
        kindModifiers: string;   // see ScriptElementKindModifier, comma separated
        type: string;
        fullSymbolName: string;
        docComment: string;
    }


    export class ScriptElementKind {
        static unknown = "";

        // predefined type (void) or keyword (class)
        static keyword = "keyword";

        // top level script node
        static scriptElement = "script";

        // module foo {}
        static moduleElement = "module";

        // class X {}
        static classElement = "class";

        // interface Y {}
        static interfaceElement = "interface";

        // enum E
        static enumElement = "enum";

        // Inside module and script only
        // var v = ..
        static variableElement = "var";

        // Inside function
        static localVariableElement = "local var";

        // Inside module and script only
        // function f() { }
        static functionElement = "function";

        // Inside function
        static localFunctionElement = "local function";

        // class X { [public|private]* foo() {} }
        static memberFunctionElement = "method";

        // class X { [public|private]* [get|set] foo:number; }
        static memberGetAccessorElement = "getter";
        static memberSetAccessorElement = "setter";

        // class X { [public|private]* foo:number; }
        // interface Y { foo:number; }
        static memberVariableElement = "property";

        // class X { constructor() { } }
        static constructorImplementationElement = "constructor";

        // interface Y { ():number; }
        static callSignatureElement = "call";

        // interface Y { []:number; }
        static indexSignatureElement = "index";

        // interface Y { new():Y; }
        static constructSignatureElement = "construct";

        // function foo(*Y*: string)
        static parameterElement = "parameter";

        static typeParameterElement = "type parameter";

        static primitiveType = "primitive type";
    }

    export class ScriptElementKindModifier {
        static none = "";
        static publicMemberModifier = "public";
        static privateMemberModifier = "private";
        static exportedModifier = "export";
        static ambientModifier = "declare";
        static staticModifier = "static";
    }

    export class MatchKind {
        static none: string = null;
        static exact = "exact";
        static subString = "substring";
        static prefix = "prefix";
    }

    export class DiagnosticCategory {
        static none = "";
        static error = "error";
        static warning = "warning";
        static message = "message";
    }
}
