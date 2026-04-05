export interface PortionHolder {
  id: string;
  name: string;
  weight: number;
  fixedAmount: number | null;
  memo: string;
  done: boolean;
}

export type ThemeName = 'standard' | 'senior' | 'children';

export interface AppState {
  totalAmount: number;
  members: PortionHolder[];
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
}
