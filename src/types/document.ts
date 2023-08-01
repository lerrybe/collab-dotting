import { PixelModifyItem } from 'dotting';
import { JSONObject } from 'yorkie-js-sdk';

export type DottingDoc = {
  data: YorkieData;
  indices: JSONObject<Indices>;
};

export type Indices = {
  topRowIndex: number;
  bottomRowIndex: number;
  leftColumnIndex: number;
  rightColumnIndex: number;
};

export type YorkieData = Record<string, Record<string, PixelModifyItem>>;
