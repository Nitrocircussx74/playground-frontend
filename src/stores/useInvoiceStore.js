import { defineStore } from 'pinia';
import invoiceService from '@/services/invoiceService';

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    invoices: [],
    isLoading: false,
    errorMessage: ''
  }),

  actions: {
    async fetchInvoices(params = {}) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await invoiceService.getInvoices(params);
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
    }
  }
});
