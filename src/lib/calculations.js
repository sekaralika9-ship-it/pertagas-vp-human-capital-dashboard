export const calculateRemainingBudget = (allocated, used, committed) =>
  Math.max(0, Number(allocated || 0) - Number(used || 0) - Number(committed || 0));

export const calculateCompetencyGap = (current, target) =>
  Math.max(0, Number(target || 0) - Number(current || 0));

export const calculateDashboardMetrics = ({
  employees = [],
  training = [],
  audits = [],
  competencies = [],
  budgets = [],
}) => {
  const scoredAudits = audits.filter((item) => item.score !== null && item.score !== undefined);
  const completed = training.filter((item) => item.status === 'completed').length;
  const achieved = competencies.filter((item) => Number(item.current_level) >= Number(item.target_level)).length;
  const allocated = budgets.reduce((sum, item) => sum + Number(item.allocated_amount || 0), 0);
  const used = budgets.reduce((sum, item) => sum + Number(item.used_amount || 0), 0);
  return {
    totalEmployees: employees.filter((item) => item.employment_status === 'active').length,
    trainingRealization: training.length ? (completed / training.length) * 100 : 0,
    auditReadiness: scoredAudits.length
      ? scoredAudits.reduce((sum, item) => sum + Number(item.score), 0) / scoredAudits.length
      : 0,
    competencyCoverage: competencies.length ? (achieved / competencies.length) * 100 : 0,
    budgetUtilisation: allocated ? (used / allocated) * 100 : 0,
    allocated,
    used,
  };
};
