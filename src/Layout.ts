// 现在我在使用ts语言做节点的布局算法。
// 举个例子：最简单的a-b,b-c,c-e,a-d,d-e.a、e为开始节点和结束节点。
// 思考写代码是请先以横向布局考虑，当然我需要兼容横向布局和纵向布局两种情况。
// 我的图有以下特点，
// 1、一定会有一个开始节点和一个结束节点，位于图的开始和结束。例子中的结构可以视为一个原子结构，可以替换任意节点形成更大的图，当然a节点的分支也可以有多个。
// 2、如果整体以横向布局考虑（从左至右），即开始节点在最左边，结束节点在最右边。如果整体以纵向布局考虑（从上至下），即开始节点在最上边，结束节点在最右边。
// 3、以横向布局情况下，连线的方向也一定是从左向右的，不会出现反方向的线，即不会出现同向的环。
// 4、以横向布局情况下，我希望d和b在x的坐标式相同的，而不是随机的让d的x坐标介于a和e之间，也就是说对于分支节点数量不一致时，优先向左对齐。纵向布局则是优先向上。
// 5、以横向布局情况下，a节点y轴坐标我希望是所有子节点高度的的中间值（即子节点y坐标的【【最大值】-【最小值】】/2），当然这里的自节点的高祖是最难解决的，我目前没有好的方式解自节点到底有多高。
// 6、以横向布局情况下，比如b和d这两个分支谁在上谁在下，我希望不是随机的，针对这种分支的节点我希望可以通过节点的权重属性进行排布，比如权重越往下方排布。纵向布局时，权重越大越往右。
// 有一点我要补充一下，我所说的根据权重进行排序，只是针对一个节点有多个子节点的情况，如果一个节点只有一个子节点就不需要什么权重排序，子节点直接y的坐标与父节点相同就行了。
// 并且权重排序时不应该是对同一层级的所有元素进行排序，因为同一层级的元素不一定都是同一个父节点，可以能有多个，逐级汇总最终到达开始节点，因为这是一个庞大的图.
// 我开始说过，我的例子可以当作原子节点，替换任意一个节点组成更加庞大的图。对于结束节点的策略应该是与开始及节点的逻辑相同，只是他的y的取值的参照变成了所有父节点（或者说上一级），这样理想状态下开始节点和结束节点的y应该是相同的，同理任何一个子分支，也应该如此
// 入参有图的数据，有纵向或横向的标志，有节点的横向间距和纵向间距。
// 例如a-b,b-a1,e1-c,c-e,a-a2,e2-d,d-e,a1-b1,b1-c1,c1-e1,a1-d1,d1-e1,a2-b2,b2-c2,c2-e2,a2-d2,d2-e2,a、e为开始节点和结束节点这就是一个稍微复杂大一些的图，但依然符合我的描述。
// 我有一个思路，是不是可以先找出最小的子图，即这个子图出了本身是个分支外，内部不在包含其他子图分支，计算出对应节点的相对位置，并且还可以得到这个子树图的高度和宽度，然后对这个子图所在的父图进行计算如果这个父图还存在未被计算子图就还是先计算原子子图，最后处理父图，这样依次是不是就可以处理了？
// 下边是我的代码，还需要完善。我感觉我的思路是可以的解决我的问题的。如果你认为有不合适的点请指出，并帮我完善代码？如果还有不清楚的疑问点请列出，让我进行补充。
// 需要注意的是，写代码的坐标系请以，x轴向右为正，y轴向上为正

import AtomicTreeLayout from "./AtomicTreeLayout";
import BigXNode from "./BigXNode";
import { LayoutDirection, XEdge } from "./type";
import XNode from "./XNode";


const conf = {
    // 水平间距
    horizontalSpacing: 100,
    // 垂直间距
    verticalSpacing: 64,
}

function layoutGraph(
    nodes: XNode[],
    edges: XEdge[],
    startNode: XNode,
    endNode: XNode,
    direction: LayoutDirection,
    horizontalSpacing: number,
    verticalSpacing: number
): XNode[] {

    // ======================================================================================
    // const allAtomicTree = getAtomicTree(nodes, edges);
    // const layoutBigNodes = new Array<XBigNode>();

    // allAtomicTree.forEach((value: Array<XNode>, key: XNode)=>{
    //    const xBigNode = layoutMinimumBranchTree(value, key, key.joinNode)
    //    layoutBigNodes.push(xBigNode);
    // });

    // // 开始布局

    // 建立节点索引
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // 将原子树看作为为一个大的节点.key为原子树开始节点的id
    const bigNodeMap = new Map<string, BigXNode> ();
    
    // 填充子节点关系
    fillChildNodes(nodes, edges);

    const allAtomicTree: Map<XNode, Array<XNode>> =  getAtomicTree(nodes);

    allAtomicTree.forEach((value: Array<XNode>, key: XNode)=>{
        const bigXNode = layoutMinimumBranchTree(value, key, key.joinNode)
        bigNodeMap.set(bigXNode.startNode.id, bigXNode);
    });
    
    // 分层处理
    const layers = assignLayers(nodes, edges, startNode);
    
    // 从根节点开始递归布局


    return nodes;
}

function assignLayers(nodes: XNode[], edges: XEdge[], startNode: XNode): Map<string, number> {
    const layers = new Map<string, number>();
    nodes.forEach(node => layers.set(node.id, 0));
    layers.set(startNode.id, 0);
    
    let changed: boolean;
    do {
        changed = false;
        for (const edge of edges) {
            const sourceLayer = layers.get(edge.source)!;
            const targetLayer = layers.get(edge.target) || 0;
            if (targetLayer <= sourceLayer) {
                layers.set(edge.target, sourceLayer + 1);
                changed = true;
            }
        }
    } while (changed);
    
    return layers;
}

function layoutMinimumBranchTree(nodes: Array<XNode>, startNode: XNode, endNode: XNode): BigXNode  {
    const rs = {
        // 高度
        height: 100,
        // 宽度
        width: 100,
        // 全量节点节点
        nodes: nodes,
        // 开始节点
        startNode: startNode,
        // 结束节点
        endNode: endNode,
    } 
    // todo:对子树进行布局
    const childNodes: XNode[] = startNode.childNodes;

    if(childNodes === undefined || childNodes.length === 0) {
        throw new Error('子节点异常，子节点为undefined。');
    }
    // 子节点的总高度
    let childNodeHeight: number = 0 - conf.verticalSpacing;
    childNodes.forEach(childNode => {
        const childNodeMaxHeight: number = getBranchMaximumHeight(childNode, endNode.joinNode);
        childNodeHeight = childNodeMaxHeight + conf.verticalSpacing
    })

    const atomicTreeLayout = new AtomicTreeLayout(nodes, startNode, endNode, conf);
    atomicTreeLayout.layout();

    

    return rs;
}

/**
 * 获取原子树分支的最大高度
 * @param branchNode 分支节点
 * @param branchJoinNode 分支聚合节点
 * @returns 
 */
function getBranchMaximumHeight(branchNode: XNode, branchJoinNode: XNode): number  {
    if (branchNode === undefined || branchJoinNode === undefined) {
        return 0;
    }
    if (branchNode.id === branchJoinNode.id) {
        return Math.max(branchNode.height, 0);
    }
    // 获取子节点
    const childNodes: XNode[] = branchNode.childNodes;
    if (childNodes === undefined || childNodes.length === 0) {
        throw new Error('子节点数量异常，最小原子树只有聚合节点没有子节点。');
    }
    if (childNodes.length > 1) {
        throw new Error('子节点数量异常，最小原子树的每个分支中不能存在子分支。');
    }
    const childNode: XNode = childNodes[0]
    if(childNode === undefined) {
        throw new Error('子节点异常，子节点为undefined。');
    }
    const childNodeMaxHeight: number = getBranchMaximumHeight(childNode, branchJoinNode.joinNode);

    return Math.max(branchNode.height, childNodeMaxHeight);
}


/**
 * 获取所有的原子树，即一个分支节点与其对应的聚合节点之间的结构，且之间没有任何其他分支或复杂结构只有简单的node与edge
 * @param nodes 全量的node
 * @param edges 全量的edge
 * @returns 
 */
function getAtomicTree(nodes: XNode[]): Map<XNode, Array<XNode>> {
    // key:树的开始节点，value:对应树的所有节点集合
    const rs = new Map<XNode, Array<XNode>> ();
    // 获取所有的分支节点
    const allBranchNodes = nodes.filter((node)=>{
        node.isBranchNode;
    })
    // 找出所有的原子树
    allBranchNodes.forEach((node)=>{
        const atomicTree = isAtomicTree(node, node.joinNode)
        if(atomicTree !== undefined && atomicTree.length > 0) {
        rs.set(node, atomicTree);
        }
    })
    return rs;
}

/**
 * 判断两个节点之间的节点是否是原子树，如果节点是原子树则返回节点数组，否则返回空数组
 * @param startNode 开始节点
 * @param endNode 结束节点
 * @returns 一个XNode类型的数组。如果数组不为空，则表示在开始节点和结束节点之间的节点是一个原子树。
 */
function isAtomicTree(startNode: XNode, endNode: XNode): XNode[] {
    let rs = new Array<XNode> ();
    if(startNode === undefined || endNode == undefined || startNode.id === endNode.id){
        throw new Error("non element in between startNode and endNode")
    }
    // 获取两个节点直接的所有节点
    const allNodes = getNodesBetween(startNode, endNode);
    // 找出其中的分支节点
    const allBranchNodes = allNodes.filter((node)=>{
        node.isBranchNode;
    })
    // 如果不存在分支节点则返回当前节点之间的所有节点
    if(allBranchNodes === undefined || allBranchNodes.length === 0 ) {
        rs = allNodes
    }
    return rs;
}

function getNodesBetween(startNode: XNode, endNode: XNode): XNode[] {
    const allNodes = new Array<XNode> ();
    dfs(startNode, endNode, allNodes);
    return allNodes;
}

/**
 * 
 * @param node 当前节点，结束节点
 * @param endNode 
 * @param allNodes 
 * @returns 
 */
function dfs(node: XNode, endNode: XNode, allNodes: XNode[]): void {
    allNodes.push(node);
    if (node.id === endNode.id) {
        return;
    }

    for (const child of node.childNodes) {
        dfs(child, endNode, allNodes);
    }
}


/**
 * 填充节点的子节点集合
 * 注意：这里子节点只填充的节点id
 * @param nodes 全量的node
 * @param edges 全量的edge
 */
function fillChildNodes(nodes: XNode[], edges: XEdge[]): void {
    nodes.forEach((node)=>{
        // 查询以当前节点为父节点的连线
        const getoutEdges = getEdgeBySourceNodeId(edges, node.id);
        // 当前连线的所有目标节点就是子节点的集合
        getoutEdges.forEach((edge)=>{
            node.childNodes.push(getNodeById(nodes, edge.target));
        })
        if(node.childNodes === undefined || node.childNodes,length === 0) {
            node.isBranchNode = false;
        } else {
            node.isBranchNode = true;
        }

        if(node.isBranchNode) {
            node.joinNode = getNodeById(nodes, node.joinNodeId)
        }
    })

}

function getNodeById(nodes: XNode[], nodeId: string): XNode {
    if(nodes === undefined || nodes.length === 0) {
        throw new Error("nodes is null")
    }
    const rs = nodes.filter((node)=>{
        node.id === nodeId
    })
    if(rs === undefined || rs[0] === undefined) {
        throw new Error(`not find node by id(${nodeId})`)
    }
    return rs[0];
}

function getEdgeBySourceNodeId(edges: XEdge[], sourceNodeId: string): XEdge[] {
    if(edges === undefined || edges.length === 0) {
        throw new Error("edges is null")
    }
    const rs = edges.filter((edge)=>{
        edge.source === sourceNodeId
    })
    if(rs === undefined) {
        throw new Error(`not find edge by id(${sourceNodeId})`)
    }
    return rs;
}

function getEdgeByTargetNodeId(edges: XEdge[], targetNodeId: string): XEdge[] {
    if(edges === undefined || edges.length === 0) {
        throw new Error("edges is null")
    }
    const rs = edges.filter((edge)=>{
        edge.target === targetNodeId
    })
    if(rs === undefined) {
        throw new Error(`not find edge by id(${targetNodeId})`)
    }
    return rs;
}

