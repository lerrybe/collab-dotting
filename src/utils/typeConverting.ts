import yorkie from 'yorkie-js-sdk';
import { DottingData, PixelModifyItem } from 'dotting';
import { initialDataArray } from '../data/initialData.js';
import { DottingDoc, YorkieData } from '../types/document.js';

export function convertDottingDataToYorkieData(data: DottingData): YorkieData {
  const result: YorkieData = {};
  data.forEach((innerMap, rowIndex) => {
    result[rowIndex] = {};
    innerMap.forEach(({ color }, columnIndex) => {
      result[rowIndex][columnIndex] = { color, rowIndex, columnIndex };
    });
  });
  return result;
}

/*
  🚀 The function is designed to convert the existing data from the Yorkie server
  into the 'initData' for the 'Dotting' component,
  when entering the application for the first time.
*/
export function convertYorkieDataToDottingArray(doc?: yorkie.Document<DottingDoc>) {
  if (!doc || !doc.getRoot().data || !doc.getRoot().indices) {
    return initialDataArray;
  }
  const result: Array<Array<PixelModifyItem>> = [];
  const { topRowIndex, bottomRowIndex, leftColumnIndex, rightColumnIndex } = doc.getRoot().indices;

  for (let i = topRowIndex; i <= bottomRowIndex; i++) {
    result.push([]);
    for (let j = leftColumnIndex; j <= rightColumnIndex; j++) {
      const { color, rowIndex, columnIndex } = doc.getRoot().data[i][j];
      result[i - topRowIndex].push({
        color,
        rowIndex,
        columnIndex,
      });
    }
  }
  return result;
}
