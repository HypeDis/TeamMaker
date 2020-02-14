import { ISurveyEntry, IParser } from './types';
import { CapstoneSurveyParser } from './Capstone/CapstoneSurveyParser';
import { calcCapstoneCompatability } from './Capstone/utils';

interface GetEdgeWeight<T> {
  (n1: T, n2: T): number;
}

export class TeamGenerator<GraphNode> {
  static teamsFromCapstoneSurvey(filePath: string) {
    return new TeamGenerator<ISurveyEntry>(
      new CapstoneSurveyParser(filePath),
      calcCapstoneCompatability
    );
  }

  private data: GraphNode[] | null;
  private adjMatrix: number[][] | null;
  private calcEdgeWeight: GetEdgeWeight<GraphNode>;
  constructor(
    private parser: IParser<GraphNode>,
    customEdgeWeightFunc: GetEdgeWeight<GraphNode>
  ) {
    this.data = null;
    this.adjMatrix = null;
    this.calcEdgeWeight = customEdgeWeightFunc;
    this.load();
  }

  get rawData() {
    return { data: this.data, adjMatrix: this.adjMatrix };
  }

  private load() {
    this.parser.parse();
    this.data = this.parser.data;
    this.initializeMatrix();
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
    console.log(this.adjMatrix);
  }
  fillMatrix(): void {
    if (!this.data || !this.adjMatrix) {
      console.log('no data');
      return;
    }
    const entries = this.data.length;
    for (let row = 0; row < entries; row += 1) {
      for (let col = 0; col < entries; col += 1) {
        /*
        I am making an assumption that the graph is undirected:
        matrix[a][b] will have the same value as matrix[b][a]
        therefore this function will only fill half the grid
        with a total of nCr where n = number of entries and r = 2 for a pair of nodes
        */
        if (row === col || this.adjMatrix[col][row]) {
          continue;
        }
        const n1 = this.data[row];
        const n2 = this.data[col];
        const edgeWeight = this.calcEdgeWeight(n1, n2);
        this.adjMatrix[row][col] = edgeWeight;
      }
    }
  }
}
