export interface IFormProps {
  id?: number;
  name: string;
  description: string;
}

export interface IAccount extends IFormProps {
  id: number;
}

export type ICreateAccountInput = Pick<IFormProps, 'name' | 'description'>;

export interface IUpdateAccountInput extends ICreateAccountInput {
  id: number;
}

export interface ICardAccountProps {
  id: number;
  name: string;
  description: string;
  selectedId: number | null;
  handleEditAccount: (id: number, name: string, description: string) => void;
  editModal?: (id: number, name: string, description: string) => void;
  handleDeleteAccount?: (id: number) => void;
}
