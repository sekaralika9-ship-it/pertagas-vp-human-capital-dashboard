import CrudPage from './CrudPage';
import TnaTrainingSummary from '../components/training/TnaTrainingSummary';
import { trainingConfig } from './moduleConfigs';

export default function TrainingPage() {
  return <CrudPage config={trainingConfig} insight={<TnaTrainingSummary />} />;
}
