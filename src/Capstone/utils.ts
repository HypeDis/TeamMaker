import {
  NodeData,
  SurveyEntry,
  GraphEdge,
  GraphNode,
  AmchartEdge,
} from '../types';
export function calcCapstoneCompatability(
  person1: SurveyEntry,
  person2: SurveyEntry
): number[] {
  // (l + m) where l and m are person1's choice rank of person2 and vice versa
  // sum(n) + sum(3p) where n is default option match and p is write-in match
  // sum of all the terms will be the compatibility score
  const defaults = ['Web App', 'Mobile', 'Desktop', 'Game'];
  let compatibilityScore = 0;
  const p1p2Rank = person1.partnerPreferences.indexOf(person2.name);
  const p2p1Rank = person2.partnerPreferences.indexOf(person1.name);
  const p2Score = p1p2Rank >= 0 ? 5 - p1p2Rank : 0;
  const p1Score = p2p1Rank >= 0 ? 5 - p2p1Rank : 0;
  // 5 is hard coded b/c survey has 5 choices
  compatibilityScore += p2Score;
  compatibilityScore += p1Score;
  person1.appPreferences.forEach(pref => {
    if (person2.appPreferences.includes(pref)) {
      compatibilityScore += 1;
      if (!defaults.includes(pref)) {
        compatibilityScore += 2;
      }
    }
  });
  return [compatibilityScore, p1Score, p2Score];
}

export function updateCapSurveyNodeList(
  nodeList: GraphNode[],
  n1: GraphNode,
  n2: GraphNode
): void {
  const n1Idx = nodeList.findIndex(node => node.id === n1.id);
  const n2Idx = nodeList.findIndex(node => node.id === n2.id);
  let n1Node;
  let n2Node;
  if (n1Idx === -1) {
    n1Node = { id: n1.id, value: n1.value, label: n1.label };
    nodeList.push(n1Node);
  } else {
    n1Node = nodeList[n1Idx];
    if (typeof n1Node.value === 'number' && typeof n1.value === 'number') {
      n1Node.value += n1.value;
    }
  }
  if (n2Idx === -1) {
    n2Node = { id: n2.id, value: n2.value, label: n2.label };
    nodeList.push(n2Node);
  } else {
    n2Node = nodeList[n2Idx];
    if (typeof n2Node.value === 'number' && typeof n2.value === 'number') {
      n2Node.value += n2.value;
    }
  }
}

export function generateCapSurveyEdge(
  edgeList: GraphEdge[] | null,
  n1: GraphNode,
  n2: GraphNode,
  edgeWeight: number,
  minWeight: number
): GraphEdge | null {
  if (edgeWeight < minWeight) {
    return null;
  }
  const n1n2Edge = { from: n1.id, to: n2.id, value: edgeWeight };
  return n1n2Edge;
}

export function generateCapstoneAmChartEdge(
  edge: GraphEdge,
  n1: NodeData<SurveyEntry>,
  n2: NodeData<SurveyEntry>
): AmchartEdge {
  const acEdge: AmchartEdge = { from: '', to: '', value: 0 };
  acEdge.from = n1.data.name;
  acEdge.to = n2.data.name;
  acEdge.value = edge.value ? edge.value : 1;
  return acEdge;
}

export function updateCapstoneGraph(
  n1: NodeData<SurveyEntry>,
  n2: NodeData<SurveyEntry>,
  adjMatrix: number[][],
  nodeList: GraphNode[],
  edgeList: GraphEdge[],
  amChartEdgeList: AmchartEdge[]
): void {
  const n1Id = n1.id; //row
  const n2Id = n2.id; // col
  const [compatibility, p1Score, p2Score] = calcCapstoneCompatability(
    n1.data,
    n2.data
  );
  adjMatrix[n1Id][n2Id] = compatibility;

  const n1Node = { id: n1Id, label: n1.data.name, value: p1Score };
  const n2Node = { id: n2Id, label: n2.data.name, value: p2Score };

  updateCapSurveyNodeList(nodeList, n1Node, n2Node);

  const edge = generateCapSurveyEdge(
    edgeList,
    n1Node,
    n2Node,
    compatibility,
    2
  );
  if (edge) {
    edgeList.push(edge);
    const amChartEdge = generateCapstoneAmChartEdge(edge, n1, n2);
    amChartEdgeList.push(amChartEdge);
  }
}
