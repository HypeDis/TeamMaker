import * as fs from 'fs';
import {
  SurveyEntry,
  Parser,
  GraphEdge,
  GraphNode,
  UpdateGraph,
} from './types';
import { CapstoneSurveyParser } from './Capstone/CapstoneSurveyParser';
import { updateCapstoneGraph } from './Capstone/utils';

interface GetEdgeWeight<Entry> {
  (n1: Entry, n2: Entry): number;
}

export class TeamGenerator<Entry> {
  static teamsFromCapstoneSurvey(filePath: string): TeamGenerator<SurveyEntry> {
    return new TeamGenerator<SurveyEntry>(
      new CapstoneSurveyParser(filePath),
      updateCapstoneGraph
    );
  }

  private data: Entry[] | null;
  private adjMatrix: number[][];
  private nodeList: GraphNode[];
  private edgeList: GraphEdge[];

  constructor(
    private parser: Parser<Entry>,
    private updateGraph: UpdateGraph<Entry>
  ) {
    this.data = [];
    this.adjMatrix = [[]];
    this.nodeList = [];
    this.edgeList = [];
    this.load();
  }

  get rawData(): {
    data: Entry[] | null;
    adjMatrix: number[][];
    nodeList: GraphNode[];
    edgeList: GraphEdge[];
  } {
    return {
      data: this.data,
      adjMatrix: this.adjMatrix,
      nodeList: this.nodeList,
      edgeList: this.edgeList,
    };
  }

  private load(): void {
    this.parser.parse();
    this.data = this.parser.data;
    this.generateGraph();
  }

  initializeMatrix(): void {
    if (!this.data) {
      console.log('no data');
      return;
    }
    const numEntries = this.data.length;
    this.adjMatrix = Array(numEntries)
      .fill(null)
      .map(() => Array(numEntries).fill(0));
  }
  generateGraph(): void {
    if (!this.data || !this.data.length) {
      console.log('There is no data');
      return;
    }
    this.initializeMatrix();

    const entries = this.data.length;
    for (let row = 0; row < entries; row += 1) {
      for (let col = 0; col < entries; col += 1) {
        /*
        I am making an assumption that the graph is undirected:
        matrix[a][b] will have the same value as matrix[b][a] (symmetry about a=b axis)
        therefore this function will only fill half the grid
        with a total of nCr edges where n = number of entries and r = 2 representing a pair of nodes
        */
        if (row === col || this.adjMatrix[col][row]) {
          continue;
        }
        const n1 = this.data[row];
        const n2 = this.data[col];
        //  {n1Data, n1Id} {n2Data, n2Id}, adjMatrix, nodeList, edgeList
        // const edgeWeight = this.calcEdgeWeight(n1, n2);
        // this.adjMatrix[row][col] = edgeWeight;
        this.updateGraph(
          { data: n1, id: row },
          { data: n2, id: col },
          this.adjMatrix,
          this.nodeList,
          this.edgeList
        );
      }
    }
  }

  exportData(): void {
    const dataString = JSON.stringify(this.rawData);
    fs.writeFileSync('output.json', dataString);
  }
}
