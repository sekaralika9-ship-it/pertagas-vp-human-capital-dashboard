import CrudPage from './CrudPage';
import TrainingSpendByFunction from '../components/training/TrainingSpendByFunction';
import { budgetConfig } from './moduleConfigs';

export default function BudgetPage() {
  return <CrudPage config={budgetConfig} insight={<TrainingSpendByFunction />} />;
}
