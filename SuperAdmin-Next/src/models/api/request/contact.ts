export interface IContactFormField {
  fieldId: string;
  title: string;
  value: string;
  titleLan: {
    en: string;
    es?: string;
  };
}

export interface IContactRequestRM {
  userIP: string;
  storeId: string;
  form: IContactFormField[];
}