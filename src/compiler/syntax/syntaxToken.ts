///<reference path='references.ts' />

module TypeScript {
    export interface ISyntaxToken extends ISyntaxNodeOrToken, INameSyntax, IPrimaryExpressionSyntax {
        // Adjusts the full start and text of this token.  Should only be called by the parser.
        setTextAndFullStart(text: ISimpleText, fullStart: number): void;

        // Text for this token, not including leading or trailing trivia.
        text(): string;

        value(): any;
        valueText(): string;

        hasLeadingTrivia(): boolean;
        hasLeadingComment(): boolean;
        hasLeadingNewLine(): boolean;
        hasLeadingSkippedText(): boolean;

        hasTrailingTrivia(): boolean;
        hasTrailingComment(): boolean;
        hasTrailingNewLine(): boolean;
        hasTrailingSkippedText(): boolean;

        hasSkippedToken(): boolean;

        leadingTrivia(): ISyntaxTriviaList;
        trailingTrivia(): ISyntaxTriviaList;

        withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken;
        withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken;

        previousToken(includeSkippedTokens?: boolean): ISyntaxToken;
        nextToken(includeSkippedTokens?: boolean): ISyntaxToken;

        // True if this was a keyword that the parser converted to an identifier.  i.e. if you have
        //      x.public
        //
        // then 'public' will be converted to an identifier.  These tokens should are parser 
        // generated and, as such, should not be returned when the incremental parser source
        // hands out tokens.  Note: If it is included in a node then *that* node may still
        // be reusuable.  i.e. if i have:  private Foo() { x.public = 1; }
        //
        // Then that entire method node is reusable even if the 'public' identifier is not.
        isKeywordConvertedToIdentifier(): boolean;

        clone(): ISyntaxToken;
    }

    export interface ITokenInfo {
        leadingTrivia?: ISyntaxTrivia[];
        text?: string;
        trailingTrivia?: ISyntaxTrivia[];
    }
}

module TypeScript.Syntax {
    export function isPrimaryExpression(token: ISyntaxToken): boolean {
        switch (token.kind()) {
            case SyntaxKind.IdentifierName:
            case SyntaxKind.RegularExpressionLiteral:
            case SyntaxKind.NumericLiteral:
            case SyntaxKind.StringLiteral:
            case SyntaxKind.FalseKeyword:
            case SyntaxKind.NullKeyword:
            case SyntaxKind.ThisKeyword:
            case SyntaxKind.TrueKeyword:
            case SyntaxKind.SuperKeyword:
                return true;
        }

        return false;
    }

    export function realizeToken(token: ISyntaxToken): ISyntaxToken {
        return new RealizedToken(token.fullStart(), token.kind(),
            token.leadingTrivia(), token.text(), token.value(), token.valueText(), token.trailingTrivia());
    }

    export function convertToIdentifierName(token: ISyntaxToken): ISyntaxToken {
        Debug.assert(SyntaxFacts.isAnyKeyword(token.kind()));
        return new ConvertedIdentifierToken(token);
    }

    export function tokenToJSON(token: ISyntaxToken): any {
        var result: any = {};

        for (var name in SyntaxKind) {
            if (<any>SyntaxKind[name] === token.kind()) {
                result.kind = name;
                break;
            }
        }

        result.fullStart = token.fullStart();
        result.fullEnd = token.fullEnd();

        result.start = token.start();
        result.end = token.end();

        result.fullWidth = token.fullWidth();
        result.width = token.width();

        result.text = token.text();

        var value = token.value();
        if (value !== null) {
            result.value = value;
            result.valueText = token.valueText();
        }

        if (token.hasLeadingTrivia()) {
            result.hasLeadingTrivia = true;
        }

        if (token.hasLeadingComment()) {
            result.hasLeadingComment = true;
        }

        if (token.hasLeadingNewLine()) {
            result.hasLeadingNewLine = true;
        }

        if (token.hasLeadingSkippedText()) {
            result.hasLeadingSkippedText = true;
        }

        if (token.hasTrailingTrivia()) {
            result.hasTrailingTrivia = true;
        }

        if (token.hasTrailingComment()) {
            result.hasTrailingComment = true;
        }

        if (token.hasTrailingNewLine()) {
            result.hasTrailingNewLine = true;
        }

        if (token.hasTrailingSkippedText()) {
            result.hasTrailingSkippedText = true;
        }

        var trivia = token.leadingTrivia();
        if (trivia.count() > 0) {
            result.leadingTrivia = trivia;
        }

        trivia = token.trailingTrivia();
        if (trivia.count() > 0) {
            result.trailingTrivia = trivia;
        }

        return result;
    }

    export function value(token: ISyntaxToken): any {
        return value1(token.kind(), token.text());
    }

    function hexValue(text: string, start: number, length: number): number {
        var intChar = 0;
        for (var i = 0; i < length; i++) {
            var ch2 = text.charCodeAt(start + i);
            if (!CharacterInfo.isHexDigit(ch2)) {
                break;
            }

            intChar = (intChar << 4) + CharacterInfo.hexValue(ch2);
        }

        return intChar;
    }

    var characterArray: number[] = [];

    function convertEscapes(text: string): string {
        characterArray.length = 0;
        var result = "";

        for (var i = 0, n = text.length; i < n; i++) {
            var ch = text.charCodeAt(i);

            if (ch === CharacterCodes.backslash) {
                i++;
                if (i < n) {
                    ch = text.charCodeAt(i);
                    switch (ch) {
                        case CharacterCodes._0:
                            characterArray.push(CharacterCodes.nullCharacter);
                            continue;

                        case CharacterCodes.b:
                            characterArray.push(CharacterCodes.backspace);
                            continue;

                        case CharacterCodes.f:
                            characterArray.push(CharacterCodes.formFeed);
                            continue;

                        case CharacterCodes.n:
                            characterArray.push(CharacterCodes.lineFeed);
                            continue;

                        case CharacterCodes.r:
                            characterArray.push(CharacterCodes.carriageReturn);
                            continue;

                        case CharacterCodes.t:
                            characterArray.push(CharacterCodes.tab);
                            continue;

                        case CharacterCodes.v:
                            characterArray.push(CharacterCodes.verticalTab);
                            continue;

                        case CharacterCodes.x:
                            characterArray.push(hexValue(text, /*start:*/ i + 1, /*length:*/ 2));
                            i += 2;
                            continue;

                        case CharacterCodes.u:
                            characterArray.push(hexValue(text, /*start:*/ i + 1, /*length:*/ 4));
                            i += 4;
                            continue;

                        case CharacterCodes.carriageReturn:
                            var nextIndex = i + 1;
                            if (nextIndex < text.length && text.charCodeAt(nextIndex) === CharacterCodes.lineFeed) {
                                // Skip the entire \r\n sequence.
                                i++;
                            }
                            continue;

                        case CharacterCodes.lineFeed:
                        case CharacterCodes.paragraphSeparator:
                        case CharacterCodes.lineSeparator:
                            // From ES5: LineContinuation is the empty character sequence.
                            continue;

                        default:
                            // Any other character is ok as well.  As per rule:
                            // EscapeSequence :: CharacterEscapeSequence
                            // CharacterEscapeSequence :: NonEscapeCharacter
                            // NonEscapeCharacter :: SourceCharacter but notEscapeCharacter or LineTerminator
                            //
                            // Intentional fall through
                        }
                }
            }

            characterArray.push(ch);

            if (i && !(i % 1024)) {
                result = result.concat(String.fromCharCode.apply(null, characterArray));
                characterArray.length = 0;
            }
        }

        if (characterArray.length) {
            result = result.concat(String.fromCharCode.apply(null, characterArray));
        }

        return result;
    }

    export function massageEscapes(text: string): string {
        return text.indexOf("\\") >= 0 ? convertEscapes(text) : text;
    }

    function value1(kind: SyntaxKind, text: string): any {
        if (kind === SyntaxKind.IdentifierName) {
            return massageEscapes(text);
        }

        switch (kind) {
            case SyntaxKind.TrueKeyword:
                return true;
            case SyntaxKind.FalseKeyword:
                return false;
            case SyntaxKind.NullKeyword:
                return null;
        }

        if (SyntaxFacts.isAnyKeyword(kind) || SyntaxFacts.isAnyPunctuation(kind)) {
            return SyntaxFacts.getText(kind);
        }

        if (kind === SyntaxKind.NumericLiteral) {
            return IntegerUtilities.isHexInteger(text) ? parseInt(text, /*radix:*/ 16) : parseFloat(text);
        }
        else if (kind === SyntaxKind.StringLiteral) {
            if (text.length > 1 && text.charCodeAt(text.length - 1) === text.charCodeAt(0)) {
                // Properly terminated.  Remove the quotes, and massage any escape characters we see.
                return massageEscapes(text.substr(1, text.length - 2));
            }
            else {
                // Not property terminated.  Remove the first quote and massage any escape characters we see.
                return massageEscapes(text.substr(1));

            }
        }
        else if (kind === SyntaxKind.RegularExpressionLiteral) {
            return regularExpressionValue(text);
        }
        else if (kind === SyntaxKind.EndOfFileToken || kind === SyntaxKind.ErrorToken) {
            return null;
        }
        else {
            throw Errors.invalidOperation();
        }
    }

    function regularExpressionValue(text: string): RegExp {
        try {
            var lastSlash = text.lastIndexOf("/");
            var body = text.substring(1, lastSlash);
            var flags = text.substring(lastSlash + 1);
            return new RegExp(body, flags);
        }
        catch (e) {
            return null;
        }
    }

    function massageDisallowedIdentifiers(text: string): string {
        // A bit of an unfortunate hack we need to run on some downlevel browsers. 
        // The problem is that we use a token's valueText as a key in many of our collections.  
        // Unfortunately, if that key turns out to be __proto__, then that breaks in some browsers
        // due to that being a reserved way to get to the object's prototyped.  To workaround this
        // we ensure that the valueText of any token is not __proto__ but is instead #__proto__.
        if (text === "__proto__") {
            return "#__proto__";
        }

        return text;
    }

    function valueText1(kind: SyntaxKind, text: string): string {
        var value = value1(kind, text);
        return value === null ? "" : massageDisallowedIdentifiers(value.toString());
    }

    export function valueText(token: ISyntaxToken): string {
        var value = token.value();
        return value === null ? "" : massageDisallowedIdentifiers(value.toString());
    }

    class EmptyToken implements ISyntaxToken {
        public parent: ISyntaxElement = null;
        public tokenKind: SyntaxKind;
        private _syntaxID: number = 0;

        constructor(kind: SyntaxKind) {
            this.tokenKind = kind;
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public setTextAndFullStart(text: ISimpleText, fullStart: number): void {
            // An empty token is always at the -1 position.
            // An empty token has no need to point at an underlying text.
        }

        public clone(): ISyntaxToken {
            return new EmptyToken(this.tokenKind);
        }

        public kind() { return this.tokenKind; }

        public childCount(): number {
            return 0;
        }

        public childAt(index: number): ISyntaxElement {
            throw Errors.argumentOutOfRange("index");
        }

        public isShared(): boolean {
            return false;
        }

        public toJSON(key: any): any { return tokenToJSON(this); }

        private findTokenInternal(parent: ISyntaxElement, position: number, fullStart: number): ISyntaxToken {
            return this;
        }

        public firstToken(): ISyntaxToken { return null; }
        public lastToken(): ISyntaxToken { return null; }

        // Empty tokens are never incrementally reusable.
        public isIncrementallyUnusable() { return true; }

        public isKeywordConvertedToIdentifier() { return false; }

        public fullWidth() { return 0; }
        public width() { return 0; }

        private position(): number {
            // It's hard for us to tell the position of an empty token at the eact time we create 
            // it.  For example, we may have:
            //
            //      a / finally
            //
            // There will be a missing token detected after the forward slash, so it would be 
            // tempting to set its position as the full-end of hte slash token. However, 
            // immediately after that, the 'finally' token will be skipped and will be attached
            // as skipped text to the forward slash.  This means the 'full-end' of the forward
            // slash will change, and thus the empty token will now appear to be embedded inside
            // another token.  This violates are rule that all tokens must only touch at the end,
            // and makes enforcing invariants much harder.
            //
            // To address this we create the empty token with no known position, and then we 
            // determine what it's position should be based on where it lies in the tree.  
            // Specifically, we find the previous non-zero-width syntax element, and we consider
            // the full-start of this token to be at the full-end of that element.

            var previousElement = this.previousNonZeroWidthElement();
            return previousElement === null ? 0 : previousElement.fullStart() + previousElement.fullWidth();
        }

        private previousNonZeroWidthElement(): ISyntaxElement {
            var current: ISyntaxElement = this;
            while (true) {
                var parent = current.parent;
                if (parent === null) {
                    Debug.assert(current.kind() === SyntaxKind.SourceUnit, "We had a node without a parent that was not the root node!");

                    // We walked all the way to the top, and never found a previous element.  This 
                    // can happen with code like:
                    //
                    //      / b;
                    //
                    // We will have an empty identifier token as the first token in the tree.  In
                    // this case, return null so that the position of the empty token will be 
                    // considered to be 0.
                    return null;
                }

                // Ok.  We have a parent.  First, find out which slot we're at in the parent.
                for (var i = 0, n = parent.childCount(); i < n; i++) {
                    if (parent.childAt(i) === current) {
                        break;
                    }
                }

                Debug.assert(i !== n, "Could not find current element in parent's child list!");

                // Walk backward from this element, looking for a non-zero-width sibling.
                for (var j = i - 1; j >= 0; j--) {
                    var sibling = parent.childAt(j);
                    if (sibling && sibling.fullWidth() > 0) {
                        return sibling;
                    }
                }

                // We couldn't find a non-zero-width sibling.  We were either the first element, or
                // all preceding elements are empty.  So, move up to our parent so we we can find
                // its preceding sibling.
                current = current.parent;
            }
        }

        public fullStart(): number {
            return this.position();
        }

        public fullEnd(): number {
            return this.position();
        }

        public start(): number {
            return this.position();
        }

        public end(): number {
            return this.position();
        }

        public text() { return ""; }
        public fullText(): string { return ""; }
        public value(): any { return null; }
        public valueText() { return ""; }

        public hasLeadingTrivia() { return false; }
        public hasLeadingComment() { return false; }
        public hasLeadingNewLine() { return false; }
        public hasLeadingSkippedText() { return false; }
        public leadingTriviaWidth() { return 0; }
        public hasTrailingTrivia() { return false; }
        public hasTrailingComment() { return false; }
        public hasTrailingNewLine() { return false; }
        public hasTrailingSkippedText() { return false; }
        public hasSkippedToken() { return false; }

        public trailingTriviaWidth() { return 0; }
        public leadingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }
        public trailingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }
        public realize(): ISyntaxToken { return realizeToken(this); }
        public collectTextElements(elements: string[]): void { }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withLeadingTrivia(leadingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withTrailingTrivia(trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken {
            return Syntax.previousToken(this, includeSkippedTokens);
        }

        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken {
            return Syntax.nextToken(this, includeSkippedTokens);
        }
    }

    export function emptyToken(kind: SyntaxKind): ISyntaxToken {
        return new EmptyToken(kind);
    }

    class ConvertedIdentifierToken implements ISyntaxToken {
        public parent: ISyntaxElement = null;
        public tokenKind: SyntaxKind = SyntaxKind.IdentifierName;
        private _underlyingToken: ISyntaxToken;
        private _syntaxID: number = 0;

        constructor(underlyingToken: ISyntaxToken) {
            this._underlyingToken = underlyingToken;
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public setTextAndFullStart(text: ISimpleText, fullStart: number): void {
            this._underlyingToken.setTextAndFullStart(text, fullStart);
        }

        public clone(): ISyntaxToken {
            throw Errors.notYetImplemented();
        }

        public kind(): SyntaxKind { return this.tokenKind; }
        public toJSON(key: any): any { return tokenToJSON(this); }
        public firstToken() { return this.fullWidth() > 0 ? this : null; }
        public lastToken() { return this.fullWidth() > 0 ? this : null; }

        // We mark this token as being incrementally *reusable* and also that it was a keyword
        // that was converted to an identifier.  The incremental parser knows not to return this
        // token if hte parser is asking for a *token*.  That's because this token would not have
        // been created by the scanner (and thus the incremental source will be behaving differently
        // from the normal source).  However, if the parser asks for a *node*, then we can still
        // reuse a node even if it contains one of these tokens in it.  
        // 
        // NOTE: a converted keyword is still unusable if it's underlying token is unusable.  The
        // underlying token may be unusable if the scanner encountered errors while trying to scan
        // it.
        public isIncrementallyUnusable() { return this._underlyingToken.isIncrementallyUnusable(); }
        public isKeywordConvertedToIdentifier() { return true; }

        public childCount(): number {
            return 0;
        }

        public childAt(index: number): ISyntaxElement {
            throw Errors.argumentOutOfRange("index");
        }

        public isShared(): boolean {
            return false;
        }

        public fullWidth(): number { return this._underlyingToken.fullWidth(); }
        public width(): number { return this._underlyingToken.width(); }

        public fullStart(): number { return this._underlyingToken.fullStart(); }
        public fullEnd(): number { return this._underlyingToken.fullEnd(); }
        public start(): number { return this._underlyingToken.start(); }
        public end(): number { return this._underlyingToken.end(); }

        public text(): string { return this._underlyingToken.text(); }
        public fullText(): string { return this._underlyingToken.fullText(); }

        public value(): any { return this.text(); }
        public valueText(): string { return this.text(); }

        public hasLeadingTrivia(): boolean { return this._underlyingToken.hasLeadingTrivia(); }
        public hasLeadingComment(): boolean { return this._underlyingToken.hasLeadingComment(); }
        public hasLeadingNewLine(): boolean { return this._underlyingToken.hasLeadingNewLine(); }
        public hasLeadingSkippedText(): boolean { return this._underlyingToken.hasLeadingSkippedText(); }
        public leadingTriviaWidth(): number { return this._underlyingToken.leadingTriviaWidth(); }

        public hasTrailingTrivia(): boolean { return this._underlyingToken.hasTrailingTrivia(); }
        public hasTrailingComment(): boolean { return this._underlyingToken.hasTrailingComment(); }
        public hasTrailingNewLine(): boolean { return this._underlyingToken.hasTrailingNewLine(); }
        public hasTrailingSkippedText(): boolean { return this._underlyingToken.hasTrailingSkippedText(); }
        public trailingTriviaWidth(): number { return this._underlyingToken.trailingTriviaWidth(); }

        public hasSkippedToken(): boolean { return this.hasLeadingSkippedText() || this.hasTrailingSkippedText(); }

        public leadingTrivia(): ISyntaxTriviaList { 
            var triviaList = this._underlyingToken.leadingTrivia().clone();
            triviaList.parent = this;

            return triviaList;
        }

        public trailingTrivia(): ISyntaxTriviaList {
            var triviaList = this._underlyingToken.trailingTrivia().clone();
            triviaList.parent = this;

            return triviaList;
        }

        private findTokenInternal(parent: ISyntaxElement, position: number, fullStart: number): ISyntaxToken {
            return this;
        }

        public collectTextElements(elements: string[]): void {
            this.leadingTrivia().collectTextElements(elements);
            elements.push(this.text());
            this.trailingTrivia().collectTextElements(elements);
        }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return new RealizedToken(
                this.fullStart(), this.tokenKind, leadingTrivia, this.text(), this.value(), this.valueText(), this.trailingTrivia());
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return new RealizedToken(
                this.fullStart(), this.tokenKind, this.leadingTrivia(), this.text(), this.value(), this.valueText(), trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken {
            return Syntax.previousToken(this, includeSkippedTokens);
        }

        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken {
            return Syntax.nextToken(this, includeSkippedTokens);
        }
    }

    class RealizedToken implements ISyntaxToken {
        public parent: ISyntaxElement = null;
        private _fullStart: number;
        public tokenKind: SyntaxKind;
        private _leadingTrivia: ISyntaxTriviaList;
        private _text: string;
        private _value: any;
        private _valueText: string;
        private _trailingTrivia: ISyntaxTriviaList;
        private _syntaxID: number = 0;

        constructor(fullStart: number,
                    tokenKind: SyntaxKind,
                    leadingTrivia: ISyntaxTriviaList,
                    text: string,
                    value: any,
                    valueText: string,
                    trailingTrivia: ISyntaxTriviaList) {
            this._fullStart = fullStart;
            this.tokenKind = tokenKind;
            this._text = text;
            this._value = value;
            this._valueText = valueText;

            this._leadingTrivia = leadingTrivia.clone();
            this._trailingTrivia = trailingTrivia.clone();

            if (!this._leadingTrivia.isShared()) {
                this._leadingTrivia.parent = this;
            }

            if (!this._trailingTrivia.isShared()) {
                this._trailingTrivia.parent = this;
            }
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public syntaxID(): number {
            if (this._syntaxID === 0) {
                this._syntaxID = _nextSyntaxID++;
            }

            return this._syntaxID;
        }

        public setTextAndFullStart(text: ISimpleText, fullStart: number): void {
            // realized token has no need to hold onto the text.
            this._fullStart = fullStart;
        }

        public clone(): ISyntaxToken {
            return new RealizedToken(this._fullStart, this.tokenKind, /*this.tokenKeywordKind,*/ this._leadingTrivia,
                this._text, this._value, this._valueText, this._trailingTrivia);
        }

        public kind(): SyntaxKind { return this.tokenKind; }
        public toJSON(key: any): any { return tokenToJSON(this); }
        public firstToken() { return this.fullWidth() > 0 ? this : null; }
        public lastToken() { return this.fullWidth() > 0 ? this : null; }

        // Realized tokens are created from the parser.  They are *never* incrementally reusable.
        public isIncrementallyUnusable() { return true; }
        public isKeywordConvertedToIdentifier() { return false; }

        public childCount(): number {
            return 0;
        }

        public childAt(index: number): ISyntaxElement {
            throw Errors.argumentOutOfRange("index");
        }

        public isShared(): boolean {
            return false;
        }

        public fullWidth(): number { return this._leadingTrivia.fullWidth() + this.width() + this._trailingTrivia.fullWidth(); }
        public width(): number { return this.text().length; }

        public fullStart(): number { return this._fullStart; }
        public fullEnd(): number { return this._fullStart + this.fullWidth(); }
        public start(): number { return this._fullStart + this._leadingTrivia.fullWidth(); }
        public end(): number { return this.start() + this.width(); }

        public text(): string { return this._text; }
        public fullText(): string { return this._leadingTrivia.fullText() + this.text() + this._trailingTrivia.fullText(); }

        public value(): any { return this._value; }
        public valueText(): string { return this._valueText; }

        public hasLeadingTrivia(): boolean { return this._leadingTrivia.count() > 0; }
        public hasLeadingComment(): boolean { return this._leadingTrivia.hasComment(); }
        public hasLeadingNewLine(): boolean { return this._leadingTrivia.hasNewLine(); }
        public hasLeadingSkippedText(): boolean { return this._leadingTrivia.hasSkippedToken(); }
        public leadingTriviaWidth(): number { return this._leadingTrivia.fullWidth(); }

        public hasTrailingTrivia(): boolean { return this._trailingTrivia.count() > 0; }
        public hasTrailingComment(): boolean { return this._trailingTrivia.hasComment(); }
        public hasTrailingNewLine(): boolean { return this._trailingTrivia.hasNewLine(); }
        public hasTrailingSkippedText(): boolean { return this._trailingTrivia.hasSkippedToken(); }
        public trailingTriviaWidth(): number { return this._trailingTrivia.fullWidth(); }

        public hasSkippedToken(): boolean { return this.hasLeadingSkippedText() || this.hasTrailingSkippedText(); }

        public leadingTrivia(): ISyntaxTriviaList { return this._leadingTrivia; }
        public trailingTrivia(): ISyntaxTriviaList { return this._trailingTrivia; }

        private findTokenInternal(parent: ISyntaxElement, position: number, fullStart: number): ISyntaxToken {
            return this;
        }

        public collectTextElements(elements: string[]): void {
            this.leadingTrivia().collectTextElements(elements);
            elements.push(this.text());
            this.trailingTrivia().collectTextElements(elements);
        }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return new RealizedToken(
                this._fullStart, this.tokenKind, leadingTrivia, this._text, this._value, this._valueText, this._trailingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return new RealizedToken(
                this._fullStart, this.tokenKind,  this._leadingTrivia, this._text, this._value, this._valueText, trailingTrivia);
        }

        public isPrimaryExpression(): boolean {
            return isPrimaryExpression(this);
        }

        public isExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isLeftHandSideExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isMemberExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isPostfixExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public isUnaryExpression(): boolean {
            return this.isPrimaryExpression();
        }

        public previousToken(includeSkippedTokens: boolean = false): ISyntaxToken {
            return Syntax.previousToken(this, includeSkippedTokens);
        }

        public nextToken(includeSkippedTokens: boolean = false): ISyntaxToken {
            return Syntax.nextToken(this, includeSkippedTokens);
        }
    }

    export function token(kind: SyntaxKind, info: ITokenInfo = null, fullStart = -1): ISyntaxToken {
        var text = (info !== null && info.text !== undefined) ? info.text : SyntaxFacts.getText(kind);

        return new RealizedToken(
            fullStart,
            kind,
            Syntax.triviaList(info === null ? null : info.leadingTrivia),
            text,
            value1(kind, text),
            valueText1(kind, text),
            Syntax.triviaList(info === null ? null : info.trailingTrivia));
    }
    
    export function identifier(text: string, info: ITokenInfo = null): ISyntaxToken {
        info = info || {};
        info.text = text;
        return token(SyntaxKind.IdentifierName, info);
    }
}