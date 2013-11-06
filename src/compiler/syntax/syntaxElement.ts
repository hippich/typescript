///<reference path='references.ts' />

module TypeScript {
    export interface ISyntaxElement {
        syntaxID(): number;
        syntaxTree(): SyntaxTree;
        fileName(): string;

        kind(): SyntaxKind;
        parent: ISyntaxElement;

        isNode(): boolean;
        isToken(): boolean;
        isList(): boolean;
        isSeparatedList(): boolean;

        childCount(): number;
        childAt(index: number): ISyntaxElement;

        // True if there is only a single instance of this element (and thus can be reused in many 
        // places in a syntax tree).  Examples of this include our empty lists.  Because empty 
        // lists can be found all over the tree, we want to save on memory by using this single
        // instance instead of creating new objects for each case.  Note: because of this, shared
        // nodes don't have positions or parents.
        isShared(): boolean;

        // True if this element is typescript specific and would not be legal in pure javascript.
        isTypeScriptSpecific(): boolean;

        // True if this element cannot be reused in incremental parsing.  There are several situations
        // in which an element can not be reused.  They are:
        //
        // 1) The element contained skipped text.
        // 2) The element contained zero width tokens.
        // 3) The element contains tokens generated by the parser (like >> or a keyword -> identifier
        //    conversion).
        // 4) The element contains a regex token somewhere under it.  A regex token is either a 
        //    regex itself (i.e. /foo/), or is a token which could start a regex (i.e. "/" or "/=").  This
        //    data is used by the incremental parser to decide if a node can be reused.  Due to the 
        //    lookahead nature of regex tokens, a node containing a regex token cannot be reused.  Normally,
        //    changes to text only affect the tokens directly intersected.  However, because regex tokens 
        //    have such unbounded lookahead (technically bounded at the end of a line, but htat's minor), 
        //    we need to recheck them to see if they've changed due to the edit.  For example, if you had:
        //    
        //         while (true) /3; return;
        //    
        //    And you changed it to:
        //    
        //         while (true) /3; return/;
        //    
        //    Then even though only the 'return' and ';' colons were touched, we'd want to rescan the '/'
        //    token which we would then realize was a regex.
        isIncrementallyUnusable(): boolean;

        // With of this element, including leading and trailing trivia.
        fullWidth(): number;

        // Width of this element, not including leading and trailing trivia.
        width(): number;

        // The absolute start of this element, including the leading trivia.
        fullStart(): number;

        // The absolute end of this element, including the trailing trivia.
        fullEnd(): number;

        // The absolute start of this element, not including the leading trivia.
        start(): number;

        // The absolute start of this element, not including the trailing trivia.
        end(): number;

        // Text for this element, including leading and trailing trivia.
        fullText(): string;

        leadingTrivia(): ISyntaxTriviaList;
        trailingTrivia(): ISyntaxTriviaList;

        leadingTriviaWidth(): number;
        trailingTriviaWidth(): number;

        firstToken(): ISyntaxToken;
        lastToken(): ISyntaxToken;

        collectTextElements(elements: string[]): void;
    }

    export interface ISyntaxNode extends ISyntaxNodeOrToken {
    }

    export interface IModuleReferenceSyntax extends ISyntaxNode {
        isModuleReference(): boolean;
    }

    export interface IModuleElementSyntax extends ISyntaxNode {
    }

    export interface IStatementSyntax extends IModuleElementSyntax {
        isStatement(): boolean;
    }

    export interface IIterationStatementSyntax extends IStatementSyntax {
        isIterationStatement(): boolean;
    }

    export interface ITypeMemberSyntax extends ISyntaxNode {
    }

    export interface IClassElementSyntax extends ISyntaxNode {
    }

    export interface IMemberDeclarationSyntax extends IClassElementSyntax {
    }

    export interface IPropertyAssignmentSyntax extends IClassElementSyntax {
    }

    export interface ISwitchClauseSyntax extends ISyntaxNode {
        isSwitchClause(): boolean;
        statements: ISyntaxList;
    }

    export interface IExpressionSyntax extends ISyntaxNodeOrToken {
        isExpression(): boolean;
        withLeadingTrivia(trivia: ISyntaxTriviaList): IExpressionSyntax;
        withTrailingTrivia(trivia: ISyntaxTriviaList): IExpressionSyntax;
    }

    export interface IUnaryExpressionSyntax extends IExpressionSyntax {
        isUnaryExpression(): boolean;
    }

    export interface IArrowFunctionExpressionSyntax extends IUnaryExpressionSyntax {
        isArrowFunctionExpression(): boolean;
        equalsGreaterThanToken: ISyntaxToken;
        block: BlockSyntax;
        expression: IExpressionSyntax;
    }

    export interface IPostfixExpressionSyntax extends IUnaryExpressionSyntax {
        isPostfixExpression(): boolean;
    }

    export interface IMemberExpressionSyntax extends IPostfixExpressionSyntax {
        isMemberExpression(): boolean;
    }

    export interface IPrimaryExpressionSyntax extends IMemberExpressionSyntax {
        isPrimaryExpression(): boolean;
    }

    export interface ITypeSyntax extends ISyntaxNodeOrToken {
    }

    export interface INameSyntax extends ITypeSyntax {
    }
}