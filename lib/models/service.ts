import clientPromise from '../mongodb';
import { ObjectId } from 'mongodb';

export interface Service {
  title: string;
  description: string;
  image: string;
  order: number;
  createdAt: Date;
}

export class ServiceModel {
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('lead_stats');
    return db.collection<Service>('services');
  }

  static async create(data: Omit<Service, 'createdAt'>) {
    const collection = await this.getCollection();
    return collection.insertOne({
      ...data,
      createdAt: new Date()
    });
  }

  static async getAll() {
    const collection = await this.getCollection();
    return collection.find().sort({ order: 1, createdAt: -1 }).toArray();
  }

  static async delete(id: string) {
    const collection = await this.getCollection();
    return collection.deleteOne({ _id: new ObjectId(id) });
  }
}