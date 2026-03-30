import clientPromise from '../mongodb';
import { Collection } from 'mongodb';

export interface Stat {
  visitorId: string;
  page: string;
  referrer: string;
  userAgent: string;
  timestamp: Date;
}

export class StatModel {
  static async getCollection(): Promise<Collection<Stat>> {
    const client = await clientPromise;
    const db = client.db('lead_stats');
    return db.collection<Stat>('visits');
  }

  static async track(data: Omit<Stat, '_id'>) {
    const collection = await this.getCollection();
    return collection.insertOne(data);
  }

  static async getUniqueVisitors(startDate: Date): Promise<number> {
    const collection = await this.getCollection();
    const pipeline = [
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$visitorId' } },
      { $count: 'total' }
    ];
    const result = await collection.aggregate(pipeline).toArray();
    return result[0]?.total || 0;
  }

  static async getTotalVisits(startDate: Date): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments({ timestamp: { $gte: startDate } });
  }

  static async getDailyStats() {
    const now = new Date();
    
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [uniqueToday, uniqueWeek, uniqueMonth, totalToday, totalWeek, totalMonth] = await Promise.all([
      this.getUniqueVisitors(startOfDay),
      this.getUniqueVisitors(startOfWeek),
      this.getUniqueVisitors(startOfMonth),
      this.getTotalVisits(startOfDay),
      this.getTotalVisits(startOfWeek),
      this.getTotalVisits(startOfMonth)
    ]);
    
    return {
      unique: { today: uniqueToday, week: uniqueWeek, month: uniqueMonth },
      total: { today: totalToday, week: totalWeek, month: totalMonth }
    };
  }
}