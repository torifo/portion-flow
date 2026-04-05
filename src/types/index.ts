export interface PortionHolder {
  id: string;
  name: string;
  weight: number;
  groupId: string | null;
  fixedAmount: number | null;
  memo: string;
  done: boolean;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  weight: number;
}

export type ThemeName = 'standard' | 'senior' | 'children';

export interface AppState {
  totalAmount: number;
  members: PortionHolder[];
  groups: Group[];
  theme: ThemeName;
}

export interface DistributionResult {
  id: string;
  portion: number;
  remainder: number;
}

export interface ExportSchema {
  $schema: 'portion-flow-v1';
  totalAmount: number;
  theme: ThemeName;
  members: PortionHolder[];
  groups: Group[];
}
