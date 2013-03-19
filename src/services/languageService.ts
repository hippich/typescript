﻿//﻿
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

module Services {

    //
    // Public interface of the host of a language service instance.
    //
    export interface ILanguageServiceHost extends TypeScript.ILogger {
        getCompilationSettings(): TypeScript.CompilationSettings;
        getHostSettings(): TypeScript.IHostSettings;

        getScriptFileNames(): string[];
        getScriptVersion(fileName: string): number;
        getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot;
    }

    //
    // Public services of a language service instance associated
    // with a language service host instance
    //
    export interface ILanguageService {
        // TODO: This should be removed.  We should not be publicly exposing a way to refresh the 
        // language service.
        refresh(): void;

        getCompletionsAtPosition(fileName: string, pos: number, isMemberCompletion: bool): CompletionInfo;
        getTypeAtPosition(fileName: string, pos: number): TypeInfo;
        getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): SpanInfo;
        getBreakpointStatementAtPosition(fileName: string, pos: number): SpanInfo;
        getSignatureAtPosition(fileName: string, pos: number): SignatureInfo;
        getDefinitionAtPosition(fileName: string, pos: number): DefinitionInfo;
        getReferencesAtPosition(fileName: string, pos: number): ReferenceEntry[];
        getOccurrencesAtPosition(fileName: string, pos: number): ReferenceEntry[];
        getImplementorsAtPosition(fileName: string, pos: number): ReferenceEntry[];
        getNavigateToItems(searchValue: string): NavigateToItem[];
        getScriptLexicalStructure(fileName: string): NavigateToItem[];
        getOutliningRegions(fileName: string): TypeScript.TextSpan[];
        getBraceMatchingAtPosition(fileName: string, position: number): TypeScript.TextSpan[];
        getSmartIndentAtLineNumber(fileName: string, position: number, options: Services.EditorOptions): number;

        getFormattingEditsForRange(fileName: string, minChar: number, limChar: number, options: FormatCodeOptions): TextEdit[];
        getFormattingEditsForDocument(fileName: string, minChar: number, limChar: number, options: FormatCodeOptions): TextEdit[];
        getFormattingEditsOnPaste(fileName: string, minChar: number, limChar: number, options: FormatCodeOptions): TextEdit[];
        getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions): TextEdit[];

        getAstPathToPosition(script: TypeScript.AST, pos: number, options: TypeScript.GetAstPathOptions /*= Tools.GetAstPathOptions.Default*/): TypeScript.AstPath;
        getIdentifierPathToPosition(script: TypeScript.AST, pos: number): TypeScript.AstPath;

        getSymbolTree(): Services.ISymbolTree;
        getEmitOutput(fileName: string) : IOutputFile[];
    }

    export function logInternalError(logger: TypeScript.ILogger, err: Error) {
        logger.log("*INTERNAL ERROR* - Exception in typescript services: " + err.message);
    }

    export class ReferenceEntry {
        constructor (public fileName: string, public ast: TypeScript.AST, public isWriteAccess: bool) {
        }

        public getHashCode(): number {
            return TypeScript.combineHashes(
                    TypeScript.Hash.computeSimple31BitStringHashCode(this.fileName),
                    TypeScript.combineHashes(
                        TypeScript.numberHashFn(this.ast.minChar),
                        TypeScript.numberHashFn(this.ast.limChar)));
        }
        
        public equals(other: ReferenceEntry): bool {
            if (other === null || other === undefined)
                return false;

            return (this.fileName === other.fileName) &&
                (this.ast.minChar === other.ast.minChar) &&
                (this.ast.limChar === other.ast.limChar);
        }
    }

    export class ReferenceEntrySet {
        private hashTable: TypeScript.HashTable;
        private entries: ReferenceEntry[];

        constructor () {
            this.entries = [];
            this.hashTable = new TypeScript.HashTable(101,
                (r: ReferenceEntry) => { return r.getHashCode(); },
                (r1: ReferenceEntry, r2: ReferenceEntry) => { return r1.equals(r2); });
        }

        public getEntries(): ReferenceEntry[] {
            return this.entries;
        }

        public addAst(fileName: string, ast: TypeScript.AST, isWriteAccess: bool): void {
            // Avoid duplicate entries
            var reference = new ReferenceEntry(fileName, ast, isWriteAccess);
            if (this.hashTable.lookup(reference) !== null)
                return;
            this.hashTable.add(reference, reference);

            // Add entry to resulting string
            this.entries.push(reference);

        }

        public addSymbol(sym: TypeScript.Symbol): void {
            var fileName = sym.fileName;
            if (fileName === TypeScript.unknownLocationInfo.fileName)
                return;

            var ast = sym.declAST;
            if (ast === null)
                return;

            var symbolLocation: TypeScript.AST;
            switch (ast.nodeType) {
                case TypeScript.NodeType.InterfaceDeclaration:
                    symbolLocation = (<TypeScript.InterfaceDeclaration>ast).name;
                    break;

                case TypeScript.NodeType.ClassDeclaration:
                    symbolLocation = (<TypeScript.ClassDeclaration>ast).name;
                    break;

                case TypeScript.NodeType.ModuleDeclaration:
                    symbolLocation = (<TypeScript.ModuleDeclaration>ast).name;
                    break;

                case TypeScript.NodeType.VarDecl:
                    symbolLocation = (<TypeScript.VarDecl>ast).id;
                    break;

                case TypeScript.NodeType.FuncDecl:
                    symbolLocation = (<TypeScript.FuncDecl>ast).name;
                    break;

                default:
                    symbolLocation = ast;
            }

            if (symbolLocation === null)
                symbolLocation = ast;

            this.addAst(fileName, symbolLocation, /*isWriteAccess:*/false);
        }
    }

    export class NavigateToItem {
        public name: string = "";
        public kind: string = "";            // see ScriptElementKind
        public kindModifiers: string = "";   // see ScriptElementKindModifier, comma separated
        public matchKind: string = "";
        public fileName: string = TypeScript.unknownLocationInfo.fileName;
        public minChar: number = -1;
        public limChar: number = -1;
        public containerName: string = "";
        public containerKind: string = "";  // see ScriptElementKind
    }

    export class NavigateToContext {
        public options = new TypeScript.AstWalkOptions();
        public fileName: string = TypeScript.unknownLocationInfo.fileName;
        public containerSymbols: TypeScript.Symbol[] = [];
        public containerKinds: string[] = [];
        public containerASTs: TypeScript.AST[] = [];
        public path: TypeScript.AstPath = new TypeScript.AstPath();
        public result: NavigateToItem[] = [];
    }

    export class TextRange {
        constructor (public minChar: number, public limChar: number) {
        }
    }

    export class TextEdit {
        constructor (public minChar: number, public limChar: number, public text: string) {
        }

        static createInsert(pos: number, text: string): TextEdit {
            return new TextEdit(pos, pos, text);
        }
        static createDelete(minChar: number, limChar: number): TextEdit {
            return new TextEdit(minChar, limChar, "");
        }
        static createReplace(minChar: number, limChar: number, text: string): TextEdit {
            return new TextEdit(minChar, limChar, text);
        }
    }

    export class EditorOptions {
        public IndentSize: number = 4;
        public TabSize: number = 4;
        public NewLineCharacter: string = "\r\n";
        public ConvertTabsToSpaces: bool = true;
    }

    export class FormatCodeOptions extends EditorOptions {
        public InsertSpaceAfterCommaDelimiter: bool = true;
        public InsertSpaceAfterSemicolonInForStatements: bool = true;
        public InsertSpaceBeforeAndAfterBinaryOperators: bool = true;
        public InsertSpaceAfterKeywordsInControlFlowStatements: bool = true;
        public InsertSpaceAfterFunctionKeywordForAnonymousFunctions: bool = false;
        public InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: bool = false;
        public PlaceOpenBraceOnNewLineForFunctions: bool = false;
        public PlaceOpenBraceOnNewLineForControlBlocks: bool = false;
    }

    export class GetReferencesContext {
        // list of scripts (index) to collect references from
        public scope: string[] = [];
    }

    export class DefinitionInfo {
        constructor (
            public fileName: string,
            public minChar: number,
            public limChar: number,
            public kind: string,
            public name: string,
            public containerKind: string,
            public containerName: string,
            public overloads:DefinitionInfo[]) {
        }
    }

    export class TypeInfo {
        constructor (
            public memberName: TypeScript.MemberName,
            public docComment: string,
            public fullSymbolName: string,
            public kind: string,
            public minChar: number,
            public limChar: number) {
        }
    }

    export class SpanInfo {
        constructor (public minChar: number, public limChar: number, public text: string = null) {
        }
    }
    
    export class SignatureInfo {
        public actual: ActualSignatureInfo;
        public formal: FormalSignatureInfo;
        public activeFormal: number; // Index of the "best match" formal signature
    }

    export class FormalSignatureInfo {
        public name: string;
        public isNew: bool;
        public openParen: string;
        public closeParen: string;
        public docComment: string;
        public signatureGroup: FormalSignatureItemInfo[] = [];
    }

    export class FormalSignatureItemInfo {
        public parameters: FormalParameterInfo[] = [];   // Array of parameters
        public returnType: string;                          // String representation of parameter type
        public docComment: string; // Help for the signature
    }

    export class FormalParameterInfo {
        public name: string;        // Parameter name
        public type: string;        // String representation of parameter type
        public isOptional: bool;    // true if parameter is optional
        public isVariable: bool;    // true if parameter is var args
        public docComment: string; // Comments that contain help for the parameter
    }

    export class ActualSignatureInfo {
        public openParenMinChar: number;
        public closeParenLimChar: number;
        public currentParameter: number; // Index of active parameter in "parameters" array
        public parameters: ActualParameterInfo[] = [];
    }

    export class ActualParameterInfo {
        public minChar: number;
        public limChar: number;
    }

    export class CompletionInfo {
        public maybeInaccurate = false;
        public isMemberCompletion = false;
        public entries: CompletionEntry[] = [];
    }

    export class CompletionEntry {
        public name = "";
        public type = "";
        public kind = "";            // see ScriptElementKind
        public kindModifiers = "";   // see ScriptElementKindModifier, comma separated
        public fullSymbolName = "";
        public docComment = "";
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

    export class ScriptSyntaxASTState {
        public version: number;
        public syntaxAST: ScriptSyntaxAST;
        public syntaxTree: TypeScript.SyntaxTree;
        public fileName: string;

        constructor() {
            this.version = -1;
            this.syntaxAST = null;
            this.fileName = null;
        }
    }

    export interface IOutputFile {
        name: string;
        useUTF8encoding: bool;
        text: string;
    }
    
    export interface TypeInfoAtPosition {
        spanInfo: SpanInfo; 
        ast: TypeScript.AST;
        symbol?: TypeScript.Symbol;
        callSignature?: TypeScript.Signature;
        isNew: bool;
    }

    export class LanguageService implements ILanguageService {
        private logger: TypeScript.ILogger;
        private compilerState: CompilerState;
        private syntaxASTState: ScriptSyntaxASTState;
        private formattingRulesProvider: Formatting.RulesProvider;

        constructor(private host: ILanguageServiceHost) {
            this.logger = this.host;
            this.compilerState = new CompilerState(this.host);
            this.syntaxASTState = new ScriptSyntaxASTState();
            this.formattingRulesProvider = new Formatting.RulesProvider(this.logger);
        }

        public refresh(): void {
            TypeScript.timeFunction(this.logger, "refresh()", () => {
                this.compilerState.refresh();
            });
        }

        public minimalRefresh(): void {
            TypeScript.timeFunction(this.logger, "minimalRefresh()", () => {
                this.compilerState.minimalRefresh();
            });
        }

        public getSymbolTree(): ISymbolTree {
            this.refresh();
            return this.compilerState.getSymbolTree();
        }

        public getScriptSyntaxAST(fileName: string): ScriptSyntaxAST {
            this.minimalRefresh();

            return this._getScriptSyntaxAST(fileName);
        }

        private _getScriptSyntaxAST(fileName: string): ScriptSyntaxAST {
            return TypeScript.timeFunction(this.logger, "getScriptSyntaxAST(\"" + fileName + "\")", () => {
                var version = this.compilerState.getScriptVersion(fileName);

                var syntaxAST = this.syntaxASTState.syntaxAST;
                if (syntaxAST === null || this.syntaxASTState.fileName !== fileName) {
                    syntaxAST = this.compilerState.getScriptSyntaxAST(fileName);
                }
                else if (this.syntaxASTState.version !== version) {
                    syntaxAST = this.attemptIncrementalSyntaxAST(this.syntaxASTState);
                    if (syntaxAST === null) {
                        syntaxAST = this.compilerState.getScriptSyntaxAST(fileName);
                    }
                }

                // All done, ensure state is up to date
                this.syntaxASTState.version = version;
                this.syntaxASTState.fileName = fileName;
                this.syntaxASTState.syntaxAST = syntaxAST;
                return this.syntaxASTState.syntaxAST;
            });
        }

        private attemptIncrementalSyntaxAST(syntaxASTState: ScriptSyntaxASTState): ScriptSyntaxAST {
            var syntaxAST = syntaxASTState.syntaxAST;
            var fileName = syntaxAST.getScriptFileName();
            var newSourceText = this.compilerState.getScriptSnapshot(fileName);

            var editRange = this.compilerState.getScriptTextChangeRangeSinceVersion(fileName, syntaxASTState.version);

            // If "no changes", ast is good to go as is
            if (editRange === null) {
                return syntaxAST;
            }

            return null;
        }

        private getTypeInfo(type: TypeScript.Type, symbol: TypeScript.Symbol, typeInfoAtPosition: TypeInfoAtPosition, enclosingScopeContext: TypeScript.EnclosingScopeContext): TypeInfo {
            var memberName: TypeScript.MemberName = null;
            var kind = "";
            var docComment = "";
            var symbolName = "";
            var scopeSymbol = enclosingScopeContext.getScope();
            if (typeInfoAtPosition.ast.nodeType === TypeScript.NodeType.Dot) {
                return null;
            }
            if (symbol.declAST && symbol.declAST.nodeType === TypeScript.NodeType.FuncDecl && (<TypeScript.FuncDecl>symbol.declAST).accessorSymbol) {
                symbol = (<TypeScript.FuncDecl>symbol.declAST).accessorSymbol;
                type = symbol.getType();
            }
            if (typeInfoAtPosition.callSignature) {
                var signatureGroup: TypeScript.SignatureGroup = null;
                if (typeInfoAtPosition.isNew) {
                    signatureGroup = type.construct;
                } else {
                    signatureGroup = type.call;
                }
                var memberNames = new TypeScript.MemberNameArray();
                memberNames.addAll(signatureGroup.toStrings("", true, scopeSymbol, true, typeInfoAtPosition.callSignature));
                memberName = memberNames;
                if (typeInfoAtPosition.callSignature.declAST) {
                    docComment = TypeScript.Comment.getDocCommentText(typeInfoAtPosition.callSignature.declAST.getDocComments());
                    if (typeInfoAtPosition.callSignature.declAST.type.symbol.name != "_anonymous") {
                        symbol = typeInfoAtPosition.callSignature.declAST.type.symbol;
                    }
                } else {
                    docComment = "";
                }
                kind = this.getSymbolElementKind(symbol, scopeSymbol, false);
                if (kind === ScriptElementKind.interfaceElement || kind === ScriptElementKind.classElement) {
                    kind = typeInfoAtPosition.isNew ? ScriptElementKind.constructorImplementationElement : ScriptElementKind.functionElement;
                }
            } else {
                memberName = type.getScopedTypeNameEx(scopeSymbol, true);
                docComment = this.getDocCommentOfSymbol(symbol);
                kind = this.getSymbolElementKind(symbol, scopeSymbol, true);
            }
            symbolName = symbol ? this.getFullNameOfSymbol(symbol, enclosingScopeContext) : "";
            return new TypeInfo(memberName, docComment, symbolName, kind, typeInfoAtPosition.ast.minChar, typeInfoAtPosition.ast.limChar);
        }

        public getTypeAtPosition(fileName: string, pos: number): TypeInfo {
            this.refresh();

            var script = this.compilerState.getScriptAST(fileName);
            var sourceText = this.compilerState.getScriptSnapshot(fileName);

            // Look for AST node containing the position
            var typeInfo = this.getTypeInfoAtPosition(pos, script, true);
            if (typeInfo === null) {
                this.logger.log("No type found at the specified location.");
                return null;
            }

            var enclosingScopeContext = TypeScript.findEnclosingScopeAt(this.logger, script, sourceText, pos, /*isMemberCompletion*/false);
            if (enclosingScopeContext === null) {
                this.logger.log("No context found at the specified location.");
                return null;
            }

            if (typeInfo.symbol) {
                return this.getTypeInfo(typeInfo.symbol.getType(), typeInfo.symbol, typeInfo, enclosingScopeContext);
            } else if (typeInfo.ast.type) {
                return this.getTypeInfo(typeInfo.ast.type, typeInfo.ast.type.symbol, typeInfo, enclosingScopeContext);
            } else {
                this.logger.log("No type found at the specified location.");
                return null;
            }
        }

        public getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): SpanInfo {
            this.refresh();

            var script = this.compilerState.getScriptAST(fileName);

            // Look for AST node containing the position
            var typeAndSpanInfo = this.getTypeInfoAtPosition(startPos, script);
            if (typeAndSpanInfo === null) {
                this.logger.log("No name or dotted name found at the specified location.");
                return null;
            }

            return typeAndSpanInfo.spanInfo;
        }

        // Gets breakpoint span in the statement depending on context
        private getBreakpointInStatement(pos: number, astSpan: TypeScript.IASTSpan, verifyASTPos: bool,
                                         existingResult: TypeScript.IASTSpan, forceFirstStatement: bool, isAst: bool): TypeScript.IASTSpan {
            if (existingResult || !astSpan || (verifyASTPos && pos > astSpan.limChar)) {
                return existingResult;
            }

            if (!isAst) {
                // Satisfies the result
                return astSpan;
            }

            var ast = <TypeScript.AST>astSpan;
            var astList: TypeScript.ASTList = null;
            if (ast.nodeType === TypeScript.NodeType.Block) {
                var block = <TypeScript.Block>ast;
                astList = block.statements;
            } else if (ast.nodeType === TypeScript.NodeType.List) {
                astList = <TypeScript.ASTList>ast;
            } else {
                return ast;
            }

            if (astList.members.length > 0) {
                var lastAST = astList.members[astList.members.length - 1];
                if (!forceFirstStatement && pos > lastAST.limChar) {
                    // Use last one if the character after last statement in the block
                    return lastAST;
                } else {
                    return astList.members[0];
                }
            }

            return null;
        }

        public getBreakpointStatementAtPosition(fileName: string, pos: number): SpanInfo {
            this.refresh();
            var script = this.compilerState.getScriptAST(fileName);

            var containerASTs: TypeScript.AST[] = [];
            //var lineMap = this.compilerState.getLineMap(fileName);

            //// find line and col
            //var lineCol = { line: -1, col: -1 };
            //TypeScript.getSourceLineColFromMap(lineCol, pos, lineMap);

            // Get the valid breakpoint location container list till position so we could choose where to set breakpoint
            var pre = (cur: TypeScript.AST, parent: TypeScript.AST, walker: TypeScript.IAstWalker): TypeScript.AST => {
                if (TypeScript.isValidAstNode(cur)) {
                    if (pos >= cur.minChar && pos <= cur.limChar) {
                        switch (cur.nodeType) {
                            // Can be used as breakpoint location
                            case TypeScript.NodeType.ModuleDeclaration:
                            case TypeScript.NodeType.ClassDeclaration:
                            case TypeScript.NodeType.FuncDecl:
                            case TypeScript.NodeType.Break:
                            case TypeScript.NodeType.Continue:
                                containerASTs.push(cur);
                                break;

                            // These are statements or expressions that cant be used as valid breakpoint statements
                            case TypeScript.NodeType.Script:
                            case TypeScript.NodeType.List:
                            case TypeScript.NodeType.NumberLit:
                            case TypeScript.NodeType.Regex:
                            case TypeScript.NodeType.QString:
                            case TypeScript.NodeType.ArrayLit:
                            case TypeScript.NodeType.ObjectLit:
                            case TypeScript.NodeType.TypeAssertion:
                            case TypeScript.NodeType.Pos:
                            case TypeScript.NodeType.Neg:
                            case TypeScript.NodeType.Not:
                            case TypeScript.NodeType.LogNot:
                            case TypeScript.NodeType.Block:
                                break;

                            // Type Reference cannot have breakpoint, nor can its children
                            case TypeScript.NodeType.TypeRef:
                                walker.options.goChildren = false;
                                break;

                            default:
                                // If it is a statement or expression - they are debuggable
                                // But expressions are debuggable as standalone statement only
                                if (cur.isStatementOrExpression() &&
                                    (!cur.isExpression() ||
                                     containerASTs.length === 0 ||
                                     (!containerASTs[containerASTs.length - 1].isExpression() &&
                                      containerASTs[containerASTs.length - 1].nodeType != TypeScript.NodeType.VarDecl ||
                                      containerASTs[containerASTs.length - 1].nodeType === TypeScript.NodeType.ConditionalExpression))) {
                                    containerASTs.push(cur);
                                }
                                break;
                        }
                    } else {
                        walker.options.goChildren = false;
                    }
                }
                return cur;
            }
            TypeScript.getAstWalkerFactory().walk(script, pre);

            if (containerASTs.length === 0) {
                return null;
            }

            // We have container list in resultAST
            // Use it to determine where to set the breakpoint
            var resultAST: TypeScript.IASTSpan = null;
            var cur = containerASTs[containerASTs.length - 1];
            var customSpan: TypeScript.ASTSpan = null;
            var tryCatch: TypeScript.TryCatch;

            switch (cur.nodeType) {
                // TODO : combine these as interface and use custom method instead of duplicate logic
                case TypeScript.NodeType.ModuleDeclaration:
                    var moduleDecl = <TypeScript.ModuleDeclaration>cur;
                    // If inside another module the whole module is debuggable
                    if (containerASTs.length > 1) {
                        resultAST = moduleDecl;
                    } else {
                        // Use first statement - whatever it is 
                        resultAST = this.getBreakpointInStatement(pos, moduleDecl.members, false, null, false, true);
                    }
                    // Can use ending token and if it cant find anything breakpoint cannot be set at this declaration
                    customSpan = moduleDecl.endingToken;
                    break;

                case TypeScript.NodeType.FuncDecl:
                    var funcDecl = <TypeScript.FuncDecl>cur;
                    // If function is inside module/class then it can be used completely as statement
                    if (containerASTs.length > 1) {
                        resultAST = funcDecl;
                    } else {
                        // We want to use first statement in the body if present
                        resultAST = this.getBreakpointInStatement(pos, funcDecl.bod, false, null, false, true);
                    }
                    // Can use ending token and if it cant find anything breakpoint cannot be set at this declaration
                    customSpan = funcDecl.endingToken;
                    break;

                case TypeScript.NodeType.ClassDeclaration:
                    var classDecl = <TypeScript.ClassDeclaration>cur;
                    // If class is inside module then it can be used completely as statement
                    if (containerASTs.length > 1) {
                        resultAST = classDecl;
                    } else {
                        // We want to use first statement in the body if present
                        resultAST = this.getBreakpointInStatement(pos, classDecl.members, false, null, false, true);
                    }
                    // Can use ending token and if it cant find anything breakpoint cannot be set at this declaration
                    customSpan = classDecl.endingToken;
                    break;

                case TypeScript.NodeType.VarDecl:
                    // Use varDecl only if it has initializer
                    var varDecl = <TypeScript.VarDecl>cur;
                    if (varDecl.init) {
                        resultAST = varDecl;
                    }
                    break;

                case TypeScript.NodeType.If:
                    var ifStatement = <TypeScript.IfStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, ifStatement.statement, true, resultAST, false, false);
                    resultAST = this.getBreakpointInStatement(pos, ifStatement.thenBod, true, resultAST, false, true);
                    resultAST = this.getBreakpointInStatement(pos, ifStatement.elseBod, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.ForIn:
                    var forInStatement = <TypeScript.ForInStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, forInStatement.statement, true, resultAST, false, false);
                    resultAST = this.getBreakpointInStatement(pos, forInStatement.body, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.For:
                    var forStatement = <TypeScript.ForStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, forStatement.init, true, null, false, true);
                    resultAST = this.getBreakpointInStatement(pos, forStatement.cond, true, resultAST, false, true);
                    resultAST = this.getBreakpointInStatement(pos, forStatement.incr, true, resultAST, false, true);
                    resultAST = this.getBreakpointInStatement(pos, forStatement.body, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.While:
                    var whileStatement = <TypeScript.WhileStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, whileStatement.cond, true, null, false, true);
                    resultAST = this.getBreakpointInStatement(pos, whileStatement.body, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.DoWhile:
                    var doWhileStatement = <TypeScript.DoWhileStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, doWhileStatement.body, true, null, false, true);
                    resultAST = this.getBreakpointInStatement(pos, doWhileStatement.cond, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.Switch:
                    var switchStatement = <TypeScript.SwitchStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, switchStatement.statement, true, resultAST, false, false);
                    // Loop through case statements and find the best one
                    var caseListCount = switchStatement.caseList.members.length;
                    var caseToUse: TypeScript.CaseStatement;
                    if (caseListCount > 0) {
                        var lastCase = switchStatement.caseList.members[caseListCount - 1];
                        if (pos >= lastCase.limChar) {
                            // Use last one if the character after last statement in the block
                            caseToUse = <TypeScript.CaseStatement>lastCase;
                            resultAST = this.getBreakpointInStatement(pos, caseToUse.body.members[0], false, resultAST, false, true);
                        } else {
                            caseToUse = <TypeScript.CaseStatement>switchStatement.caseList.members[0];
                            resultAST = this.getBreakpointInStatement(pos, caseToUse.body.members[0], false, resultAST, true, true);
                        }
                    }
                    break;

                case TypeScript.NodeType.Case:
                    var caseStatement = <TypeScript.CaseStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, caseStatement.body.members[0], false, null, false, true);
                    break;

                case TypeScript.NodeType.With:
                    var withStatement = <TypeScript.WithStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, withStatement.body, false, null, false, true);
                    break;

                case TypeScript.NodeType.Try:
                    var tryNode = <TypeScript.Try>cur;
                    resultAST = this.getBreakpointInStatement(pos, tryNode.body, false, null, false, true);
                    break;

                case TypeScript.NodeType.Catch:
                    var catchNode = <TypeScript.Catch>cur;
                    resultAST = this.getBreakpointInStatement(pos, catchNode.statement, true, null, false, false);
                    resultAST = this.getBreakpointInStatement(pos, catchNode.body, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.Finally:
                    var finallyNode = <TypeScript.Finally>cur;
                    resultAST = this.getBreakpointInStatement(pos, finallyNode, false, null, false, true);
                    break;

                case TypeScript.NodeType.TryCatch:
                    tryCatch = <TypeScript.TryCatch>cur;
                    resultAST = this.getBreakpointInStatement(pos, tryCatch.tryNode.body, true, null, false, true);
                    resultAST = this.getBreakpointInStatement(pos, tryCatch.catchNode.statement, true, resultAST, false, false);
                    resultAST = this.getBreakpointInStatement(pos, tryCatch.catchNode.body, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.TryFinally:
                    var tryFinally = <TypeScript.TryFinally>cur;
                    if (tryFinally.nodeType === TypeScript.NodeType.Try) {
                        resultAST = this.getBreakpointInStatement(pos, (<TypeScript.Try>tryFinally.tryNode).body, true, null, false, true);
                    } else {
                        tryCatch = <TypeScript.TryCatch>tryFinally.tryNode;
                        resultAST = this.getBreakpointInStatement(pos, tryCatch.tryNode.body, true, null, false, true);
                        resultAST = this.getBreakpointInStatement(pos, tryCatch.catchNode.statement, true, resultAST, false, false);
                        resultAST = this.getBreakpointInStatement(pos, tryCatch.catchNode.body, true, resultAST, false, true);
                    }
                    resultAST = this.getBreakpointInStatement(pos, tryFinally.finallyNode, false, resultAST, false, true);
                    break;

                default:
                    resultAST = cur;
                    break;
            }

            // If we have custom span check if it is better option
            if (TypeScript.isValidAstNode(customSpan) && pos >= customSpan.minChar && pos <= customSpan.limChar) {
                resultAST = customSpan;
            }

            // Use result AST to create span info
            if (resultAST) {
                var result = new SpanInfo(resultAST.minChar, resultAST.limChar);
                return result;
            }

            return null;
        }

        public getSignatureAtPosition(fileName: string, pos: number): SignatureInfo {
            this.refresh();

            var script = this.compilerState.getScriptAST(fileName);

            // If "pos" is the "EOF" position
            var atEOF = (pos === script.limChar);

            var path = this.getAstPathToPosition(script, pos);
            if (path.count() === 0)
                return null;

            // First check whether we are in a comment where quick info should not be displayed
            if (path.nodeType() === TypeScript.NodeType.Comment) {
                this.logger.log("position is inside a comment");
                return null;
            }

            var callExpr: TypeScript.CallExpression = null;  // assigned null to avoid definite assignment error
            while (path.count() >= 2) {
                // Path we are looking for...
                if (path.isArgumentListOfCall() || path.isArgumentListOfNew()) {
                    // The caret position should be *after* the opening "(" of the argument list
                    if (atEOF || pos > path.ast().minChar) {
                        path.pop();
                        callExpr = <TypeScript.CallExpression>path.pop();
                    }
                    break;
                }

                // Path that should make us stop looking up..
                if (pos > path.ast().minChar) {  // If cursor is on the "{" of the body, we may wat to display param help
                    if (path.ast().nodeType !== TypeScript.NodeType.Error && path.ast().nodeType !== TypeScript.NodeType.List) {
                        // only skip errors and lists that contain the caret position
                        break;
                    }
                }
                path.pop();
            }

            if (!callExpr || !callExpr.target || !callExpr.target.type) {
                this.logger.log("No call expression for the given position");
                return null;
            }

            if (callExpr.target.type === this.compilerState.anyType()) {
                this.logger.log("Call expression is of type 'any'");
                return null;
            }

            var sourceText = this.compilerState.getScriptSnapshot(fileName);
            var enclosingScopeContext = TypeScript.findEnclosingScopeAt(this.logger, script, sourceText, pos, /*isMemberCompletion*/false);
            if (enclosingScopeContext === null) {
                this.logger.log("No context found at the specified location.");
                return null;
            }

            var getNameFromSymbol = (symbol: TypeScript.Symbol) => {
                if (symbol != null && symbol.name != "_anonymous" /* see TypeChecker.anon*/) {
                    return symbol.name;
                }
                return "";
            }

            var getDocCommentFromSymbol = (symbol: TypeScript.Symbol) => {
                if (symbol != null) {
                    return TypeScript.Comment.getDocCommentText(symbol.getDocComments());
                }

                return "";
            }

            var convertSignatureGroupToSignatureInfo = (symbol: TypeScript.Symbol, isNew: bool, group: TypeScript.SignatureGroup) => {
                var result = new FormalSignatureInfo();
                result.isNew = false;
                result.name = getNameFromSymbol(symbol);
                result.docComment = getDocCommentFromSymbol(symbol);
                result.openParen = (group.flags & TypeScript.SignatureFlags.IsIndexer ? "[" : "(");
                result.closeParen = (group.flags & TypeScript.SignatureFlags.IsIndexer ? "]" : ")");

                var hasOverloads = group.signatures.length > 1;
                group.signatures
                    // Same test as in "typeFlow.str: resolveOverload()": filter out the definition signature if there are overloads
                    .filter(signature => !(hasOverloads && signature === group.definitionSignature && !this.compilerState.getCompilationSettings().canCallDefinitionSignature))
                    .forEach(signature => {
                        var signatureGroupInfo = new FormalSignatureItemInfo();
                        signatureGroupInfo.docComment = (signature.declAST != null) ? TypeScript.Comment.getDocCommentText(signature.declAST.getDocComments()) : "";
                        signatureGroupInfo.returnType = (signature.returnType === null ? "any" : signature.returnType.type.getScopedTypeName(enclosingScopeContext.getScope()));
                        signature.parameters.forEach((p, i) => {
                            var signatureParameterInfo = new FormalParameterInfo();
                            signatureParameterInfo.isVariable = (signature.hasVariableArgList) && (i === signature.parameters.length - 1);
                            signatureParameterInfo.isOptional = p.isOptional();
                            signatureParameterInfo.name = p.name;
                            signatureParameterInfo.docComment = p.getParameterDocComments();
                            signatureParameterInfo.type = p.getType().getScopedTypeName(enclosingScopeContext.getScope());
                            signatureGroupInfo.parameters.push(signatureParameterInfo);
                        });
                        result.signatureGroup.push(signatureGroupInfo);
                    });
                return result;
            };

            var convertCallExprToActualSignatureInfo = (ast: TypeScript.CallExpression, caretPosition: number): ActualSignatureInfo => {
                if (!TypeScript.isValidAstNode(ast))
                    return null;

                if (!TypeScript.isValidAstNode(ast.arguments))
                    return null;

                var result = new ActualSignatureInfo();
                result.currentParameter = -1;
                result.openParenMinChar = ast.arguments.minChar;
                result.closeParenLimChar = Math.max(ast.arguments.minChar, ast.arguments.limChar);
                ast.arguments.members.forEach((arg, index) => {
                    var parameter = new ActualParameterInfo();
                    parameter.minChar = arg.minChar;
                    parameter.limChar = Math.max(arg.minChar, arg.limChar);
                    result.parameters.push(parameter);
                });

                result.parameters.forEach((p, index) => {
                    var minChar = (index === 0 ? result.openParenMinChar : result.parameters[index - 1].limChar + 1);
                    var limChar = (index === result.parameters.length - 1 ? result.closeParenLimChar : result.parameters[index + 1].minChar);
                    if (caretPosition >= minChar && (atEOF ? caretPosition <= limChar : caretPosition < limChar)) {
                        result.currentParameter = index;
                    }
                });
                return result;
            };

            var getSignatureIndex = (ast: TypeScript.CallExpression, group: TypeScript.SignatureGroup) => {
                if (ast === null || group === null || group.signatures === null)
                    return -1;

                return group.signatures.indexOf(ast.signature);
            };

            var getTargetSymbolWithName = (callExpr: TypeScript.CallExpression) => {
                var sym: TypeScript.Symbol = null;
                if ((<any>callExpr.target).sym != null) {
                    sym = (<any>callExpr.target).sym;
                } else if (callExpr.target.type.symbol !== null) {
                    var sym = callExpr.target.type.symbol;
                }

                if (sym != null) {
                    if (sym.kind() === TypeScript.SymbolKind.Type &&
                        ((<TypeScript.TypeSymbol>sym).isMethod || (<TypeScript.TypeSymbol>sym).isClass() || (<TypeScript.TypeSymbol>sym).isFunction()) &&
                        (sym.name != null)) {
                        return sym;
                    }
                    else if (sym.kind() === TypeScript.SymbolKind.Parameter) {
                        return sym;
                    }
                    else if (sym.kind() === TypeScript.SymbolKind.Variable) {
                        return sym;
                    }
                    else if (sym.kind() === TypeScript.SymbolKind.Field) {
                        return sym;
                    }
                }

                return null;
            };
            
            var symbol = getTargetSymbolWithName(callExpr);
            var result = new SignatureInfo();
            if (callExpr.nodeType === TypeScript.NodeType.Call && callExpr.target.type.call !== null) {
                result.formal = convertSignatureGroupToSignatureInfo(symbol, /*isNew:*/false, callExpr.target.type.call);
                result.actual = convertCallExprToActualSignatureInfo(callExpr, pos);
                result.activeFormal = getSignatureIndex(callExpr, callExpr.target.type.call);
            }
            else if (callExpr.nodeType === TypeScript.NodeType.New && callExpr.target.type.construct !== null) {
                result.formal = convertSignatureGroupToSignatureInfo(symbol, /*isNew:*/true, callExpr.target.type.construct);
                result.actual = convertCallExprToActualSignatureInfo(callExpr, pos);
                result.activeFormal = getSignatureIndex(callExpr, callExpr.target.type.construct);
            }
            else if (callExpr.target.nodeType === TypeScript.NodeType.Super && callExpr.target.type.symbol && callExpr.target.type.symbol.declAST) {
                var classType = callExpr.target.type.symbol.declAST.type;
                if (classType && classType.construct !== null) {
                    result.formal = convertSignatureGroupToSignatureInfo(symbol, /*isNew:*/true, classType.construct);
                    result.actual = convertCallExprToActualSignatureInfo(callExpr, pos);
                    result.activeFormal = getSignatureIndex(callExpr, classType.construct);
                }
                else {
                    this.logger.log("No signature group found for the target class type constructor");
                    return null;
                }
            }
            else {
                this.logger.log("No signature group found for the target of the call expression");
                return null;
            }

            if (result.actual === null || result.formal === null || result.activeFormal === null) {
                this.logger.log("Can't compute actual and/or formal signature of the call expression");
                return null;
            }

            return result;
        }

        public getDefinitionAtPosition(fileName: string, pos: number): DefinitionInfo {
            this.refresh();

            var script = this.compilerState.getScriptAST(fileName);

            var sym = this.getSymbolAtPosition(script, pos);
            if (sym === null) {
                this.logger.log("No identifier at the specified location.");
                return null;
            }

            if (!TypeScript.isValidAstNode(sym.declAST)) {
                this.logger.log("No symbol location for identifier at the specified location.");
                return null;
            }

            var minChar = sym.declAST.minChar;
            var limChar = sym.declAST.limChar;

            return new DefinitionInfo(
                sym.fileName,
                minChar,
                limChar,
                this.getSymbolElementKind(sym),
                sym.name,
                this.getSymbolContainerKind(sym),
                this.getSymbolContainerName(sym),
                null);
        }

        // Given a script name and position in the script, return a string representing 
        // the desired smart indent text (assuming the line is empty).
        // Return "null" in case the smart indent cannot be determined.
        public getSmartIndentAtLineNumber(fileName: string, position: number, options: EditorOptions): number {
            this.minimalRefresh();
            
            var syntaxAST = this._getScriptSyntaxAST(fileName);

            // find line and col
            var lineNumber = position < 0 ? -1 : syntaxAST.getScript().locationInfo.lineMap.getLineNumberFromPosition(position);

            var manager = new Formatting.SmartIndentManager(syntaxAST, options);
            return manager.getSmartIndentAtLineNumber(lineNumber);
        }

        // Given a script name and position in the script, return a pair of text range if the 
        // position corresponds to a "brace matchin" characters (e.g. "{" or "(", etc.)
        // If the position is not on any range, return "null".
        public getBraceMatchingAtPosition(fileName: string, position: number): TypeScript.TextSpan[]{
            this.minimalRefresh();

            var syntaxAST = this._getScriptSyntaxAST(fileName);
            var manager = new BraceMatchingManager(syntaxAST);
            return this.textRangesToTextSpans(manager.getBraceMatchingAtPosition(position));
        }

        private textRangesToTextSpans(items: TextRange[]): TypeScript.TextSpan[]{
             if (!items) {
                return null;
            }

            var result: TypeScript.TextSpan[] = [];
            for (var i = 0; i < items.length; i++) {
                result.push(TypeScript.TextSpan.fromBounds(items[i].minChar, items[i].limChar));
            }

            return result;
        }

        private getFullNameOfSymbol(symbol: TypeScript.Symbol, enclosingScopeContext: TypeScript.EnclosingScopeContext) {
            if (symbol && symbol.container && symbol.container.declAST && symbol.container.declAST.nodeType === TypeScript.NodeType.FuncDecl) {
                var funcDecl = <TypeScript.FuncDecl>symbol.container.declAST;
                if (funcDecl.symbols.lookup(symbol.name) === symbol) {
                    return symbol.getPrettyName(enclosingScopeContext.getScope().container);
                }
            }

            if (symbol && symbol.kind() === TypeScript.SymbolKind.Type) {
                var typeSymbol = <TypeScript.TypeSymbol>symbol;
                if (typeSymbol.type && typeSymbol.type.symbol === symbol && typeSymbol.type.primitiveTypeClass != TypeScript.Primitive.None) {
                    // Primitive type symbols - do not use symbol name
                    return "";
                }
            }
            return symbol.fullName(enclosingScopeContext.getScope());
        }

        private getSymbolElementKind(sym: TypeScript.Symbol, scopeSymbol?: TypeScript.SymbolScope, useConstructorAsClass?: bool): string {
            if (!sym) {
                return ScriptElementKind.unknown;
            }

            if (sym.declAST === null) {
                return ScriptElementKind.keyword; // Predefined type (void, etc.)
            }

            var isLocal = () => {
                if (sym.container && sym.container.declAST && sym.container.declAST.nodeType === TypeScript.NodeType.FuncDecl) {
                    if (scopeSymbol && scopeSymbol.container === sym.container) {
                        return true;
                    }
                }
                return false;
            }

            var ast = sym.declAST;
            //var isMember = symbol.isMember() || symbol.container && 
            switch (ast.nodeType) {
                case TypeScript.NodeType.InterfaceDeclaration:
                    return ScriptElementKind.interfaceElement;

                case TypeScript.NodeType.ClassDeclaration:
                    return ScriptElementKind.classElement;

                case TypeScript.NodeType.ModuleDeclaration:
                    var moduleDecl = <TypeScript.ModuleDeclaration>ast;
                    var isEnum = moduleDecl.isEnum();
                    return isEnum ? ScriptElementKind.enumElement : ScriptElementKind.moduleElement;

                case TypeScript.NodeType.ImportDeclaration:
                    return ScriptElementKind.moduleElement;

                case TypeScript.NodeType.VarDecl:
                    var varDecl = <TypeScript.VarDecl>ast;
                    if (varDecl.isProperty()) {
                        return ScriptElementKind.memberVariableElement;
                    }
                    return isLocal() ? ScriptElementKind.localVariableElement : ScriptElementKind.variableElement;

                case TypeScript.NodeType.ArgDecl:
                    var argDecl = <TypeScript.ArgDecl>ast;
                    if (sym.kind() === TypeScript.SymbolKind.Parameter) {
                        return ScriptElementKind.parameterElement;
                    }
                    return (argDecl.isProperty() ? ScriptElementKind.memberVariableElement : ScriptElementKind.variableElement);

                case TypeScript.NodeType.FuncDecl:
                    var funcDecl = <TypeScript.FuncDecl>ast;
                    if (funcDecl.isGetAccessor()) {
                        return ScriptElementKind.memberGetAccessorElement;
                    }
                    else if (funcDecl.isSetAccessor()) {
                        return ScriptElementKind.memberSetAccessorElement;
                    }
                    else if (funcDecl.isCallMember()) {
                        return ScriptElementKind.callSignatureElement;
                    }
                    else if (funcDecl.isIndexerMember()) {
                        return ScriptElementKind.indexSignatureElement;
                    }
                    else if (funcDecl.isConstructMember()) {
                        return ScriptElementKind.constructSignatureElement;
                    }
                    else if (funcDecl.isConstructor) {
                        return useConstructorAsClass ? ScriptElementKind.classElement : ScriptElementKind.constructorImplementationElement;
                    }
                    else if (funcDecl.isMethod()) {
                        return ScriptElementKind.memberFunctionElement;
                    }
                    else if (isLocal()) {
                        return ScriptElementKind.localFunctionElement;
                    } else {
                        return ScriptElementKind.functionElement;
                    }

                default:
                    if (this.logger.warning()) {
                        this.logger.log("Warning: unrecognized AST node type: " + (<any>TypeScript.NodeType)._map[ast.nodeType]);
                    }
                    return ScriptElementKind.unknown;
            }
        }

        private getSymbolElementKindModifiers(sym: TypeScript.Symbol): string {
            if (sym.declAST === null) {
                return ScriptElementKindModifier.none; // Predefined type (void, etc.)
            }
            return this.getDeclNodeElementKindModifiers(sym.declAST);
        }

        private getSymbolContainerKind(sym: TypeScript.Symbol): string {
            return "";
        }

        private getSymbolContainerName(sym: TypeScript.Symbol): string {
            return sym.container === null ? "<global>" : sym.container.fullName();
        }

        public getReferencesAtPosition(fileName: string, pos: number): ReferenceEntry[] {
            this.refresh();

            var context = new GetReferencesContext();

            // Whole program scope
            var fileNames = this.compilerState.getFileNames();
            for (var i = 0, len = fileNames.length; i < len; i++) {
                context.scope.push(fileNames[i]);
            }

            return this.getReferencesForSourceLocation(context, fileName, pos);
        }

        public getOccurrencesAtPosition(fileName: string, pos: number): ReferenceEntry[] {
            this.refresh();

            var context = new GetReferencesContext();
            // Single source file scope
            context.scope.push(fileName);
            return this.getReferencesForSourceLocation(context, fileName, pos);
        }

        public getImplementorsAtPosition(fileName: string, position: number): ReferenceEntry[] {
            this.refresh();

            var script = this.compilerState.getScriptAST(fileName);
            var path = this.getIdentifierPathToPosition(script, position);
            if (path === null) {
                this.logger.log("No identifier at the specified location.");
                return [];
            }

            var name = <TypeScript.Identifier>path.ast();
            var sym = name.sym;
            if (sym === null) {
                this.logger.log("No symbol annotation on the identifier AST.");
                return [];
            }

            var collector = new OverridesCollector(this.getSymbolTree());
            var symbolSet = collector.findImplementors(sym);
            var references = new ReferenceEntrySet();
            symbolSet.getAll().forEach(x => { references.addSymbol(x); })
            return references.getEntries();
        }


        private getReferencesForSourceLocation(context: GetReferencesContext, fileName: string, position: number): ReferenceEntry[] {
            var script = this.compilerState.getScript(fileName);

            var path = this.getIdentifierPathToPosition(script, position);
            if (path === null) {
                this.logger.log("No identifier at the specified location.");
                return [];
            }

            var name = <TypeScript.Identifier>path.ast();
            var sym = name.sym;
            if (sym === null) {
                this.logger.log("No symbol annotation on the identifier AST.");
                return [];
            }

            return this.getReferencesForSymbol(context, sym);
        }

        private isWriteAccess(parent: TypeScript.AST, cur: TypeScript.AST) {
            var write: bool = false;
            if (parent !== null) {
                var pnt = parent.nodeType;
                switch (pnt) {
                    case TypeScript.NodeType.VarDecl:
                        if ((<TypeScript.VarDecl>parent).init != null) {
                            write = true;
                        }
                        break;
                    case TypeScript.NodeType.ArgDecl:
                        write = true;
                        break;
                    case TypeScript.NodeType.Asg:
                    case TypeScript.NodeType.AsgAdd:
                    case TypeScript.NodeType.AsgSub:
                    case TypeScript.NodeType.AsgMul:
                    case TypeScript.NodeType.AsgDiv:
                    case TypeScript.NodeType.AsgMod:
                    case TypeScript.NodeType.AsgOr:
                    case TypeScript.NodeType.AsgAnd:
                    case TypeScript.NodeType.AsgXor:
                    case TypeScript.NodeType.AsgLsh:
                    case TypeScript.NodeType.AsgRsh:
                    case TypeScript.NodeType.AsgRs2:
                        if ((<TypeScript.BinaryExpression>parent).operand1 === cur) {
                            write = true;
                        }
                        break;
                    case TypeScript.NodeType.IncPost:
                    case TypeScript.NodeType.IncPre:
                    case TypeScript.NodeType.DecPost:
                    case TypeScript.NodeType.DecPre:
                        write = true;
                        break;
                }
            }
            return write;
        }


        private getReferencesForSymbol(context: GetReferencesContext, sym: TypeScript.Symbol): ReferenceEntry[] {
            var collector = new OverridesCollector(this.getSymbolTree());
            var symbolSet = collector.findMemberOverrides(sym);
            var references = new ReferenceEntrySet();

            var match = (fileName: string, parent: TypeScript.AST, cur: TypeScript.AST) => {
                //logger.log("Found reference: " + unitIndex + ", " + ast.minChar);
                references.addAst(fileName, cur, this.isWriteAccess(parent, cur));
            }

            if (sym.kind() === TypeScript.SymbolKind.Field) {
                this.logger.log("getReferencesToField");
                this.getReferencesToField(context, symbolSet, match);
            }
            else if (sym.kind() === TypeScript.SymbolKind.Parameter) {
                this.logger.log("getReferencesToParameter");
                this.getReferencesToParameter(context, symbolSet, match);
            }
            else if (sym.kind() === TypeScript.SymbolKind.Type) {
                this.logger.log("getReferencesToType");
                this.getReferencesToType(context, symbolSet, match);
            }
            else if (sym.kind() === TypeScript.SymbolKind.Variable) {
                this.logger.log("getReferencesToVariable");
                this.getReferencesToVariable(context, symbolSet, match);
            }
            else {
                this.logger.log("No recognized symbol at the specified location (" + sym.kind() + ").");
            }

            return references.getEntries();
        }

        /// COMPLETION LISTS
        /// Get a string based representation of the completions 
        /// to provide at the given source position and providing a member completion 
        /// list if requested.
        /// * "isMemberCompletion" is set to true if the character on the left of "pos" is a "dot".
        ///   This corresponds to the "list members" completion list.
        /// * If set to false, "pos" is the caret location or the poisition of the first character of
        ///   the identifier at the caret location. This corresponds to the semantics of "complete word"
        ///   completion list.
        public getCompletionsAtPosition(fileName: string, pos: number, isMemberCompletion: bool): CompletionInfo {
            //this.minimalRefresh();
            this.refresh();

            var result = new CompletionInfo();
            result.maybeInaccurate = false;
            result.isMemberCompletion = isMemberCompletion;

            // Find the enclosing scope so we can parse the corresponding fragment
            var script = this.compilerState.getScriptAST(fileName);
            var sourceText = this.compilerState.getScriptSnapshot(fileName);
            var enclosingScopeContext = TypeScript.findEnclosingScopeAt(this.logger, script, sourceText, pos, isMemberCompletion);
            if (enclosingScopeContext === null) {
                this.logger.log("No context found at the specified location.");
                return result;
            }
            this.logger.log("Found scope context in up-to-date script AST: pos=" + pos + ", scopePos=" + enclosingScopeContext.getScopePosition());

            // Compute completion entries
            enclosingScopeContext.useFullAst = true;
            this.getCompletionsFromEnclosingScopeContext(enclosingScopeContext, result);
            return result;
        }

        private getDocCommentOfSymbol(symbol: TypeScript.Symbol) {
            if (!symbol) {
                return "";
            }

            var type = symbol.getType();
            if (type && type.isClass() && type.symbol.name === symbol.name) {
                return TypeScript.Comment.getDocCommentText(type.getDocComments());
            }


            if (symbol.declAST && symbol.declAST.nodeType === TypeScript.NodeType.FuncDecl && type.call && type.call.signatures.length > 1) {
                // Overload method - combine docComments from all the signatures
                return TypeScript.Comment.getDocCommentFirstOverloadSignature(type.call);
            }

            if (symbol.kind() === TypeScript.SymbolKind.Parameter) {
                // Its a parameter
                return (<TypeScript.ParameterSymbol>symbol).getParameterDocComments();
            }

            if (symbol.declAST && symbol.declAST.nodeType === TypeScript.NodeType.ArgDecl &&
                (<TypeScript.ArgDecl>symbol.declAST).isProperty()) {
                // Its a property that was defined as parameter to constructor
                return (<TypeScript.ParameterSymbol>(<TypeScript.ArgDecl>symbol.declAST).sym).getParameterDocComments();
            }


            return TypeScript.Comment.getDocCommentText(symbol.getDocComments());
        }

        private getCompletionsFromEnclosingScopeContext(enclosingScopeContext: TypeScript.EnclosingScopeContext, result: CompletionInfo): void {
            var getCompletions = (isMemberCompletion: bool) => {
                result.isMemberCompletion = isMemberCompletion;
                enclosingScopeContext.isMemberCompletion = isMemberCompletion;

                var entries = this.compilerState.getScopeEntries(enclosingScopeContext, true);
                entries.forEach(x => {
                    var entry = new CompletionEntry();
                    entry.name = x.name;
                    entry.type = x.type;
                    entry.kind = this.getSymbolElementKind(x.sym, enclosingScopeContext.getScope(), true);
                    entry.fullSymbolName = this.getFullNameOfSymbol(x.sym, enclosingScopeContext);
                    entry.docComment = this.getDocCommentOfSymbol(x.sym);
                    entry.kindModifiers = this.getSymbolElementKindModifiers(x.sym);
                    result.entries.push(entry);
                });
            };

            // We have an enclosing scope context, we can now compute the completion list.
            var scriptFragment = enclosingScopeContext.getScriptFragment();
            try {
                var path = this.getAstPathToPosition(scriptFragment,
                    enclosingScopeContext.pos - enclosingScopeContext.getScriptFragmentPosition(),
                    TypeScript.GetAstPathOptions.EdgeInclusive | TypeScript.GetAstPathOptions.DontPruneSearchBasedOnPosition);

                if (this.isCompletionListBlocker(path)) { 
                    this.logger.log("Returning an empty list because position is inside a comment");
                }
                // Special case for object literals
                else if (this.isObjectLiteralMemberNameCompletion(enclosingScopeContext)) {
                    this.logger.log("Completion list for members of object literal");
                    return getCompletions(true);
                }
                // Ensure we are in a position where it is ok to provide a completion list
                else if (enclosingScopeContext.isMemberCompletion || this.isCompletionListTriggerPoint(path)) {
                    return getCompletions(enclosingScopeContext.isMemberCompletion);
                }
                else {
                    this.logger.log("Returning an empty list because position is not a valid position for displaying a completion list");
                }
            }
            finally {
                this.compilerState.cleanASTTypesForReTypeCheck(scriptFragment);
            }
        }

        private isObjectLiteralMemberNameCompletion(enclosingScopeContext: TypeScript.EnclosingScopeContext): bool {
            if (enclosingScopeContext.enclosingObjectLit === null)
                return false;

            if (enclosingScopeContext.isMemberCompletion)
                return false;

            var objectLit = enclosingScopeContext.enclosingObjectLit;
            var script = enclosingScopeContext.script;
            var pos = enclosingScopeContext.pos

            // We want to show the list of object literal members if either
            // 1) we are inside an empty object literal
            // 2) we are on the name node of a member of an object literal
            // 3) we are outside of any expression of any member of an object literal
            if (!TypeScript.isValidAstNode(objectLit))
                return false;

            if (!TypeScript.isValidAstNode(objectLit.operand))
                return false;

            if (objectLit.operand.nodeType !== TypeScript.NodeType.List)
                return false;

            var memberList = <TypeScript.ASTList>objectLit.operand;
            var isInsideList = (memberList.minChar < pos && pos < memberList.limChar);
            if (!isInsideList)
                return false;

            // Empty list always means member completion
            if (memberList.members.length === 0) {
                return true;
            }

            var syntaxAST = new ScriptSyntaxAST(this.logger, script, enclosingScopeContext.text);
            var tokenStream = new TokenStreamHelper(syntaxAST.getTokenStream(memberList.minChar, memberList.limChar));

            var nameAreaMinChar = tokenStream.tokenEndPos();
            var isNameArea = false;
            var cancelSearch = false;

            if (!tokenStream.expect(TypeScript.TokenID.OpenBrace))
                return false;

            memberList.members.forEach((x, i) => {
                if (cancelSearch)
                    return;

                if (x.nodeType !== TypeScript.NodeType.Member) {
                    nameAreaMinChar = -1;
                    return;
                }

                var member = <TypeScript.BinaryExpression>x;
                if (!TypeScript.isValidAstNode(member.operand1)) {
                    nameAreaMinChar = -1;
                    return;
                }

                if (nameAreaMinChar < 0)
                    nameAreaMinChar = member.operand1.minChar;

                if (!tokenStream.skipToOffset(member.operand1.limChar)) {
                    nameAreaMinChar = -1;
                    cancelSearch = true;
                    return;
                }

                if (tokenStream.tokenId() !== TypeScript.TokenID.Colon) {
                    nameAreaMinChar = -1;
                    return;
                }

                if ((nameAreaMinChar) >= 0 && (nameAreaMinChar <= pos) && (pos <= tokenStream.tokenStartPos())) {
                    isNameArea = true;
                    cancelSearch = true;
                    return;
                }

                // Reposition nameAreaMinChar to the end of the member expression
                nameAreaMinChar = -1;
                if (TypeScript.isValidAstNode(member.operand2)) {
                    if (tokenStream.skipToOffset(member.operand2.limChar)) {
                        if (tokenStream.tokenId() === TypeScript.TokenID.Comma) {
                            nameAreaMinChar = tokenStream.tokenEndPos();
                            tokenStream.moveNext(); // skip comma
                        }
                    }
                }
            });

            if (nameAreaMinChar < 0)
                return false;

            if (isNameArea)
                return true;

            if (tokenStream.tokenId() !== TypeScript.TokenID.CloseBrace)
                return false;

            return (nameAreaMinChar <= pos) && (pos <= tokenStream.tokenStartPos());
        }

        private isCompletionListBlocker(path: TypeScript.AstPath): bool {
            var asts = path.asts;

            var isNodeType = (nodeType: TypeScript.NodeType) => {
                return (path.count() >= 1) &&
                    (path.ast().nodeType === nodeType);
            };

            if (isNodeType(TypeScript.NodeType.Comment)
                || isNodeType(TypeScript.NodeType.Regex)
                || isNodeType(TypeScript.NodeType.QString)
                ) {
                return true;
            }

            return false;
        }

        private isCompletionListTriggerPoint(path: TypeScript.AstPath): bool {
            var asts = path.asts;

            var isNodeType = (nodeType: TypeScript.NodeType) => {
                return (path.count() >= 1) &&
                    (path.ast().nodeType === nodeType);
            };

            var isDecl = (nodeType: TypeScript.NodeType) => {
                if (isNodeType(nodeType))
                    return true;

                if (asts.length > 1 &&
                    (asts[asts.length - 2].nodeType === nodeType) &&
                    (asts[asts.length - 1].nodeType === TypeScript.NodeType.Name))
                    return true;

                return false;
            };

            if (path.isNameOfVariable() // var <here>
                || path.isNameOfFunction() // function <here>
                || path.isNameOfArgument() // function foo(a<here>
                || path.isArgumentListOfFunction() // function foo(<here>
                || path.isNameOfInterface() // interface <here>
                || path.isNameOfClass() // class <here>
                || path.isNameOfModule() // module <here>
                ) {
                return false;
            }

            if (isNodeType(TypeScript.NodeType.Member) // class C() { property <here>
                || isNodeType(TypeScript.NodeType.TryCatch) // try { } catch(<here>
                || isNodeType(TypeScript.NodeType.Catch) // try { } catch(<here>
                //|| isNodeType(Tools.NodeType.Class) // doesn't work
                || isNodeType(TypeScript.NodeType.Comment)
                || isNodeType(TypeScript.NodeType.Regex)
                || isNodeType(TypeScript.NodeType.QString)
                ) {
                return false
            }

            return true;
        }

        public getFormattingEditsForRange(fileName: string, minChar: number, limChar: number, options: FormatCodeOptions): TextEdit[] {
            this.minimalRefresh();

            // Ensure rules are initialized and up to date wrt to formatting options
            this.formattingRulesProvider.ensureUptodate(options);

            var syntaxAST = this._getScriptSyntaxAST(fileName);
            var manager = new Formatting.FormattingManager(syntaxAST, this.formattingRulesProvider, options);
            var result = manager.FormatSelection(minChar, limChar);

            if (this.logger.information()) {
                this.logFormatCodeOptions(options);
                this.logEditResults(syntaxAST, result)
            }

            return result;
        }

        public getFormattingEditsForDocument(fileName: string, minChar: number, limChar: number, options: FormatCodeOptions): TextEdit[] {
            this.minimalRefresh();
            // Ensure rules are initialized and up to date wrt to formatting options
            this.formattingRulesProvider.ensureUptodate(options);

            var syntaxAST = this._getScriptSyntaxAST(fileName);
            var manager = new Formatting.FormattingManager(syntaxAST, this.formattingRulesProvider, options);
            var result = manager.FormatDocument(minChar, limChar);

            if (this.logger.information()) {
               this.logEditResults(syntaxAST, result)
            }

            return result;
        }

        public getFormattingEditsOnPaste(fileName: string, minChar: number, limChar: number, options: FormatCodeOptions): TextEdit[] {
            this.minimalRefresh();
            // Ensure rules are initialized and up to date wrt to formatting options
            this.formattingRulesProvider.ensureUptodate(options);

            var syntaxAST = this._getScriptSyntaxAST(fileName);
            var manager = new Formatting.FormattingManager(syntaxAST, this.formattingRulesProvider, options);
            var result = manager.FormatOnPaste(minChar, limChar);

            if (this.logger.information()) {
               this.logEditResults(syntaxAST, result)
            }

            return result;
        }

        public getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions): TextEdit[] {
            this.minimalRefresh();

            // Ensure rules are initialized and up to date wrt to formatting options
            this.formattingRulesProvider.ensureUptodate(options);

            var syntaxAST: Services.ScriptSyntaxAST;
            var manager: Formatting.FormattingManager;

            if (key === "}") {
                syntaxAST = this._getScriptSyntaxAST(fileName);
                manager = new Formatting.FormattingManager(syntaxAST, this.formattingRulesProvider, options);
                return manager.FormatOnClosingCurlyBrace(position);
            }
            else if (key === ";") {
                syntaxAST = this._getScriptSyntaxAST(fileName);
                manager = new Formatting.FormattingManager(syntaxAST, this.formattingRulesProvider, options);
                return manager.FormatOnSemicolon(position);
            }
            else if (key === "\n") {
                syntaxAST = this._getScriptSyntaxAST(fileName);
                manager = new Formatting.FormattingManager(syntaxAST, this.formattingRulesProvider, options);
                return manager.FormatOnEnter(position);
            }
            return []; //TextEdit.createInsert(minChar, "/* format was invoked here!*/")];
        }

        public getNavigateToItems(searchValue: string): NavigateToItem[] {
            this.refresh();

            var i = 0;
            var len = 0;

            // Split search value in terms array
            var terms = searchValue.split(" ");
            for (i = 0; i < terms.length; i++) {
                terms[i] = terms[i].trim().toLocaleLowerCase();
            }

            var match = (ast: TypeScript.AST, parent: TypeScript.AST, name: string): string => {
                name = name.toLocaleLowerCase();
                for (i = 0; i < terms.length; i++) {
                    var term = terms[i];
                    if (name === term)
                        return MatchKind.exact;
                    if (name.indexOf(term) === 0)
                        return MatchKind.prefix;
                    if (name.indexOf(term) > 0)
                        return MatchKind.subString;
                }
                return null;
            }

            var result: NavigateToItem[] = [];

            // Process all script ASTs and look for matchin symbols
            var fileNames = this.compilerState.getFileNames();
            for (i = 0, len = fileNames.length; i < len; i++) {
                // Add the item for the script name if needed
                var fileName = fileNames[i];
                var script = this.compilerState.getScript(fileName);
                var fileName = script.locationInfo.fileName;
                var matchKind = match(null, script, fileName);
                if (matchKind != null) {
                    var item = new NavigateToItem();
                    item.name = fileName;
                    item.matchKind = matchKind;
                    item.kind = ScriptElementKind.scriptElement;
                    item.fileName = fileName;
                    item.minChar = script.minChar;
                    item.limChar = script.limChar;
                    result.push(item);
                }

                var items = this.getASTItems(fileName, script, match);
                for (var j = 0; j < items.length; j++) {
                    result.push(items[j]);
                }
            }
            return result;
        }

        public getScriptLexicalStructure(fileName: string): NavigateToItem[] {
            this.refresh();

            var script = this.compilerState.getScriptAST(fileName);
            return this.getASTItems(script.locationInfo.fileName, script, (name) => MatchKind.exact);
        }

        /// Outlining
        ///
        public getOutliningRegions(fileName: string): TypeScript.TextSpan[] {
            this.refresh();

            var script = this.compilerState.getScriptAST(fileName);

            var maxLim = (current: number, ...asts: TypeScript.AST[]) => {
                var maxLim1 = (current: number, asts: TypeScript.AST[]) => {
                    var result = current;
                    for (var i = 0; i < asts.length; i++) {
                        var ast = asts[i];
                        if (ast != null && ast.limChar != 0 && ast.limChar > result) {
                            result = ast.limChar;
                        }
                    }
                    return result;
                }

                var result = maxLim1(current, asts);
                for (var i = 0; i < asts.length; i++) {
                    var ast = asts[i];
                    if (ast != null && ast.nodeType === TypeScript.NodeType.List) {
                        result = maxLim1(result, (<TypeScript.ASTList>ast).members);
                    }
                }
                return result;
            }

            var findMinChar = (parent: TypeScript.AST, ast: TypeScript.AST) => {
                var result = ast.minChar;
                switch (ast.nodeType) {
                    case TypeScript.NodeType.FuncDecl:
                        result = maxLim(result, (<TypeScript.FuncDecl>ast).name, (<TypeScript.FuncDecl>ast).arguments, (<TypeScript.FuncDecl>ast).returnTypeAnnotation);
                        break

                    case TypeScript.NodeType.ModuleDeclaration:
                        result = maxLim(result, (<TypeScript.ModuleDeclaration>ast).name);
                        break;

                    case TypeScript.NodeType.ClassDeclaration:
                        result = maxLim(result, (<TypeScript.ClassDeclaration>ast).name, (<TypeScript.ClassDeclaration>ast).extendsList, (<TypeScript.ClassDeclaration>ast).implementsList);
                        break;

                    case TypeScript.NodeType.InterfaceDeclaration:
                        result = maxLim(result, (<TypeScript.InterfaceDeclaration>ast).name, (<TypeScript.InterfaceDeclaration>ast).extendsList, (<TypeScript.InterfaceDeclaration>ast).implementsList);
                        break;
                }

                //logger.log("findMinChar(" + Tools.NodeType._map[ast.nodeType] + ")=" + result + " (instead of " + ast.minChar + ")");
                return result;
            }

            var findLimChar = (parent: TypeScript.AST, ast: TypeScript.AST) => {
                return ast.limChar;
            }

            var match = (parent: TypeScript.AST, ast: TypeScript.AST, name: string) => {
                switch (ast.nodeType) {
                    case TypeScript.NodeType.FuncDecl:
                        if ((<TypeScript.FuncDecl>ast).bod === null)
                            return MatchKind.none;
                    //fall through
                    case TypeScript.NodeType.ClassDeclaration:
                    case TypeScript.NodeType.ModuleDeclaration:
                    case TypeScript.NodeType.InterfaceDeclaration:
                        return MatchKind.exact;

                    default:
                        return null;
                }
            }

            return this.navigateToItemsToTextSpans(this.getASTItems(script.locationInfo.fileName, script, match, findMinChar, findLimChar));
        }

        private navigateToItemsToTextSpans(items: NavigateToItem[]): TypeScript.TextSpan[]{
            if (!items) {
                return null;
            }

            var result: TypeScript.TextSpan[] = [];
            for (var i = 0; i < items.length; i++) {
                result.push(TypeScript.TextSpan.fromBounds(items[i].minChar, items[i].limChar));
            }

            return result;
        }

        /// Emit
        public getEmitOutput(fileName: string): IOutputFile[] {
            this.refresh();

            return this.compilerState.getEmitOutput(fileName);
        }

        private getTypeInfoAtPosition(pos: number, script: TypeScript.Script, constructorIsValid?: bool): TypeInfoAtPosition {
            var result: TypeInfoAtPosition = null;

            var callExpr: TypeScript.CallExpression[] = [];
            var createTypeInfoAtPosition = (minChar: number, limChar: number, ast: TypeScript.AST,
                type: TypeScript.Type, forceNew?: bool) => {
                var typeInfoAtPosition = <TypeInfoAtPosition>{
                    spanInfo: new SpanInfo(minChar, limChar),
                    ast: ast
                }
                if (callExpr.length > 0) {
                    var curCallExpr = callExpr[callExpr.length - 1];
                    if (curCallExpr.target.type === type) {
                        typeInfoAtPosition.callSignature = curCallExpr.signature;
                        typeInfoAtPosition.isNew = forceNew || curCallExpr.nodeType === TypeScript.NodeType.New;
                    }
                }
                return typeInfoAtPosition;
            }

            var pre = (cur: TypeScript.AST, parent: TypeScript.AST): TypeScript.AST => {
                if (TypeScript.isValidAstNode(cur)) {
                    if (pos >= cur.minChar && pos < cur.limChar) {
                        switch (cur.nodeType) {
                            case TypeScript.NodeType.Call:
                            case TypeScript.NodeType.New:
                                var curCallExpr = <TypeScript.CallExpression>cur;
                                if (pos >= curCallExpr.target.minChar && pos < curCallExpr.target.limChar) {
                                    callExpr.push(curCallExpr);
                                }
                                break;

                            case TypeScript.NodeType.Dot:
                                // Dotted expression
                                if (result === null) {
                                    result = createTypeInfoAtPosition(cur.minChar, cur.limChar, cur, cur.type);
                                }
                                break;

                            case TypeScript.NodeType.Name:
                                // If it was the first thing we found, use it directly
                                // Its a dotted expression, use the current end as the end of our span
                                result = createTypeInfoAtPosition(result === null ? cur.minChar : result.spanInfo.minChar, cur.limChar, cur,
                                    (<TypeScript.Identifier>cur).sym ? (<TypeScript.Identifier>cur).sym.getType() : cur.type);
                                result.symbol = (<TypeScript.Identifier>cur).sym;
                                break;

                            case TypeScript.NodeType.FuncDecl:
                                var funcDecl = <TypeScript.FuncDecl>cur;
                                if (constructorIsValid && funcDecl.constructorSpan && pos >= funcDecl.constructorSpan.minChar && pos < funcDecl.constructorSpan.limChar) {
                                    result = {
                                        spanInfo: new SpanInfo(funcDecl.constructorSpan.minChar, funcDecl.constructorSpan.limChar),
                                        ast: cur,
                                        callSignature: funcDecl.signature,
                                        isNew: true
                                    };
                                }
                                break;

                            case TypeScript.NodeType.Super:
                                result = createTypeInfoAtPosition(cur.minChar, cur.limChar, cur, cur.type, true);
                                result.symbol = cur.type.symbol;
                                break;

                            case TypeScript.NodeType.QString:
                            case TypeScript.NodeType.This:
                                result = createTypeInfoAtPosition(cur.minChar, cur.limChar, cur, cur.type);
                                break;
                        }
                    } else if (result && callExpr.length > 0) {
                        var curCallExpr = callExpr[callExpr.length - 1];
                        if (curCallExpr.target.minChar >= cur.minChar && curCallExpr.target.minChar < cur.limChar) {
                            result.callSignature = null;
                        }
                    }
                }
                return cur;
            }

            var post = (cur: TypeScript.AST, parent: TypeScript.AST) => {
                var callExprLength = callExpr.length;
                if (callExprLength > 0 && callExpr[callExprLength - 1] === parent) {
                    callExpr.pop();
                }
                
                return cur;
            }

            TypeScript.getAstWalkerFactory().walk(script, pre, post);
            return result;
        }

        private getReferencesToField(context: GetReferencesContext, symbolSet: Services.SymbolSet, match: (fileName: string, parent: TypeScript.AST, cur: TypeScript.AST) => void ) {
            var fieldMatch = (fileName: string, parent: TypeScript.AST, cur: TypeScript.AST) => {
                if (cur.nodeType === TypeScript.NodeType.Name) {
                    match(fileName, parent, cur);
                }
            }
            return this.getReferencesToSymbolSet(context, symbolSet, fieldMatch);
        }

        private getReferencesToType(context: GetReferencesContext, symbolSet: Services.SymbolSet, match: (fileName: string, parent: TypeScript.AST, cur: TypeScript.AST) => void ) {
            var typeMatch = (fileName: string, parent: TypeScript.AST, cur: TypeScript.AST) => {
                if (cur.nodeType === TypeScript.NodeType.Name) {
                    match(fileName, parent, cur);
                }
            }
            return this.getReferencesToSymbolSet(context, symbolSet, typeMatch);
        }

        private getReferencesToParameter(context: GetReferencesContext, symbolSet: Services.SymbolSet, match: (fileName: string, parent: TypeScript.AST, cur: TypeScript.AST) => void ) {
            var parameterMatch = (fileName: string, parent: TypeScript.AST, cur: TypeScript.AST) => {
                if (cur.nodeType === TypeScript.NodeType.Name) {
                    match(fileName, parent, cur);
                }
            }
            //TODO: Limit search to scope of function defining the parameter
            return this.getReferencesToSymbolSet(context, symbolSet, parameterMatch);
        }

        private getReferencesToVariable(context: GetReferencesContext, symbolSet: Services.SymbolSet, match: (fileName: string, parent: TypeScript.AST, cur: TypeScript.AST) => void ) {
            var variableMatch = (fileName: string, parent: TypeScript.AST, cur: TypeScript.AST) => {
                if (cur.nodeType === TypeScript.NodeType.Name) {
                    match(fileName, parent, cur);
                }
            }
            //TODO: Limit search to scope of function defining the variable
            return this.getReferencesToSymbolSet(context, symbolSet, variableMatch);
        }

        private getReferencesToSymbolSet(context: GetReferencesContext, symbolSet: Services.SymbolSet, match: (fileName: string, parent: TypeScript.AST, cur: TypeScript.AST) => void ): void {
            var processScript = (fileName: string) => {
                var pre = (cur: TypeScript.AST, parent: TypeScript.AST): TypeScript.AST => {
                    if (TypeScript.isValidAstNode(cur)) {
                        var sym = (<any>cur).sym;
                        if (sym != null && symbolSet.contains(sym)) {
                            match(fileName, parent, cur);
                        }
                    }
                    return cur;
                }

                TypeScript.getAstWalkerFactory().walk(this.compilerState.getScript(fileName), pre);
                //this.compilerState.getScript(unitIndex).walk(pre, null, null, new Tools.BaseWalkContext());
            }

            for (var i = 0, len = context.scope.length; i < len; i++) {
                processScript(context.scope[i]);
            }
        }

        //
        // Return the comma separated list of modifers (from the ScriptElementKindModifier list of constants) 
        // of an AST node referencing a known declaration kind.
        //
        private getDeclNodeElementKindModifiers(ast: TypeScript.AST): string {
            var addModifier = (result: string, testValue: bool, value: string): string => {
                if (!testValue)
                    return result;

                if (result === ScriptElementKindModifier.none) {
                    return value;
                }
                else {
                    return result + "," + value;
                }
            }

            var typeDeclToKindModifiers = (decl: TypeScript.InterfaceDeclaration): string => {
                var result = ScriptElementKindModifier.none;
                result = addModifier(result, decl.isExported(), ScriptElementKindModifier.exportedModifier);
                result = addModifier(result, decl.isAmbient(), ScriptElementKindModifier.ambientModifier);
                return result;
            }

            var classDeclToKindModifiers = (decl: TypeScript.ClassDeclaration): string => {
                var result = ScriptElementKindModifier.none;
                result = addModifier(result, decl.isExported(), ScriptElementKindModifier.exportedModifier);
                result = addModifier(result, decl.isAmbient(), ScriptElementKindModifier.ambientModifier);
                return result;
            }

            var moduleDeclToKindModifiers = (decl: TypeScript.ModuleDeclaration): string => {
                var result = ScriptElementKindModifier.none;
                result = addModifier(result, decl.isExported(), ScriptElementKindModifier.exportedModifier);
                result = addModifier(result, decl.isAmbient(), ScriptElementKindModifier.ambientModifier);
                return result;
            }

            var varDeclToKindModifiers = (decl: TypeScript.VarDecl): string => {
                var result = ScriptElementKindModifier.none;
                result = addModifier(result, decl.isExported(), ScriptElementKindModifier.exportedModifier);
                result = addModifier(result, decl.isAmbient(), ScriptElementKindModifier.ambientModifier);
                result = addModifier(result, decl.isPublic(), ScriptElementKindModifier.publicMemberModifier);
                result = addModifier(result, decl.isPrivate(), ScriptElementKindModifier.privateMemberModifier);
                result = addModifier(result, decl.isStatic(), ScriptElementKindModifier.staticModifier);
                return result;
            }

            var argDeclToKindModifiers = (decl: TypeScript.ArgDecl): string => {
                var result = ScriptElementKindModifier.none;
                result = addModifier(result, decl.isPublic(), ScriptElementKindModifier.publicMemberModifier);
                result = addModifier(result, decl.isPrivate(), ScriptElementKindModifier.privateMemberModifier);
                return result;
            }

            var funcDeclToKindModifiers = (decl: TypeScript.FuncDecl): string => {
                var result = ScriptElementKindModifier.none;
                result = addModifier(result, decl.isExported(), ScriptElementKindModifier.exportedModifier);
                result = addModifier(result, decl.isAmbient(), ScriptElementKindModifier.ambientModifier);
                result = addModifier(result, decl.isPublic(), ScriptElementKindModifier.publicMemberModifier);
                result = addModifier(result, decl.isPrivate(), ScriptElementKindModifier.privateMemberModifier);
                result = addModifier(result, decl.isStatic(), ScriptElementKindModifier.staticModifier);
                return result;
            }

            switch (ast.nodeType) {
                case TypeScript.NodeType.InterfaceDeclaration:
                    var typeDecl = <TypeScript.InterfaceDeclaration>ast;
                    return typeDeclToKindModifiers(typeDecl);

                case TypeScript.NodeType.ClassDeclaration:
                    var classDecl = <TypeScript.ClassDeclaration>ast;
                    return classDeclToKindModifiers(classDecl);

                case TypeScript.NodeType.ModuleDeclaration:
                    var moduleDecl = <TypeScript.ModuleDeclaration>ast;
                    return moduleDeclToKindModifiers(moduleDecl);

                case TypeScript.NodeType.VarDecl:
                    var varDecl = <TypeScript.VarDecl>ast;
                    return varDeclToKindModifiers(varDecl);

                case TypeScript.NodeType.ArgDecl:
                    var argDecl = <TypeScript.ArgDecl>ast;
                    return argDeclToKindModifiers(argDecl);

                case TypeScript.NodeType.FuncDecl:
                    var funcDecl = <TypeScript.FuncDecl>ast;
                    return funcDeclToKindModifiers(funcDecl);

                default:
                    if (this.logger.warning()) {
                        this.logger.log("Warning: unrecognized AST node type: " + (<any>TypeScript.NodeType)._map[ast.nodeType]);
                    }
                    return ScriptElementKindModifier.none;
            }
        }

        private getASTItems(
            fileName: string,
            ast: TypeScript.AST,
            match: (parent: TypeScript.AST, ast: TypeScript.AST, name: string) => string,
            findMinChar?: (parent: TypeScript.AST, ast: TypeScript.AST) => number,
            findLimChar?: (parent: TypeScript.AST, ast: TypeScript.AST) => number): NavigateToItem[] {

            if (findMinChar === null) {
                findMinChar = (parent, ast) => {
                    return ast.minChar;
                }
            }

            if (findLimChar === null) {
                findLimChar = (parent, ast) => {
                    return ast.limChar;
                }
            }

            var context = new NavigateToContext();
            context.fileName = fileName;

            var addItem = (parent: TypeScript.AST, ast: TypeScript.AST, name: string, kind: string): NavigateToItem => {
                // Compiler generated nodes have no positions (e.g. the "_map" of an enum)
                if (!TypeScript.isValidAstNode(ast))
                    return null;

                var matchKind = match(parent, ast, name);
                var minChar = findMinChar(parent, ast);
                var limChar = findLimChar(parent, ast)
                if (matchKind != null && minChar >= 0 && limChar >= 0 && limChar >= minChar) {
                    var item = new NavigateToItem();
                    item.name = name;
                    item.matchKind = matchKind;
                    item.kind = kind;
                    item.kindModifiers = this.getDeclNodeElementKindModifiers(ast);
                    item.fileName = context.fileName;
                    item.minChar = minChar;
                    item.limChar = limChar;
                    item.containerName = (TypeScript.lastOf(context.containerSymbols) === null ? "" : TypeScript.lastOf(context.containerSymbols).fullName());
                    item.containerKind = TypeScript.lastOf(context.containerKinds) === null ? "" : TypeScript.lastOf(context.containerKinds);
                    return item;
                }
                return null;
            }

            var getLimChar = (ast: TypeScript.AST): number => {
                return (ast === null ? -1 : ast.limChar);
            }

            var pre = (ast: TypeScript.AST, parent: TypeScript.AST, walker: TypeScript.IAstWalker) => {
                context.path.push(ast);

                if (!TypeScript.isValidAstNode(ast))
                    return ast;

                var item: NavigateToItem = null;

                switch (ast.nodeType) {
                    case TypeScript.NodeType.InterfaceDeclaration: {
                        var typeDecl = <TypeScript.InterfaceDeclaration>ast;
                        item = addItem(parent, typeDecl, typeDecl.name.actualText, ScriptElementKind.interfaceElement);
                        context.containerASTs.push(ast);
                        context.containerSymbols.push(typeDecl.type.symbol);
                        context.containerKinds.push("interface");
                    }
                        break;

                    case TypeScript.NodeType.ClassDeclaration: {
                        var classDecl = <TypeScript.ClassDeclaration>ast;
                        item = addItem(parent, classDecl, classDecl.name.actualText, ScriptElementKind.classElement);
                        context.containerASTs.push(ast);
                        context.containerSymbols.push(classDecl.type.symbol);
                        context.containerKinds.push("class");
                    }
                        break;

                    case TypeScript.NodeType.ModuleDeclaration: {
                        var moduleDecl = <TypeScript.ModuleDeclaration>ast;
                        var isEnum = moduleDecl.isEnum();
                        var kind = isEnum ? ScriptElementKind.enumElement : ScriptElementKind.moduleElement;
                        item = addItem(parent, moduleDecl, moduleDecl.name.actualText, kind);
                        context.containerASTs.push(ast);
                        context.containerSymbols.push(moduleDecl.mod.symbol);
                        context.containerKinds.push(kind);
                    }
                        break;

                    case TypeScript.NodeType.VarDecl: {
                        var varDecl = <TypeScript.VarDecl>ast;
                        if (varDecl.id !== null) {
                            if (varDecl.isProperty()) {
                                item = addItem(parent, varDecl, varDecl.id.actualText, ScriptElementKind.memberVariableElement);
                            }
                            else if (context.path.isChildOfScript() || context.path.isChildOfModule()) {
                                item = addItem(parent, varDecl, varDecl.id.actualText, ScriptElementKind.variableElement);
                            }
                        }
                    }
                        walker.options.goChildren = false;
                        break;

                    case TypeScript.NodeType.ArgDecl: {
                        var argDecl = <TypeScript.ArgDecl>ast;
                        // Argument of class constructor are members (variables or properties)
                        if (argDecl.id !== null) {
                            if (context.path.isArgumentOfClassConstructor()) {
                                if (argDecl.isProperty()) {
                                    item = addItem(parent, argDecl, argDecl.id.actualText, ScriptElementKind.memberVariableElement);
                                }
                            }
                        }
                    }
                        walker.options.goChildren = false;
                        break;

                    case TypeScript.NodeType.FuncDecl: {
                        var funcDecl = <TypeScript.FuncDecl>ast;
                        var kind: string = null;
                        var name: string = (funcDecl.name !== null ? funcDecl.name.actualText : null);
                        if (funcDecl.isGetAccessor()) {
                            kind = ScriptElementKind.memberGetAccessorElement;
                        }
                        else if (funcDecl.isSetAccessor()) {
                            kind = ScriptElementKind.memberSetAccessorElement;
                        }
                        else if (funcDecl.isCallMember()) {
                            kind = ScriptElementKind.callSignatureElement;
                            name = "()";
                        }
                        else if (funcDecl.isIndexerMember()) {
                            kind = ScriptElementKind.indexSignatureElement;
                            name = "[]";
                        }
                        else if (funcDecl.isConstructMember()) {
                            kind = ScriptElementKind.constructSignatureElement;
                            name = "new()";
                        }
                        else if (funcDecl.isConstructor) {
                            kind = ScriptElementKind.constructorImplementationElement;
                            name = "constructor";
                        }
                        else if (funcDecl.isMethod()) {
                            kind = ScriptElementKind.memberFunctionElement;
                        }
                        else if (context.path.isChildOfScript() || context.path.isChildOfModule()) {
                            kind = ScriptElementKind.functionElement;
                        }

                        if (kind !== null && name !== null) {
                            item = addItem(parent, funcDecl, name, kind);
                        }
                    }
                        break;

                    case TypeScript.NodeType.ObjectLit:
                        walker.options.goChildren = false;
                        break;
                }

                if (item !== null) {
                    context.result.push(item);
                }

                return ast;
            }

            var post = (ast: TypeScript.AST, parent: TypeScript.AST) => {
                context.path.pop();

                if (ast === TypeScript.lastOf(context.containerASTs)) {
                    context.containerASTs.pop();
                    context.containerSymbols.pop();
                    context.containerKinds.pop();
                }
                return ast;
            }

            TypeScript.getAstWalkerFactory().walk(ast, pre, post);
            return context.result;
        }

        ///
        /// Return the stack of AST nodes containing "position"
        ///
        public getAstPathToPosition(script: TypeScript.AST, pos: number, options = TypeScript.GetAstPathOptions.Default): TypeScript.AstPath {
            if (this.logger.information()) {
                this.logger.log("getAstPathToPosition(" + script + ", " + pos + ")");
            }

            return TypeScript.getAstPathToPosition(script, pos, options);
        }

        public getIdentifierPathToPosition(script: TypeScript.AST, pos: number): TypeScript.AstPath {
            this.logger.log("getIdentifierPathToPosition(" + script + ", " + pos + ")");

            var path = this.getAstPathToPosition(script, pos, TypeScript.GetAstPathOptions.EdgeInclusive);
            if (path.count() === 0)
                return null;

            if (path.nodeType() !== TypeScript.NodeType.Name) {
                return null;
            }

            return path;
        }

        public getSymbolAtPosition(script: TypeScript.AST, pos: number): TypeScript.Symbol {
            this.logger.log("getSymbolAtPosition(" + script + ", " + pos + ")");

            var path = this.getAstPathToPosition(script, pos);
            if (path.count() === 0)
                return null;

            var finalAST = <any>path.ast();
            if (finalAST === null)
                return null;

            //var preFinalAST = asts.length > 0 && asts[asts.length - 2];
            if (finalAST.sym) {
                return finalAST.sym;
            }
            if (finalAST.nodeType === TypeScript.NodeType.Dot && finalAST.operand2.sym) {
                return finalAST.operand2.sym;
            }
            if (finalAST.signature && finalAST.signature.returnType && finalAST.signature.returnType.type && finalAST.signature.returnType.type.symbol) {
                return finalAST.signature.returnType.type.symbol;
            }
            if (finalAST.type && finalAST.type.symbol) {
                return finalAST.type.symbol;
            }

            return null;
        }

        private logFormatCodeOptions(options: FormatCodeOptions) {
            if (this.logger.information()) {
                this.logger.log("options.InsertSpaceAfterCommaDelimiter=" + options.InsertSpaceAfterCommaDelimiter);
                this.logger.log("options.InsertSpaceAfterSemicolonInForStatements=" + options.InsertSpaceAfterSemicolonInForStatements);
                this.logger.log("options.InsertSpaceBeforeAndAfterBinaryOperators=" + options.InsertSpaceBeforeAndAfterBinaryOperators);
                this.logger.log("options.InsertSpaceAfterKeywordsInControlFlowStatements=" + options.InsertSpaceAfterKeywordsInControlFlowStatements);
                this.logger.log("options.InsertSpaceAfterFunctionKeywordForAnonymousFunctions=" + options.InsertSpaceAfterFunctionKeywordForAnonymousFunctions);
                this.logger.log("options.InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis=" + options.InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis);
                this.logger.log("options.PlaceOpenBraceOnNewLineForFunctions=" + options.PlaceOpenBraceOnNewLineForFunctions);
                this.logger.log("options.PlaceOpenBraceOnNewLineForControlBlocks=" + options.PlaceOpenBraceOnNewLineForControlBlocks);
            }
        }

        private logEditResults(syntaxAST: ScriptSyntaxAST, result: Services.TextEdit[]) {
            if (this.logger.information()) {
                var logSourceText = (text: string) => {
                    var textLines = text.replace(/^\s+|\s+$/g, "").replace(/\r\n?/g, "\n").split(/\n/);
                    for (var i = 0; i < textLines.length; i++) {
                        var textLine = textLines[i];
                        var msg = "line #" + i + "(length=" + textLine.length + "): \"" + textLine + "\"";
                        this.logger.log(msg);
                    }
                }

                var sourceText = syntaxAST.getScriptSnapshot();
                logSourceText(sourceText.getText(0, sourceText.getLength()));
                for (var i = 0; i < result.length; i++) {
                    var edit = result[i];
                    var oldSourceText = sourceText.getText(edit.minChar, edit.limChar);
                    var text = "edit #" + i + ": minChar=" + edit.minChar + ", " +
                        "limChar=" + edit.limChar + ", " +
                        "oldText=\"" + TypeScript.stringToLiteral(oldSourceText, 30) + "\", " +
                        "textLength=" + edit.text.length + ", " +
                        "text=\"" + TypeScript.stringToLiteral(edit.text, 30) + "\"";
                    this.logger.log(text);
                }
            }
        }
    }
}
