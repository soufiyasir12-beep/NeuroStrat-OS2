import Dexie, { type Table } from 'dexie';
import { Task, Email } from './types';

export class NeurostratDB extends Dexie {
  tasks!: Table<Task, number>;
  emails!: Table<Email, number>;

  constructor() {
    super('NeurostratDB');
    (this as any).version(2).stores({
      tasks: '++id, parentId, isCompleted, priority, createdAt',
      emails: '++id, status, createdAt'
    });
  }
}

export const db = new NeurostratDB();

// Initial seed if empty
(db as any).on('populate', () => {
  db.tasks.add({
    title: 'Welcome to Neurostrat OS',
    isCompleted: false,
    parentId: null,
    createdAt: new Date(),
    expanded: true,
    priority: 'High'
  });
});