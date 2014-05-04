///<reference path='references.ts' />

module TypeScript {
    var nodeMetadata: string[][] = new Array<string[]>(SyntaxKind.LastNode);
    nodeMetadata[SyntaxKind.SourceUnit] = ["moduleElements", "endOfFileToken"];
    nodeMetadata[SyntaxKind.ExternalModuleReference] = ["requireKeyword", "openParenToken", "stringLiteral", "closeParenToken"];
    nodeMetadata[SyntaxKind.ModuleNameModuleReference] = ["moduleName"];
    nodeMetadata[SyntaxKind.ImportDeclaration] = ["modifiers", "importKeyword", "identifier", "equalsToken", "moduleReference", "semicolonToken"];
    nodeMetadata[SyntaxKind.ExportAssignment] = ["exportKeyword", "equalsToken", "identifier", "semicolonToken"];
    nodeMetadata[SyntaxKind.ClassDeclaration] = ["modifiers", "classKeyword", "identifier", "typeParameterList", "heritageClauses", "openBraceToken", "classElements", "closeBraceToken"];
    nodeMetadata[SyntaxKind.InterfaceDeclaration] = ["modifiers", "interfaceKeyword", "identifier", "typeParameterList", "heritageClauses", "body"];
    nodeMetadata[SyntaxKind.ExtendsHeritageClause] = ["extendsOrImplementsKeyword", "typeNames"];
    nodeMetadata[SyntaxKind.ImplementsHeritageClause] = ["extendsOrImplementsKeyword", "typeNames"];
    nodeMetadata[SyntaxKind.ModuleDeclaration] = ["modifiers", "moduleKeyword", "name", "stringLiteral", "openBraceToken", "moduleElements", "closeBraceToken"];
    nodeMetadata[SyntaxKind.FunctionDeclaration] = ["modifiers", "functionKeyword", "identifier", "callSignature", "block", "semicolonToken"];
    nodeMetadata[SyntaxKind.VariableStatement] = ["modifiers", "variableDeclaration", "semicolonToken"];
    nodeMetadata[SyntaxKind.VariableDeclaration] = ["varKeyword", "variableDeclarators"];
    nodeMetadata[SyntaxKind.VariableDeclarator] = ["propertyName", "typeAnnotation", "equalsValueClause"];
    nodeMetadata[SyntaxKind.EqualsValueClause] = ["equalsToken", "value"];
    nodeMetadata[SyntaxKind.PreIncrementExpression] = ["operatorToken", "operand"];
    nodeMetadata[SyntaxKind.PreDecrementExpression] = ["operatorToken", "operand"];
    nodeMetadata[SyntaxKind.PlusExpression] = ["operatorToken", "operand"];
    nodeMetadata[SyntaxKind.NegateExpression] = ["operatorToken", "operand"];
    nodeMetadata[SyntaxKind.BitwiseNotExpression] = ["operatorToken", "operand"];
    nodeMetadata[SyntaxKind.LogicalNotExpression] = ["operatorToken", "operand"];
    nodeMetadata[SyntaxKind.ArrayLiteralExpression] = ["openBracketToken", "expressions", "closeBracketToken"];
    nodeMetadata[SyntaxKind.OmittedExpression] = [];
    nodeMetadata[SyntaxKind.ParenthesizedExpression] = ["openParenToken", "expression", "closeParenToken"];
    nodeMetadata[SyntaxKind.SimpleArrowFunctionExpression] = ["identifier", "equalsGreaterThanToken", "block", "expression"];
    nodeMetadata[SyntaxKind.ParenthesizedArrowFunctionExpression] = ["callSignature", "equalsGreaterThanToken", "block", "expression"];
    nodeMetadata[SyntaxKind.QualifiedName] = ["left", "dotToken", "right"];
    nodeMetadata[SyntaxKind.TypeArgumentList] = ["lessThanToken", "typeArguments", "greaterThanToken"];
    nodeMetadata[SyntaxKind.ConstructorType] = ["newKeyword", "typeParameterList", "parameterList", "equalsGreaterThanToken", "type"];
    nodeMetadata[SyntaxKind.FunctionType] = ["typeParameterList", "parameterList", "equalsGreaterThanToken", "type"];
    nodeMetadata[SyntaxKind.ObjectType] = ["openBraceToken", "typeMembers", "closeBraceToken"];
    nodeMetadata[SyntaxKind.ArrayType] = ["type", "openBracketToken", "closeBracketToken"];
    nodeMetadata[SyntaxKind.GenericType] = ["name", "typeArgumentList"];
    nodeMetadata[SyntaxKind.TypeQuery] = ["typeOfKeyword", "name"];
    nodeMetadata[SyntaxKind.TypeAnnotation] = ["colonToken", "type"];
    nodeMetadata[SyntaxKind.Block] = ["openBraceToken", "statements", "closeBraceToken"];
    nodeMetadata[SyntaxKind.Parameter] = ["dotDotDotToken", "modifiers", "identifier", "questionToken", "typeAnnotation", "equalsValueClause"];
    nodeMetadata[SyntaxKind.MemberAccessExpression] = ["expression", "dotToken", "name"];
    nodeMetadata[SyntaxKind.PostIncrementExpression] = ["operand", "operatorToken"];
    nodeMetadata[SyntaxKind.PostDecrementExpression] = ["operand", "operatorToken"];
    nodeMetadata[SyntaxKind.ElementAccessExpression] = ["expression", "openBracketToken", "argumentExpression", "closeBracketToken"];
    nodeMetadata[SyntaxKind.InvocationExpression] = ["expression", "argumentList"];
    nodeMetadata[SyntaxKind.ArgumentList] = ["typeArgumentList", "openParenToken", "arguments", "closeParenToken"];
    nodeMetadata[SyntaxKind.MultiplyExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.DivideExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.ModuloExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.AddExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.SubtractExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.LeftShiftExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.SignedRightShiftExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.UnsignedRightShiftExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.LessThanExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.GreaterThanExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.LessThanOrEqualExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.GreaterThanOrEqualExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.InstanceOfExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.InExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.EqualsWithTypeConversionExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.NotEqualsWithTypeConversionExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.EqualsExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.NotEqualsExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.BitwiseAndExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.BitwiseExclusiveOrExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.BitwiseOrExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.LogicalAndExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.LogicalOrExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.OrAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.AndAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.ExclusiveOrAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.LeftShiftAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.SignedRightShiftAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.UnsignedRightShiftAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.AddAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.SubtractAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.MultiplyAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.DivideAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.ModuloAssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.AssignmentExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.CommaExpression] = ["left", "operatorToken", "right"];
    nodeMetadata[SyntaxKind.ConditionalExpression] = ["condition", "questionToken", "whenTrue", "colonToken", "whenFalse"];
    nodeMetadata[SyntaxKind.ConstructSignature] = ["newKeyword", "callSignature"];
    nodeMetadata[SyntaxKind.MethodSignature] = ["propertyName", "questionToken", "callSignature"];
    nodeMetadata[SyntaxKind.IndexSignature] = ["openBracketToken", "parameter", "closeBracketToken", "typeAnnotation"];
    nodeMetadata[SyntaxKind.PropertySignature] = ["propertyName", "questionToken", "typeAnnotation"];
    nodeMetadata[SyntaxKind.CallSignature] = ["typeParameterList", "parameterList", "typeAnnotation"];
    nodeMetadata[SyntaxKind.ParameterList] = ["openParenToken", "parameters", "closeParenToken"];
    nodeMetadata[SyntaxKind.TypeParameterList] = ["lessThanToken", "typeParameters", "greaterThanToken"];
    nodeMetadata[SyntaxKind.TypeParameter] = ["identifier", "constraint"];
    nodeMetadata[SyntaxKind.Constraint] = ["extendsKeyword", "type"];
    nodeMetadata[SyntaxKind.ElseClause] = ["elseKeyword", "statement"];
    nodeMetadata[SyntaxKind.IfStatement] = ["ifKeyword", "openParenToken", "condition", "closeParenToken", "statement", "elseClause"];
    nodeMetadata[SyntaxKind.ExpressionStatement] = ["expression", "semicolonToken"];
    nodeMetadata[SyntaxKind.ConstructorDeclaration] = ["modifiers", "constructorKeyword", "callSignature", "block", "semicolonToken"];
    nodeMetadata[SyntaxKind.MemberFunctionDeclaration] = ["modifiers", "propertyName", "callSignature", "block", "semicolonToken"];
    nodeMetadata[SyntaxKind.GetAccessor] = ["modifiers", "getKeyword", "propertyName", "parameterList", "typeAnnotation", "block"];
    nodeMetadata[SyntaxKind.SetAccessor] = ["modifiers", "setKeyword", "propertyName", "parameterList", "block"];
    nodeMetadata[SyntaxKind.MemberVariableDeclaration] = ["modifiers", "variableDeclarator", "semicolonToken"];
    nodeMetadata[SyntaxKind.IndexMemberDeclaration] = ["modifiers", "indexSignature", "semicolonToken"];
    nodeMetadata[SyntaxKind.ThrowStatement] = ["throwKeyword", "expression", "semicolonToken"];
    nodeMetadata[SyntaxKind.ReturnStatement] = ["returnKeyword", "expression", "semicolonToken"];
    nodeMetadata[SyntaxKind.ObjectCreationExpression] = ["newKeyword", "expression", "argumentList"];
    nodeMetadata[SyntaxKind.SwitchStatement] = ["switchKeyword", "openParenToken", "expression", "closeParenToken", "openBraceToken", "switchClauses", "closeBraceToken"];
    nodeMetadata[SyntaxKind.CaseSwitchClause] = ["caseKeyword", "expression", "colonToken", "statements"];
    nodeMetadata[SyntaxKind.DefaultSwitchClause] = ["defaultKeyword", "colonToken", "statements"];
    nodeMetadata[SyntaxKind.BreakStatement] = ["breakKeyword", "identifier", "semicolonToken"];
    nodeMetadata[SyntaxKind.ContinueStatement] = ["continueKeyword", "identifier", "semicolonToken"];
    nodeMetadata[SyntaxKind.ForStatement] = ["forKeyword", "openParenToken", "variableDeclaration", "initializer", "firstSemicolonToken", "condition", "secondSemicolonToken", "incrementor", "closeParenToken", "statement"];
    nodeMetadata[SyntaxKind.ForInStatement] = ["forKeyword", "openParenToken", "variableDeclaration", "left", "inKeyword", "expression", "closeParenToken", "statement"];
    nodeMetadata[SyntaxKind.WhileStatement] = ["whileKeyword", "openParenToken", "condition", "closeParenToken", "statement"];
    nodeMetadata[SyntaxKind.WithStatement] = ["withKeyword", "openParenToken", "condition", "closeParenToken", "statement"];
    nodeMetadata[SyntaxKind.EnumDeclaration] = ["modifiers", "enumKeyword", "identifier", "openBraceToken", "enumElements", "closeBraceToken"];
    nodeMetadata[SyntaxKind.EnumElement] = ["propertyName", "equalsValueClause"];
    nodeMetadata[SyntaxKind.CastExpression] = ["lessThanToken", "type", "greaterThanToken", "expression"];
    nodeMetadata[SyntaxKind.ObjectLiteralExpression] = ["openBraceToken", "propertyAssignments", "closeBraceToken"];
    nodeMetadata[SyntaxKind.SimplePropertyAssignment] = ["propertyName", "colonToken", "expression"];
    nodeMetadata[SyntaxKind.FunctionPropertyAssignment] = ["propertyName", "callSignature", "block"];
    nodeMetadata[SyntaxKind.FunctionExpression] = ["functionKeyword", "identifier", "callSignature", "block"];
    nodeMetadata[SyntaxKind.EmptyStatement] = ["semicolonToken"];
    nodeMetadata[SyntaxKind.TryStatement] = ["tryKeyword", "block", "catchClause", "finallyClause"];
    nodeMetadata[SyntaxKind.CatchClause] = ["catchKeyword", "openParenToken", "identifier", "typeAnnotation", "closeParenToken", "block"];
    nodeMetadata[SyntaxKind.FinallyClause] = ["finallyKeyword", "block"];
    nodeMetadata[SyntaxKind.LabeledStatement] = ["identifier", "colonToken", "statement"];
    nodeMetadata[SyntaxKind.DoStatement] = ["doKeyword", "statement", "whileKeyword", "openParenToken", "condition", "closeParenToken", "semicolonToken"];
    nodeMetadata[SyntaxKind.TypeOfExpression] = ["typeOfKeyword", "expression"];
    nodeMetadata[SyntaxKind.DeleteExpression] = ["deleteKeyword", "expression"];
    nodeMetadata[SyntaxKind.VoidExpression] = ["voidKeyword", "expression"];
    nodeMetadata[SyntaxKind.DebuggerStatement] = ["debuggerKeyword", "semicolonToken"];

    export function childCount(element: ISyntaxElement): number {
        if (isToken(element)) {
            return 0;
        }
        else if (isList(element)) {
            var array = <ISyntaxNodeOrToken[]>element;
            return array.length;
        }
        else if (isSeparatedList(element)) {
            var array = <ISyntaxNodeOrToken[]>element;
            return array.length + array.separators.length;
        }
        else {
            Debug.assert(isNode(element));
            return nodeMetadata[element.kind].length;
        }
    }

    export function childAt(element: ISyntaxElement, index: number): ISyntaxElement {
        if (isToken(element)) {
            throw Errors.invalidOperation();
        }
        else if (isList(element)) {
            var array = <ISyntaxNodeOrToken[]>element;
            return array[index];
        }
        else if (isSeparatedList(element)) {
            var array = <ISyntaxNodeOrToken[]>element;
            return (index % 2 === 0) ? array[index / 2] : array.separators[(index - 1) / 2];
        }
        else {
            Debug.assert(isNode(element));
            var childName = nodeMetadata[element.kind][index];
            return (<any>element)[childName];
        }
    }

    export class SourceUnitSyntax extends SyntaxNode {
        public syntaxTree: SyntaxTree = null;
        constructor(public moduleElements: IModuleElementSyntax[],
                    public endOfFileToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.SourceUnit, data); 

            !isShared(moduleElements) && (moduleElements.parent = this);
            endOfFileToken.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.moduleElements;
                case 1: return this.endOfFileToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ExternalModuleReferenceSyntax extends SyntaxNode implements IModuleReferenceSyntax {
        public _isModuleReference: any;

        constructor(public requireKeyword: ISyntaxToken,
                    public openParenToken: ISyntaxToken,
                    public stringLiteral: ISyntaxToken,
                    public closeParenToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ExternalModuleReference, data); 

            requireKeyword.parent = this;
            openParenToken.parent = this;
            stringLiteral.parent = this;
            closeParenToken.parent = this;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.requireKeyword;
                case 1: return this.openParenToken;
                case 2: return this.stringLiteral;
                case 3: return this.closeParenToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ModuleNameModuleReferenceSyntax extends SyntaxNode implements IModuleReferenceSyntax {
        public _isModuleReference: any;

        constructor(public moduleName: INameSyntax,
                    data: number) {
            super(SyntaxKind.ModuleNameModuleReference, data); 

            moduleName.parent = this;
        }

        public childCount(): number {
            return 1;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.moduleName;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ImportDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        public _isModuleElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public importKeyword: ISyntaxToken,
                    public identifier: ISyntaxToken,
                    public equalsToken: ISyntaxToken,
                    public moduleReference: IModuleReferenceSyntax,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ImportDeclaration, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            importKeyword.parent = this;
            identifier.parent = this;
            equalsToken.parent = this;
            moduleReference.parent = this;
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.importKeyword;
                case 2: return this.identifier;
                case 3: return this.equalsToken;
                case 4: return this.moduleReference;
                case 5: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ExportAssignmentSyntax extends SyntaxNode implements IModuleElementSyntax {
        public _isModuleElement: any;

        constructor(public exportKeyword: ISyntaxToken,
                    public equalsToken: ISyntaxToken,
                    public identifier: ISyntaxToken,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ExportAssignment, data); 

            exportKeyword.parent = this;
            equalsToken.parent = this;
            identifier.parent = this;
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.exportKeyword;
                case 1: return this.equalsToken;
                case 2: return this.identifier;
                case 3: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ClassDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        public _isModuleElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public classKeyword: ISyntaxToken,
                    public identifier: ISyntaxToken,
                    public typeParameterList: TypeParameterListSyntax,
                    public heritageClauses: HeritageClauseSyntax[],
                    public openBraceToken: ISyntaxToken,
                    public classElements: IClassElementSyntax[],
                    public closeBraceToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ClassDeclaration, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            classKeyword.parent = this;
            identifier.parent = this;
            typeParameterList && (typeParameterList.parent = this);
            !isShared(heritageClauses) && (heritageClauses.parent = this);
            openBraceToken.parent = this;
            !isShared(classElements) && (classElements.parent = this);
            closeBraceToken.parent = this;
        }

        public childCount(): number {
            return 8;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.classKeyword;
                case 2: return this.identifier;
                case 3: return this.typeParameterList;
                case 4: return this.heritageClauses;
                case 5: return this.openBraceToken;
                case 6: return this.classElements;
                case 7: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class InterfaceDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        public _isModuleElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public interfaceKeyword: ISyntaxToken,
                    public identifier: ISyntaxToken,
                    public typeParameterList: TypeParameterListSyntax,
                    public heritageClauses: HeritageClauseSyntax[],
                    public body: ObjectTypeSyntax,
                    data: number) {
            super(SyntaxKind.InterfaceDeclaration, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            interfaceKeyword.parent = this;
            identifier.parent = this;
            typeParameterList && (typeParameterList.parent = this);
            !isShared(heritageClauses) && (heritageClauses.parent = this);
            body.parent = this;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.interfaceKeyword;
                case 2: return this.identifier;
                case 3: return this.typeParameterList;
                case 4: return this.heritageClauses;
                case 5: return this.body;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class HeritageClauseSyntax extends SyntaxNode {
        private _kind: SyntaxKind;

        constructor(kind: SyntaxKind,
                    public extendsOrImplementsKeyword: ISyntaxToken,
                    public typeNames: INameSyntax[],
                    data: number) {
            super(kind, data); 

            this._kind = kind;
            extendsOrImplementsKeyword.parent = this;
            !isShared(typeNames) && (typeNames.parent = this);
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.extendsOrImplementsKeyword;
                case 1: return this.typeNames;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ModuleDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        public _isModuleElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public moduleKeyword: ISyntaxToken,
                    public name: INameSyntax,
                    public stringLiteral: ISyntaxToken,
                    public openBraceToken: ISyntaxToken,
                    public moduleElements: IModuleElementSyntax[],
                    public closeBraceToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ModuleDeclaration, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            moduleKeyword.parent = this;
            name && (name.parent = this);
            stringLiteral && (stringLiteral.parent = this);
            openBraceToken.parent = this;
            !isShared(moduleElements) && (moduleElements.parent = this);
            closeBraceToken.parent = this;
        }

        public childCount(): number {
            return 7;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.moduleKeyword;
                case 2: return this.name;
                case 3: return this.stringLiteral;
                case 4: return this.openBraceToken;
                case 5: return this.moduleElements;
                case 6: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class FunctionDeclarationSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public functionKeyword: ISyntaxToken,
                    public identifier: ISyntaxToken,
                    public callSignature: CallSignatureSyntax,
                    public block: BlockSyntax,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.FunctionDeclaration, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            functionKeyword.parent = this;
            identifier.parent = this;
            callSignature.parent = this;
            block && (block.parent = this);
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.functionKeyword;
                case 2: return this.identifier;
                case 3: return this.callSignature;
                case 4: return this.block;
                case 5: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class VariableStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public variableDeclaration: VariableDeclarationSyntax,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.VariableStatement, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            variableDeclaration.parent = this;
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.variableDeclaration;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class VariableDeclarationSyntax extends SyntaxNode {
        constructor(public varKeyword: ISyntaxToken,
                    public variableDeclarators: VariableDeclaratorSyntax[],
                    data: number) {
            super(SyntaxKind.VariableDeclaration, data); 

            varKeyword.parent = this;
            !isShared(variableDeclarators) && (variableDeclarators.parent = this);
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.varKeyword;
                case 1: return this.variableDeclarators;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class VariableDeclaratorSyntax extends SyntaxNode {
        constructor(public propertyName: ISyntaxToken,
                    public typeAnnotation: TypeAnnotationSyntax,
                    public equalsValueClause: EqualsValueClauseSyntax,
                    data: number) {
            super(SyntaxKind.VariableDeclarator, data); 

            propertyName.parent = this;
            typeAnnotation && (typeAnnotation.parent = this);
            equalsValueClause && (equalsValueClause.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.typeAnnotation;
                case 2: return this.equalsValueClause;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class EqualsValueClauseSyntax extends SyntaxNode {
        constructor(public equalsToken: ISyntaxToken,
                    public value: IExpressionSyntax,
                    data: number) {
            super(SyntaxKind.EqualsValueClause, data); 

            equalsToken.parent = this;
            value.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.equalsToken;
                case 1: return this.value;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class PrefixUnaryExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        private _kind: SyntaxKind;

        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(kind: SyntaxKind,
                    public operatorToken: ISyntaxToken,
                    public operand: IUnaryExpressionSyntax,
                    data: number) {
            super(kind, data); 

            this._kind = kind;
            operatorToken.parent = this;
            operand.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.operatorToken;
                case 1: return this.operand;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ArrayLiteralExpressionSyntax extends SyntaxNode implements IPrimaryExpressionSyntax {
        public _isPrimaryExpression: any;
        public _isMemberExpression: any;
        public _isLeftHandSideExpression: any;
        public _isPostfixExpression: any;
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public openBracketToken: ISyntaxToken,
                    public expressions: IExpressionSyntax[],
                    public closeBracketToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ArrayLiteralExpression, data); 

            openBracketToken.parent = this;
            !isShared(expressions) && (expressions.parent = this);
            closeBracketToken.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openBracketToken;
                case 1: return this.expressions;
                case 2: return this.closeBracketToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class OmittedExpressionSyntax extends SyntaxNode implements IExpressionSyntax {
        public _isExpression: any;

        constructor(data: number) {
            super(SyntaxKind.OmittedExpression, data); 
        }

        public childCount(): number {
            return 0;
        }

        public childAt(slot: number): ISyntaxElement {
            throw Errors.invalidOperation();
        }
    }

    export class ParenthesizedExpressionSyntax extends SyntaxNode implements IPrimaryExpressionSyntax {
        public _isPrimaryExpression: any;
        public _isMemberExpression: any;
        public _isLeftHandSideExpression: any;
        public _isPostfixExpression: any;
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public openParenToken: ISyntaxToken,
                    public expression: IExpressionSyntax,
                    public closeParenToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ParenthesizedExpression, data); 

            openParenToken.parent = this;
            expression.parent = this;
            closeParenToken.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openParenToken;
                case 1: return this.expression;
                case 2: return this.closeParenToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class SimpleArrowFunctionExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public identifier: ISyntaxToken,
                    public equalsGreaterThanToken: ISyntaxToken,
                    public block: BlockSyntax,
                    public expression: IExpressionSyntax,
                    data: number) {
            super(SyntaxKind.SimpleArrowFunctionExpression, data); 

            identifier.parent = this;
            equalsGreaterThanToken.parent = this;
            block && (block.parent = this);
            expression && (expression.parent = this);
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.identifier;
                case 1: return this.equalsGreaterThanToken;
                case 2: return this.block;
                case 3: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ParenthesizedArrowFunctionExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public callSignature: CallSignatureSyntax,
                    public equalsGreaterThanToken: ISyntaxToken,
                    public block: BlockSyntax,
                    public expression: IExpressionSyntax,
                    data: number) {
            super(SyntaxKind.ParenthesizedArrowFunctionExpression, data); 

            callSignature.parent = this;
            equalsGreaterThanToken.parent = this;
            block && (block.parent = this);
            expression && (expression.parent = this);
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.callSignature;
                case 1: return this.equalsGreaterThanToken;
                case 2: return this.block;
                case 3: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class QualifiedNameSyntax extends SyntaxNode implements INameSyntax {
        public _isName: any;
        public _isType: any;

        constructor(public left: INameSyntax,
                    public dotToken: ISyntaxToken,
                    public right: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.QualifiedName, data); 

            left.parent = this;
            dotToken.parent = this;
            right.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.left;
                case 1: return this.dotToken;
                case 2: return this.right;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class TypeArgumentListSyntax extends SyntaxNode {
        constructor(public lessThanToken: ISyntaxToken,
                    public typeArguments: ITypeSyntax[],
                    public greaterThanToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.TypeArgumentList, data); 

            lessThanToken.parent = this;
            !isShared(typeArguments) && (typeArguments.parent = this);
            greaterThanToken.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.lessThanToken;
                case 1: return this.typeArguments;
                case 2: return this.greaterThanToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ConstructorTypeSyntax extends SyntaxNode implements ITypeSyntax {
        public _isType: any;

        constructor(public newKeyword: ISyntaxToken,
                    public typeParameterList: TypeParameterListSyntax,
                    public parameterList: ParameterListSyntax,
                    public equalsGreaterThanToken: ISyntaxToken,
                    public type: ITypeSyntax,
                    data: number) {
            super(SyntaxKind.ConstructorType, data); 

            newKeyword.parent = this;
            typeParameterList && (typeParameterList.parent = this);
            parameterList.parent = this;
            equalsGreaterThanToken.parent = this;
            type.parent = this;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.newKeyword;
                case 1: return this.typeParameterList;
                case 2: return this.parameterList;
                case 3: return this.equalsGreaterThanToken;
                case 4: return this.type;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class FunctionTypeSyntax extends SyntaxNode implements ITypeSyntax {
        public _isType: any;

        constructor(public typeParameterList: TypeParameterListSyntax,
                    public parameterList: ParameterListSyntax,
                    public equalsGreaterThanToken: ISyntaxToken,
                    public type: ITypeSyntax,
                    data: number) {
            super(SyntaxKind.FunctionType, data); 

            typeParameterList && (typeParameterList.parent = this);
            parameterList.parent = this;
            equalsGreaterThanToken.parent = this;
            type.parent = this;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.typeParameterList;
                case 1: return this.parameterList;
                case 2: return this.equalsGreaterThanToken;
                case 3: return this.type;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ObjectTypeSyntax extends SyntaxNode implements ITypeSyntax {
        public _isType: any;

        constructor(public openBraceToken: ISyntaxToken,
                    public typeMembers: ITypeMemberSyntax[],
                    public closeBraceToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ObjectType, data); 

            openBraceToken.parent = this;
            !isShared(typeMembers) && (typeMembers.parent = this);
            closeBraceToken.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openBraceToken;
                case 1: return this.typeMembers;
                case 2: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ArrayTypeSyntax extends SyntaxNode implements ITypeSyntax {
        public _isType: any;

        constructor(public type: ITypeSyntax,
                    public openBracketToken: ISyntaxToken,
                    public closeBracketToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ArrayType, data); 

            type.parent = this;
            openBracketToken.parent = this;
            closeBracketToken.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.type;
                case 1: return this.openBracketToken;
                case 2: return this.closeBracketToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class GenericTypeSyntax extends SyntaxNode implements ITypeSyntax {
        public _isType: any;

        constructor(public name: INameSyntax,
                    public typeArgumentList: TypeArgumentListSyntax,
                    data: number) {
            super(SyntaxKind.GenericType, data); 

            name.parent = this;
            typeArgumentList.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.name;
                case 1: return this.typeArgumentList;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class TypeQuerySyntax extends SyntaxNode implements ITypeSyntax {
        public _isType: any;

        constructor(public typeOfKeyword: ISyntaxToken,
                    public name: INameSyntax,
                    data: number) {
            super(SyntaxKind.TypeQuery, data); 

            typeOfKeyword.parent = this;
            name.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.typeOfKeyword;
                case 1: return this.name;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class TypeAnnotationSyntax extends SyntaxNode {
        constructor(public colonToken: ISyntaxToken,
                    public type: ITypeSyntax,
                    data: number) {
            super(SyntaxKind.TypeAnnotation, data); 

            colonToken.parent = this;
            type.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.colonToken;
                case 1: return this.type;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class BlockSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public openBraceToken: ISyntaxToken,
                    public statements: IStatementSyntax[],
                    public closeBraceToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.Block, data); 

            openBraceToken.parent = this;
            !isShared(statements) && (statements.parent = this);
            closeBraceToken.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openBraceToken;
                case 1: return this.statements;
                case 2: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ParameterSyntax extends SyntaxNode {
        constructor(public dotDotDotToken: ISyntaxToken,
                    public modifiers: ISyntaxToken[],
                    public identifier: ISyntaxToken,
                    public questionToken: ISyntaxToken,
                    public typeAnnotation: TypeAnnotationSyntax,
                    public equalsValueClause: EqualsValueClauseSyntax,
                    data: number) {
            super(SyntaxKind.Parameter, data); 

            dotDotDotToken && (dotDotDotToken.parent = this);
            !isShared(modifiers) && (modifiers.parent = this);
            identifier.parent = this;
            questionToken && (questionToken.parent = this);
            typeAnnotation && (typeAnnotation.parent = this);
            equalsValueClause && (equalsValueClause.parent = this);
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.dotDotDotToken;
                case 1: return this.modifiers;
                case 2: return this.identifier;
                case 3: return this.questionToken;
                case 4: return this.typeAnnotation;
                case 5: return this.equalsValueClause;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class MemberAccessExpressionSyntax extends SyntaxNode implements IMemberExpressionSyntax, ICallExpressionSyntax {
        public _isMemberExpression: any;
        public _isCallExpression: any;
        public _isLeftHandSideExpression: any;
        public _isPostfixExpression: any;
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public expression: ILeftHandSideExpressionSyntax,
                    public dotToken: ISyntaxToken,
                    public name: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.MemberAccessExpression, data); 

            expression.parent = this;
            dotToken.parent = this;
            name.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.expression;
                case 1: return this.dotToken;
                case 2: return this.name;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class PostfixUnaryExpressionSyntax extends SyntaxNode implements IPostfixExpressionSyntax {
        private _kind: SyntaxKind;

        public _isPostfixExpression: any;
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(kind: SyntaxKind,
                    public operand: ILeftHandSideExpressionSyntax,
                    public operatorToken: ISyntaxToken,
                    data: number) {
            super(kind, data); 

            this._kind = kind;
            operand.parent = this;
            operatorToken.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.operand;
                case 1: return this.operatorToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ElementAccessExpressionSyntax extends SyntaxNode implements IMemberExpressionSyntax, ICallExpressionSyntax {
        public _isMemberExpression: any;
        public _isCallExpression: any;
        public _isLeftHandSideExpression: any;
        public _isPostfixExpression: any;
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public expression: ILeftHandSideExpressionSyntax,
                    public openBracketToken: ISyntaxToken,
                    public argumentExpression: IExpressionSyntax,
                    public closeBracketToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ElementAccessExpression, data); 

            expression.parent = this;
            openBracketToken.parent = this;
            argumentExpression.parent = this;
            closeBracketToken.parent = this;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.expression;
                case 1: return this.openBracketToken;
                case 2: return this.argumentExpression;
                case 3: return this.closeBracketToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class InvocationExpressionSyntax extends SyntaxNode implements ICallExpressionSyntax {
        public _isCallExpression: any;
        public _isLeftHandSideExpression: any;
        public _isPostfixExpression: any;
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public expression: ILeftHandSideExpressionSyntax,
                    public argumentList: ArgumentListSyntax,
                    data: number) {
            super(SyntaxKind.InvocationExpression, data); 

            expression.parent = this;
            argumentList.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.expression;
                case 1: return this.argumentList;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ArgumentListSyntax extends SyntaxNode {
    public arguments: IExpressionSyntax[];
        constructor(public typeArgumentList: TypeArgumentListSyntax,
                    public openParenToken: ISyntaxToken,
                    _arguments: IExpressionSyntax[],
                    public closeParenToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ArgumentList, data); 

            this.arguments = _arguments;
            typeArgumentList && (typeArgumentList.parent = this);
            openParenToken.parent = this;
            !isShared(_arguments) && (_arguments.parent = this);
            closeParenToken.parent = this;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.typeArgumentList;
                case 1: return this.openParenToken;
                case 2: return this.arguments;
                case 3: return this.closeParenToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class BinaryExpressionSyntax extends SyntaxNode implements IExpressionSyntax {
        private _kind: SyntaxKind;

        public _isExpression: any;

        constructor(kind: SyntaxKind,
                    public left: IExpressionSyntax,
                    public operatorToken: ISyntaxToken,
                    public right: IExpressionSyntax,
                    data: number) {
            super(kind, data); 

            this._kind = kind;
            left.parent = this;
            operatorToken.parent = this;
            right.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.left;
                case 1: return this.operatorToken;
                case 2: return this.right;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ConditionalExpressionSyntax extends SyntaxNode implements IExpressionSyntax {
        public _isExpression: any;

        constructor(public condition: IExpressionSyntax,
                    public questionToken: ISyntaxToken,
                    public whenTrue: IExpressionSyntax,
                    public colonToken: ISyntaxToken,
                    public whenFalse: IExpressionSyntax,
                    data: number) {
            super(SyntaxKind.ConditionalExpression, data); 

            condition.parent = this;
            questionToken.parent = this;
            whenTrue.parent = this;
            colonToken.parent = this;
            whenFalse.parent = this;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.condition;
                case 1: return this.questionToken;
                case 2: return this.whenTrue;
                case 3: return this.colonToken;
                case 4: return this.whenFalse;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ConstructSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        public _isTypeMember: any;

        constructor(public newKeyword: ISyntaxToken,
                    public callSignature: CallSignatureSyntax,
                    data: number) {
            super(SyntaxKind.ConstructSignature, data); 

            newKeyword.parent = this;
            callSignature.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.newKeyword;
                case 1: return this.callSignature;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class MethodSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        public _isTypeMember: any;

        constructor(public propertyName: ISyntaxToken,
                    public questionToken: ISyntaxToken,
                    public callSignature: CallSignatureSyntax,
                    data: number) {
            super(SyntaxKind.MethodSignature, data); 

            propertyName.parent = this;
            questionToken && (questionToken.parent = this);
            callSignature.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.questionToken;
                case 2: return this.callSignature;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class IndexSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        public _isTypeMember: any;

        constructor(public openBracketToken: ISyntaxToken,
                    public parameter: ParameterSyntax,
                    public closeBracketToken: ISyntaxToken,
                    public typeAnnotation: TypeAnnotationSyntax,
                    data: number) {
            super(SyntaxKind.IndexSignature, data); 

            openBracketToken.parent = this;
            parameter.parent = this;
            closeBracketToken.parent = this;
            typeAnnotation && (typeAnnotation.parent = this);
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openBracketToken;
                case 1: return this.parameter;
                case 2: return this.closeBracketToken;
                case 3: return this.typeAnnotation;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class PropertySignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        public _isTypeMember: any;

        constructor(public propertyName: ISyntaxToken,
                    public questionToken: ISyntaxToken,
                    public typeAnnotation: TypeAnnotationSyntax,
                    data: number) {
            super(SyntaxKind.PropertySignature, data); 

            propertyName.parent = this;
            questionToken && (questionToken.parent = this);
            typeAnnotation && (typeAnnotation.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.questionToken;
                case 2: return this.typeAnnotation;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class CallSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        public _isTypeMember: any;

        constructor(public typeParameterList: TypeParameterListSyntax,
                    public parameterList: ParameterListSyntax,
                    public typeAnnotation: TypeAnnotationSyntax,
                    data: number) {
            super(SyntaxKind.CallSignature, data); 

            typeParameterList && (typeParameterList.parent = this);
            parameterList.parent = this;
            typeAnnotation && (typeAnnotation.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.typeParameterList;
                case 1: return this.parameterList;
                case 2: return this.typeAnnotation;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ParameterListSyntax extends SyntaxNode {
        constructor(public openParenToken: ISyntaxToken,
                    public parameters: ParameterSyntax[],
                    public closeParenToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ParameterList, data); 

            openParenToken.parent = this;
            !isShared(parameters) && (parameters.parent = this);
            closeParenToken.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openParenToken;
                case 1: return this.parameters;
                case 2: return this.closeParenToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class TypeParameterListSyntax extends SyntaxNode {
        constructor(public lessThanToken: ISyntaxToken,
                    public typeParameters: TypeParameterSyntax[],
                    public greaterThanToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.TypeParameterList, data); 

            lessThanToken.parent = this;
            !isShared(typeParameters) && (typeParameters.parent = this);
            greaterThanToken.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.lessThanToken;
                case 1: return this.typeParameters;
                case 2: return this.greaterThanToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class TypeParameterSyntax extends SyntaxNode {
        constructor(public identifier: ISyntaxToken,
                    public constraint: ConstraintSyntax,
                    data: number) {
            super(SyntaxKind.TypeParameter, data); 

            identifier.parent = this;
            constraint && (constraint.parent = this);
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.identifier;
                case 1: return this.constraint;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ConstraintSyntax extends SyntaxNode {
        constructor(public extendsKeyword: ISyntaxToken,
                    public type: ITypeSyntax,
                    data: number) {
            super(SyntaxKind.Constraint, data); 

            extendsKeyword.parent = this;
            type.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.extendsKeyword;
                case 1: return this.type;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ElseClauseSyntax extends SyntaxNode {
        constructor(public elseKeyword: ISyntaxToken,
                    public statement: IStatementSyntax,
                    data: number) {
            super(SyntaxKind.ElseClause, data); 

            elseKeyword.parent = this;
            statement.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.elseKeyword;
                case 1: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class IfStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public ifKeyword: ISyntaxToken,
                    public openParenToken: ISyntaxToken,
                    public condition: IExpressionSyntax,
                    public closeParenToken: ISyntaxToken,
                    public statement: IStatementSyntax,
                    public elseClause: ElseClauseSyntax,
                    data: number) {
            super(SyntaxKind.IfStatement, data); 

            ifKeyword.parent = this;
            openParenToken.parent = this;
            condition.parent = this;
            closeParenToken.parent = this;
            statement.parent = this;
            elseClause && (elseClause.parent = this);
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.ifKeyword;
                case 1: return this.openParenToken;
                case 2: return this.condition;
                case 3: return this.closeParenToken;
                case 4: return this.statement;
                case 5: return this.elseClause;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ExpressionStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public expression: IExpressionSyntax,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ExpressionStatement, data); 

            expression.parent = this;
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.expression;
                case 1: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ConstructorDeclarationSyntax extends SyntaxNode implements IClassElementSyntax {
        public _isClassElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public constructorKeyword: ISyntaxToken,
                    public callSignature: CallSignatureSyntax,
                    public block: BlockSyntax,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ConstructorDeclaration, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            constructorKeyword.parent = this;
            callSignature.parent = this;
            block && (block.parent = this);
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.constructorKeyword;
                case 2: return this.callSignature;
                case 3: return this.block;
                case 4: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class MemberFunctionDeclarationSyntax extends SyntaxNode implements IMemberDeclarationSyntax {
        public _isMemberDeclaration: any;
        public _isClassElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public propertyName: ISyntaxToken,
                    public callSignature: CallSignatureSyntax,
                    public block: BlockSyntax,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.MemberFunctionDeclaration, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            propertyName.parent = this;
            callSignature.parent = this;
            block && (block.parent = this);
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.propertyName;
                case 2: return this.callSignature;
                case 3: return this.block;
                case 4: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class GetAccessorSyntax extends SyntaxNode implements IMemberDeclarationSyntax, IPropertyAssignmentSyntax {
        public _isMemberDeclaration: any;
        public _isPropertyAssignment: any;
        public _isClassElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public getKeyword: ISyntaxToken,
                    public propertyName: ISyntaxToken,
                    public parameterList: ParameterListSyntax,
                    public typeAnnotation: TypeAnnotationSyntax,
                    public block: BlockSyntax,
                    data: number) {
            super(SyntaxKind.GetAccessor, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            getKeyword.parent = this;
            propertyName.parent = this;
            parameterList.parent = this;
            typeAnnotation && (typeAnnotation.parent = this);
            block.parent = this;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.getKeyword;
                case 2: return this.propertyName;
                case 3: return this.parameterList;
                case 4: return this.typeAnnotation;
                case 5: return this.block;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class SetAccessorSyntax extends SyntaxNode implements IMemberDeclarationSyntax, IPropertyAssignmentSyntax {
        public _isMemberDeclaration: any;
        public _isPropertyAssignment: any;
        public _isClassElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public setKeyword: ISyntaxToken,
                    public propertyName: ISyntaxToken,
                    public parameterList: ParameterListSyntax,
                    public block: BlockSyntax,
                    data: number) {
            super(SyntaxKind.SetAccessor, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            setKeyword.parent = this;
            propertyName.parent = this;
            parameterList.parent = this;
            block.parent = this;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.setKeyword;
                case 2: return this.propertyName;
                case 3: return this.parameterList;
                case 4: return this.block;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class MemberVariableDeclarationSyntax extends SyntaxNode implements IMemberDeclarationSyntax {
        public _isMemberDeclaration: any;
        public _isClassElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public variableDeclarator: VariableDeclaratorSyntax,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.MemberVariableDeclaration, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            variableDeclarator.parent = this;
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.variableDeclarator;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class IndexMemberDeclarationSyntax extends SyntaxNode implements IClassElementSyntax {
        public _isClassElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public indexSignature: IndexSignatureSyntax,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.IndexMemberDeclaration, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            indexSignature.parent = this;
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.indexSignature;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ThrowStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public throwKeyword: ISyntaxToken,
                    public expression: IExpressionSyntax,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ThrowStatement, data); 

            throwKeyword.parent = this;
            expression.parent = this;
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.throwKeyword;
                case 1: return this.expression;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ReturnStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public returnKeyword: ISyntaxToken,
                    public expression: IExpressionSyntax,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ReturnStatement, data); 

            returnKeyword.parent = this;
            expression && (expression.parent = this);
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.returnKeyword;
                case 1: return this.expression;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ObjectCreationExpressionSyntax extends SyntaxNode implements IMemberExpressionSyntax {
        public _isMemberExpression: any;
        public _isLeftHandSideExpression: any;
        public _isPostfixExpression: any;
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public newKeyword: ISyntaxToken,
                    public expression: IMemberExpressionSyntax,
                    public argumentList: ArgumentListSyntax,
                    data: number) {
            super(SyntaxKind.ObjectCreationExpression, data); 

            newKeyword.parent = this;
            expression.parent = this;
            argumentList && (argumentList.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.newKeyword;
                case 1: return this.expression;
                case 2: return this.argumentList;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class SwitchStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public switchKeyword: ISyntaxToken,
                    public openParenToken: ISyntaxToken,
                    public expression: IExpressionSyntax,
                    public closeParenToken: ISyntaxToken,
                    public openBraceToken: ISyntaxToken,
                    public switchClauses: ISwitchClauseSyntax[],
                    public closeBraceToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.SwitchStatement, data); 

            switchKeyword.parent = this;
            openParenToken.parent = this;
            expression.parent = this;
            closeParenToken.parent = this;
            openBraceToken.parent = this;
            !isShared(switchClauses) && (switchClauses.parent = this);
            closeBraceToken.parent = this;
        }

        public childCount(): number {
            return 7;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.switchKeyword;
                case 1: return this.openParenToken;
                case 2: return this.expression;
                case 3: return this.closeParenToken;
                case 4: return this.openBraceToken;
                case 5: return this.switchClauses;
                case 6: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class CaseSwitchClauseSyntax extends SyntaxNode implements ISwitchClauseSyntax {
        public _isSwitchClause: any;

        constructor(public caseKeyword: ISyntaxToken,
                    public expression: IExpressionSyntax,
                    public colonToken: ISyntaxToken,
                    public statements: IStatementSyntax[],
                    data: number) {
            super(SyntaxKind.CaseSwitchClause, data); 

            caseKeyword.parent = this;
            expression.parent = this;
            colonToken.parent = this;
            !isShared(statements) && (statements.parent = this);
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.caseKeyword;
                case 1: return this.expression;
                case 2: return this.colonToken;
                case 3: return this.statements;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class DefaultSwitchClauseSyntax extends SyntaxNode implements ISwitchClauseSyntax {
        public _isSwitchClause: any;

        constructor(public defaultKeyword: ISyntaxToken,
                    public colonToken: ISyntaxToken,
                    public statements: IStatementSyntax[],
                    data: number) {
            super(SyntaxKind.DefaultSwitchClause, data); 

            defaultKeyword.parent = this;
            colonToken.parent = this;
            !isShared(statements) && (statements.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.defaultKeyword;
                case 1: return this.colonToken;
                case 2: return this.statements;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class BreakStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public breakKeyword: ISyntaxToken,
                    public identifier: ISyntaxToken,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.BreakStatement, data); 

            breakKeyword.parent = this;
            identifier && (identifier.parent = this);
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.breakKeyword;
                case 1: return this.identifier;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ContinueStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public continueKeyword: ISyntaxToken,
                    public identifier: ISyntaxToken,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ContinueStatement, data); 

            continueKeyword.parent = this;
            identifier && (identifier.parent = this);
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.continueKeyword;
                case 1: return this.identifier;
                case 2: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ForStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public forKeyword: ISyntaxToken,
                    public openParenToken: ISyntaxToken,
                    public variableDeclaration: VariableDeclarationSyntax,
                    public initializer: IExpressionSyntax,
                    public firstSemicolonToken: ISyntaxToken,
                    public condition: IExpressionSyntax,
                    public secondSemicolonToken: ISyntaxToken,
                    public incrementor: IExpressionSyntax,
                    public closeParenToken: ISyntaxToken,
                    public statement: IStatementSyntax,
                    data: number) {
            super(SyntaxKind.ForStatement, data); 

            forKeyword.parent = this;
            openParenToken.parent = this;
            variableDeclaration && (variableDeclaration.parent = this);
            initializer && (initializer.parent = this);
            firstSemicolonToken.parent = this;
            condition && (condition.parent = this);
            secondSemicolonToken.parent = this;
            incrementor && (incrementor.parent = this);
            closeParenToken.parent = this;
            statement.parent = this;
        }

        public childCount(): number {
            return 10;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.forKeyword;
                case 1: return this.openParenToken;
                case 2: return this.variableDeclaration;
                case 3: return this.initializer;
                case 4: return this.firstSemicolonToken;
                case 5: return this.condition;
                case 6: return this.secondSemicolonToken;
                case 7: return this.incrementor;
                case 8: return this.closeParenToken;
                case 9: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ForInStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public forKeyword: ISyntaxToken,
                    public openParenToken: ISyntaxToken,
                    public variableDeclaration: VariableDeclarationSyntax,
                    public left: IExpressionSyntax,
                    public inKeyword: ISyntaxToken,
                    public expression: IExpressionSyntax,
                    public closeParenToken: ISyntaxToken,
                    public statement: IStatementSyntax,
                    data: number) {
            super(SyntaxKind.ForInStatement, data); 

            forKeyword.parent = this;
            openParenToken.parent = this;
            variableDeclaration && (variableDeclaration.parent = this);
            left && (left.parent = this);
            inKeyword.parent = this;
            expression.parent = this;
            closeParenToken.parent = this;
            statement.parent = this;
        }

        public childCount(): number {
            return 8;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.forKeyword;
                case 1: return this.openParenToken;
                case 2: return this.variableDeclaration;
                case 3: return this.left;
                case 4: return this.inKeyword;
                case 5: return this.expression;
                case 6: return this.closeParenToken;
                case 7: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class WhileStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public whileKeyword: ISyntaxToken,
                    public openParenToken: ISyntaxToken,
                    public condition: IExpressionSyntax,
                    public closeParenToken: ISyntaxToken,
                    public statement: IStatementSyntax,
                    data: number) {
            super(SyntaxKind.WhileStatement, data); 

            whileKeyword.parent = this;
            openParenToken.parent = this;
            condition.parent = this;
            closeParenToken.parent = this;
            statement.parent = this;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.whileKeyword;
                case 1: return this.openParenToken;
                case 2: return this.condition;
                case 3: return this.closeParenToken;
                case 4: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class WithStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public withKeyword: ISyntaxToken,
                    public openParenToken: ISyntaxToken,
                    public condition: IExpressionSyntax,
                    public closeParenToken: ISyntaxToken,
                    public statement: IStatementSyntax,
                    data: number) {
            super(SyntaxKind.WithStatement, data); 

            withKeyword.parent = this;
            openParenToken.parent = this;
            condition.parent = this;
            closeParenToken.parent = this;
            statement.parent = this;
        }

        public childCount(): number {
            return 5;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.withKeyword;
                case 1: return this.openParenToken;
                case 2: return this.condition;
                case 3: return this.closeParenToken;
                case 4: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class EnumDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        public _isModuleElement: any;

        constructor(public modifiers: ISyntaxToken[],
                    public enumKeyword: ISyntaxToken,
                    public identifier: ISyntaxToken,
                    public openBraceToken: ISyntaxToken,
                    public enumElements: EnumElementSyntax[],
                    public closeBraceToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.EnumDeclaration, data); 

            !isShared(modifiers) && (modifiers.parent = this);
            enumKeyword.parent = this;
            identifier.parent = this;
            openBraceToken.parent = this;
            !isShared(enumElements) && (enumElements.parent = this);
            closeBraceToken.parent = this;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.modifiers;
                case 1: return this.enumKeyword;
                case 2: return this.identifier;
                case 3: return this.openBraceToken;
                case 4: return this.enumElements;
                case 5: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class EnumElementSyntax extends SyntaxNode {
        constructor(public propertyName: ISyntaxToken,
                    public equalsValueClause: EqualsValueClauseSyntax,
                    data: number) {
            super(SyntaxKind.EnumElement, data); 

            propertyName.parent = this;
            equalsValueClause && (equalsValueClause.parent = this);
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.equalsValueClause;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class CastExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public lessThanToken: ISyntaxToken,
                    public type: ITypeSyntax,
                    public greaterThanToken: ISyntaxToken,
                    public expression: IUnaryExpressionSyntax,
                    data: number) {
            super(SyntaxKind.CastExpression, data); 

            lessThanToken.parent = this;
            type.parent = this;
            greaterThanToken.parent = this;
            expression.parent = this;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.lessThanToken;
                case 1: return this.type;
                case 2: return this.greaterThanToken;
                case 3: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class ObjectLiteralExpressionSyntax extends SyntaxNode implements IPrimaryExpressionSyntax {
        public _isPrimaryExpression: any;
        public _isMemberExpression: any;
        public _isLeftHandSideExpression: any;
        public _isPostfixExpression: any;
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public openBraceToken: ISyntaxToken,
                    public propertyAssignments: IPropertyAssignmentSyntax[],
                    public closeBraceToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.ObjectLiteralExpression, data); 

            openBraceToken.parent = this;
            !isShared(propertyAssignments) && (propertyAssignments.parent = this);
            closeBraceToken.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.openBraceToken;
                case 1: return this.propertyAssignments;
                case 2: return this.closeBraceToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class SimplePropertyAssignmentSyntax extends SyntaxNode implements IPropertyAssignmentSyntax {
        public _isPropertyAssignment: any;

        constructor(public propertyName: ISyntaxToken,
                    public colonToken: ISyntaxToken,
                    public expression: IExpressionSyntax,
                    data: number) {
            super(SyntaxKind.SimplePropertyAssignment, data); 

            propertyName.parent = this;
            colonToken.parent = this;
            expression.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.colonToken;
                case 2: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class FunctionPropertyAssignmentSyntax extends SyntaxNode implements IPropertyAssignmentSyntax {
        public _isPropertyAssignment: any;

        constructor(public propertyName: ISyntaxToken,
                    public callSignature: CallSignatureSyntax,
                    public block: BlockSyntax,
                    data: number) {
            super(SyntaxKind.FunctionPropertyAssignment, data); 

            propertyName.parent = this;
            callSignature.parent = this;
            block.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.propertyName;
                case 1: return this.callSignature;
                case 2: return this.block;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class FunctionExpressionSyntax extends SyntaxNode implements IPrimaryExpressionSyntax {
        public _isPrimaryExpression: any;
        public _isMemberExpression: any;
        public _isLeftHandSideExpression: any;
        public _isPostfixExpression: any;
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public functionKeyword: ISyntaxToken,
                    public identifier: ISyntaxToken,
                    public callSignature: CallSignatureSyntax,
                    public block: BlockSyntax,
                    data: number) {
            super(SyntaxKind.FunctionExpression, data); 

            functionKeyword.parent = this;
            identifier && (identifier.parent = this);
            callSignature.parent = this;
            block.parent = this;
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.functionKeyword;
                case 1: return this.identifier;
                case 2: return this.callSignature;
                case 3: return this.block;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class EmptyStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.EmptyStatement, data); 

            semicolonToken.parent = this;
        }

        public childCount(): number {
            return 1;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class TryStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public tryKeyword: ISyntaxToken,
                    public block: BlockSyntax,
                    public catchClause: CatchClauseSyntax,
                    public finallyClause: FinallyClauseSyntax,
                    data: number) {
            super(SyntaxKind.TryStatement, data); 

            tryKeyword.parent = this;
            block.parent = this;
            catchClause && (catchClause.parent = this);
            finallyClause && (finallyClause.parent = this);
        }

        public childCount(): number {
            return 4;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.tryKeyword;
                case 1: return this.block;
                case 2: return this.catchClause;
                case 3: return this.finallyClause;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class CatchClauseSyntax extends SyntaxNode {
        constructor(public catchKeyword: ISyntaxToken,
                    public openParenToken: ISyntaxToken,
                    public identifier: ISyntaxToken,
                    public typeAnnotation: TypeAnnotationSyntax,
                    public closeParenToken: ISyntaxToken,
                    public block: BlockSyntax,
                    data: number) {
            super(SyntaxKind.CatchClause, data); 

            catchKeyword.parent = this;
            openParenToken.parent = this;
            identifier.parent = this;
            typeAnnotation && (typeAnnotation.parent = this);
            closeParenToken.parent = this;
            block.parent = this;
        }

        public childCount(): number {
            return 6;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.catchKeyword;
                case 1: return this.openParenToken;
                case 2: return this.identifier;
                case 3: return this.typeAnnotation;
                case 4: return this.closeParenToken;
                case 5: return this.block;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class FinallyClauseSyntax extends SyntaxNode {
        constructor(public finallyKeyword: ISyntaxToken,
                    public block: BlockSyntax,
                    data: number) {
            super(SyntaxKind.FinallyClause, data); 

            finallyKeyword.parent = this;
            block.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.finallyKeyword;
                case 1: return this.block;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class LabeledStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public identifier: ISyntaxToken,
                    public colonToken: ISyntaxToken,
                    public statement: IStatementSyntax,
                    data: number) {
            super(SyntaxKind.LabeledStatement, data); 

            identifier.parent = this;
            colonToken.parent = this;
            statement.parent = this;
        }

        public childCount(): number {
            return 3;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.identifier;
                case 1: return this.colonToken;
                case 2: return this.statement;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class DoStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public doKeyword: ISyntaxToken,
                    public statement: IStatementSyntax,
                    public whileKeyword: ISyntaxToken,
                    public openParenToken: ISyntaxToken,
                    public condition: IExpressionSyntax,
                    public closeParenToken: ISyntaxToken,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.DoStatement, data); 

            doKeyword.parent = this;
            statement.parent = this;
            whileKeyword.parent = this;
            openParenToken.parent = this;
            condition.parent = this;
            closeParenToken.parent = this;
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 7;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.doKeyword;
                case 1: return this.statement;
                case 2: return this.whileKeyword;
                case 3: return this.openParenToken;
                case 4: return this.condition;
                case 5: return this.closeParenToken;
                case 6: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class TypeOfExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public typeOfKeyword: ISyntaxToken,
                    public expression: IUnaryExpressionSyntax,
                    data: number) {
            super(SyntaxKind.TypeOfExpression, data); 

            typeOfKeyword.parent = this;
            expression.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.typeOfKeyword;
                case 1: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class DeleteExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public deleteKeyword: ISyntaxToken,
                    public expression: IUnaryExpressionSyntax,
                    data: number) {
            super(SyntaxKind.DeleteExpression, data); 

            deleteKeyword.parent = this;
            expression.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.deleteKeyword;
                case 1: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class VoidExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public _isUnaryExpression: any;
        public _isExpression: any;

        constructor(public voidKeyword: ISyntaxToken,
                    public expression: IUnaryExpressionSyntax,
                    data: number) {
            super(SyntaxKind.VoidExpression, data); 

            voidKeyword.parent = this;
            expression.parent = this;
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.voidKeyword;
                case 1: return this.expression;
                default: throw Errors.invalidOperation();
            }
        }
    }

    export class DebuggerStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public _isStatement: any;
        public _isModuleElement: any;

        constructor(public debuggerKeyword: ISyntaxToken,
                    public semicolonToken: ISyntaxToken,
                    data: number) {
            super(SyntaxKind.DebuggerStatement, data); 

            debuggerKeyword.parent = this;
            semicolonToken && (semicolonToken.parent = this);
        }

        public childCount(): number {
            return 2;
        }

        public childAt(slot: number): ISyntaxElement {
            switch (slot) {
                case 0: return this.debuggerKeyword;
                case 1: return this.semicolonToken;
                default: throw Errors.invalidOperation();
            }
        }
    }
}