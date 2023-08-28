import { PixelModifyItem } from 'dotting';

export const CreateInitialDataArray = (size: number): PixelModifyItem[][] => {
  const data: PixelModifyItem[][] = [];
  for (let i = 0; i < size; i++) {
    const row: PixelModifyItem[] = [];
    for (let j = 0; j < size; j++) {
      row.push({ rowIndex: i, columnIndex: j, color: '' });
    }
    data.push(row);
  }
  return data;
};
