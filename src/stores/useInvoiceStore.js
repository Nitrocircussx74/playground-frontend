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

    async exportPdf(invoiceId, invoiceNumber) {
      this.isLoading = true;
      try {
        const blob = await invoiceService.exportPdf(invoiceId);
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
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
