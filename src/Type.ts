export interface XEdge {
    source: string;
    target: string;
};

// export interface XNode {
//     id: string;
//     x: number;
//     y: number;
//     // 权重 越大越靠近右下
//     weight: number;
//     // 高度
//     height: number;
//     // 宽度
//     width: number;
//     // 子节点
//     childNodes: XNode[];
//     // 是否为分支节点
//     isBranchNode: boolean;
//     // 如果节点为分支节点，改值对应的聚合节点的id
//     joinNodeId: string;
//     joinNode: XNode;
// };

// export interface BigXNode {
//     // 高度
//     height: number;
//     // 宽度
//     width: number;
//     // 全量节点节点
//     nodes: XNode[];
//     // 开始节点
//     startNode: XNode;
//     // 结束节点
//     endNode: XNode;

// };

export interface AtomicTree {
    nodes: XNode[];
    // 开始节点
    startNode: XNode;
    // 结束节点
    endNode: XNode;
}

export interface LayoutContext {
    direction: LayoutDirection;
    hSpace: number;
    vSpace: number;
    nodeMap: Map<string, XNode>;
    layers: Map<string, number>;
};

export interface LayoutConfig {    
    // 水平间距
    horizontalSpacing: number,
    // 垂直间距
    verticalSpacing: number,
}

export type LayoutDirection = 'horizontal' | 'vertical';