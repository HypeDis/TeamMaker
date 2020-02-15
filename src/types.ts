export interface Parser<T> {
  filePath: string;
  data: T[] | null;
  parse: () => void;
}

export interface SurveyEntry {
  name: string;
  partnerPreferences: string[];
  appPreferences: string[];
}

export interface GraphNode {
  id: number;
  label: string | number;
  value?: number;
}

export interface GraphEdge {
  from: number;
  to: number;
  value?: number;
}
export interface NodeData<Entry> {
  data: Entry;
  id: number;
}

export interface UpdateGraph<Entry> {
  (
    n1: NodeData<Entry>,
    n2: NodeData<Entry>,
    adjMatrix: number[][],
    nodeList: GraphNode[],
    edgeList: GraphEdge[]
  ): void;
}

export interface UpdateNodeList {
  (nodeList: GraphNode[], n1: GraphNode, n2?: GraphNode): void;
}

export interface UpdateEdgeList {
  (edgeList: GraphEdge[], n1: GraphNode, n2: GraphNode): void;
}
