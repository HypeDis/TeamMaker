import { create } from '@amcharts/amcharts4/core';
import { ChordDiagram } from '@amcharts/amcharts4/charts';
import chordData from './../../output_files/chord_diagram.json';
console.log(chordData);

/// obfuscate names
// chordData.forEach(chord => {
//   chord.to = chord.to.split('').reduce((str, char) => {
//     str += char.charCodeAt(0).toString();
//     return str;
//   }, '');
//   chord.from = chord.from.split('').reduce((str, char) => {
//     str += char.charCodeAt(0).toString();
//     return str;
//   }, '');
// });

chordData.sort((a, b) => {
  if (a.value <= b.value) {
    return -1;
  } else {
    return 1;
  }
});

const chartEl = document.getElementById('chart-container');

const chart = create(chartEl, ChordDiagram);
chart.data = chordData;
chart.dataFields.fromName = 'from';
chart.dataFields.toName = 'to';
chart.dataFields.value = 'value';
