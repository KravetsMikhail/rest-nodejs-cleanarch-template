
import { IWriter } from "./i.writer"
import { IReader } from "./i.reader"

export interface IRepository<T, C> extends IWriter<T>, IReader<T, C>{}