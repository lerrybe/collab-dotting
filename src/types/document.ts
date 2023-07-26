import { JSONArray, JSONObject } from 'yorkie-js-sdk';
import { ColorChangeItem, PixelModifyItem } from 'dotting';

export type DottingDoc = {
  indices: JSONObject<Indices>;
  strokedPixels: JSONArray<ColorChangeItem>;
  data: YorkieData;
};

export type Indices = {
  topRowIndex: number;
  bottomRowIndex: number;
  leftColumnIndex: number;
  rightColumnIndex: number;
};

export type YorkieData = Record<number, Record<number, PixelModifyItem>>;
