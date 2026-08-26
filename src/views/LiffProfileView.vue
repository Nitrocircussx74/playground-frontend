<template>
  <div class="min-h-screen bg-slate-100 py-6 px-4 font-sans text-slate-900">
    <div class="max-w-md mx-auto space-y-5">
      <!-- Profile Header -->
      <div class="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl shadow-md text-center space-y-3">
        <div class="w-20 h-20 rounded-full bg-white/20 text-white text-3xl font-bold flex items-center justify-center mx-auto border-2 border-white/30">
          👤
        </div>
        <div>
          <h1 class="text-xl font-bold">ข้อมูลผู้เช่าหอพัก</h1>
          <p class="text-xs text-indigo-100">Dormitory Tenant Profile (LIFF Portal)</p>
        </div>
      </div>

      <!-- Section 1: Personal Info -->
      <div class="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 class="text-xs uppercase font-bold text-slate-400 tracking-wider">ส่วนที่ 1: ข้อมูลส่วนตัว</h3>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between border-b border-slate-100 pb-2">
            <span class="text-slate-500">ชื่อ-นามสกุล</span>
            <span class="font-bold text-slate-900">สมชาย ใจดี</span>
          </div>
          <div class="flex justify-between border-b border-slate-100 pb-2">
            <span class="text-slate-500">เบอร์โทรศัพท์</span>
            <span class="font-mono text-slate-900">081-234-5678</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">ห้องพักปัจจุบัน</span>
            <span class="font-bold text-indigo-600">ห้อง 101 (ชั้น 1)</span>
          </div>
        </div>
      </div>

      <!-- Section 2: LINE Account Binding -->
      <div class="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <h3 class="text-xs uppercase font-bold text-slate-400 tracking-wider">ส่วนที่ 2: สถานะบัญชี LINE</h3>
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-600">LINE Messaging API Status</span>
          <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ Connected (ผูกบัญชีแล้ว)
          </span>
        </div>
      </div>

      <!-- Section 3: My Vehicles (การจัดการยานพาหนะ) -> ควบคุมด้วย Feature Flag ENABLE_VEHICLE_MANAGEMENT -->
      <div
        v-if="featureStore.isEnabled('ENABLE_VEHICLE_MANAGEMENT')"
        class="p-5 bg-white rounded-3xl border border-indigo-200 shadow-xs space-y-3"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-xs uppercase font-bold text-indigo-700 tracking-wider">ส่วนที่ 3: My Vehicles (การจัดการยานพาหนะ)</h3>
          <span class="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">FEATURE ON</span>
        </div>

        <div class="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2 text-xs">
          <div class="flex justify-between items-center">
            <span class="font-bold text-slate-800">🛵 มอเตอร์ไซค์บิ๊กไบค์</span>
            <span class="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">1กข-9999 กทม</span>
          </div>
          <p class="text-slate-500 text-[11px]">ลงทะเบียนสิทธิ์จอดรถบริเวณโซน A เรียบร้อยแล้ว</p>
        </div>
      </div>

      <!-- Section 4: Parcel Notifications (การแจ้งเตือนพัสดุ) -> ควบคุมด้วย Feature Flag ENABLE_PARCEL_NOTIFY -->
      <div
        v-if="featureStore.isEnabled('ENABLE_PARCEL_NOTIFY')"
        class="p-5 bg-white rounded-3xl border border-emerald-200 shadow-xs space-y-3"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-xs uppercase font-bold text-emerald-700 tracking-wider">ส่วนที่ 4: Parcel Notifications (พัสดุถึงคุณ)</h3>
          <span class="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">FEATURE ON</span>
        </div>

        <div class="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs space-y-1">
          <div class="font-bold text-emerald-950">📦 มีพัสดุรอรับ 1 รายการ</div>
          <p class="text-slate-600 text-[11px]">กล่องพัสดุ Kerry Express รับได้ที่ป้อม รปภ. หอพัก</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useFeatureStore } from '@/stores/useFeatureStore';

const featureStore = useFeatureStore();

onMounted(() => {
  featureStore.fetchFeatures();
});
</script>
