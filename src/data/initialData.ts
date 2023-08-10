export const initialDataArray = Array(30)
  .fill('')
  .map((_, rowIndex) => {
    return Array(30)
      .fill('')
      .map((_, columnIndex) => {
        return {
          color: '',
          rowIndex,
          columnIndex,
        };
      });
  });

export const initialIndices = {
  topRowIndex: 0,
  bottomRowIndex: 29,
  leftColumnIndex: 0,
  rightColumnIndex: 29,
};
