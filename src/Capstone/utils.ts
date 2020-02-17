import {
  NodeData,
  SurveyEntry,
  GraphEdge,
  GraphNode,
  AmchartEdge,
  UpdateNodeList,
  UpdateGraph,
} from '../types';

export function calcCapstoneCompatability(
  person1: SurveyEntry,
  person2: SurveyEntry
): number[] {
  const defaults = ['Web App', 'Mobile', 'Desktop', 'Game'];
  let appCompatibilityScore = 0;
  const p1p2Rank = person1.partnerPreferences.indexOf(person2.name);
  const p2p1Rank = person2.partnerPreferences.indexOf(person1.name);
  const choices = person1.partnerPreferences.length;
  const p2Score = p1p2Rank >= 0 ? choices - p1p2Rank : 0;
  const p1Score = p2p1Rank >= 0 ? choices - p2p1Rank : 0;

  // app preference matching
  person1.appPreferences.forEach(pref => {
    if (person2.appPreferences.includes(pref)) {
      appCompatibilityScore += 1;
      if (!defaults.includes(pref)) {
        appCompatibilityScore += 2;
      }
    }
  });
  return [appCompatibilityScore, p1Score, p2Score];
}

const updateCapSurveyNodeList: UpdateNodeList = (
  nodeList: GraphNode[],
  incomingNode: GraphNode
): void => {
  const nIdx = nodeList.findIndex(node => node.id === incomingNode.id);
  if (nIdx === -1) nodeList.push(incomingNode);
  else {
    const updatedNode = nodeList[nIdx];
    if (
      typeof updatedNode.value === 'number' &&
      typeof incomingNode.value === 'number'
    ) {
      updatedNode.value += incomingNode.value;
    }
  }
};

export function generateCapSurveyEdge(
  n1: GraphNode,
  n2: GraphNode,
  edgeWeight: number,
  minWeight = 1
): GraphEdge | null {
  if (edgeWeight < minWeight) return null;

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

export const updateCapstoneGraph: UpdateGraph<SurveyEntry> = (
  n1: NodeData<SurveyEntry>,
  n2: NodeData<SurveyEntry>,
  adjMatrix: number[][],
  nodeList: GraphNode[],
  edgeList: GraphEdge[],
  amChartEdgeList: AmchartEdge[]
): void => {
  const n1Id = n1.id; // row
  const n2Id = n2.id; // col

  if (n1Id === n2Id) {
    return;
  }

  const [appCompatibility, p1Score, p2Score] = calcCapstoneCompatability(
    n1.data,
    n2.data
  );
  if (!adjMatrix[n1Id][n2Id]) {
    adjMatrix[n1Id][n2Id] = p2Score;
  }
  if (!adjMatrix[n2Id][n1Id]) {
    adjMatrix[n2Id][n1Id] = p1Score;
  }

  const n1Node = { id: n1Id, label: n1.data.name, value: p1Score };
  const n2Node = { id: n2Id, label: n2.data.name, value: p2Score };

  updateCapSurveyNodeList(nodeList, n1Node);

  const directedEdge = generateCapSurveyEdge(
    n1Node,
    n2Node,
    p2Score + appCompatibility,
    3
  );
  if (directedEdge) {
    const amChartEdge = generateCapstoneAmChartEdge(directedEdge, n1, n2);
    edgeList.push(directedEdge);
    amChartEdgeList.push(amChartEdge);
  }
};
