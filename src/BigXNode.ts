import XNode from './XNode';

class BigXNode {
    /**
     * 高度
     */
    private height: number;
    /**
     * 宽度
     */
    private width: number;
    /**
     * 全量节点
     */
    private nodes: XNode[];
    /**
     * 开始节点
     */
    private startNode: XNode;
    /**
     * 结束节点
     */
    private endNode: XNode;

    // 无参构造函数 (带默认值)
    public constructor();
    // 全参构造函数
    public constructor(
        height: number,
        width: number,
        nodes: XNode[],
        startNode: XNode,
        endNode: XNode
    );
    // 构造函数实现
    public constructor(...args: any[]) {
        if (args.length === 0) {
            // 无参构造初始化
            this.height = 0;
            this.width = 0;
            this.nodes = [];
            this.startNode = new XNode(); // 默认空节点
            this.endNode = new XNode();    // 默认空节点
        } else {
            // 全参构造初始化
            [
                this.height,
                this.width,
                this.nodes,
                this.startNode,
                this.endNode
            ] = args;
        }
    }

    // Getter & Setter 方法
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

    // 全量节点
    public getNodes(): XNode[] {
        return this.nodes;
    }
    public setNodes(nodes: XNode[]): void {
        this.nodes = nodes;
    }

    // 开始节点
    public getStartNode(): XNode {
        return this.startNode;
    }
    public setStartNode(node: XNode): void {
        this.startNode = node;
    }

    // 结束节点
    public getEndNode(): XNode {
        return this.endNode;
    }
    public setEndNode(node: XNode): void {
        this.endNode = node;
    }
}

export default BigXNode;
