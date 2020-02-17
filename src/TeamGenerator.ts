import * as fs from 'fs';
import * as path from 'path';
import {
  SurveyEntry,
  Parser,
  GraphEdge,
  GraphNode,
  UpdateGraph,
  AmchartEdge,
  NodeTable,
} from './types';
import { CapstoneSurveyParser } from './Capstone/CapstoneSurveyParser';
import { updateCapstoneGraph } from './Capstone/utils';
import { shuffleArray, generateNodeTable } from './utils/index';
import { NULL_ENTRY_DATA_ERROR, EXPORT_TEAMS_OPTIONS_ERROR } from './errors';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './';

interface FormattedOutput {
  [key: string]: any;
}

export class TeamGenerator<Entry extends { [key: string]: any }> {
  static teamsFromCapstoneSurvey(filePath: string): TeamGenerator<SurveyEntry> {
    return new TeamGenerator<SurveyEntry>(
      new CapstoneSurveyParser(filePath),
      updateCapstoneGraph
    );
  }

  private entryData: Entry[] | null;
  private adjMatrix: number[][];
  private nodeList: GraphNode[];
  private edgeList: GraphEdge[];
  private amchartEdgeList: AmchartEdge[];

  constructor(
    private parser: Parser<Entry>,
    private updateGraph: UpdateGraph<Entry>
  ) {
    this.entryData = [];
    this.adjMatrix = [[]];
    this.nodeList = [];
    this.edgeList = [];
    this.amchartEdgeList = [];
    this.load();
  }

  get rawData(): {
    entryData: Entry[] | null;
    adjMatrix: number[][];
    nodeList: GraphNode[];
    edgeList: GraphEdge[];
    amchartEdgeList: AmchartEdge[];
  } {
    return {
      entryData: this.entryData,
      adjMatrix: this.adjMatrix,
      nodeList: this.nodeList,
      edgeList: this.edgeList,
      amchartEdgeList: this.amchartEdgeList,
    };
  }

  private load(): void {
    this.parser.parse();
    this.entryData = this.parser.data;
    this.generateGraph();
  }

  private initializeMatrix(): void {
    if (!this.entryData) throw NULL_ENTRY_DATA_ERROR;

    const numEntries = this.entryData.length;
    this.adjMatrix = Array(numEntries)
      .fill(null)
      .map(() => Array(numEntries).fill(0));
  }

  private generateGraph(): void {
    if (!this.entryData || !this.entryData.length) throw NULL_ENTRY_DATA_ERROR;

    this.initializeMatrix();

    const entries = this.entryData.length;
    for (let row = 0; row < entries; row += 1) {
      for (let col = 0; col < entries; col += 1) {
        const n1 = this.entryData[row];
        const n2 = this.entryData[col];
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

  // creates groups using the id of each node, pass in outputKeys to format the groups using entry data.
  private createTeams(
    groupSize: number,
    outputKeys: string[] | null = null
  ): number[][] | FormattedOutput[][] {
    if (!this.entryData) throw NULL_ENTRY_DATA_ERROR;

    const numTeams = Math.floor(this.entryData.length / groupSize);

    let groups = Array(numTeams)
      .fill(null)
      .map((): number[] => []);

    const nodeTable = generateNodeTable(this.nodeList);

    // the first round, 5 random captains are chosen
    // each round the groups are shuffled and they pick the person
    // that they are most compatible with from the remaining pool
    let count = 0;
    while (Object.keys(nodeTable).length) {
      if (count > groups.length - 1) count = 0;
      // shuffle the array every round
      if (count === 0) groups = shuffleArray(groups, 3);

      const nextPick = this.findMostCompatibleMember(groups[count], nodeTable);
      groups[count].push(nextPick);
      delete nodeTable[nextPick];

      count += 1;
    }
    if (!outputKeys || (outputKeys && !outputKeys.length)) return groups;

    return this.formatGroups(groups, outputKeys);
  }

  private formatGroups(
    groups: number[][],
    outputKeys: string[]
  ): FormattedOutput[][] {
    // outputKeys should match the keys in an Entry
    if (!this.entryData) throw NULL_ENTRY_DATA_ERROR;

    const formattedGroups: FormattedOutput[][] = [];
    for (const group of groups) {
      const formattedGroup: FormattedOutput[] = [];
      for (let i = 0; i < group.length; i += 1) {
        const id = group[i];
        const entry = this.entryData[id];
        const output: FormattedOutput = {};
        for (const label of outputKeys) {
          output[label] = entry[label];
        }
        formattedGroup.push(output);
      }
      formattedGroups.push(formattedGroup);
    }
    return formattedGroups;
  }

  private findMostCompatibleMember(
    group: number[],
    availablePicks: NodeTable
  ): number {
    // sum the edge weights between a candidate and all current group members
    // find the candidate with the greatest sum
    let mostCompatibleId = -1;
    let maxScore = 0;
    if (group.length) {
      for (const pick in availablePicks) {
        const pickId = availablePicks[pick].id;
        let totalScore = 0;
        for (const member of group) {
          // this logic is due to earlier decision to only create half the adjacency matrix
          totalScore +=
            this.adjMatrix[member][pickId] || this.adjMatrix[pickId][member];
        }
        if (totalScore > maxScore) {
          maxScore = totalScore;
          mostCompatibleId = pickId;
        }
      }
    }

    // if everyone remaining has 0 compatibility with group or group is empty
    // pick a random person from the pool
    if (mostCompatibleId === -1) {
      let pickIds = Object.keys(availablePicks);
      pickIds = shuffleArray(pickIds, 3);
      mostCompatibleId = parseInt(pickIds[0]);
    }
    return mostCompatibleId;
  }

  export(
    type: string,
    options: {
      groupSize?: number;
      trialRuns?: number;
      outputKeys?: string[];
    } | null = null
  ): void {
    switch (type) {
      case 'raw':
        this.exportJSON('raw_data', this.rawData);
        break;
      case 'chord':
        this.exportJSON('chord_diagram', this.amchartEdgeList);
        break;
      case 'teams':
        if (!options || !options.groupSize) throw EXPORT_TEAMS_OPTIONS_ERROR;

        this.exportTeams(
          options.groupSize || 1,
          options.outputKeys || null,
          options.trialRuns || 1
        );
        break;
      default:
        console.log('Export Type not found');
        return;
    }
  }

  private exportJSON(fileName: string, data: any): void {
    const serializedData = JSON.stringify(data);
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    fs.writeFileSync(
      path.resolve(OUTPUT_DIR, `${fileName}.json`),
      serializedData
    );
    console.log(`File Created: ${fileName}.json`);
  }

  private exportTeams(
    groupSize: number,
    outputKeys: string[] | null,
    trialRuns: number
  ): void {
    const output: { [key: number]: number[][] | FormattedOutput[][] } = {};
    for (let i = 0; i < trialRuns; i += 1) {
      output[i] = this.createTeams(groupSize, outputKeys);
    }
    this.exportJSON('teams', output);
  }
}
