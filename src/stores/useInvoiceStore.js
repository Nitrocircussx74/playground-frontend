import { defineStore } from 'pinia';
import invoiceService from '@/services/invoiceService';
import { useBuildingStore } from '@/stores/useBuildingStore';

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    invoices: [],
    isLoading: false,
    errorMessage: ''
  }),

  actions: {
    async fetchInvoices(params = {}) {
      const bStore = useBuildingStore();
      const targetBuildingId = params.buildingId || bStore.activeBuildingId;
      const queryParams = { ...params };
      if (targetBuildingId) {
        queryParams.buildingId = targetBuildingId;
      }

      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await invoiceService.getInvoices(queryParams);
        this.invoices = response.data || [];
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to fetch invoices';
      } finally {
        this.isLoading = false;
      }
    },

    async generateInvoice(payload) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await invoiceService.createInvoice(payload);
        await this.fetchInvoices();
        return response;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to generate invoice';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async uploadSlip(invoiceId, slipUrl) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await invoiceService.uploadPaymentSlip(invoiceId, { slipUrl });
        await this.fetchInvoices();
        return response;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to upload slip';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateStatus(invoiceId, status) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await invoiceService.updateInvoiceStatus(invoiceId, { status });
        await this.fetchInvoices();
        return response;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to update status';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async recordManualPayment(invoiceId, payload) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await invoiceService.recordManualPayment(invoiceId, payload);
        await this.fetchInvoices();
        return response;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to record manual payment';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async remindInvoice(invoiceId) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await invoiceService.remindInvoice(invoiceId);
        return response;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to send LINE reminder';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async remindBulkInvoices(payload = {}) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await invoiceService.remindBulkInvoices(payload);
        return response;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to send bulk LINE reminder';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async exportPdf(invoiceId, invoiceNumber) {
      this.isLoading = true;
      try {
        const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
        const directUrl = `${cleanBaseUrl}/api/v1/invoices/${invoiceId}/export`;

        const blob = await invoiceService.exportPdf(invoiceId);
        const filename = `Invoice-${invoiceNumber || invoiceId}.pdf`;
        const { downloadOrSharePdf } = await import('@/utils/downloadHelper');
        await downloadOrSharePdf(blob, filename, directUrl);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to export PDF';
      } finally {
        this.isLoading = false;
      }
    }
  }
});
