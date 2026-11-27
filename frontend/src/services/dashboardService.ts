import { api } from './api';
import { DashboardData } from '../types/dashboard.types';

export async function fetchStudentDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>('/dashboard');
  return data;
}