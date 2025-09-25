import { supabase } from './supabaseClient';
import type { BloodPressureReading } from '../types';

export interface DatabaseReading {
  id: string;
  user_id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  reading_date: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface CreateReadingData {
  systolic: number;
  diastolic: number;
  pulse: number;
  reading_date: string;
  notes?: string;
}

export interface UpdateReadingData {
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  reading_date?: string;
  notes?: string;
}

class BloodPressureService {
  // Convert database reading to app reading format
  private convertToAppReading(dbReading: DatabaseReading): BloodPressureReading {
    return {
      id: dbReading.id, // Keep UUID as string for proper database operations
      date: dbReading.reading_date,
      systolic: dbReading.systolic,
      diastolic: dbReading.diastolic,
      pulse: dbReading.pulse,
      notes: dbReading.notes,
    };
  }

  // Get all readings for the current user
  async getReadings(): Promise<BloodPressureReading[]> {
    const { data, error } = await supabase
      .from('blood_pressure_readings')
      .select('*')
      .order('reading_date', { ascending: false });

    if (error) {
      console.error('Error fetching readings:', error);
      throw new Error('Failed to fetch readings');
    }

    return data.map(this.convertToAppReading);
  }

  // Get readings within a date range
  async getReadingsByDateRange(startDate: string, endDate: string): Promise<BloodPressureReading[]> {
    const { data, error } = await supabase
      .from('blood_pressure_readings')
      .select('*')
      .gte('reading_date', startDate)
      .lte('reading_date', endDate)
      .order('reading_date', { ascending: false });

    if (error) {
      console.error('Error fetching readings by date range:', error);
      throw new Error('Failed to fetch readings');
    }

    return data.map(this.convertToAppReading);
  }

  // Create a new reading
  async createReading(readingData: CreateReadingData): Promise<BloodPressureReading> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('blood_pressure_readings')
      .insert({
        user_id: user.user.id,
        ...readingData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reading:', error);
      throw new Error('Failed to create reading');
    }

    return this.convertToAppReading(data);
  }

  // Create multiple readings
  async createReadings(readingsData: CreateReadingData[]): Promise<BloodPressureReading[]> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const readingsWithUserId = readingsData.map(reading => ({
      user_id: user.user!.id,
      ...reading,
    }));

    const { data, error } = await supabase
      .from('blood_pressure_readings')
      .insert(readingsWithUserId)
      .select();

    if (error) {
      console.error('Error creating readings:', error);
      throw new Error('Failed to create readings');
    }

    return data.map(this.convertToAppReading);
  }

  // Update a reading
  async updateReading(id: string, updateData: UpdateReadingData): Promise<BloodPressureReading> {
    const { data, error } = await supabase
      .from('blood_pressure_readings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reading:', error);
      throw new Error('Failed to update reading');
    }

    return this.convertToAppReading(data);
  }

  // Delete a reading
  async deleteReading(id: string): Promise<void> {
    const { error } = await supabase
      .from('blood_pressure_readings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reading:', error);
      throw new Error('Failed to delete reading');
    }
  }

  // Delete all readings for the current user
  async deleteAllReadings(): Promise<void> {
    const { error } = await supabase
      .from('blood_pressure_readings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using a condition that's always true)

    if (error) {
      console.error('Error deleting all readings:', error);
      throw new Error('Failed to delete all readings');
    }
  }

  // Get reading statistics
  async getReadingStats(): Promise<{
    totalReadings: number;
    averageSystolic: number;
    averageDiastolic: number;
    averagePulse: number;
    latestReading?: BloodPressureReading;
  }> {
    const readings = await this.getReadings();
    
    if (readings.length === 0) {
      return {
        totalReadings: 0,
        averageSystolic: 0,
        averageDiastolic: 0,
        averagePulse: 0,
      };
    }

    const totalSystolic = readings.reduce((sum, r) => sum + r.systolic, 0);
    const totalDiastolic = readings.reduce((sum, r) => sum + r.diastolic, 0);
    const totalPulse = readings.reduce((sum, r) => sum + r.pulse, 0);

    return {
      totalReadings: readings.length,
      averageSystolic: Math.round(totalSystolic / readings.length),
      averageDiastolic: Math.round(totalDiastolic / readings.length),
      averagePulse: Math.round(totalPulse / readings.length),
      latestReading: readings[0], // Already sorted by date desc
    };
  }

  // Sync local readings to database (for migration)
  async syncLocalReadings(localReadings: BloodPressureReading[]): Promise<void> {
    if (localReadings.length === 0) return;

    const readingsData: CreateReadingData[] = localReadings.map(reading => ({
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      pulse: reading.pulse,
      reading_date: reading.date,
    }));

    await this.createReadings(readingsData);
  }
}

export const bloodPressureService = new BloodPressureService();
