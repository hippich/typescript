
// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='references.ts' />


module TypeScript.Services {
    export class LanguageService implements ILanguageService {
        private logger: TypeScript.ILogger;
        private compiler: LanguageServiceCompiler;
        private _syntaxTreeCache: SyntaxTreeCache;
        private formattingRulesProvider: TypeScript.Services.Formatting.RulesProvider;

        private activeCompletionSession: CompletionSession = null;        
        private cancellationToken: CancellationToken;

        constructor(public host: ILanguageServiceHost, documentRegistry: IDocumentRegistry) {
            this.logger = this.host;
            this.cancellationToken = new CancellationToken(this.host.getCancellationToken());
            this.compiler = new LanguageServiceCompiler(this.host, documentRegistry, this.cancellationToken);
            this._syntaxTreeCache = new SyntaxTreeCache(this.host);

            // Check if the localized messages json is set, otherwise query the host for it
            if (!TypeScript.LocalizedDiagnosticMessages) {
                TypeScript.LocalizedDiagnosticMessages = this.host.getLocalizedDiagnosticMessages();
            }
        }

        public dispose() {
            this.compiler.dispose();
        }

        public cleanupSemanticCache(): void {
            this.compiler.cleanupSemanticCache();
        }

        public refresh(): void {
            // No-op.  Only kept around for compatability with the interface we shipped.
        }

        private getSemanticInfoChain(): SemanticInfoChain {
            return this.compiler.getSemanticInfoChain();
        }

        private getSymbolInfoAtPosition(fileName: string, pos: number, requireName: boolean): { symbol: TypeScript.PullSymbol; containingASTOpt: TypeScript.ISyntaxElement } {
            var document = this.compiler.getDocument(fileName);
            var sourceUnit = document.sourceUnit();

            /// TODO: this does not allow getting references on "constructor"
            var topNode = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, pos);
            return this.getSymbolInfoAtAST(document, topNode, pos, requireName);
        }

        private getSymbolInfoAtAST(document: Document, topNode: ISyntaxElement, pos: number, requireName: boolean): { symbol: TypeScript.PullSymbol; containingASTOpt: TypeScript.ISyntaxElement } {
            if (topNode === null || (requireName && topNode.kind() !== TypeScript.SyntaxKind.IdentifierName)) {
                this.logger.log("No name found at the given position");
                return null;
            }

            // Store the actual name before calling getSymbolInformationFromPath

            var symbolInfoAtPosition = this.compiler.getSymbolInformationFromAST(topNode, document);
            if (symbolInfoAtPosition === null || (symbolInfoAtPosition.symbol === null && symbolInfoAtPosition.aliasSymbol)) {
                this.logger.log("No symbol found at the given position");
                // only single reference
                return { symbol: null, containingASTOpt: null };
            }

            var symbol = symbolInfoAtPosition.aliasSymbol || symbolInfoAtPosition.symbol;
            var symbolName = symbol.getName();

            // if we are not looking for any but we get an any symbol, then we ran into a wrong symbol
            if (requireName) {
                var actualNameAtPosition = tokenValueText(<TypeScript.ISyntaxToken>topNode);

                if ((symbol.isError() || symbol.isAny()) && actualNameAtPosition !== symbolName) {
                    this.logger.log("Unknown symbol found at the given position");
                    // only single reference
                    return { symbol: null, containingASTOpt: null };
                }
            }

            var containingASTOpt = this.getSymbolScopeAST(symbol, topNode);

            return { symbol: symbol, containingASTOpt: containingASTOpt };
        }

        public getReferencesAtPosition(fileName: string, pos: number): ReferenceEntry[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var symbolAndContainingAST = this.getSymbolInfoAtPosition(fileName, pos, /*requireName:*/ true);
            if (symbolAndContainingAST === null) {
                // Didn't even have a name at that position.
                return [];
            }

            if (symbolAndContainingAST.symbol === null) {
                // Had a name, but couldn't bind it to anything.
                return this.getSingleNodeReferenceAtPosition(fileName, pos);
            }

            var result: ReferenceEntry[] = [];
            var symbol = symbolAndContainingAST.symbol;
            var symbolName = symbol.getName();
            var containingASTOpt = symbolAndContainingAST.containingASTOpt;

            var fileNames = this.compiler.fileNames();
            for (var i = 0, n = fileNames.length; i < n; i++) {
                this.cancellationToken.throwIfCancellationRequested();

                var tempFileName = fileNames[i];

                if (containingASTOpt && fileName != tempFileName) {
                    continue;
                }

                var tempDocument = this.compiler.getDocument(tempFileName);
                var filter = tempDocument.bloomFilter();

                if (filter.probablyContains(symbolName)) {
                    result = result.concat(this.getReferencesInFile(tempFileName, symbol, containingASTOpt));
                }
            }

            return result;
        }

        private getSymbolScopeAST(symbol: TypeScript.PullSymbol, ast: TypeScript.ISyntaxElement): TypeScript.ISyntaxElement {
            if (symbol.kind === TypeScript.PullElementKind.TypeParameter &&
                symbol.getDeclarations().length > 0 &&
                symbol.getDeclarations()[0].getParentDecl() &&
                symbol.getDeclarations()[0].getParentDecl().kind === TypeScript.PullElementKind.Method) {

                // The compiler shares class method type parameter symbols.  So if we get one, 
                // scope our search down to the method ast so we don't find other hits elsewhere.
                while (ast) {
                    if (ast.kind() === TypeScript.SyntaxKind.FunctionDeclaration ||
                        ast.kind() === TypeScript.SyntaxKind.MemberFunctionDeclaration) {
                        return ast;
                    }

                    ast = ast.parent;
                }
            }

            // Todo: we could add more smarts about things like local variables and parameters here.
            return null;
        }

        public getOccurrencesAtPosition(fileName: string, pos: number): ReferenceEntry[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var symbolAndContainingAST = this.getSymbolInfoAtPosition(fileName, pos, /*requireName:*/ true);
            if (symbolAndContainingAST === null) {
                // Didn't even have a name at that position.
                return [];
            }

            if (symbolAndContainingAST.symbol === null) {
                // Had a name, but couldn't bind it to anything.
                return this.getSingleNodeReferenceAtPosition(fileName, pos);
            }

            var symbol = symbolAndContainingAST.symbol;
            var containingASTOpt = symbolAndContainingAST.containingASTOpt;

            return this.getReferencesInFile(fileName, symbol, containingASTOpt);
        }

        private getSingleNodeReferenceAtPosition(fileName: string, position: number): ReferenceEntry[] {
            var document = this.compiler.getDocument(fileName);
            var sourceUnit = document.sourceUnit();

            var node = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, position);
            if (node === null || node.kind() !== TypeScript.SyntaxKind.IdentifierName) {
                return [];
            }

            var isWriteAccess = this.isWriteAccess(node);
            return [new ReferenceEntry(this._getHostFileName(fileName), TextSpan.fromBounds(start(node), end(node)), isWriteAccess)];
        }

        public getImplementorsAtPosition(fileName: string, pos: number): ReferenceEntry[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var result: ReferenceEntry[] = [];

            var document = this.compiler.getDocument(fileName);
            var sourceUnit = document.sourceUnit();

            var ast = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, pos);
            if (ast === null || ast.kind() !== TypeScript.SyntaxKind.IdentifierName) {
                this.logger.log("No identifier at the specified location.");
                return result;
            }

            // Store the actual name before calling getSymbolInformationFromPath
            var actualNameAtPosition = tokenValueText(<TypeScript.ISyntaxToken>ast);

            var symbolInfoAtPosition = this.compiler.getSymbolInformationFromAST(ast, document);
            var symbol = symbolInfoAtPosition.symbol;

            if (symbol === null) {
                this.logger.log("No symbol annotation on the identifier ISyntaxElement.");
                return result;
            }

            var symbolName: string = symbol.getName();

            // if we are not looking for any but we get an any symbol, then we ran into a wrong symbol
            if ((symbol.isError() || symbol.isAny()) && actualNameAtPosition !== symbolName) {
                this.logger.log("Unknown symbol found at the given position");
                return result;
            }

            var typeSymbol: TypeScript.PullTypeSymbol = symbol.type;
            var typesToSearch: TypeScript.PullTypeSymbol[];

            if (typeSymbol.isClass() || typeSymbol.isInterface()) {
                typesToSearch = typeSymbol.getTypesThatExtendThisType();
            }
            else if (symbol.kind == TypeScript.PullElementKind.Property || typeSymbol.isMethod() || typeSymbol.isProperty()) {

                var declaration: TypeScript.PullDecl = symbol.getDeclarations()[0];
                var classSymbol: TypeScript.PullTypeSymbol = declaration.getParentDecl().getSymbol(symbol.semanticInfoChain).type;

                typesToSearch = [];
                var extendingTypes = classSymbol.getTypesThatExtendThisType();
                var extendedTypes = classSymbol.getExtendedTypes();
                extendingTypes.forEach(type => {
                    var overrides = this.getOverrides(type, symbol);
                    overrides.forEach(override => {
                        typesToSearch.push(override);
                    });
                });
                extendedTypes.forEach(type => {
                    var overrides = this.getOverrides(type, symbol);
                    overrides.forEach(override => {
                        typesToSearch.push(override);
                    });
                });
            }

            if (typesToSearch) {
                var fileNames = this.compiler.fileNames();
                for (var i = 0, n = fileNames.length; i < n; i++) {
                    var tempFileName = fileNames[i];

                    var tempDocument = this.compiler.getDocument(tempFileName);
                    var filter = tempDocument.bloomFilter();

                    typesToSearch.forEach(typeToSearch => {
                        var symbolName: string = typeToSearch.getName();
                        if (filter.probablyContains(symbolName)) {
                            result = result.concat(this.getImplementorsInFile(tempFileName, typeToSearch));
                        }
                    });
                }
            }
            return result;
        }

        public getOverrides(container: TypeScript.PullTypeSymbol, memberSym: TypeScript.PullSymbol): TypeScript.PullTypeSymbol[] {
            var result: TypeScript.PullTypeSymbol[] = [];
            var members: TypeScript.PullSymbol[];
            if (container.isClass()) {
                members = container.getMembers();
            }
            else if (container.isInterface()) {
                members = container.getMembers();
            }

            if (members == null)
                return null;

            members.forEach(member => {
                var typeMember = <TypeScript.PullTypeSymbol>member;
                if (typeMember.getName() === memberSym.getName()) {
                    // Not currently checking whether static-ness matches: typeMember.isStatic() === memberSym.isStatic() or whether
                    //  typeMember.isMethod() === memberSym.isMethod() && typeMember.isProperty() === memberSym.isProperty()
                    result.push(typeMember);
                }
            });

            return result;
        }

        private getImplementorsInFile(fileName: string, symbol: TypeScript.PullTypeSymbol): ReferenceEntry[] {
            var result: ReferenceEntry[] = [];
            var symbolName = symbol.getDisplayName();

            var possiblePositions = this.getPossibleSymbolReferencePositions(fileName, symbolName);
            if (possiblePositions && possiblePositions.length > 0) {
                var document = this.compiler.getDocument(fileName);
                var sourceUnit = document.sourceUnit();

                possiblePositions.forEach(p => {
                    var nameAST = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, p);
                    if (nameAST === null || nameAST.kind() !== TypeScript.SyntaxKind.IdentifierName) {
                        return;
                    }
                    var searchSymbolInfoAtPosition = this.compiler.getSymbolInformationFromAST(nameAST, document);
                    if (searchSymbolInfoAtPosition !== null) {

                        var normalizedSymbol: TypeScript.PullSymbol;
                        if (symbol.kind === TypeScript.PullElementKind.Class || symbol.kind === TypeScript.PullElementKind.Interface) {
                            normalizedSymbol = searchSymbolInfoAtPosition.symbol.type;
                        }
                        else {
                            var declaration = searchSymbolInfoAtPosition.symbol.getDeclarations()[0];
                            normalizedSymbol = declaration.getSymbol(symbol.semanticInfoChain);
                        }

                        if (normalizedSymbol === symbol) {
                            var isWriteAccess = this.isWriteAccess(nameAST);

                            result.push(new ReferenceEntry(this._getHostFileName(fileName),
                                TextSpan.fromBounds(start(nameAST), end(nameAST)), isWriteAccess));
                        }
                    }
                });
            }

            return result;
        }

        private getReferencesInFile(fileName: string, symbol: TypeScript.PullSymbol, containingASTOpt: TypeScript.ISyntaxElement): ReferenceEntry[] {
            var result: ReferenceEntry[] = [];
            var symbolName = symbol.getDisplayName();

            var possiblePositions = this.getPossibleSymbolReferencePositions(fileName, symbolName);
            if (possiblePositions && possiblePositions.length > 0) {
                var document = this.compiler.getDocument(fileName);
                var sourceUnit = document.sourceUnit();

                possiblePositions.forEach(p => {
                    this.cancellationToken.throwIfCancellationRequested();
                    // If it's not in the bounds of the ISyntaxElement we're asking for, then this can't possibly be a hit.
                    if (containingASTOpt && (p < start(containingASTOpt) || p > end(containingASTOpt))) {
                        return;
                    }

                    // Each position we're searching for should be at the start of an identifier.  
                    // As such, we useTrailingTriviaAsLimChar=false so that the position doesn't
                    // accidently return another node (which may end at that position).
                    var nameAST = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, p, /*useTrailingTriviaAsLimChar:*/ false);

                    // Compare the length so we filter out strict superstrings of the symbol we are looking for
                    if (nameAST === null || nameAST.kind() !== TypeScript.SyntaxKind.IdentifierName || (end(nameAST) - start(nameAST) !== symbolName.length)) {
                        return;
                    }

                    var symbolInfoAtPosition = this.compiler.getSymbolInformationFromAST(nameAST, document);
                    if (symbolInfoAtPosition !== null) {
                        var searchSymbol = symbolInfoAtPosition.aliasSymbol || symbolInfoAtPosition.symbol;

                        if (FindReferenceHelpers.compareSymbolsForLexicalIdentity(searchSymbol, symbol)) {
                            var isWriteAccess = this.isWriteAccess(nameAST);
                            result.push(new ReferenceEntry(this._getHostFileName(fileName), TextSpan.fromBounds(start(nameAST), end(nameAST)), isWriteAccess));
                        }
                    }
                });
            }

            return result;
        }

        private isWriteAccess(current: TypeScript.ISyntaxElement): boolean {
            var parent = current.parent;
            if (parent !== null) {
                var parentNodeType = parent.kind();
                switch (parentNodeType) {
                    case TypeScript.SyntaxKind.ClassDeclaration:
                        return (<TypeScript.ClassDeclarationSyntax>parent).identifier === current;

                    case TypeScript.SyntaxKind.InterfaceDeclaration:
                        return (<TypeScript.InterfaceDeclarationSyntax>parent).identifier === current;

                    case TypeScript.SyntaxKind.ModuleDeclaration:
                        return (<TypeScript.ModuleDeclarationSyntax>parent).name === current || (<TypeScript.ModuleDeclarationSyntax>parent).stringLiteral === current;

                    case TypeScript.SyntaxKind.FunctionDeclaration:
                        return (<TypeScript.FunctionDeclarationSyntax>parent).identifier === current;

                    case TypeScript.SyntaxKind.ImportDeclaration:
                        return (<TypeScript.ImportDeclarationSyntax>parent).identifier === current;

                    case TypeScript.SyntaxKind.VariableDeclarator:
                        var varDeclarator = <TypeScript.VariableDeclaratorSyntax>parent;
                        return !!(varDeclarator.equalsValueClause && varDeclarator.propertyName === current);

                    case TypeScript.SyntaxKind.Parameter:
                        return true;

                    case TypeScript.SyntaxKind.AssignmentExpression:
                    case TypeScript.SyntaxKind.AddAssignmentExpression:
                    case TypeScript.SyntaxKind.SubtractAssignmentExpression:
                    case TypeScript.SyntaxKind.MultiplyAssignmentExpression:
                    case TypeScript.SyntaxKind.DivideAssignmentExpression:
                    case TypeScript.SyntaxKind.ModuloAssignmentExpression:
                    case TypeScript.SyntaxKind.OrAssignmentExpression:
                    case TypeScript.SyntaxKind.AndAssignmentExpression:
                    case TypeScript.SyntaxKind.ExclusiveOrAssignmentExpression:
                    case TypeScript.SyntaxKind.LeftShiftAssignmentExpression:
                    case TypeScript.SyntaxKind.UnsignedRightShiftAssignmentExpression:
                    case TypeScript.SyntaxKind.SignedRightShiftAssignmentExpression:
                        return (<TypeScript.BinaryExpressionSyntax>parent).left === current;

                    case TypeScript.SyntaxKind.PreIncrementExpression:
                    case TypeScript.SyntaxKind.PostIncrementExpression:
                        return true;

                    case TypeScript.SyntaxKind.PreDecrementExpression:
                    case TypeScript.SyntaxKind.PostDecrementExpression:
                        return true;
                }
            }

            return false;
        }

        private isLetterOrDigit(char: number): boolean {
            return (char >= TypeScript.CharacterCodes.a && char <= TypeScript.CharacterCodes.z) ||
                (char >= TypeScript.CharacterCodes.A && char <= TypeScript.CharacterCodes.Z) ||
                (char >= TypeScript.CharacterCodes._0 && char <= TypeScript.CharacterCodes._9) ||
                char === TypeScript.CharacterCodes._ ||
                char === TypeScript.CharacterCodes.$ ||
                (char > 127 && TypeScript.Unicode.isIdentifierPart(char, TypeScript.LanguageVersion.EcmaScript5));
        }

        private getPossibleSymbolReferencePositions(fileName: string, symbolName: string): number[] {
            var positions: number[] = [];

            /// TODO: Cache symbol existence for files to save text search
            // Also, need to make this work for unicode escapes.

            // Be reseliant in the face of a symbol with no name or zero length name
            if (!symbolName || !symbolName.length) {
                return positions;
            }

            var sourceText = this.compiler.getScriptSnapshot(fileName);

            var sourceLength = sourceText.getLength();
            var text = sourceText.getText(0, sourceLength);
            var symbolNameLength = symbolName.length;

            var position = text.indexOf(symbolName);
            while (position >= 0) {
                this.cancellationToken.throwIfCancellationRequested();
                // We found a match.  Make sure it's not part of a larger word (i.e. the char 
                // before and after it have to be a non-identifier char).
                var endPosition = position + symbolNameLength;

                if ((position <= 0 || !this.isLetterOrDigit(text.charCodeAt(position - 1))) &&
                    (endPosition >= sourceLength || !this.isLetterOrDigit(text.charCodeAt(endPosition)))) {

                    // Found a real match.  Keep searching.  
                    positions.push(position);
                }

                position = text.indexOf(symbolName, position + symbolNameLength + 1);
            }

            return positions;
        }

        private charAtIndex(document: Document, index: number): number {
            var scriptSnapshot = document.scriptSnapshot;

            if (index < 0 || index >= scriptSnapshot.getLength()) {
                return null;
            }

            return scriptSnapshot.getText(index, index + 1).charCodeAt(0);
        }

        private recoverExpressionWithArgumentList(document: Document, openParenIndex: number): IExpressionWithArgumentListSyntax {
            var sourceUnit = document.sourceUnit();

            var token = findToken(sourceUnit, openParenIndex);
            if (token && start(token) === openParenIndex && token.kind() === SyntaxKind.OpenParenToken &&
                token.parent && token.parent.parent &&
                token.parent.kind() === SyntaxKind.ArgumentList) {

                if (token.parent.parent.kind() === SyntaxKind.InvocationExpression ||
                    token.parent.parent.kind() === SyntaxKind.ObjectCreationExpression) {

                    return <IExpressionWithArgumentListSyntax>token.parent.parent;
                }
            }

            return null;
        }

        public getSignatureHelpCurrentArgumentState(fileName: string, position: number, applicableSpanStart: number): SignatureHelpState {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var document = this.compiler.getDocument(fileName);
            var openCharIndex = applicableSpanStart;

            var char = this.charAtIndex(document, openCharIndex);
            if (char === CharacterCodes.lessThan) {
                // TODO: handle generics.
                return null;
            }
            else if (char === CharacterCodes.openParen) {
                var expressionWithArgumentList = this.recoverExpressionWithArgumentList(document, openCharIndex);
                var argumentList = expressionWithArgumentList.argumentList;

                if (position < end(argumentList.openParenToken)) {
                    return null;
                }

                var closeToken = argumentList.closeParenToken;
                if (closeToken.fullWidth() > 0 &&
                    position > start(closeToken)) {
                    return null;
                }

                var index = 0;
                for (var i = 0, n = argumentList.arguments.separators.length; i < n; i++) {
                    var separator = argumentList.arguments.separators[i];

                    if (position >= end(separator)) {
                        index++;
                    }
                }

                var count = expressionWithArgumentList.argumentList.arguments.separatorCount();
                return new SignatureHelpState(index, count);
            }

            return null;
        }

        private getSignatureHelpApplicableSpan(document: Document, applicableSpanStart: number): TextSpan {

            var scriptSnapshot = document.scriptSnapshot;
            var openCharIndex = applicableSpanStart;

            var char = this.charAtIndex(document, openCharIndex);
            if (char === CharacterCodes.lessThan) {
                // TODO: handle generics.
                return null;
            }
            else if (char === CharacterCodes.openParen) {
                var expressionWithArgumentList = this.recoverExpressionWithArgumentList(document, openCharIndex);
                var lastToken = expressionWithArgumentList.argumentList.closeParenToken;
                if (lastToken.fullWidth() !== 0) {
                    // invocation has a close paren.  The span that we want to pass back is from 
                    // the start of the invocation itself, to the start of the close paren token.
                    return TextSpan.fromBounds(start(expressionWithArgumentList.argumentList.openParenToken), start(lastToken));
                }

                // we're missing the close paren.  The span should be up to the start of the next 
                // token (or the end of the document if there is no next token).
                var nextToken = TypeScript.nextToken(TypeScript.lastToken(expressionWithArgumentList));
                var end = nextToken === null ? scriptSnapshot.getLength() : start(nextToken);

                return TextSpan.fromBounds(start(expressionWithArgumentList.argumentList.openParenToken), end);
            }

            return null;
        }

        public getSignatureHelpItems(fileName: string, position: number): SignatureHelpItems {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var document = this.compiler.getDocument(fileName);

            if (SignatureInfoHelpers.isSignatureHelpBlocker(document.syntaxTree().sourceUnit(), position)) {
                this.logger.log("position is not a valid singature help location");
                return null;
            }

            // Second check if we are inside a generic parameter
            var genericTypeArgumentListInfo = SignatureInfoHelpers.isInPartiallyWrittenTypeArgumentList(document.syntaxTree(), position);
            if (genericTypeArgumentListInfo) {
                // The expression could be messed up because we are parsing a partial generic expression, so set the search path to a place where we know it
                // can find a call expression

                return null;
                // return this.getSignatureHelpItemsFromPartiallyWrittenTypeArgumentList(document, position, genericTypeArgumentListInfo);
            }

            // Third set the path to find ask the type system about the call expression
            var sourceUnit = document.sourceUnit();
            var node = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, position);
            if (!node) {
                return null;
            }

            // Find call expression
            while (node) {
                if (node.kind() === TypeScript.SyntaxKind.InvocationExpression ||
                    node.kind() === TypeScript.SyntaxKind.ObjectCreationExpression ||  // Valid call or new expressions
                    (isSignatureHelpBlocker(node) && position > start(node))) // Its a declaration node - call expression cannot be in parent scope
                {
                    break;
                }

                node = node.parent;
            }

            if (!node) {
                return null;
            }

            if (node.kind() !== TypeScript.SyntaxKind.InvocationExpression && node.kind() !== TypeScript.SyntaxKind.ObjectCreationExpression) {
                this.logger.log("No call expression or generic arguments found for the given position");
                return null;
            }

            var callExpression = <TypeScript.Services.IExpressionWithArgumentListSyntax>node;
            var isNew = callExpression.kind() === TypeScript.SyntaxKind.ObjectCreationExpression;

            if (isNew && callExpression.argumentList === null) {
                this.logger.log("No signature help for a object creation expression without arguments");
                return null;
            }

            TypeScript.Debug.assert(callExpression.argumentList.arguments !== null, "Expected call expression to have arguments, but it did not");

            var argumentsStart = end(callExpression.argumentList.openParenToken);
            var argumentsEnd = callExpression.argumentList.closeParenToken.fullWidth() > 0
                ? start(callExpression.argumentList.closeParenToken)
                : fullEnd(callExpression.argumentList);

            if (position < argumentsStart || position > argumentsEnd) {
                this.logger.log("Outside argument list");
                return null;
            }

            // Resolve symbol
            var callSymbolInfo = this.compiler.getCallInformationFromAST(node, document);
            if (!callSymbolInfo || !callSymbolInfo.targetSymbol || !callSymbolInfo.resolvedSignatures) {
                this.logger.log("Could not find symbol for call expression");
                return null;
            }

            // We use the start of the argument list as the 'id' for this signature help item so 
            // that we can try to recover it later on when we get subsequent sig help questions.
            var applicableSpanStart = start(callExpression.argumentList.openParenToken);

            // Build the result
            var items = SignatureInfoHelpers.getSignatureInfoFromSignatureSymbol(
                callSymbolInfo.targetSymbol, callSymbolInfo.resolvedSignatures, callSymbolInfo.enclosingScopeSymbol, this.compiler);

            var selectedItemIndex = callSymbolInfo.resolvedSignatures && callSymbolInfo.candidateSignature
                ? callSymbolInfo.resolvedSignatures.indexOf(callSymbolInfo.candidateSignature) 
                : 0;

            if (items === null || items.length === 0) {
                this.logger.log("Can't compute actual and/or formal signature of the call expression");
                return null;
            }

            return new SignatureHelpItems(items, this.getSignatureHelpApplicableSpan(document, applicableSpanStart), selectedItemIndex);
        }

        //private getSignatureHelpItemsFromPartiallyWrittenTypeArgumentList(document: TypeScript.Document, position: number, genericTypeArgumentListInfo: IPartiallyWrittenTypeArgumentListInformation): SignatureHelpItems {
        //    var sourceUnit = document.sourceUnit();

        //    // Get the identifier information
        //    var ast = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, genericTypeArgumentListInfo.genericIdentifer.start());
        //    if (ast === null || ast.kind() !== TypeScript.SyntaxKind.IdentifierName) {
        //        this.logger.log(["getTypeParameterSignatureAtPosition: Unexpected ast found at position:", position, ast === null ? "ast was null" : "ast kind: " + SyntaxKind[ast.kind()]].join(' '));
        //        return null;
        //    }

        //    var symbolInformation = this.compiler.getSymbolInformationFromAST(ast, document);

        //    if (!symbolInformation.symbol) {
        //        return null;
        //    }

        //    // TODO: are we in an new expression?
        //    var isNew = SignatureInfoHelpers.isTargetOfObjectCreationExpression(genericTypeArgumentListInfo.genericIdentifer);

        //    var typeSymbol = symbolInformation.symbol.type;

        //    if (typeSymbol.kind === TypeScript.PullElementKind.FunctionType ||
        //        (isNew && typeSymbol.kind === TypeScript.PullElementKind.ConstructorType)) {

        //        var signatures = isNew ? typeSymbol.getConstructSignatures() : typeSymbol.getCallSignatures();

        //        // Build the result
        //        var items = SignatureInfoHelpers.getSignatureInfoFromSignatureSymbol(symbolInformation.symbol, signatures, symbolInformation.enclosingScopeSymbol, this.compiler);
        //        if (items === null || items.length === 0) {
        //            return null;
        //        }

        //        return new SignatureHelpItems(items, 0);
        //    }
        //    else if (typeSymbol.isGeneric()) {
        //        // The symbol is a generic type

        //        // Get the class symbol for constuctor symbol
        //        if (typeSymbol.kind === TypeScript.PullElementKind.ConstructorType) {
        //            typeSymbol = typeSymbol.getAssociatedContainerType();
        //        }

        //        // Build the result
        //        var items = SignatureInfoHelpers.getSignatureInfoFromGenericSymbol(typeSymbol, symbolInformation.enclosingScopeSymbol, this.compiler);
        //        if (items === null || items.length === 0) {
        //            return null;
        //        }

        //        return new SignatureHelpItems(items, 0);
        //    }

        //    // Nothing to handle
        //    return null;
        //}

        public getRenameInfo(fileName: string, position: number): RenameInfo {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var symbolInfo = this.getSymbolInfoAtPosition(fileName, position, /*requireName:*/ true);
            if (symbolInfo === null) {
                return RenameInfo.CreateError(TypeScript.getDiagnosticMessage(DiagnosticCode.You_must_rename_an_identifier, null));
            }

            if (symbolInfo.symbol === null) {
                return RenameInfo.CreateError(TypeScript.getDiagnosticMessage(DiagnosticCode.You_cannot_rename_this_element, null));
            }

            var document = this.compiler.getDocument(fileName);
            var sourceUnit = document.sourceUnit();

            var topNode = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, position);

            var definitions = this.getDefinitionAtPosition(fileName, position);
            if (definitions === null || definitions.length === 0) {
                return RenameInfo.CreateError(TypeScript.getDiagnosticMessage(DiagnosticCode.You_cannot_rename_this_element, null));
            }

            var definition = definitions[0];
            var symbol = symbolInfo.symbol;
            return RenameInfo.Create(
                symbol.name,
                symbol.name,
                this.mapPullElementKind(symbol.kind, symbol),
                this.getScriptElementKindModifiers(symbol),
                TextSpan.fromBounds(start(topNode), end(topNode)));
        }

        public getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var document = this.compiler.getDocument(fileName);
            var sourceUnit = document.sourceUnit();
            var currentNode = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, position);

            // first check if we are at InvocationExpression\ObjectCreationExpression - if yes then try to obtain concrete overload that was used
            var callExpressionTarget = ASTHelpers.getCallExpressionTarget(currentNode);
            var callInformation = callExpressionTarget && callExpressionTarget.parent && this.compiler.getCallInformationFromAST(callExpressionTarget.parent, document);
            var symbol: PullSymbol = callInformation && callInformation.candidateSignature;

            if (!symbol) {
                var symbolInfo = this.getSymbolInfoAtAST(document, currentNode, position, /*requireName:*/ false);
                if (symbolInfo === null || symbolInfo.symbol === null) {
                    return null;
                }

                var symbol = symbolInfo.symbol;

                TypeScript.Debug.assert(symbol.kind !== TypeScript.PullElementKind.None &&
                    symbol.kind !== TypeScript.PullElementKind.Global &&
                    symbol.kind !== TypeScript.PullElementKind.Script, "getDefinitionAtPosition - Invalid symbol kind");

                if (symbol.kind === TypeScript.PullElementKind.Primitive) {
                    // Primitive symbols do not have definition locations that map to host soruces.
                    // Return null to indicate they have no "definition locations".
                    return null;
                }
            }

            var declarations = symbol.getDeclarations();
            var symbolName = symbol.getDisplayName();
            var symbolKind = this.mapPullElementKind(symbol.kind, symbol);
            var container = symbol.getContainer();
            var containerName = container ? container.fullName() : "";
            var containerKind = container ? this.mapPullElementKind(container.kind, container) : "";

            var result: DefinitionInfo[] = [];

            if (!this.tryAddDefinition(symbolKind, symbolName, containerKind, containerName, declarations, result) &&
                !this.tryAddSignatures(symbolKind, symbolName, containerKind, containerName, declarations, result) &&
                !this.tryAddConstructor(symbolKind, symbolName, containerKind, containerName, declarations, result)) {

                // Just add all the declarations. 
                this.addDeclarations(symbolKind, symbolName, containerKind, containerName, declarations, result);
            }

            return result;
        }

        private addDeclarations(symbolKind: string, symbolName: string, containerKind: string, containerName: string, declarations: TypeScript.PullDecl[], result: DefinitionInfo[]): void {
            for (var i = 0, n = declarations.length; i < n; i++) {
                this.addDeclaration(symbolKind, symbolName, containerKind, containerName, declarations[i], result);
            }
        }

        private addDeclaration(symbolKind: string, symbolName: string, containerKind: string, containerName: string, declaration: TypeScript.PullDecl, result: DefinitionInfo[]): void {
            var ast = declaration.ast();
            result.push(new DefinitionInfo(
                this._getHostFileName(declaration.fileName()),
                TextSpan.fromBounds(start(ast), end(ast)), symbolKind, symbolName, containerKind, containerName));
        }

        private tryAddDefinition(symbolKind: string, symbolName: string, containerKind: string, containerName: string, declarations: TypeScript.PullDecl[], result: DefinitionInfo[]): boolean {
            // First, if there are definitions and signatures, then just pick the definition.
            var definitionDeclaration = TypeScript.ArrayUtilities.firstOrDefault(declarations, d => {
                var signature = d.getSignatureSymbol(this.getSemanticInfoChain());
                return signature && signature.isDefinition();
            });

            if (!definitionDeclaration) {
                return false;
            }

            this.addDeclaration(symbolKind, symbolName, containerKind, containerName, definitionDeclaration, result);
            return true;
        }

        private tryAddSignatures(symbolKind: string, symbolName: string, containerKind: string, containerName: string, declarations: TypeScript.PullDecl[], result: DefinitionInfo[]): boolean {
            // We didn't have a definition.  Check and see if we have any signatures.  If so, just
            // add the last one.
            var signatureDeclarations = TypeScript.ArrayUtilities.where(declarations, d => {
                var signature = d.getSignatureSymbol(this.getSemanticInfoChain());
                return signature && !signature.isDefinition();
            });

            if (signatureDeclarations.length === 0) {
                return false;
            }

            this.addDeclaration(symbolKind, symbolName, containerKind, containerName, TypeScript.ArrayUtilities.last(signatureDeclarations), result);
            return true;
        }

        private tryAddConstructor(symbolKind: string, symbolName: string, containerKind: string, containerName: string, declarations: TypeScript.PullDecl[], result: DefinitionInfo[]): boolean {
            var constructorDeclarations = TypeScript.ArrayUtilities.where(declarations, d => d.kind === TypeScript.PullElementKind.ConstructorMethod);

            if (constructorDeclarations.length === 0) {
                return false;
            }

            this.addDeclaration(symbolKind, symbolName, containerKind, containerName, TypeScript.ArrayUtilities.last(constructorDeclarations), result);
            return true;
        }

        // Return array of NavigateToItems in which each item has matched name with searchValue. If none is found, return an empty array.
        // The function will search all files (both close and open) in the solutions. SearchValue can be either one search term or multiple terms separated by comma.
        public getNavigateToItems(searchValue: string): NavigateToItem[] {
            Debug.assert(searchValue !== null && searchValue !== undefined, "The searchValue argument was not supplied or null");
            // Split search value in terms array
            var terms = searchValue.split(" ");

            // default NavigateTo approach: if search term contains only lower-case chars - use case-insensitive search, otherwise switch to case-sensitive version
            var searchTerms = terms.map((t) => ({ caseSensitive: this.hasAnyUpperCaseCharacter(t), term: t }));

            var items: NavigateToItem[] = [];

            var fileNames = this.compiler.fileNames();
            for (var i = 0, n = fileNames.length; i < n; i++) {
                var fileName = fileNames[i];
                var declaration = this.compiler.getCachedTopLevelDeclaration(fileName);
                this.findSearchValueInPullDecl(fileName, [declaration], /*onlyFunctions:*/ false, items, searchTerms);
            }
            return items;
        }

        private hasAnyUpperCaseCharacter(s: string): boolean {
            for (var i = 0; i < s.length; ++i) {
                if (s.charAt(i).toLocaleLowerCase() !== s.charAt(i)) {
                    return true;
                }
            }

            return false;
        }

        // Search given file's declaration and output matched NavigateToItem into array of NavigateToItem[] which is passed in as 
        // one of the function's arguements. The function will recruseively call itself to visit all children declarations  
        // of each member of declarations array.
        // 
        // @param fileName: name of the file which the function is currently visiting its PullDecl members.
        //        delcarations: array of PullDecl, containing current visiting top level PullDecl objects.
        //        results: array of NavigateToItem to be filled in with matched NavigateToItem objects.
        //        searchTerms: array of search terms.
        //        searchRegExpTerms: array of regular expressions in which each expression corresponding to each item in the searchTerms array.
        //        parentName: a name of the parent of declarations array.
        //        parentKindName: a kind of parent in string format.
        private findSearchValueInPullDecl(fileName: string, declarations: TypeScript.PullDecl[], onlyFunctions: boolean, results: NavigateToItem[],
            searchTerms: { caseSensitive: boolean; term: string }[], parentName?: string, parentkindName?: string): void {

            for (var i = 0, declLength = declarations.length; i < declLength; ++i) {
                var declaration = declarations[i];

                if (this.shouldIncludeDeclarationInNavigationItems(declaration, onlyFunctions)) {
                    var declName = declaration.getDisplayName();
                    var matchKind = this.getMatchKind(searchTerms, declName);

                    if (matchKind) {
                        var ast = declaration.ast();

                        var item = new NavigateToItem();
                        item.name = declName;
                        item.matchKind = matchKind;
                        item.kind = this.mapPullElementKind(declaration.kind);
                        item.kindModifiers = this.getScriptElementKindModifiersFromDecl(declaration);
                        item.fileName = this._getHostFileName(fileName);
                        item.textSpan = TextSpan.fromBounds(start(ast), end(ast));
                        item.containerName = parentName || "";
                        item.containerKind = parentkindName || "";
                        results.push(item);
                    }
                }

                if (this.isContainerDeclaration(declaration)) {
                    var declName = declaration.kind === PullElementKind.Script ? undefined : declaration.getDisplayName();
                    var fullName = parentName ? parentName + "." + declName : declName;

                    this.findSearchValueInPullDecl(
                        fileName, declaration.getChildDecls(), /*onlyFunctions:*/ declaration.kind === PullElementKind.Function,
                        results, searchTerms, fullName, this.mapPullElementKind(declaration.kind));
                }
            }
        }

        private getMatchKind(searchTerms: { caseSensitive: boolean; term: string }[], declName: string) {
            var matchKind: MatchKind = null;

            for (var j = 0, termsLength = searchTerms.length; j < termsLength; ++j) {
                var searchTerm = searchTerms[j];
                var declNameToSearch = searchTerm.caseSensitive ? declName : declName.toLocaleLowerCase();
                // in case of case-insensitive search searchTerm.term will already be lower-cased
                var index = declNameToSearch.indexOf(searchTerm.term);
                if (index < 0) {
                    // Didn't match.
                    return null;
                }

                var termKind = MatchKind.substring
                if (index === 0) {
                    // here we know that match occur at the beginning of the string.
                    // if search term and declName has the same length - we have an exact match, otherwise declName have longer length and this will be prefix match
                    termKind = declName.length === searchTerm.term.length ? MatchKind.exact : MatchKind.prefix;
                }

                // Update our match kind if we don't have one, or if this match is better.
                if (matchKind === null || termKind < matchKind) {
                    matchKind = termKind;
                }
            }

            return matchKind === null ? null : MatchKind[matchKind];
        }

        // Return ScriptElementKind in string of a given declaration.
        private getScriptElementKindModifiersFromDecl(decl: TypeScript.PullDecl): string {
            var result: string[] = [];
            var flags = decl.flags;

            if (flags & TypeScript.PullElementFlags.Exported) {
                result.push(ScriptElementKindModifier.exportedModifier);
            }

            if (flags & TypeScript.PullElementFlags.Ambient) {
                result.push(ScriptElementKindModifier.ambientModifier);
            }

            if (flags & TypeScript.PullElementFlags.Public) {
                result.push(ScriptElementKindModifier.publicMemberModifier);
            }

            if (flags & TypeScript.PullElementFlags.Private) {
                result.push(ScriptElementKindModifier.privateMemberModifier);
            }

            if (flags & TypeScript.PullElementFlags.Static) {
                result.push(ScriptElementKindModifier.staticModifier);
            }

            return result.length > 0 ? result.join(',') : ScriptElementKindModifier.none;
        }

        // Return true if the declaration has PullElementKind that is one of 
        // the following container types and return false otherwise.
        private isContainerDeclaration(declaration: TypeScript.PullDecl): boolean {
            switch (declaration.kind) {
                case TypeScript.PullElementKind.Script:
                case TypeScript.PullElementKind.Container:
                case TypeScript.PullElementKind.Class:
                case TypeScript.PullElementKind.Interface:
                case TypeScript.PullElementKind.DynamicModule:
                case TypeScript.PullElementKind.Enum:
                    return true;
                case TypeScript.PullElementKind.Function:
                    // A function declaration with nested functions is similar to a class.  In that
                    // case, we want to consider the function to be a container, and we do want to
                    // search inside of it.
                    return ArrayUtilities.any(declaration.getChildDecls(), d => d.kind === PullElementKind.Function);
            }

            return false;
        }

        // Return true if the declaration should havce corresponding NavigateToItem and false otherwise.
        private shouldIncludeDeclarationInNavigationItems(declaration: TypeScript.PullDecl, onlyFunctions: boolean): boolean {
            if (onlyFunctions) {
                return declaration.kind === PullElementKind.Function;
            }

            switch (declaration.kind) {
                case TypeScript.PullElementKind.Script:
                    // Do not include the script item
                    return false;
                case TypeScript.PullElementKind.Variable:
                case TypeScript.PullElementKind.Property:
                    // Do not include the value side of modules or classes, as thier types has already been included
                    return (declaration.flags & (TypeScript.PullElementFlags.ClassConstructorVariable |
                        TypeScript.PullElementFlags.InitializedModule |
                        TypeScript.PullElementFlags.InitializedDynamicModule |
                        TypeScript.PullElementFlags.Enum)) === 0;
                case TypeScript.PullElementKind.EnumMember:
                case TypeScript.PullElementKind.Function:
                case TypeScript.PullElementKind.Method:
                case TypeScript.PullElementKind.GetAccessor:
                case TypeScript.PullElementKind.SetAccessor:
                    return true;
                case TypeScript.PullElementKind.ConstructorMethod:
                    return false;
            }

            return this.isContainerDeclaration(declaration);
        }

        public getSyntacticDiagnostics(fileName: string): TypeScript.Diagnostic[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);
            return this.compiler.getSyntacticDiagnostics(fileName);
        }

        public getSemanticDiagnostics(fileName: string): TypeScript.Diagnostic[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);
            return this.compiler.getSemanticDiagnostics(fileName);
        }

        private _getHostSpecificDiagnosticWithFileName(diagnostic: Diagnostic) {
            return new Diagnostic(this._getHostFileName(diagnostic.fileName()), diagnostic.lineMap(),
                diagnostic.start(), diagnostic.length(), diagnostic.diagnosticKey(), diagnostic.arguments(),
                diagnostic.additionalLocations());
        }

        public getCompilerOptionsDiagnostics(): TypeScript.Diagnostic[]{
            var resolvePath = (fileName: string) => this.host.resolveRelativePath(fileName, null);
            var compilerOptionsDiagnostics = this.compiler.getCompilerOptionsDiagnostics(resolvePath);
            return compilerOptionsDiagnostics.map(d => this._getHostSpecificDiagnosticWithFileName(d));
        }

        private _getHostFileName(fileName: string): string {
            if (fileName) {
                return this.compiler.getCachedHostFileName(fileName);
            }
            return fileName;
        }

        public getEmitOutput(fileName: string): TypeScript.EmitOutput {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var resolvePath = (fileName: string) => this.host.resolveRelativePath(fileName, null);

            var document = this.compiler.getDocument(fileName);
            var emitToSingleFile = document.emitToOwnOutputFile();

            // Check for syntactic errors
            var syntacticDiagnostics = emitToSingleFile
                ? this.getSyntacticDiagnostics(fileName)
                : this.getAllSyntacticDiagnostics();
            if (this.containErrors(syntacticDiagnostics)) {
                // This file has at least one syntactic error, return and do not emit code.
                return new TypeScript.EmitOutput(EmitOutputResult.FailedBecauseOfSyntaxErrors);
            }

            // Force a type check before emit to ensure that all symbols have been resolved
            var semanticDiagnostics = emitToSingleFile
                ? this.getSemanticDiagnostics(fileName)
                : this.getAllSemanticDiagnostics();

            // Emit output files and source maps
            // Emit declarations, if there are no semantic errors
            var emitResult = this.compiler.emit(fileName, resolvePath);
            if (emitResult.emitOutputResult == EmitOutputResult.Succeeded) {
                if (!this.containErrors(semanticDiagnostics)) {
                    // Merge the results
                    var declarationEmitOutput = this.compiler.emitDeclarations(fileName, resolvePath);
                    emitResult.outputFiles.push.apply(emitResult.outputFiles, declarationEmitOutput.outputFiles);
                    Debug.assert(declarationEmitOutput.emitOutputResult == EmitOutputResult.Succeeded);
                }
                else if (this.compiler.canEmitDeclarations(fileName)) {
                    emitResult.emitOutputResult = EmitOutputResult.FailedToGenerateDeclarationsBecauseOfSemanticErrors;
                }
            }

            return emitResult;
        }

        private getAllSyntacticDiagnostics(): TypeScript.Diagnostic[] {
            var diagnostics: TypeScript.Diagnostic[] = [];

            this.compiler.fileNames().forEach(fileName =>
                diagnostics.push.apply(diagnostics, this.compiler.getSyntacticDiagnostics(fileName)));

            return diagnostics;
        }

        private getAllSemanticDiagnostics(): TypeScript.Diagnostic[] {
            var diagnostics: TypeScript.Diagnostic[] = [];

            this.compiler.fileNames().map(fileName =>
                diagnostics.push.apply(diagnostics, this.compiler.getSemanticDiagnostics(fileName)));

            return diagnostics;
        }

        private containErrors(diagnostics: TypeScript.Diagnostic[]): boolean {
            if (diagnostics && diagnostics.length > 0) {
                for (var i = 0; i < diagnostics.length; i++) {
                    var diagnosticInfo = diagnostics[i].info();
                    if (diagnosticInfo.category === TypeScript.DiagnosticCategory.Error) {
                        return true;
                    }
                }
            }

            return false;
        }

        private getFullNameOfSymbol(symbol: TypeScript.PullSymbol, enclosingScopeSymbol: TypeScript.PullSymbol) {
            var container = symbol.getContainer();
            if (PullHelpers.isSymbolLocal(symbol) ||
                symbol.kind == TypeScript.PullElementKind.Parameter) {
                // Local var
                return symbol.getScopedName(enclosingScopeSymbol, /*skipTypeParametersInName*/ false, /*useConstraintInName*/ true);
            }

            var symbolKind = symbol.kind;
            if (symbol.kind == TypeScript.PullElementKind.Primitive) {
                // Primitive type symbols - do not use symbol name
                return "";
            }

            if (symbolKind == TypeScript.PullElementKind.ConstructorType) {
                symbol = (<TypeScript.PullTypeSymbol>symbol).getAssociatedContainerType();
            }

            if (symbolKind != TypeScript.PullElementKind.Property &&
                symbolKind != TypeScript.PullElementKind.EnumMember &&
                symbolKind != TypeScript.PullElementKind.Method &&
                symbolKind != TypeScript.PullElementKind.TypeParameter &&
                !symbol.anyDeclHasFlag(TypeScript.PullElementFlags.Exported)) {
                // Non exported variable/function
                return symbol.getScopedName(enclosingScopeSymbol, /*skipTypeParametersInName*/ false, /*useConstraintInName*/true);
            }

            return symbol.fullName(enclosingScopeSymbol);
        }

        private getTypeInfoEligiblePath(fileName: string, position: number, isConstructorValidPosition: boolean) {
            var document = this.compiler.getDocument(fileName);
            var sourceUnit = document.sourceUnit();

            var ast = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, position, /*useTrailingTriviaAsLimChar*/ false, /*forceInclusive*/ true);
            if (ast === null) {
                return null;
            }

            if (ast.kind() === SyntaxKind.ParameterList && ast.parent.kind() === SyntaxKind.CallSignature && ast.parent.parent.kind() === SyntaxKind.ConstructorDeclaration) {
                ast = ast.parent.parent;
            }

            switch (ast.kind()) {
                default:
                    return null;
                case TypeScript.SyntaxKind.ConstructorDeclaration:
                    var constructorAST = <TypeScript.ConstructorDeclarationSyntax>ast;
                    if (!isConstructorValidPosition || !(position >= start(constructorAST) && position <= start(constructorAST) + "constructor".length)) {
                        return null;
                    }
                    else {
                        return ast;
                    }

                case TypeScript.SyntaxKind.FunctionDeclaration:
                    return null;

                case TypeScript.SyntaxKind.MemberAccessExpression:
                case TypeScript.SyntaxKind.QualifiedName:
                case TypeScript.SyntaxKind.SuperKeyword:
                case TypeScript.SyntaxKind.StringLiteral:
                case TypeScript.SyntaxKind.ThisKeyword:
                case TypeScript.SyntaxKind.IdentifierName:
                    return ast;
            }
        }

        public getTypeAtPosition(fileName: string, position: number): TypeInfo {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var node = this.getTypeInfoEligiblePath(fileName, position, true);
            if (!node) {
                return null;
            }

            var document = this.compiler.getDocument(fileName);
            var ast: TypeScript.ISyntaxElement;
            var symbol: TypeScript.PullSymbol;
            var typeSymbol: TypeScript.PullTypeSymbol;
            var enclosingScopeSymbol: TypeScript.PullSymbol;
            var _isCallExpression: boolean = false;
            var resolvedSignatures: TypeScript.PullSignatureSymbol[];
            var candidateSignature: TypeScript.PullSignatureSymbol;
            var isConstructorCall: boolean;

            if (TypeScript.ASTHelpers.isDeclarationASTOrDeclarationNameAST(node)) {
                var declarationInformation = this.compiler.getSymbolInformationFromAST(node, document);
                if (!declarationInformation) {
                    return null;
                }

                ast = declarationInformation.ast;
                symbol = declarationInformation.symbol;
                enclosingScopeSymbol = declarationInformation.enclosingScopeSymbol;

                if (node.kind() === TypeScript.SyntaxKind.ConstructorDeclaration ||
                    node.kind() === TypeScript.SyntaxKind.FunctionDeclaration ||
                    node.kind() === TypeScript.SyntaxKind.ParenthesizedArrowFunctionExpression ||
                    node.kind() === TypeScript.SyntaxKind.SimpleArrowFunctionExpression ||
                    node.kind() === TypeScript.SyntaxKind.MemberFunctionDeclaration ||
                    TypeScript.ASTHelpers.isNameOfFunction(node) ||
                    TypeScript.ASTHelpers.isNameOfMemberFunction(node)) {
                    var funcDecl = node.kind() === TypeScript.SyntaxKind.IdentifierName ? node.parent : node;
                    if (symbol && symbol.kind != TypeScript.PullElementKind.Property) {
                        var signatureInfo = TypeScript.PullHelpers.getSignatureForFuncDecl(this.compiler.getDeclForAST(funcDecl), symbol.semanticInfoChain);
                        _isCallExpression = true;
                        candidateSignature = signatureInfo.signature;
                        resolvedSignatures = signatureInfo.allSignatures;
                    }
                }
            }
            else if (TypeScript.ASTHelpers.isCallExpression(node) || TypeScript.ASTHelpers.isCallExpressionTarget(node)) {
                // If this is a call we need to get the call singuatures as well
                // Move the cursor to point to the call expression
                while (!TypeScript.ASTHelpers.isCallExpression(node)) {
                    node = node.parent;
                }

                // Get the call expression symbol
                var callExpressionInformation = this.compiler.getCallInformationFromAST(node, document);

                if (!callExpressionInformation || !callExpressionInformation.targetSymbol) {
                    return null;
                }

                ast = callExpressionInformation.ast;
                symbol = callExpressionInformation.targetSymbol;
                enclosingScopeSymbol = callExpressionInformation.enclosingScopeSymbol;

                // Check if this is a property or a variable, if so do not treat it as a fuction, but rather as a variable with function type
                var isPropertyOrVar = symbol.kind == TypeScript.PullElementKind.Property || symbol.kind == TypeScript.PullElementKind.Variable;
                typeSymbol = symbol.type;
                if (isPropertyOrVar) {
                    if (typeSymbol.getName() != "") {
                        symbol = typeSymbol;
                    }
                    isPropertyOrVar = (typeSymbol.kind != TypeScript.PullElementKind.Interface && typeSymbol.kind != TypeScript.PullElementKind.ObjectType) || typeSymbol.getName() == "";
                }

                if (!isPropertyOrVar) {
                    _isCallExpression = true;
                    resolvedSignatures = callExpressionInformation.resolvedSignatures;
                    candidateSignature = callExpressionInformation.candidateSignature;
                    isConstructorCall = callExpressionInformation.isConstructorCall;
                }
            }
            else {
                var symbolInformation = this.compiler.getSymbolInformationFromAST(node, document);

                if (!symbolInformation || !symbolInformation.symbol) {
                    return null;
                }

                ast = symbolInformation.ast;
                symbol = symbolInformation.symbol;
                enclosingScopeSymbol = symbolInformation.enclosingScopeSymbol;

                if (symbol.kind === TypeScript.PullElementKind.Method || symbol.kind == TypeScript.PullElementKind.Function) {
                    typeSymbol = symbol.type;
                    if (typeSymbol) {
                        _isCallExpression = true;
                        resolvedSignatures = typeSymbol.getCallSignatures();
                    }
                }
            }

            if (resolvedSignatures && (!candidateSignature || candidateSignature.isDefinition())) {
                for (var i = 0, len = resolvedSignatures.length; i < len; i++) {
                    if (len > 1 && resolvedSignatures[i].isDefinition()) {
                        continue;
                    }

                    candidateSignature = resolvedSignatures[i];
                    break;
                }
            }

            var memberName = _isCallExpression
                ? TypeScript.PullSignatureSymbol.getSignatureTypeMemberName(candidateSignature, resolvedSignatures, enclosingScopeSymbol)
                : symbol.getTypeNameEx(enclosingScopeSymbol, /*useConstraintInName*/ true);
            var kind = this.mapPullElementKind(symbol.kind, symbol, !_isCallExpression, _isCallExpression, isConstructorCall);

            var docCommentSymbol = candidateSignature || symbol;
            var docComment = docCommentSymbol.docComments(!_isCallExpression);
            var symbolName = this.getFullNameOfSymbol(symbol, enclosingScopeSymbol);
            var minChar = ast ? start(ast) : -1;
            var limChar = ast ? end(ast) : -1;

            return new TypeInfo(memberName, docComment, symbolName, kind, TextSpan.fromBounds(minChar, limChar));
        }

        public getCompletionsAtPosition(fileName: string, position: number, isMemberCompletion: boolean): CompletionInfo {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var document = this.compiler.getDocument(fileName);
            var sourceUnit = document.sourceUnit();

            if (CompletionHelpers.isCompletionListBlocker(document.syntaxTree().sourceUnit(), position)) {
                this.logger.log("Returning an empty list because completion was blocked.");
                return null;
            }

            var node = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, position, /*useTrailingTriviaAsLimChar*/ true, /*forceInclusive*/ true);

            if (node && node.kind() === TypeScript.SyntaxKind.IdentifierName &&
                start(node) === end(node)) {
                // Ignore missing name nodes
                node = node.parent;
            }

            var isRightOfDot = false;
            if (node &&
                node.kind() === TypeScript.SyntaxKind.MemberAccessExpression &&
                end((<TypeScript.MemberAccessExpressionSyntax>node).expression) < position) {

                isRightOfDot = true;
                node = (<TypeScript.MemberAccessExpressionSyntax>node).expression;
            }
            else if (node &&
                node.kind() === TypeScript.SyntaxKind.QualifiedName &&
                end((<TypeScript.QualifiedNameSyntax>node).left) < position) {

                isRightOfDot = true;
                node = (<TypeScript.QualifiedNameSyntax>node).left;
            }
            else if (node && node.parent &&
                node.kind() === TypeScript.SyntaxKind.IdentifierName &&
                node.parent.kind() === TypeScript.SyntaxKind.MemberAccessExpression &&
                (<TypeScript.MemberAccessExpressionSyntax>node.parent).name === node) {

                isRightOfDot = true;
                node = (<TypeScript.MemberAccessExpressionSyntax>node.parent).expression;
            }
            else if (node && node.parent &&
                node.kind() === TypeScript.SyntaxKind.IdentifierName &&
                node.parent.kind() === TypeScript.SyntaxKind.QualifiedName &&
                (<TypeScript.QualifiedNameSyntax>node.parent).right === node) {

                isRightOfDot = true;
                node = (<TypeScript.QualifiedNameSyntax>node.parent).left;
            }

            // Get the completions
            var entries = new TypeScript.IdentiferNameHashTable<CachedCompletionEntryDetails>();

            // Right of dot member completion list
            if (isRightOfDot) {
                var members = this.compiler.getVisibleMemberSymbolsFromAST(node, document);
                if (!members) {
                    return null;
                }

                isMemberCompletion = true;
                this.getCompletionEntriesFromSymbols(members, entries);
            }
            else {
                var containingObjectLiteral = CompletionHelpers.getContainingObjectLiteralApplicableForCompletion(document.syntaxTree().sourceUnit(), position);

                // Object literal expression, look up possible property names from contextual type
                if (containingObjectLiteral) {
                    var searchPosition = Math.min(position, end(containingObjectLiteral));
                    var path = TypeScript.ASTHelpers.getAstAtPosition(sourceUnit, searchPosition);
                    // Get the object literal node

                    while (node && node.kind() !== TypeScript.SyntaxKind.ObjectLiteralExpression) {
                        node = node.parent;
                    }

                    if (!node || node.kind() !== TypeScript.SyntaxKind.ObjectLiteralExpression) {
                        // AST Path look up did not result in the same node as Fidelity Syntax Tree look up.
                        // Once we remove AST this will no longer be a problem.
                        return null;
                    }

                    isMemberCompletion = true;

                    // Try to get the object members form contextual typing
                    var contextualMembers = this.compiler.getContextualMembersFromAST(node, document);
                    if (contextualMembers && contextualMembers.symbols && contextualMembers.symbols.length > 0) {
                        // get existing members
                        var existingMembers = this.compiler.getVisibleMemberSymbolsFromAST(node, document);

                        // Add filtterd items to the completion list
                        this.getCompletionEntriesFromSymbols({
                            symbols: CompletionHelpers.filterContextualMembersList(contextualMembers.symbols, existingMembers, fileName, position),
                            enclosingScopeSymbol: contextualMembers.enclosingScopeSymbol
                        }, entries);
                    }
                }
                // Get scope memebers
                else {
                    isMemberCompletion = false;
                    var decls = this.compiler.getVisibleDeclsFromAST(node, document);
                    this.getCompletionEntriesFromDecls(decls, entries);
                }
            }

            // Add keywords if this is not a member completion list
            if (!isMemberCompletion) {
                this.getCompletionEntriesForKeywords(KeywordCompletions.getKeywordCompltions(), entries);
            }

            // Prepare the completion result
            var completions = new CompletionInfo();
            completions.isMemberCompletion = isMemberCompletion;
            completions.entries = [];
            entries.map((key, value) => {
                completions.entries.push({
                    name: value.name,
                    kind: value.kind,
                    kindModifiers: value.kindModifiers
                });
            }, null);

            // Store this completion list as the active completion list
            this.activeCompletionSession = new CompletionSession(fileName, position, entries);

            return completions;
        }

        private getCompletionEntriesFromSymbols(symbolInfo: TypeScript.PullVisibleSymbolsInfo, result: TypeScript.IdentiferNameHashTable<CachedCompletionEntryDetails>): void {
            for (var i = 0, n = symbolInfo.symbols.length; i < n; i++) {
                var symbol = symbolInfo.symbols[i];

                var symbolDisplayName = CompletionHelpers.getValidCompletionEntryDisplayName(symbol.getDisplayName());
                if (!symbolDisplayName) {
                    continue;
                }

                var symbolKind = symbol.kind;

                var exitingEntry = result.lookup(symbolDisplayName);

                if (exitingEntry && (symbolKind & TypeScript.PullElementKind.SomeValue)) {
                    // We have two decls with the same name. Do not overwrite types and containers with thier variable delcs.
                    continue;
                }

                var entry: CachedCompletionEntryDetails;
                var kindName = this.mapPullElementKind(symbolKind, symbol, true);
                var kindModifiersName = this.getScriptElementKindModifiers(symbol);

                if (symbol.isResolved) {
                    // If the symbol has already been resolved, cache the needed information for completion details.
                    var completionInfo = this.getResolvedCompletionEntryDetailsFromSymbol(symbol, symbolInfo.enclosingScopeSymbol);

                    entry = new ResolvedCompletionEntry(symbolDisplayName, kindName, kindModifiersName, completionInfo.typeName, completionInfo.fullSymbolName, completionInfo.docComments);
                }
                else {
                    entry = new DeclReferenceCompletionEntry(symbolDisplayName, kindName, kindModifiersName, symbol.getDeclarations()[0]);
                }

                result.addOrUpdate(symbolDisplayName, entry);
            }
        }

        private getCompletionEntriesFromDecls(decls: TypeScript.PullDecl[], result: TypeScript.IdentiferNameHashTable<CachedCompletionEntryDetails>): void {
            var semanticInfoChain = this.getSemanticInfoChain();
            for (var i = 0, n = decls ? decls.length : 0; i < n; i++) {
                var decl = decls[i];

                var declDisplaylName = CompletionHelpers.getValidCompletionEntryDisplayName(decl.getDisplayName());
                if (!declDisplaylName) {
                    continue;
                }

                var declKind = decl.kind;

                var exitingEntry = result.lookup(declDisplaylName);

                if (exitingEntry && (declKind & TypeScript.PullElementKind.SomeValue)) {
                    // We have two decls with the same name. Do not overwrite types and containers with thier variable delcs.
                    continue;
                }

                var kindName = this.mapPullElementKind(declKind, /*symbol*/ null, true);
                var kindModifiersName = this.getScriptElementKindModifiersFromFlags(decl.flags);

                var entry: CachedCompletionEntryDetails = null;
                // Do not call getSymbol if the decl is not already bound. This would force a bind,
                // which is too expensive to do for every completion item when we are building the
                // list.
                var symbol = decl.hasSymbol(semanticInfoChain) && decl.getSymbol(semanticInfoChain);
                // If the symbol has already been resolved, cache the needed information for completion details.
                var enclosingDecl = decl.getEnclosingDecl();
                var enclosingScopeSymbol = (enclosingDecl && enclosingDecl.hasSymbol(semanticInfoChain)) ? enclosingDecl.getSymbol(semanticInfoChain) : null;

                if (symbol && symbol.isResolved && enclosingScopeSymbol && enclosingScopeSymbol.isResolved) {
                    var completionInfo = this.getResolvedCompletionEntryDetailsFromSymbol(symbol, enclosingScopeSymbol);
                    entry = new ResolvedCompletionEntry(declDisplaylName, kindName, kindModifiersName, completionInfo.typeName, completionInfo.fullSymbolName, completionInfo.docComments);
                }
                else {
                    entry = new DeclReferenceCompletionEntry(declDisplaylName, kindName, kindModifiersName, decl);
                }

                result.addOrUpdate(declDisplaylName, entry);
            }
        }

        private getResolvedCompletionEntryDetailsFromSymbol(symbol: TypeScript.PullSymbol, enclosingScopeSymbol: TypeScript.PullSymbol):
            { typeName: string; fullSymbolName: string; docComments: string } {
            var typeName = symbol.getTypeName(enclosingScopeSymbol, /*useConstraintInName*/ true);
            var fullSymbolName = this.getFullNameOfSymbol(symbol, enclosingScopeSymbol);

            var type = symbol.type;
            var symbolForDocComments = symbol;
            if (type && type.hasOnlyOverloadCallSignatures()) {
                symbolForDocComments = type.getCallSignatures()[0];
            }

            var docComments = symbolForDocComments.docComments(/*useConstructorAsClass:*/ true);
            return {
                typeName: typeName,
                fullSymbolName: fullSymbolName,
                docComments: docComments
            };
        }

        private getCompletionEntriesForKeywords(keywords: ResolvedCompletionEntry[], result: TypeScript.IdentiferNameHashTable<CompletionEntryDetails>): void {
            for (var i = 0, n = keywords.length; i < n; i++) {
                var keyword = keywords[i];
                result.addOrUpdate(keyword.name, keyword);
            }
        }

        public getCompletionEntryDetails(fileName: string, position: number, entryName: string): CompletionEntryDetails {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            // Ensure that the current active completion session is still valid for this request
            if (!this.activeCompletionSession ||
                this.activeCompletionSession.fileName !== fileName ||
                this.activeCompletionSession.position !== position) {
                return null;
            }

            var entry = this.activeCompletionSession.entries.lookup(entryName);
            if (!entry) {
                return null;
            }

            if (!entry.isResolved()) {
                var decl = (<DeclReferenceCompletionEntry>entry).decl;

                // If this decl has been invalidated becuase of a user edit, try to find the new
                // decl that matches it
                // Theoretically, this corrective measure should just fix decls if the completion
                // session is older than the file, but we are being defensive, so always correct
                // the decl.
                var document = this.compiler.getDocument(fileName);
                if (decl.fileName() === TypeScript.switchToForwardSlashes(fileName)) {
                    decl = this.tryFindDeclFromPreviousCompilerVersion(decl);

                    if (decl) {
                        var declDisplaylName = CompletionHelpers.getValidCompletionEntryDisplayName(decl.getDisplayName());
                        var declKind = decl.kind;
                        var kindName = this.mapPullElementKind(declKind, /*symbol*/ null, true);
                        var kindModifiersName = this.getScriptElementKindModifiersFromFlags(decl.flags);

                        // update the existing entry
                        entry = new DeclReferenceCompletionEntry(declDisplaylName, kindName, kindModifiersName, decl);
                        this.activeCompletionSession.entries.addOrUpdate(entryName, entry);
                    }
                }

                // This entry has not been resolved yet. Resolve it.
                if (decl) {
                    var node = TypeScript.ASTHelpers.getAstAtPosition(document.sourceUnit(), position);
                    var symbolInfo = this.compiler.pullGetDeclInformation(decl, node, document);

                    if (!symbolInfo) {
                        return null;
                    }

                    var symbol = symbolInfo.symbol;
                    var completionInfo = this.getResolvedCompletionEntryDetailsFromSymbol(symbol, symbolInfo.enclosingScopeSymbol);
                    // Store the information for next lookup
                    (<DeclReferenceCompletionEntry>entry).resolve(completionInfo.typeName, completionInfo.fullSymbolName, completionInfo.docComments);
                }
            }

            return {
                name: entry.name,
                kind: entry.kind,
                kindModifiers: entry.kindModifiers,
                type: entry.type,
                fullSymbolName: entry.fullSymbolName,
                docComment: entry.docComment
            };
        }

        // Given a declaration returned from a previous version of the compiler (i.e. prior to 
        // any mutation operations), attempts to find the same decl in this version.  
        private tryFindDeclFromPreviousCompilerVersion(invalidatedDecl: TypeScript.PullDecl): TypeScript.PullDecl {
            var fileName = invalidatedDecl.fileName();

            var declsInPath: TypeScript.PullDecl[] = [];
            var current = invalidatedDecl;
            while (current) {
                if (current.kind !== TypeScript.PullElementKind.Script) {
                    declsInPath.unshift(current);
                }

                current = current.getParentDecl();
            }

            // now search for that decl
            var topLevelDecl = this.compiler.topLevelDeclaration(fileName);
            if (!topLevelDecl) {
                return null;
            }

            var declsToSearch = [topLevelDecl];
            var foundDecls: TypeScript.PullDecl[] = [];
            var keepSearching = (invalidatedDecl.kind & TypeScript.PullElementKind.Container) ||
                (invalidatedDecl.kind & TypeScript.PullElementKind.Interface) ||
                (invalidatedDecl.kind & TypeScript.PullElementKind.Class) ||
                (invalidatedDecl.kind & TypeScript.PullElementKind.Enum);

            for (var i = 0; i < declsInPath.length; i++) {
                var declInPath = declsInPath[i];
                var decls: TypeScript.PullDecl[] = [];

                for (var j = 0; j < declsToSearch.length; j++) {
                    foundDecls = declsToSearch[j].searchChildDecls(declInPath.name, declInPath.kind);

                    decls.push.apply(decls, foundDecls);

                    // Unless we're searching for an interface or module, we've found the one true
                    // decl, so don't bother searching the rest of the top-level decls
                    if (foundDecls.length && !keepSearching) {
                        break;
                    }
                }

                declsToSearch = decls;

                if (declsToSearch.length == 0) {
                    break;
                }
            }

            return declsToSearch.length === 0 ? null : declsToSearch[0];
        }

        private getModuleOrEnumKind(symbol: TypeScript.PullSymbol) {
            if (symbol) {
                var declarations = symbol.getDeclarations();
                for (var i = 0; i < declarations.length; i++) {
                    var declKind = declarations[i].kind;
                    if (declKind == TypeScript.PullElementKind.Container) {
                        return ScriptElementKind.moduleElement;
                    }
                    else if (declKind == TypeScript.PullElementKind.Enum) {
                        return ScriptElementKind.enumElement;
                    }
                    else if (declKind == TypeScript.PullElementKind.Variable) {
                        var declFlags = declarations[i].flags;
                        if (declFlags & TypeScript.PullElementFlags.InitializedModule) {
                            return ScriptElementKind.moduleElement;
                        }
                        else if (declFlags & TypeScript.PullElementFlags.Enum) {
                            return ScriptElementKind.enumElement;
                        }
                    }
                }
            }
            return ScriptElementKind.unknown;
        }

        private mapPullElementKind(kind: TypeScript.PullElementKind, symbol?: TypeScript.PullSymbol, useConstructorAsClass?: boolean, varIsFunction?: boolean, functionIsConstructor?: boolean): string {
            if (functionIsConstructor) {
                return ScriptElementKind.constructorImplementationElement;
            }

            if (varIsFunction) {
                switch (kind) {
                    case TypeScript.PullElementKind.Container:
                    case TypeScript.PullElementKind.DynamicModule:
                    case TypeScript.PullElementKind.TypeAlias:
                    case TypeScript.PullElementKind.Interface:
                    case TypeScript.PullElementKind.Class:
                    case TypeScript.PullElementKind.Parameter:
                        return ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.Variable:
                        return (symbol && PullHelpers.isSymbolLocal(symbol)) ? ScriptElementKind.localFunctionElement : ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.Property:
                        return ScriptElementKind.memberFunctionElement;
                    case TypeScript.PullElementKind.Function:
                        return (symbol && PullHelpers.isSymbolLocal(symbol)) ? ScriptElementKind.localFunctionElement : ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.ConstructorMethod:
                        return ScriptElementKind.constructorImplementationElement;
                    case TypeScript.PullElementKind.Method:
                        return ScriptElementKind.memberFunctionElement;
                    case TypeScript.PullElementKind.FunctionExpression:
                        return ScriptElementKind.localFunctionElement;
                    case TypeScript.PullElementKind.GetAccessor:
                        return ScriptElementKind.memberGetAccessorElement;
                    case TypeScript.PullElementKind.SetAccessor:
                        return ScriptElementKind.memberSetAccessorElement;
                    case TypeScript.PullElementKind.CallSignature:
                        return ScriptElementKind.callSignatureElement;
                    case TypeScript.PullElementKind.ConstructSignature:
                        return ScriptElementKind.constructSignatureElement;
                    case TypeScript.PullElementKind.IndexSignature:
                        return ScriptElementKind.indexSignatureElement;
                    case TypeScript.PullElementKind.TypeParameter:
                        return ScriptElementKind.typeParameterElement;
                    case TypeScript.PullElementKind.Primitive:
                        return ScriptElementKind.primitiveType;
                }
            }
            else {
                switch (kind) {
                    case TypeScript.PullElementKind.Script:
                        return ScriptElementKind.scriptElement;
                    case TypeScript.PullElementKind.Container:
                    case TypeScript.PullElementKind.DynamicModule:
                    case TypeScript.PullElementKind.TypeAlias:
                        return ScriptElementKind.moduleElement;
                    case TypeScript.PullElementKind.Interface:
                        return ScriptElementKind.interfaceElement;
                    case TypeScript.PullElementKind.Class:
                        return ScriptElementKind.classElement;
                    case TypeScript.PullElementKind.Enum:
                        return ScriptElementKind.enumElement;
                    case TypeScript.PullElementKind.Variable:
                        var scriptElementKind = this.getModuleOrEnumKind(symbol);
                        if (scriptElementKind != ScriptElementKind.unknown) {
                            return scriptElementKind;
                        }
                        return (symbol && PullHelpers.isSymbolLocal(symbol)) ? ScriptElementKind.localVariableElement : ScriptElementKind.variableElement;
                    case TypeScript.PullElementKind.Parameter:
                        return ScriptElementKind.parameterElement;
                    case TypeScript.PullElementKind.Property:
                        return ScriptElementKind.memberVariableElement;
                    case TypeScript.PullElementKind.Function:
                        return (symbol && PullHelpers.isSymbolLocal(symbol)) ? ScriptElementKind.localFunctionElement : ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.ConstructorMethod:
                        return useConstructorAsClass ? ScriptElementKind.classElement : ScriptElementKind.constructorImplementationElement;
                    case TypeScript.PullElementKind.Method:
                        return ScriptElementKind.memberFunctionElement;
                    case TypeScript.PullElementKind.FunctionExpression:
                        return ScriptElementKind.localFunctionElement;
                    case TypeScript.PullElementKind.GetAccessor:
                        return ScriptElementKind.memberGetAccessorElement;
                    case TypeScript.PullElementKind.SetAccessor:
                        return ScriptElementKind.memberSetAccessorElement;
                    case TypeScript.PullElementKind.CallSignature:
                        return ScriptElementKind.callSignatureElement;
                    case TypeScript.PullElementKind.ConstructSignature:
                        return ScriptElementKind.constructSignatureElement;
                    case TypeScript.PullElementKind.IndexSignature:
                        return ScriptElementKind.indexSignatureElement;
                    case TypeScript.PullElementKind.EnumMember:
                        return ScriptElementKind.memberVariableElement;
                    case TypeScript.PullElementKind.TypeParameter:
                        return ScriptElementKind.typeParameterElement;
                    case TypeScript.PullElementKind.Primitive:
                        return ScriptElementKind.primitiveType;
                }
            }

            return ScriptElementKind.unknown;
        }

        private getScriptElementKindModifiers(symbol: TypeScript.PullSymbol): string {
            var result: string[] = [];

            if (symbol.anyDeclHasFlag(TypeScript.PullElementFlags.Exported)) {
                result.push(ScriptElementKindModifier.exportedModifier);
            }
            if (symbol.anyDeclHasFlag(TypeScript.PullElementFlags.Ambient)) {
                result.push(ScriptElementKindModifier.ambientModifier);
            }
            if (symbol.anyDeclHasFlag(TypeScript.PullElementFlags.Public)) {
                result.push(ScriptElementKindModifier.publicMemberModifier);
            }
            if (symbol.anyDeclHasFlag(TypeScript.PullElementFlags.Private)) {
                result.push(ScriptElementKindModifier.privateMemberModifier);
            }
            if (symbol.anyDeclHasFlag(TypeScript.PullElementFlags.Static)) {
                result.push(ScriptElementKindModifier.staticModifier);
            }

            return result.length > 0 ? result.join(',') : ScriptElementKindModifier.none;
        }

        private getScriptElementKindModifiersFromFlags(flags: TypeScript.PullElementFlags): string {
            var result: string[] = [];

            if (flags & TypeScript.PullElementFlags.Exported) {
                result.push(ScriptElementKindModifier.exportedModifier);
            }

            if (flags & TypeScript.PullElementFlags.Ambient) {
                result.push(ScriptElementKindModifier.ambientModifier);
            }

            if (flags & TypeScript.PullElementFlags.Public) {
                result.push(ScriptElementKindModifier.publicMemberModifier);
            }

            if (flags & TypeScript.PullElementFlags.Private) {
                result.push(ScriptElementKindModifier.privateMemberModifier);
            }

            if (flags & TypeScript.PullElementFlags.Static) {
                result.push(ScriptElementKindModifier.staticModifier);
            }

            return result.length > 0 ? result.join(',') : ScriptElementKindModifier.none;
        }

        // 
        // Syntactic Single-File features
        //

        public getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): TextSpan {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var node = this.getTypeInfoEligiblePath(fileName, startPos, false);

            if (!node) {
                return null;
            }

            while (node) {
                if (TypeScript.ASTHelpers.isNameOfMemberAccessExpression(node) ||
                    TypeScript.ASTHelpers.isRightSideOfQualifiedName(node)) {
                    node = node.parent;
                }
                else {
                    break;
                }
            }

            var spanInfo = TextSpan.fromBounds(start(node), end(node));
            return spanInfo;
        }

        public getBreakpointStatementAtPosition(fileName: string, pos: number): TextSpan {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var syntaxtree = this.getSyntaxTree(fileName);
            return TypeScript.Services.Breakpoints.getBreakpointLocation(syntaxtree, pos);
        }

        public getFormattingEditsForRange(fileName: string, start: number, end: number, options: FormatCodeOptions): TextChange[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var manager = this.getFormattingManager(fileName, options);
            return manager.formatSelection(start, end);
        }

        public getFormattingEditsForDocument(fileName: string, options: FormatCodeOptions): TextChange[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var manager = this.getFormattingManager(fileName, options);
            return manager.formatDocument();
        }

        public getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions): TextChange[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var manager = this.getFormattingManager(fileName, options);

            if (key === "}") {
                return manager.formatOnClosingCurlyBrace(position);
            }
            else if (key === ";") {
                return manager.formatOnSemicolon(position);
            }
            else if (key === "\n") {
                return manager.formatOnEnter(position);
            }

            return [];
        }

        private getFormattingManager(fileName: string, options: FormatCodeOptions) {
            // Ensure rules are initialized and up to date wrt to formatting options
            if (this.formattingRulesProvider == null) {
                this.formattingRulesProvider = new TypeScript.Services.Formatting.RulesProvider(this.logger);
            }

            this.formattingRulesProvider.ensureUpToDate(options);

            // Get the Syntax Tree
            var syntaxTree = this.getSyntaxTree(fileName);

            // Convert IScriptSnapshot to ITextSnapshot
            var scriptSnapshot = this.compiler.getScriptSnapshot(fileName);
            var scriptText = TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot);
            var textSnapshot = new TypeScript.Services.Formatting.TextSnapshot(scriptText);

            var manager = new TypeScript.Services.Formatting.FormattingManager(syntaxTree, textSnapshot, this.formattingRulesProvider, options);

            return manager;
        }

        public getOutliningSpans(fileName: string): OutliningSpan[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var syntaxTree = this.getSyntaxTree(fileName);
            return OutliningElementsCollector.collectElements(syntaxTree.sourceUnit());
        }

        private escapeRegExp(str: string): string {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        private getTodoCommentsRegExp(descriptors: TodoCommentDescriptor[]): RegExp {
            // NOTE: ?:  means 'non-capture group'.  It allows us to have groups without having to
            // filter them out later in the final result array.

            // TODO comments can appear in one of the following forms:
            //
            //  1)      // TODO
            //  2)      /* TODO
            //  3)      /*
            //           *   TODO
            //           */
            //
            // The following three regexps are used to match the start of the text up to the TODO
            // comment portion.
            var singleLineCommentStart = "(?:\\/\\/\\s*)";
            var multiLineCommentStart = "(?:\\/\\*\\s*)";
            var anyNumberOfSpacesAndAsterixesAtStartOfLine = "(?:^(?:\\s|\\*)*)";

            // Match any of the above three TODO comment start regexps.
            // Note that the outermost group *is* a capture group.  We want to capture the preamble
            // so that we can determine the starting position of the TODO comment match.
            var preamble = "(" + anyNumberOfSpacesAndAsterixesAtStartOfLine + "|" + singleLineCommentStart + "|" + multiLineCommentStart + ")";

            // Takes the descriptors and forms a regexp that matches them as if they were literals.
            // For example, if the descriptors are "TODO(jason)" and "HACK", then this will be:
            //
            //      (?:(TODO\(jason\))|(HACK))
            //
            // Note that the outermost group is *not* a capture group, but the innermost groups
            // *are* capture groups.  By capturing the inner literals we can determine after 
            // matching which descriptor we are dealing with.
            var literals = "(?:" +descriptors.map(d => "(" + this.escapeRegExp(d.text) + ")").join("|") + ")";

            // After matching a descriptor literal, the following regexp matches the rest of the 
            // text up to the end of the line.  We don't want to match something like 'TODOBY', so
            // we ask for a non word character (\W) to follow the match if we're not at the end of
            // the line.
            var postamble = "(?:(?:\\W.*$)|$)";

            // This is the portion of the match we'll return as part of the TODO comment result. We
            // match the literal portion up to the end of the line.
            var messagePortion = "(" + literals + postamble + ")";
            var regExpString = preamble + messagePortion;

            // The final regexp will look like this:
            // /((?:\/\/\s*)|(?:\/\*\s*)|(?:^(?:\s|\*)*))((?:(TODO\(jason\))|(HACK))(?:(?:\W.*$)|$))/gim

            // The flags of the regexp are important here.
            //  'g' is so that we are doing a global search and can find matches several times
            //  in the input.
            //
            //  'i' is for case insensitivity (We do this to match C#).
            //
            //  'm' is so we can find matches in a multiline input.
            return new RegExp(regExpString, "gim");
        }

        public getTodoComments(fileName: string, descriptors: TodoCommentDescriptor[]): TodoComment[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var syntaxTree = this.compiler.getDocument(fileName).syntaxTree();
            this.cancellationToken.throwIfCancellationRequested();

            var text = syntaxTree.text;
            var fileContents = text.substr(0, text.length());
            this.cancellationToken.throwIfCancellationRequested();

            var result: TodoComment[] = [];

            if (descriptors.length > 0) {
                var regExp = this.getTodoCommentsRegExp(descriptors);

                var matchArray: RegExpExecArray;
                while (matchArray = regExp.exec(fileContents)) {
                    this.cancellationToken.throwIfCancellationRequested();

                    // If we got a match, here is what the match array will look like.  Say the source text is:
                    //
                    //      "    // hack   1"
                    //
                    // The result array with the regexp:    will be:
                    //
                    //      ["// hack   1", "// ", "hack   1", undefined, "hack"]
                    //
                    // Here are the relevant capture groups:
                    //  0) The full match for hte entire regex.
                    //  1) The preamble to the message portion.
                    //  2) The message portion.
                    //  3...N) The descriptor that was matched - by index.  'undefined' for each 
                    //         descriptor that didn't match.  an actual value if it did match.
                    //
                    //  i.e. 'undefined' in position 3 above means TODO(jason) didn't match.
                    //       "hack"      in position 4 means HACK did match.
                    var firstDescriptorCaptureIndex = 3;
                    Debug.assert(matchArray.length === descriptors.length + firstDescriptorCaptureIndex);

                    var preamble = matchArray[1];
                    var matchPosition = matchArray.index + preamble.length;

                    // Ok, we have found a match in the file.  This is ony an acceptable match if
                    // it is contained within a comment.
                    var token = findToken(syntaxTree.sourceUnit(), matchPosition);

                    if (matchPosition >= start(token) && matchPosition < end(token)) {
                        // match was within the token itself.  Not in the comment.  Keep searching
                        // descriptor.
                        continue;
                    }

                    // Looks to be within the trivia.  See if we can find hte comment containing it.
                    var triviaList = matchPosition < start(token) ? token.leadingTrivia(syntaxTree.text) : token.trailingTrivia(syntaxTree.text);
                    var trivia = this.findContainingComment(triviaList, matchPosition);
                    if (trivia === null) {
                        continue;
                    }

                    var message = matchArray[2];
                    var descriptor: TodoCommentDescriptor = undefined;
                    for (var i = 0, n = descriptors.length; i < n; i++) {
                        if (matchArray[i + firstDescriptorCaptureIndex]) {
                            descriptor = descriptors[i];
                        }
                    }
                    Debug.assert(descriptor);

                    result.push(new TodoComment(descriptor, message, matchPosition));
                }
            }

            return result;
        }

        private findContainingComment(triviaList: ISyntaxTriviaList, position: number): ISyntaxTrivia {
            for (var i = 0, n = triviaList.count(); i < n; i++) {
                var trivia = triviaList.syntaxTriviaAt(i);
                var fullEnd = trivia.fullStart() + trivia.fullWidth();
                if (trivia.isComment() && trivia.fullStart() <= position && position < fullEnd) {
                    return trivia;
                }
            }

            return null;
        }

        // Given a script name and position in the script, return the
        // number of spaces equivalent to the desired smart indent 
        // (assuming the line is empty). Returns "null" in case the
        // smart indent cannot be determined.
        public getIndentationAtPosition(fileName: string, position: number, editorOptions: EditorOptions): number {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var syntaxTree = this.getSyntaxTree(fileName);

            var scriptSnapshot = this.compiler.getScriptSnapshot(fileName);
            var scriptText = TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot);
            var textSnapshot = new TypeScript.Services.Formatting.TextSnapshot(scriptText);
            var options = new FormattingOptions(!editorOptions.ConvertTabsToSpaces, editorOptions.TabSize, editorOptions.IndentSize, editorOptions.NewLineCharacter)

            return TypeScript.Services.Formatting.SingleTokenIndenter.getIndentationAmount(position, syntaxTree.sourceUnit(), textSnapshot, options);
        }

        // Given a script name and position in the script, return a pair of text range if the 
        // position corresponds to a "brace matchin" characters (e.g. "{" or "(", etc.)
        // If the position is not on any range, return "null".
        public getBraceMatchingAtPosition(fileName: string, position: number): TypeScript.TextSpan[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var syntaxTree = this.getSyntaxTree(fileName);
            return BraceMatcher.getMatchSpans(syntaxTree, position);
        }

        public getNavigationBarItems(fileName: string): NavigationBarItem[] {
            fileName = TypeScript.switchToForwardSlashes(fileName);

            var syntaxTree = this.getSyntaxTree(fileName);
            return new NavigationBarItemGetter().getItems(syntaxTree.sourceUnit());
        }

        public getSyntaxTree(fileName: string): TypeScript.SyntaxTree {
            fileName = TypeScript.switchToForwardSlashes(fileName);
            return this._syntaxTreeCache.getCurrentFileSyntaxTree(fileName);
        }
    }

    function isSignatureHelpBlocker(ast: TypeScript.ISyntaxElement): boolean {
        if (ast) {
            switch (ast.kind()) {
                case TypeScript.SyntaxKind.ClassDeclaration:
                case TypeScript.SyntaxKind.InterfaceDeclaration:
                case TypeScript.SyntaxKind.ModuleDeclaration:
                case TypeScript.SyntaxKind.ConstructorDeclaration:
                case TypeScript.SyntaxKind.FunctionDeclaration:
                case TypeScript.SyntaxKind.VariableDeclarator:
                case TypeScript.SyntaxKind.ParenthesizedArrowFunctionExpression:
                case TypeScript.SyntaxKind.SimpleArrowFunctionExpression:
                    return true;
            }
        }

        return false;
    }
}