///<reference path='References.ts' />

class FullStartNormalizer extends SyntaxRewriter {
    private currentFullStart: number;

    constructor(initialFullStart: number) {
        super();
        this.currentFullStart = initialFullStart;
    }

    private visitTriviaList(list: ISyntaxTriviaList): ISyntaxTriviaList {
        var newTriviaList: ISyntaxTrivia[] = null;
        
        for (var i = 0, n = list.count(); i < n; i++) {
            var trivia = list.syntaxTriviaAt(i);
            var newTrivia = trivia.withFullStart(this.currentFullStart);

            if (newTrivia !== trivia && newTriviaList === null) {
                newTriviaList = [];
                for (var j = 0; j < i; j++) {
                    newTriviaList.push(list.syntaxTriviaAt(j));
                }
            }

            if (newTriviaList) {
                newTriviaList.push(newTrivia);
            }

            this.currentFullStart += trivia.fullWidth();
        }

        return newTriviaList === null
            ? list
            : SyntaxTriviaList.create(newTriviaList);
    }

    public visitToken(token: ISyntaxToken): ISyntaxToken {
        var tokenFullStart = this.currentFullStart;
        var leadingTrivia = this.visitTriviaList(token.leadingTrivia());

        this.currentFullStart += token.width();
        var trailingTrivia = this.visitTriviaList(token.trailingTrivia());

        if (token.leadingTrivia() === leadingTrivia &&
            token.fullStart() === tokenFullStart &&
            token.trailingTrivia() === trailingTrivia) {
            return token;
        }

        return token.withFullStart(tokenFullStart).withLeadingTrivia(leadingTrivia).withTrailingTrivia(trailingTrivia);
    }
}

class Emitter extends SyntaxRewriter {
    private syntaxOnly: bool;
    private indentation: number = 0;

    constructor(syntaxOnly: bool) {
        super();

        this.syntaxOnly = syntaxOnly;
    }

    public emit(input: SourceUnitSyntax): SourceUnitSyntax {
        var sourceUnit = input.accept1(this);
        return sourceUnit.accept1(new FullStartNormalizer(0));
    }

    private visitSourceUnit(node: SourceUnitSyntax): SourceUnitSyntax {
        var moduleElements: ModuleElementSyntax[] = [];

        for (var i = 0, n = node.moduleElements().count(); i < n; i++) {
            var moduleElement = node.moduleElements().syntaxNodeAt(i);

            var converted = moduleElement.accept1(this);
            if (ArrayUtilities.isArray(converted)) {
                moduleElements.push.apply(moduleElements, converted);
            }
            else {
                moduleElements.push(converted);
            }
        }

        return new SourceUnitSyntax(SyntaxList.create(moduleElements), node.endOfFileToken());
    }

    private static leftmostName(name: NameSyntax): IdentifierNameSyntax {
        if (name.kind() === SyntaxKind.IdentifierName) {
            return <IdentifierNameSyntax>name;
        }
        else if (name.kind() === SyntaxKind.QualifiedName) {
            return Emitter.leftmostName((<QualifiedNameSyntax>name).left());
        }
        else {
            throw Errors.invalidOperation();
        }
    }

    private visitModuleDeclaration(node: ModuleDeclarationSyntax): StatementSyntax[] {
        // TODO: Handle the case where this is a dotted name.  Note: existing typescript transpiler
        // does not seem to handle this.
        var identifierName = Emitter.leftmostName(node.moduleName());

        var variableStatement = VariableStatementSyntax.create(
            new VariableDeclarationSyntax(
                SyntaxToken.createElasticKeyword({ kind: SyntaxKind.VarKeyword, trailingTrivia: [SyntaxTrivia.space] }),
                SeparatedSyntaxList.create(
                    [VariableDeclaratorSyntax.create(identifierName.identifier())])),
            SyntaxToken.createElastic({ kind: SyntaxKind.SemicolonToken, trailingTrivia: [SyntaxTrivia.carriageReturnLineFeed] }));

        var functionExpression = FunctionExpressionSyntax.create(
            SyntaxToken.createElasticKeyword({ kind: SyntaxKind.FunctionKeyword }),
            CallSignatureSyntax.create(
                new ParameterListSyntax(
                    SyntaxToken.createElastic({ kind: SyntaxKind.OpenParenToken }),
                    SeparatedSyntaxList.create([
                        ParameterSyntax.create(identifierName.identifier())]),
                    SyntaxToken.createElastic({ kind: SyntaxKind.CloseParenToken, trailingTrivia: [SyntaxTrivia.space]  }))),
            new BlockSyntax(
                SyntaxToken.createElastic({ kind: SyntaxKind.OpenBraceToken, trailingTrivia: [SyntaxTrivia.carriageReturnLineFeed]  }),
                SyntaxList.empty,
                SyntaxToken.createElastic({ kind: SyntaxKind.CloseBraceToken })));

        var parenthesizedFunctionExpression = new ParenthesizedExpressionSyntax(
            SyntaxToken.createElastic({ kind: SyntaxKind.OpenParenToken }),
            functionExpression,
            SyntaxToken.createElastic({ kind: SyntaxKind.CloseParenToken }));
        
        var logicalOrExpression = new BinaryExpressionSyntax(
            SyntaxKind.LogicalOrExpression,
            identifierName,
            SyntaxToken.createElastic({ kind: SyntaxKind.BarBarToken }),
            new ParenthesizedExpressionSyntax(
                SyntaxToken.createElastic({ kind: SyntaxKind.OpenParenToken }),
                new BinaryExpressionSyntax(
                    SyntaxKind.AssignmentExpression,
                    identifierName,
                    SyntaxToken.createElastic({ kind: SyntaxKind.EqualsToken }),
                    new ObjectLiteralExpressionSyntax(
                        SyntaxToken.createElastic({ kind: SyntaxKind.OpenBraceToken }),
                        SeparatedSyntaxList.empty,
                        SyntaxToken.createElastic({ kind: SyntaxKind.CloseBraceToken })
                    )),
                SyntaxToken.createElastic({ kind: SyntaxKind.CloseParenToken })));

        var invocationExpression = new InvocationExpressionSyntax(
            parenthesizedFunctionExpression,
            new ArgumentListSyntax(
                SyntaxToken.createElastic({ kind: SyntaxKind.OpenParenToken }),
                SeparatedSyntaxList.create([logicalOrExpression]),
                SyntaxToken.createElastic({ kind: SyntaxKind.CloseParenToken })));

        var expressionStatement = new ExpressionStatementSyntax(
            invocationExpression,
            SyntaxToken.createElastic({ kind: SyntaxKind.SemicolonToken }));

        return [variableStatement, expressionStatement];
    }
}