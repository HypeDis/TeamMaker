import * as fs from 'fs';

import { ISurveyEntry, IParser } from '../types';

export class CapstoneSurveyParser implements IParser<ISurveyEntry> {
  private _data: ISurveyEntry[] | null;
  constructor(public filePath: string) {
    this._data = null;
    this.parse();
  }

  get data() {
    return this._data;
  }
  convertCSVtoString(filePath: string): string {
    try {
      return fs.readFileSync(filePath, { encoding: 'utf-8' });
    } catch (err) {
      console.error('******* Error reading file ******** \n', err);
      return err;
    }
  }

  parseSurveyCSV(data: string): string[] {
    const rows = data.split('\n');
    // top row is column names so byebye
    return rows.slice(1);
  }

  parseSurveyRow(row: string): ISurveyEntry {
    const [
      timeStamp,
      name,
      choice1,
      choice2,
      choice3,
      choice4,
      choice5,
      appPreferencesRaw,
    ] = row.split(',');

    const appPreferences = appPreferencesRaw.split(';');

    return {
      name,
      partnerPreferences: [choice1, choice2, choice3, choice4, choice5],
      appPreferences,
    };
  }

  parse() {
    const csvString = this.convertCSVtoString(this.filePath);
    const entries = this.parseSurveyCSV(csvString);
    this._data = entries.map(entry => this.parseSurveyRow(entry));
  }
}
