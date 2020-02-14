export interface IParser<T> {
  filePath: string;
  data: T[] | null;
  parse: () => void;
}

export interface ISurveyEntry {
  name: string;
  partnerPreferences: string[];
  appPreferences: string[];
}
