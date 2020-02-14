import dotenv from 'dotenv';
dotenv.config();
import * as path from 'path';
import { TeamGenerator } from './TeamGenerator';

const fileName = process.env.FILE_NAME as string;
const filePath = path.resolve('.', fileName);

const capstoneTeamGenerator = TeamGenerator.teamsFromCapstoneSurvey(filePath);

capstoneTeamGenerator.fillMatrix();
console.log(capstoneTeamGenerator.rawData);
