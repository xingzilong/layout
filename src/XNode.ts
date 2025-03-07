class XNode {
    private id: string;
    private x: number;
    private y: number;
    // 权重 越大越靠近右下
    private weight: number;
    // 高度
    private height: number;
    // 宽度
    private width: number;
    // 子节点
    private childNodes: XNode[];
    // 是否为分支节点
    private isBranchNode: boolean;
    // 如果节点为分支节点，改值对应的聚合节点的id
    private joinNodeId: string;
    private joinNode: XNode | null;
    // 无参构造函数 (带默认值)
    public constructor();
    // 全参构造函数
    public constructor(
        id: string,
        x: number,
        y: number,
        weight: number,
        height: number,
        width: number,
        childNodes: XNode[],
        isBranchNode: boolean,
        joinNodeId: string,
        joinNode: XNode | null
    );
    // 构造函数实现
    public constructor(...args: any[]) {
        if (args.length === 0) {
            // 无参构造初始化
            this.id = "";
            this.x = 0;
            this.y = 0;
            this.weight = 0;
            this.height = 0;
            this.width = 0;
            this.childNodes = [];
            this.isBranchNode = false;
            this.joinNodeId = "";
            this.joinNode = null;
        } else {
            // 全参构造初始化
            [
                this.id,
                this.x,
                this.y,
                this.weight,
                this.height,
                this.width,
                this.childNodes,
                this.isBranchNode,
                this.joinNodeId,
                this.joinNode
            ] = args;
        }
    }


    // ID
    public getId(): string {
        return this.id;
    }
    public setId(id: string): void {
        this.id = id;
    }

    // X坐标
    public getX(): number {
        return this.x;
    }
    public setX(x: number): void {
        this.x = x;
    }

    // Y坐标
    public getY(): number {
        return this.y;
    }
    public setY(y: number): void {
        this.y = y;
    }

    // 权重
    public getWeight(): number {
        return this.weight;
    }
    public setWeight(weight: number): void {
        this.weight = weight;
    }

    // 高度
    public getHeight(): number {
        return this.height;
    }
    public setHeight(height: number): void {
        this.height = height;
    }

    // 宽度
    public getWidth(): number {
        return this.width;
    }
    public setWidth(width: number): void {
        this.width = width;
    }

    // 子节点
    public getChildNodes(): XNode[] {
        return this.childNodes;
    }
    public setChildNodes(nodes: XNode[]): void {
        this.childNodes = nodes;
    }

    // 是否为分支节点
    public isBranch(): boolean {
        return this.isBranchNode;
    }
    public setIsBranch(isBranch: boolean): void {
        this.isBranchNode = isBranch;
    }

    // 聚合节点ID
    public getJoinNodeId(): string {
        return this.joinNodeId;
    }
    public setJoinNodeId(id: string): void {
        this.joinNodeId = id;
    }

    // 聚合节点对象
    public getJoinNode(): XNode | null {
        return this.joinNode;
    }
    public setJoinNode(node: XNode | null): void {
        this.joinNode = node;
    }
}

export default XNode;
