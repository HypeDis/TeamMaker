import * as fs from 'fs';
import {
  SurveyEntry,
  Parser,
  GraphEdge,
  GraphNode,
  UpdateGraph,
  AmchartEdge,
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
  private amchartEdgeList: AmchartEdge[];

  constructor(
    private parser: Parser<Entry>,
    private updateGraph: UpdateGraph<Entry>
  ) {
    this.data = [];
    this.adjMatrix = [[]];
    this.nodeList = [];
    this.edgeList = [];
    this.amchartEdgeList = [];
    this.load();
  }

  get rawData(): {
    data: Entry[] | null;
    adjMatrix: number[][];
    nodeList: GraphNode[];
    edgeList: GraphEdge[];
    amchartEdgeList: AmchartEdge[];
  } {
    return {
      data: this.data,
      adjMatrix: this.adjMatrix,
      nodeList: this.nodeList,
      edgeList: this.edgeList,
      amchartEdgeList: this.amchartEdgeList,
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
          this.edgeList,
          this.amchartEdgeList
        );
      }
    }
  }

  createTeams(groupSize: number): number[][] | null {
    if (!this.data) {
      console.error('No Data!');
      return null;
    }
    const numTeams = Math.floor(this.data.length / groupSize);

    const groups = Array(numTeams)
      .fill(null)
      .map((): number[] => []);

    const nodeTable = this.nodeList.reduce(
      (table: { [key: number]: GraphNode }, curNode) => {
        table[curNode.id] = curNode;
        return table;
      },
      {}
    );

    const el = this.edgeList.slice();

    el.sort((e1, e2) => {
      if (e1.value < e2.value) {
        return -1;
      } else {
        return 1;
      }
    });

    // initialize the teams as groups of 2, according to the highest edge weights
    for (let i = 0; i < numTeams; i += 1) {
      if (!Object.keys(nodeTable).length || !el.length) {
        console.error('Not enough people for given group size');
        return groups;
      }
      let picked = false;
      while (!picked) {
        const curEdge = el.pop() as GraphEdge;
        const p1 = curEdge.from;
        const p2 = curEdge.to;
        // check that the people in this edge havent been picked yet
        if (p1 in nodeTable && p2 in nodeTable) {
          groups[i].push(p1, p2);
          delete nodeTable[p1];
          delete nodeTable[p2];
          picked = true;
        }
      }
    }

    // each round the groups pick in random order the person from the remaining pool
    // that they are most compatible with
    let count = 0;
    while (Object.keys(nodeTable).length) {
      if (count > groups.length - 1) {
        count = 0;
      }
      if (count === 0) {
        // shuffle the array again
      }

      const nextPick = this.findMostCompatibleMember(groups[count], nodeTable);
      groups[count].push(nextPick);

      count += 1;
    }
    return groups;
  }

  findMostCompatibleMember(group, availableEntries): number {
    // sum the edge weights between a candidate and all current group members
    // find the candidate with the greatest sum
    let mostCompatible = null;
    let score = 0;
    for (let entry in availableEntries) {
      
    }
  }
  export(type: string): void {
    switch (type) {
      case 'all':
        this.exportAllData();
        break;
      case 'chord':
        this.exportChordDiagramData();
        break;
      default:
        console.log('Export Type not found');
        return;
    }
  }

  exportAllData(): void {
    const dataString = JSON.stringify(this.rawData);
    fs.writeFileSync('all_data.json', dataString);
    console.log('File Created: allData.json');
  }
  exportChordDiagramData(): void {
    const dataString = JSON.stringify(this.amchartEdgeList);
    fs.writeFileSync('chord_diagram.json', dataString);
    console.log('File Created: chord_diagram.json');
  }
}
