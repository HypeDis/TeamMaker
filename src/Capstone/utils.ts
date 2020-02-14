import { ISurveyEntry } from '../types';
export function calcCapstoneCompatability(
  person1: ISurveyEntry,
  person2: ISurveyEntry
): number {
  // (l + m) where l and m are person1's choice rank of person2 and vice versa
  // sum(n) + sum(3p) where n is default option match and p is write-in match
  // sum of all the terms will be the compatibility score
  const defaults = ['Web App', 'Mobile', 'Desktop', 'Game'];
  let compatibilityScore = 0;
  compatibilityScore += person1.partnerPreferences.indexOf(person2.name) + 1;
  compatibilityScore += person2.partnerPreferences.indexOf(person1.name) + 1;
  person1.appPreferences.forEach(pref => {
    if (person2.appPreferences.includes(pref)) {
      compatibilityScore += 1;
      if (!defaults.includes(pref)) {
        compatibilityScore += 2;
      }
    }
  });
  return compatibilityScore;
}
