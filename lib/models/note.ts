import clientPromise from '../mongodb';
import { Collection, ObjectId } from 'mongodb';

export interface Note {
  text: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export class NoteModel {
  static async getCollection(): Promise<Collection<Note>> {
    const client = await clientPromise;
    const db = client.db('lead_stats');
    return db.collection<Note>('notes');
  }

  static async create(text: string, priority: Note['priority']) {
    const collection = await this.getCollection();
    return collection.insertOne({
      text,
      priority,
      createdAt: new Date()
    });
  }

  static async getAll() {
    const collection = await this.getCollection();
    return collection.find().sort({ createdAt: -1 }).toArray();
  }

  static async delete(id: string) {
    const collection = await this.getCollection();
    return collection.deleteOne({ _id: new ObjectId(id) });
  }
}