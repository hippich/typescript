///<reference path='references.ts' />

module TypeScript {
    export enum NodeFlags {
        Export   = 0x00000001,  // Declarations
        Ambient  = 0x00000002,  // Declarations
        Optional = 0x00000004,  // Parameter/Property/Method
        Rest     = 0x00000008,  // Parameter
        Public   = 0x00000010,  // Property/Method
        Private  = 0x00000020,  // Property/Method
        Static   = 0x00000040,  // Property/Method
    }

    interface SyntaxElement {
        kind: SyntaxKind;
    }

    interface SyntaxNode extends SyntaxElement {
        flags: NodeFlags;
    }

    function nodeStart(node: Node): number {
    }

    function nodeWidth(node: Node): number {
    }

    interface SyntaxToken extends Name, PrimaryExpression {
    }

    // The raw text of the token, as written in the original source.
    function tokenText(token: SyntaxToken): string {
    }

    // The token's javascript value.  i.e. 0.0 in the text would have the javascript number value: 0.
    function tokenValue(token: SyntaxToken): any {
    }

    // The token's value in string form.  i.e. \u0041 in the source text would result in a string with the text: A.
    function tokenValueText(token: SyntaxToken): string {
    }

    interface SyntaxList<T> extends SyntaxElement {
        length: number;
        item(index: number): T;
    }

    interface SourceUnit extends Node {
        moduleElements: SyntaxList<ModuleElement>;
    }

    interface ExternalModuleReference extends ModuleReference {
        stringLiteral: SyntaxToken;
    }

    interface ModuleNameModuleReference extends ModuleReference {
        moduleName: Name;
    }

    interface ImportDeclaration extends ModuleElement {
        identifier: SyntaxToken;
        moduleReference: ModuleReference;
    }

    interface ExportAssignment extends ModuleElement {
        identifier: SyntaxToken;
    }

    interface ClassDeclaration extends ModuleElement {
        identifier: SyntaxToken;
        typeParameterList?: TypeParameterList;
        heritageClauses: SyntaxList<HeritageClause>;
        classElements: SyntaxList<ClassElement>;
    }

    interface InterfaceDeclaration extends ModuleElement {
        identifier: SyntaxToken;
        typeParameterList?: TypeParameterList;
        heritageClauses: SyntaxList<HeritageClause>;
        body: ObjectType;
    }

    interface HeritageClause extends Node {
        typeNames: SyntaxList<Name>;
    }

    interface ModuleDeclaration extends ModuleElement {
        name?: Name;
        stringLiteral?: SyntaxToken;
        moduleElements: SyntaxList<ModuleElement>;
    }

    interface FunctionDeclaration extends Statement {
        identifier: SyntaxToken;
        callSignature: CallSignature;
        block?: Block;
    }

    interface VariableStatement extends Statement {
        variableDeclaration: VariableDeclaration;
    }

    interface VariableDeclaration extends Node {
        variableDeclarators: SyntaxList<VariableDeclarator>;
    }

    interface VariableDeclarator extends Node {
        propertyName: SyntaxToken;
        typeAnnotation?: TypeAnnotation;
        equalsValueClause?: EqualsValueClause;
    }

    interface EqualsValueClause extends Node {
        value: Expression;
    }

    interface PrefixUnaryExpression extends UnaryExpression {
        operand: UnaryExpression;
    }

    interface ArrayLiteralExpression extends PrimaryExpression {
        expressions: SyntaxList<Expression>;
    }

    interface ParenthesizedExpression extends PrimaryExpression {
        expression: Expression;
    }

    interface SimpleArrowFunctionExpression extends UnaryExpression {
        identifier: SyntaxToken;
        block?: Block;
        expression?: Expression;
    }

    interface ParenthesizedArrowFunctionExpression extends UnaryExpression {
        callSignature: CallSignature;
        block?: Block;
        expression?: Expression;
    }

    interface QualifiedName extends Name {
        left: Name;
        right: SyntaxToken;
    }

    interface TypeArgumentList extends Node {
        typeArguments: SyntaxList<Type>;
    }

    interface ConstructorType extends Type {
        typeParameterList?: TypeParameterList;
        parameterList: ParameterList;
        type: Type;
    }

    interface FunctionType extends Type {
        typeParameterList?: TypeParameterList;
        parameterList: ParameterList;
        type: Type;
    }

    interface ObjectType extends Type {
        typeMembers: SyntaxList<TypeMember>;
    }

    interface ArrayType extends Type {
        type: Type;
    }

    interface GenericType extends Type {
        name: Name;
        typeArgumentList: TypeArgumentList;
    }

    interface TypeQuery extends Type {
        name: Name;
    }

    interface TypeAnnotation extends Node {
        type: Type;
    }

    interface Block extends Statement {
        statements: SyntaxList<Statement>;
    }

    interface Parameter extends Node {
        identifier: SyntaxToken;
        typeAnnotation?: TypeAnnotation;
        equalsValueClause?: EqualsValueClause;
    }

    interface MemberAccessExpression extends MemberExpression, CallExpression {
        expression: LeftHandSideExpression;
        name: SyntaxToken;
    }

    interface PostfixUnaryExpression extends PostfixExpression {
        operand: LeftHandSideExpression;
    }

    interface ElementAccessExpression extends MemberExpression, CallExpression {
        expression: LeftHandSideExpression;
        argumentExpression: Expression;
    }

    interface InvocationExpression extends CallExpression {
        expression: LeftHandSideExpression;
        argumentList: ArgumentList;
    }

    interface ArgumentList extends Node {
        typeArgumentList?: TypeArgumentList;
        arguments: SyntaxList<Expression>;
    }

    interface BinaryExpression extends Expression {
        left: Expression;
        right: Expression;
    }

    interface ConditionalExpression extends Expression {
        condition: Expression;
        whenTrue: Expression;
        whenFalse: Expression;
    }

    interface ConstructSignature extends TypeMember {
        callSignature: CallSignature;
    }

    interface MethodSignature extends TypeMember {
        propertyName: SyntaxToken;
        callSignature: CallSignature;
    }

    interface IndexSignature extends TypeMember {
        parameter: Parameter;
        typeAnnotation?: TypeAnnotation;
    }

    interface PropertySignature extends TypeMember {
        propertyName: SyntaxToken;
        typeAnnotation?: TypeAnnotation;
    }

    interface CallSignature extends TypeMember {
        typeParameterList?: TypeParameterList;
        parameterList: ParameterList;
        typeAnnotation?: TypeAnnotation;
    }

    interface ParameterList extends Node {
        parameters: SyntaxList<Parameter>;
    }

    interface TypeParameterList extends Node {
        typeParameters: SyntaxList<TypeParameter>;
    }

    interface TypeParameter extends Node {
        identifier: SyntaxToken;
        constraint?: Constraint;
    }

    interface Constraint extends Node {
        type: Type;
    }

    interface ElseClause extends Node {
        statement: Statement;
    }

    interface IfStatement extends Statement {
        condition: Expression;
        statement: Statement;
        elseClause?: ElseClause;
    }

    interface ExpressionStatement extends Statement {
        expression: Expression;
    }

    interface ConstructorDeclaration extends ClassElement {
        callSignature: CallSignature;
        block?: Block;
    }

    interface MemberFunctionDeclaration extends MemberDeclaration {
        propertyName: SyntaxToken;
        callSignature: CallSignature;
        block?: Block;
    }

    interface GetAccessor extends MemberDeclaration, PropertyAssignment {
        propertyName: SyntaxToken;
        parameterList: ParameterList;
        typeAnnotation?: TypeAnnotation;
        block: Block;
    }

    interface SetAccessor extends MemberDeclaration, PropertyAssignment {
        propertyName: SyntaxToken;
        parameterList: ParameterList;
        block: Block;
    }

    interface MemberVariableDeclaration extends MemberDeclaration {
        variableDeclarator: VariableDeclarator;
    }

    interface IndexMemberDeclaration extends ClassElement {
        indexSignature: IndexSignature;
    }

    interface ThrowStatement extends Statement {
        expression: Expression;
    }

    interface ReturnStatement extends Statement {
        expression?: Expression;
    }

    interface ObjectCreationExpression extends MemberExpression {
        expression: MemberExpression;
        argumentList?: ArgumentList;
    }

    interface SwitchStatement extends Statement {
        expression: Expression;
        switchClauses: SyntaxList<SwitchClause>;
    }

    interface CaseSwitchClause extends SwitchClause {
        expression: Expression;
        statements: SyntaxList<Statement>;
    }

    interface DefaultSwitchClause extends SwitchClause {
        statements: SyntaxList<Statement>;
    }

    interface BreakStatement extends Statement {
        identifier?: SyntaxToken;
    }

    interface ContinueStatement extends Statement {
        identifier?: SyntaxToken;
    }

    interface ForStatement extends Statement {
        variableDeclaration?: VariableDeclaration;
        initializer?: Expression;
        condition?: Expression;
        incrementor?: Expression;
        statement: Statement;
    }

    interface ForInStatement extends Statement {
        variableDeclaration?: VariableDeclaration;
        left?: Expression;
        expression: Expression;
        statement: Statement;
    }

    interface WhileStatement extends Statement {
        condition: Expression;
        statement: Statement;
    }

    interface WithStatement extends Statement {
        condition: Expression;
        statement: Statement;
    }

    interface EnumDeclaration extends ModuleElement {
        identifier: SyntaxToken;
        enumElements: SyntaxList<EnumElement>;
    }

    interface EnumElement extends Node {
        propertyName: SyntaxToken;
        equalsValueClause?: EqualsValueClause;
    }

    interface CastExpression extends UnaryExpression {
        type: Type;
        expression: UnaryExpression;
    }

    interface ObjectLiteralExpression extends PrimaryExpression {
        propertyAssignments: SyntaxList<PropertyAssignment>;
    }

    interface SimplePropertyAssignment extends PropertyAssignment {
        propertyName: SyntaxToken;
        expression: Expression;
    }

    interface FunctionPropertyAssignment extends PropertyAssignment {
        propertyName: SyntaxToken;
        callSignature: CallSignature;
        block: Block;
    }

    interface FunctionExpression extends PrimaryExpression {
        identifier?: SyntaxToken;
        callSignature: CallSignature;
        block: Block;
    }

    interface TryStatement extends Statement {
        block: Block;
        catchClause?: CatchClause;
        finallyClause?: FinallyClause;
    }

    interface CatchClause extends Node {
        identifier: SyntaxToken;
        typeAnnotation?: TypeAnnotation;
        block: Block;
    }

    interface FinallyClause extends Node {
        block: Block;
    }

    interface LabeledStatement extends Statement {
        identifier: SyntaxToken;
        statement: Statement;
    }

    interface DoStatement extends Statement {
        statement: Statement;
        condition: Expression;
    }

    interface TypeOfExpression extends UnaryExpression {
        expression: UnaryExpression;
    }

    interface DeleteExpression extends UnaryExpression {
        expression: UnaryExpression;
    }

    interface VoidExpression extends UnaryExpression {
        expression: UnaryExpression;
    }

    interface MemberDeclaration extends ClassElement {
    }

    interface Statement extends ModuleElement {
    }

    interface Name extends Type {
    }

    interface UnaryExpression extends Expression {
    }

    interface PostfixExpression extends UnaryExpression {
    }

    interface LeftHandSideExpression extends PostfixExpression {
    }

    interface MemberExpression extends LeftHandSideExpression {
    }

    interface CallExpression extends LeftHandSideExpression {
    }

    interface PrimaryExpression extends MemberExpression {
    }

    interface ModuleElement extends SyntaxElement {
    }

    interface ModuleReference extends Node {
    }

    interface ClassElement extends Node {
    }

    interface TypeMember extends Node {
    }

    interface PropertyAssignment extends Node {
    }

    interface SwitchClause extends Node {
    }

    interface Expression extends SyntaxElement {
    }

    interface Type extends SyntaxElement {
    }
}