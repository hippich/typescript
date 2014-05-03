///<reference path='references.ts' />

module TypeScript {
    export interface ISyntaxList<T extends ISyntaxNodeOrToken> extends ISyntaxElement {
        childAt(index: number): T;
        setChildAt(index: number, value: T): void;
    }
}

module TypeScript.Syntax {
    // TODO: stop exporting this once typecheck bug is fixed.
    export class EmptySyntaxList<T extends ISyntaxNodeOrToken> implements ISyntaxList<T> {
        public parent: ISyntaxElement = null;

        public syntaxTree(): SyntaxTree {
            throw Errors.invalidOperation("Shared lists do not belong to a single tree.");
        }

        public fileName(): string {
            throw Errors.invalidOperation("Shared lists do not belong to a single file.");
        }

        public kind(): SyntaxKind { return SyntaxKind.List; }

        public toJSON(key: any): any {
            return [];
        }

        public childCount(): number {
            return 0;
        }

        public childAt(index: number): T {
            throw Errors.argumentOutOfRange("index");
        }

        public setChildAt(index: number, value: T): void {
            throw Errors.argumentOutOfRange("index");
        }

        public isShared(): boolean {
            return true;
        }

        public fullWidth(): number {
            return 0;
        }

        public width(): number {
            return 0;
        }

        public fullStart(): number {
            throw Errors.invalidOperation("'fullStart' invalid on a singleton element.");
        }

        public fullEnd(): number {
            throw Errors.invalidOperation("'fullEnd' invalid on a singleton element.");
        }

        public start(): number {
            throw Errors.invalidOperation("'start' invalid on a singleton element.");
        }

        public end(): number {
            throw Errors.invalidOperation("'end' invalid on a singleton element.");
        }

        public isIncrementallyUnusable(): boolean {
            return false;
        }
    }

    var _emptyList: ISyntaxList<ISyntaxNodeOrToken> = <any>new EmptySyntaxList<ISyntaxNodeOrToken>();

    export function emptyList<T extends ISyntaxNodeOrToken>(): ISyntaxList<T> {
        return <ISyntaxList<T>>_emptyList;
    }

    class SingletonSyntaxList<T extends ISyntaxNodeOrToken> implements ISyntaxList<T> {
        public parent: ISyntaxElement = null;

        constructor(private item: T) {
            Syntax.setParentForChildren(this);
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public kind(): SyntaxKind { return SyntaxKind.List; }

        public toJSON(key: any) {
            return [this.item];
        }

        public childCount() {
            return 1;
        }

        public childAt(index: number): T {
            if (index !== 0) {
                throw Errors.argumentOutOfRange("index");
            }

            return this.item;
        }

        public setChildAt(index: number, value: T): void {
            if (index !== 0) {
                throw Errors.argumentOutOfRange("index");
            }

            this.item = value;
            value.parent = this;
        }

        public isShared(): boolean {
            return false;
        }

        public fullWidth(): number {
            return this.item.fullWidth();
        }

        public width(): number {
            return this.item.width();
        }

        public fullStart(): number {
            return this.item.fullStart();
        }

        public fullEnd(): number {
            return this.item.fullEnd();
        }

        public start(): number {
            return this.item.start();
        }

        public end(): number {
            return this.item.end();
        }

        public isIncrementallyUnusable(): boolean {
            return this.item.isIncrementallyUnusable();
        }
    }

    class NormalSyntaxList<T extends ISyntaxNodeOrToken> implements ISyntaxList<T> {
        public parent: ISyntaxElement = null;
        private _data: number = 0;

        constructor(private nodeOrTokens: T[]) {
            Syntax.setParentForChildren(this);
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public kind(): SyntaxKind { return SyntaxKind.List; }

        public toJSON(key: any) {
            return this.nodeOrTokens;
        }

        public childCount() {
            return this.nodeOrTokens.length;
        }

        public childAt(index: number): T {
            if (index < 0 || index >= this.nodeOrTokens.length) {
                throw Errors.argumentOutOfRange("index");
            }

            return this.nodeOrTokens[index];
        }

        public setChildAt(index: number, value: T): void {
            if (index < 0 || index >= this.nodeOrTokens.length) {
                throw Errors.argumentOutOfRange("index");
            }

            this.nodeOrTokens[index] = value;
            value.parent = this;
            this._data = 0;
        }

        public isShared(): boolean {
            return false;
        }

        public isIncrementallyUnusable(): boolean {
            return (this.data() & SyntaxConstants.NodeIncrementallyUnusableMask) !== 0;
        }

        public fullWidth(): number {
            return this.data() >>> SyntaxConstants.NodeFullWidthShift;
        }

        public width(): number {
            var fullWidth = this.fullWidth();
            return fullWidth - leadingTriviaWidth(this) - trailingTriviaWidth(this);
        }

        public fullStart(): number {
            return firstToken(this).fullStart();
        }

        public fullEnd(): number {
            return lastToken(this).fullEnd();
        }

        public start(): number {
            return firstToken(this).start();
        }

        public end(): number {
            return lastToken(this).end();
        }

        private computeData(): number {
            var fullWidth = 0;
            var isIncrementallyUnusable = false;

            for (var i = 0, n = this.nodeOrTokens.length; i < n; i++) {
                var node = this.nodeOrTokens[i];
                fullWidth += node.fullWidth();
                isIncrementallyUnusable = isIncrementallyUnusable || node.isIncrementallyUnusable();
            }

            return (fullWidth << SyntaxConstants.NodeFullWidthShift)
                 | (isIncrementallyUnusable ? SyntaxConstants.NodeIncrementallyUnusableMask : 0)
                 | SyntaxConstants.NodeDataComputed;
        }

        private data(): number {
            if ((this._data & SyntaxConstants.NodeDataComputed) === 0) {
                this._data = this.computeData();
            }

            return this._data;
        }
    }

    export function list<T extends ISyntaxNodeOrToken>(nodes: T[]): ISyntaxList<T> {
        if (nodes === undefined || nodes === null || nodes.length === 0) {
            return emptyList<T>();
        }

        if (nodes.length === 1) {
            var item = nodes[0];
            return new SingletonSyntaxList<T>(item);
        }

        return new NormalSyntaxList(nodes);
    }
}