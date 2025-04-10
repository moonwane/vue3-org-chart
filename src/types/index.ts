export interface INode {
  id: string;
  parentId?: string;
  [key: string]: unknown;
}

export interface NodeData<T> {
  readonly children: string[];
  readonly data: T;
}

export interface NodeState {
  childrenExpanded: boolean;
}

export interface NodeSlotParams<T> {
  item: T;
  children: string[];
  childrenExpanded: boolean;
  toggleChildren: () => void;
}
