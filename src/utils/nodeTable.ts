import { NodeTable, GraphNode } from './../types';
export function generateNodeTable(nodeList: GraphNode[]): NodeTable {
  return nodeList.reduce((table: NodeTable, curNode) => {
    table[curNode.id] = curNode;
    return table;
  }, {});
}
