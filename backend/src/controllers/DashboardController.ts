import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
  private dashboardService = new DashboardService();

  async index(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
      }

      const payload = await this.dashboardService.getStudentDashboard(userId);
      return res.json(payload);
    } catch (error) {
      console.error('Erro ao gerar dashboard do aluno:', error);
      return res.status(500).json({ message: 'Erro interno ao carregar o painel.' });
    }
  }
}