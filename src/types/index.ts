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
  allocatedAmount: number | null; // null = 全体比重配分に参加、数値 = グループ内配分額を固定
}

export type ThemeName = 'standard' | 'senior' | 'children';

export interface ValueConstraint {
  enabled: boolean;
  min: number;
  max: number;
}

export interface AppState {
  totalAmount: number;
  valueConstraint: ValueConstraint;
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
  valueConstraint: ValueConstraint;
  theme: ThemeName;
  members: PortionHolder[];
  groups: Group[];
}
