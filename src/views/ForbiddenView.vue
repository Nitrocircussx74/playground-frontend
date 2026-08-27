<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
      <!-- Icon Shield Alert -->
      <div class="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner">
        🛡️
      </div>

      <!-- Title & Message -->
      <div class="space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">403 Forbidden</h1>
        <p class="text-base font-semibold text-rose-600">Access Denied: Insufficient Permissions</p>
        <p class="text-xs text-slate-500 leading-relaxed pt-1">
          คุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ (Admin Backoffice) เนื่องจากบัญชีของคุณไม่ได้เป็นสิทธิ์ผู้ดูแลระบบ (Admin Role)
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-3 pt-2">
        <router-link
          to="/liff/profile"
          class="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md"
        >
          📱 กลับไปยังศูนย์กลางผู้เช่า (LINE Tenant Hub)
        </router-link>

        <router-link
          to="/login"
          class="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition-all border border-slate-200"
        >
          🔐 เข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin Login)
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
