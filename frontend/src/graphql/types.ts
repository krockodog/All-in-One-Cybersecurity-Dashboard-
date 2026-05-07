export interface GraphQLDashboardStats {
  dashboardStats: {
    totalPentests: number;
    activePentests: number;
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
  };
}
