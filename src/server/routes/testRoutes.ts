import { Router } from 'express';
import { runAllTests } from '../services/testRunnerService';

export const testRouter = Router();

testRouter.post('/run-all', async (req, res) => {
  try {
    const report = await runAllTests();
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
