import { Indexable } from 'yorkie-js-sdk';
import { PixelModifyItem } from 'dotting';

export type DottingDoc = {
  data: YorkieData;
  addedOrDeletedRows?: Array<{ index: number; isDelete: boolean }>;
  addedOrDeletedColumns?: Array<{ index: number; isDelete: boolean }>;
};

export type Peer = {
  clientID: string;
  presence: Indexable;
};

export type YorkieData = Record<string, Record<string, PixelModifyItem>>;
