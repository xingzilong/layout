import { LayoutConfig } from "./type";
import XNode from "./XNode";

class AtomicTreeLayout {
    /**
     * 节点列表
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
    /**
     * 布局配置
     */
    private config: LayoutConfig;
    /**
     * 是否已经布局
     */
    private isLaidOut = false;
    /**
     * 节点深度映射
     */
    private depthMap!: Map<XNode, number>;



    constructor(nodes: XNode[], startNode: XNode, endNode: XNode, config: LayoutConfig) {
        this.nodes = nodes;
        this.startNode = startNode;
        this.endNode = endNode;
        this.config = config;
    }

    /**
     * 执行布局
     */
    public layout() {
        // 1. 计算节点层级（最长路径原则）
        const depths = this.calculateNodeDepths(this.startNode);

        // 2. 记录节点深度映射
        this.depthMap = depths;

        // 3. 按层级分组节点
        const layers = this.groupNodesByDepth(this.startNode, depths);

        // 4. 计算各层坐标
        this.layoutLayers(layers);
    }

    /**
     * BFS计算最大深度
     * @param root 开始节点
     * @returns 
     */
    private calculateNodeDepths(startNode: XNode): Map<XNode, number> {
        const depthMap = new Map<XNode, number>([[startNode, 0]]);
        const queue: XNode[] = [startNode];

        while (queue.length > 0) {
            const node = queue.shift()!;
            const currentDepth = depthMap.get(node)!;

            node.childNodes.forEach(child => {
                const existingDepth = depthMap.get(child) ?? -1;
                if (currentDepth + 1 > existingDepth) {
                    depthMap.set(child, currentDepth + 1);
                    queue.push(child);
                }
            });
        }

        return depthMap;
    }

    /**
     * 按深度分组节点（优化实现）
     * @param startNode 开始节点
     * @param depthMap 节点深度映射
     * @returns 
     */
    private groupNodesByDepth(startNode: XNode, depthMap: Map<XNode, number>) {
        const layers = new Map<number, XNode[]>();
        const queue: XNode[] = [startNode];

        while (queue.length > 0) {
            const node = queue.shift()!;
            const depth = depthMap.get(node)!;

            if (!layers.has(depth)) {
                layers.set(depth, []);
            }
            layers.get(depth)!.push(node);

            // 按原始顺序保留子节点
            node.childNodes.forEach(child => {
                if (!queue.includes(child)) {
                    queue.push(child);
                }
            });
        }

        return Array.from(layers.entries())
            .sort((a, b) => a[0] - b[0])
            .map(entry => entry[1]);
    }

    /**
     * 核心布局逻辑（纯间距驱动）
     * @param layers 层次布局
     */
    private layoutLayers(layers: XNode[][]) {
        layers.forEach((layer, depth) => {
            // 按权重降序排列（权重大的在下方）
            const sortedNodes = [...layer].sort((a, b) => b.weight - a.weight);

            // 计算垂直起始位置（使整体居中）
            const startY = -(sortedNodes.length - 1) * config.verticalSpacing / 2;

            // 分配坐标
            sortedNodes.forEach((node, index) => {
                node.x = depth * config.horizontalSpacing;
                node.y = startY + index * config.verticalSpacing;
            });
        });
    }

    /**
     * 重新定位树
     * @param startNode 开始节点
     * @param newX 新X坐标
     * @param newY 新Y坐标
     */
    public repositionTree(startNode: XNode, newX: number, newY: number) {
        this.validateLayoutState();
        const dx = newX - this.startNode.x;
        const dy = newY - this.startNode.y;
        this.applyPositionOffset(dx, dy);
    }

    /**
     * 获取布局的高度
     * @returns 布局的高度
     */
    public getHeight(): number {
        this.validateLayoutState();
        return this.calculateVerticalSpan();
    }

    /**
     * 获取布局的宽度
     * @returns 布局的宽度
     */
    public getWidth(): number {
        this.validateLayoutState();
        return this.calculateHorizontalSpan();
    }

    /**
     * 校验布局状态
     */
    private validateLayoutState() {
        if (!this.isLaidOut) {
            throw new Error("必须首先执行布局操作");
        }
    }

    /**
     * 计算垂直跨度
     * @returns 
     */
    private calculateVerticalSpan(): number {
        const ys = this.nodes.map(node => node.y);
        return Math.max(...ys) - Math.min(...ys);
    }

    /**
     * 计算水平跨度
     * @returns 
     */
    private calculateHorizontalSpan(): number {
        const maxDepth = Math.max(...Array.from(this.depthMap.values()));
        return maxDepth * this.config.horizontalSpacing;
    }

    /**
     * 应用偏移量
     * @param dx x轴偏移量
     * @param dy y轴偏移量
     */
    private applyPositionOffset(dx: number, dy: number) {
        this.nodes.forEach(node => {
            node.x += dx;
            node.y += dy;
        });
    }
}

export default AtomicTreeLayout;

const config = {
    horizontalSpacing: 100, // 水平节点间距
    verticalSpacing: 60     // 垂直节点间距
};

// 测试用例 -------------------------------------------------
const a: XNode = { id: 'a', x: 0, y: 0, weight: 0, childNodes: [], width: 100, height: 100, isBranchNode: false, joinNodeId: '', joinNode: {} as XNode };
const b: XNode = { id: 'b', x: 0, y: 0, weight: 1, childNodes: [], width: 100, height: 100, isBranchNode: false, joinNodeId: '', joinNode: {} as XNode };
const d: XNode = { id: 'd', x: 0, y: 0, weight: 3, childNodes: [], width: 100, height: 100, isBranchNode: false, joinNodeId: '', joinNode: {} as XNode };
const c: XNode = { id: 'c', x: 0, y: 0, weight: 2, childNodes: [], width: 100, height: 100, isBranchNode: false, joinNodeId: '', joinNode: {} as XNode };
const e: XNode = { id: 'e', x: 0, y: 0, weight: 4, childNodes: [], width: 100, height: 100, isBranchNode: false, joinNodeId: '', joinNode: {} as XNode };

// 构建树结构
a.childNodes = [b, d];
b.childNodes = [c];
c.childNodes = [e];
d.childNodes = [e];

const atomicTreeLayout = new AtomicTreeLayout([a, b, c, d, e], a, e, config);
// 执行布局
atomicTreeLayout.layout();

/* 预期结果（数学坐标系）：
a(0,0)
├─ b(100,-30) → c(200,-30) → e(300,0)
└─ d(100,30) → e(300,0)
*/
console.log("初始布局:");
console.log("a:", a.x, a.y);   // (0, 0)
console.log("b:", b.x, b.y);   // (100, -30)
console.log("d:", d.x, d.y);   // (100, 30)
console.log("c:", c.x, c.y);   // (200, -30)
console.log("e:", e.x, e.y);   // (300, 0)

// 平移测试
atomicTreeLayout.repositionTree(a, 500, 500);

console.log("\n平移后布局:");
console.log("a:", a.x, a.y);   // (500, 500)
console.log("b:", b.x, b.y);   // (600, 470)
console.log("d:", d.x, d.y);   // (600, 530)
console.log("c:", c.x, c.y);   // (700, 470)
console.log("e:", e.x, e.y);   // (800, 500)