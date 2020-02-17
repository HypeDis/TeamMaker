import dotenv from 'dotenv';
dotenv.config();
import * as path from 'path';
import { TeamGenerator } from './TeamGenerator';
import { FILE_PATH_ERROR } from './errors';

const filePath = process.env.FILE_PATH;
if (!filePath) throw FILE_PATH_ERROR;

const capstoneTeamGenerator = TeamGenerator.teamsFromCapstoneSurvey(filePath);
capstoneTeamGenerator.export('raw');
capstoneTeamGenerator.export('chord');
capstoneTeamGenerator.export('teams', {
  groupSize: 3,
  trialRuns: 1,
  outputKeys: ['name'],
});
