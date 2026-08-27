import { defineStore } from 'pinia';
import dashboardService from '@/services/dashboardService';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    summary: {
      occupancy: {
        totalRooms: 0,
        availableRooms: 0,
        occupiedRooms: 0,
        maintenanceRooms: 0,
        occupancyRate: 0
      },
      financial: {
        currentCycle: '',
        currentTotal: 0,
        prevCycle: '',
        prevTotal: 0,
        momGrowth: 0,
        breakdown: {
          roomPrice: 0,
          waterTotal: 0,
          electricTotal: 0,
          commonFee: 0
        }
      },
      debt: {
        totalDebt: 0,
        debtorCount: 0,
        debtors: []
      },
      expiringLeases: [],
      expiringLeasesCount: 0,
      pendingMaintenanceCount: 0
    },
    revenueTrends: [],
    isLoading: false,
    errorMessage: '',
    remindSuccessMessage: ''
  }),

  actions: {
    async fetchSummary(buildingId) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await dashboardService.getSummary({ ...(buildingId && { buildingId }) });
        if (response.success) {
          this.summary = response.data;
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to fetch dashboard summary';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchRevenueTrend(buildingId) {
      try {
        const response = await dashboardService.getRevenueTrend({ ...(buildingId && { buildingId }) });
        if (response.success) {
          this.revenueTrends = response.data;
        }
      } catch (error) {
        console.error('Failed to fetch revenue trend', error);
      }
    },

    async remindDebtors() {
      this.isLoading = true;
      this.errorMessage = '';
      this.remindSuccessMessage = '';
      try {
        const response = await dashboardService.remindDebtors();
        this.remindSuccessMessage = response.message || 'Notification sent';
        await this.fetchSummary();
        return response;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to send debt reminders';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async exportCsv(billingCycle = '') {
      this.isLoading = true;
      try {
        const blob = await dashboardService.downloadCsv({ billingCycle });
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoices_report_${billingCycle || 'all'}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to export CSV';
      } finally {
        this.isLoading = false;
      }
    },

    async exportPdf(billingCycle = '') {
      this.isLoading = true;
      try {
        const blob = await dashboardService.downloadPdf({ billingCycle });
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `financial_report_${billingCycle || 'current'}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to export PDF';
      } finally {
        this.isLoading = false;
      }
    }
  }
});
