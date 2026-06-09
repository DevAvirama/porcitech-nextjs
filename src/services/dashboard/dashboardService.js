const dashboardService = {
  getKPIs: async () => {
    return {
      activePopulation: 320,
      feedConsumptionTon: 4.2,
      conversionRateFCR: 2.4,
      activeAlerts: 0,
    };
  },
};

export default dashboardService;
