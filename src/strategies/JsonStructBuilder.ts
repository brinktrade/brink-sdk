export interface JsonStructBuilder<T, U> {
  toStruct(): T
  toJSON(): U
}