<template>
  <div class="space-y-6">
    <!-- Header & Export Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-white p-1 border border-slate-200/80 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/horhub-app-icon.png" alt="HorHub Logo" class="w-full h-full object-contain rounded-xl" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>แดชบอร์ดภาพรวม HorHub</span>
            <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-soft-pulse"></span>
              <span>Realtime</span>
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            A Central Platform for Living and Management - ติดตามรายรับรวม อัตราครองห้อง และยอดค้างชำระ
          </p>
        </div>
      </div>

      <!-- Toolbar Controls -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Billing Cycle Selector -->
        <div class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <Calendar class="w-4 h-4 text-cyan-600 shrink-0" />
          <label class="text-xs font-bold text-slate-600">รอบบิล:</label>
          <CycleDatePicker v-model="selectedCycle" />
        </div>

        <!-- Refresh Button -->
        <button
          @click="loadDashboardData"
          class="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200/90 shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="รีเฟรชข้อมูลล่าสุด"
        >
          <RefreshCw class="w-3.5 h-3.5 text-slate-500" :class="{ 'animate-spin': dashboardStore.isLoading }" />
          <span class="hidden sm:inline">รีเฟรช</span>
        </button>

        <!-- Export CSV Button -->
        <button
          @click="handleExportCsv"
          :disabled="dashboardStore.isLoading"
          class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
        >
          <FileSpreadsheet class="w-3.5 h-3.5" />
          <span>CSV</span>
        </button>

        <!-- Export PDF Button -->
        <button
          @click="handleExportPdf"
          :disabled="dashboardStore.isLoading"
          class="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
        >
          <FileText class="w-3.5 h-3.5" />
          <span>PDF</span>
        </button>
      </div>
    </div>

    <!-- Dashboard Mode Banner -->
    <div
      class="p-4 sm:p-5 rounded-3xl border flex items-center justify-between shadow-2xs transition-all relative overflow-hidden"
      :class="isConsolidatedMode ? 'bg-gradient-to-r from-slate-900 via-cyan-950 to-teal-950 text-white border-cyan-800/80 shadow-cyan-950/20' : 'bg-gradient-to-r from-cyan-50/70 via-teal-50/50 to-white border-cyan-200/80 text-slate-900'"
    >
      <div class="flex items-center gap-3.5 z-10">
        <div
          class="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs"
          :class="isConsolidatedMode ? 'bg-white/10 border border-white/20 text-white' : 'bg-cyan-600 text-white shadow-cyan-500/20'"
        >
          <Globe v-if="isConsolidatedMode" class="w-5 h-5" />
          <Building2 v-else class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-extrabold text-sm sm:text-base tracking-tight">
              {{ isConsolidatedMode ? 'โหมดภาพรวมทุกหอพัก (Consolidated Portfolio)' : `สรุปผลประกอบการ: ${activeBuildingName}` }}
            </h2>
          </div>
          <p class="text-xs mt-0.5" :class="isConsolidatedMode ? 'text-cyan-200' : 'text-slate-500'">
            {{ isConsolidatedMode ? 'แสดงผลสรุปรายรับรวม อัตราครองห้องรวม และการเปรียบเทียบระหว่างตึกทั้งหมดในระบบ' : 'แสดงข้อมูลสถิติและสถานะเฉพาะหอพักที่เลือกอยู่' }}
          </p>
        </div>
      </div>

      <div class="hidden sm:flex items-center gap-2 z-10">
        <span
          class="px-3.5 py-1 rounded-full text-xs font-bold shrink-0"
          :class="isConsolidatedMode ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/30' : 'bg-white text-cyan-800 border border-cyan-200 shadow-2xs'"
        >
          {{ isConsolidatedMode ? '🏢 ทุกอาคาร' : `🏢 ${activeBuildingName}` }}
        </span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="dashboardStore.errorMessage" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center justify-between shadow-2xs">
      <div class="flex items-center gap-2">
        <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
        <span>{{ dashboardStore.errorMessage }}</span>
      </div>
      <button @click="dashboardStore.errorMessage = ''" class="text-rose-500 hover:text-rose-700 font-bold cursor-pointer">✕</button>
    </div>

    <!-- Loading State Skeleton -->
    <div v-if="dashboardStore.isLoading && !summary.occupancy?.totalRooms" class="p-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
      <div class="animate-spin w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <div class="font-bold text-slate-800 text-sm">กำลังโหลดข้อมูลแดชบอร์ด...</div>
      <div class="text-xs text-slate-400 mt-1">กรุณารอสักครู่ ระบบกำลังประมวลผลข้อมูลสถิติ</div>
    </div>

    <div v-else class="space-y-6">
      <!-- Building Comparison Section (Visible in Consolidated Mode) -->
      <div v-if="isConsolidatedMode && summary.buildingBreakdown?.length > 0" class="space-y-3">
        <h3 class="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <span>🏢 เปรียบเทียบผลประกอบการระหว่างตึก (Building Breakdown)</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="b in summary.buildingBreakdown"
            :key="b.id"
            @click="selectBuilding(b.id)"
            class="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-cyan-400 cursor-pointer transition-all space-y-3 group card-hover"
          >
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors flex items-center gap-2">
                <Building class="w-4 h-4 text-cyan-600" />
                <span>{{ b.name }}</span>
              </h4>
              <span class="text-xs text-cyan-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                <span>เลือกตึกนี้</span>
                <span>→</span>
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs pt-1">
              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div class="text-slate-500 text-[11px]">รายได้เดือนนี้</div>
                <div class="font-extrabold font-mono text-cyan-700 text-sm">฿{{ b.currentRevenue?.toLocaleString() }}</div>
              </div>
              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div class="text-slate-500 text-[11px]">อัตราครองห้อง</div>
                <div class="font-bold text-slate-900 text-sm">{{ b.occupancyRate }}% <span class="text-[10px] text-slate-400">({{ b.occupiedRooms }}/{{ b.totalRooms }})</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 1. Top KPI Summary Cards (4 Cards) -->
      <div id="tour-kpi-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <!-- Card 1: Revenue -->
        <div class="bg-white p-5 rounded-3xl border border-cyan-100 shadow-2xs hover:shadow-md transition-all card-hover relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">รายรับเดือนนี้ (Revenue)</div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
                ฿{{ Number(summary.financial?.currentTotal || 0).toLocaleString() }}
              </div>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-cyan-100/80 text-cyan-700 flex items-center justify-center font-bold shadow-2xs shrink-0">
              <DollarSign class="w-5 h-5" />
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
            <span
              class="font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-0.5"
              :class="summary.financial?.momGrowth >= 0 ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'"
            >
              {{ summary.financial?.momGrowth >= 0 ? '▲ +' : '▼ ' }}{{ Math.abs(summary.financial?.momGrowth || 0) }}%
            </span>
            <span class="text-slate-400">เทียบเดือนก่อน</span>
          </div>
        </div>

        <!-- Card 2: Total Debt -->
        <div class="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs hover:shadow-md transition-all card-hover relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ยอดค้างชำระ (Overdue)</div>
              <div class="text-2xl sm:text-3xl font-black text-rose-600 font-mono tracking-tight mt-1">
                ฿{{ Number(summary.debt?.totalDebt || 0).toLocaleString() }}
              </div>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-rose-100/80 text-rose-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
              <AlertTriangle class="w-5 h-5" />
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
            <span
              class="font-bold px-2 py-0.5 rounded-md"
              :class="summary.debt?.debtorCount > 0 ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'"
            >
              {{ summary.debt?.debtorCount || 0 }} ห้อง
            </span>
            <span class="text-slate-400">ที่ยังไม่ชำระค่าเช่า</span>
          </div>
        </div>

        <!-- Card 3: Occupancy Rate -->
        <div class="bg-white p-5 rounded-3xl border border-emerald-100 shadow-2xs hover:shadow-md transition-all card-hover relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">อัตราครองห้อง (Occupancy)</div>
              <div class="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight mt-1">
                {{ summary.occupancy?.occupancyRate || 0 }}%
              </div>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold shadow-2xs shrink-0">
              <Home class="w-5 h-5" />
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <div>
              <span class="font-bold text-slate-800">{{ summary.occupancy?.occupiedRooms || 0 }}</span>
              <span> / {{ summary.occupancy?.totalRooms || 0 }} ห้อง</span>
            </div>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">
              ว่าง {{ summary.occupancy?.availableRooms || 0 }}
            </span>
          </div>
        </div>

        <!-- Card 4: Pending Tasks & Maintenance -->
        <div class="bg-white p-5 rounded-3xl border border-amber-100 shadow-2xs hover:shadow-md transition-all card-hover relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">งานรอดำเนินการ (Tasks)</div>
              <div class="text-2xl sm:text-3xl font-black text-amber-600 font-mono tracking-tight mt-1">
                {{ summary.pendingMaintenanceCount || 0 }} <span class="text-xs font-normal text-slate-400">เคสซ่อม</span>
              </div>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold shadow-2xs shrink-0">
              <Wrench class="w-5 h-5" />
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>สัญญาใกล้หมด 30 วัน:</span>
            <span class="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
              {{ summary.expiringLeasesCount || 0 }} รายการ
            </span>
          </div>
        </div>
      </div>

      <!-- 2. Interactive Charts Section -->
      <div id="tour-revenue-chart" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Stacked Bar Chart: 6-Month Revenue Trend -->
        <div class="lg:col-span-2 p-5 sm:p-6 bg-white border border-slate-200/90 rounded-3xl shadow-2xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 class="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <BarChart3 class="w-4 h-4 text-cyan-600" />
                <span>แนวโน้มรายรับ 6 เดือนย้อนหลัง (Revenue Trend)</span>
              </h3>
              <p class="text-xs text-slate-500">แสดงการกระจายรายรับจำแนกตามค่าเช่า ค่าน้ำไฟ และค่าส่วนกลาง</p>
            </div>
          </div>

          <div class="h-72 w-full flex items-center justify-center">
            <Bar :data="trendChartData" :options="trendChartOptions" />
          </div>
        </div>

        <!-- Doughnut Chart: Room Status Distribution -->
        <div class="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-3xl shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <PieChart class="w-4 h-4 text-teal-600" />
              <span>สัดส่วนสถานะห้องพัก (Room Status)</span>
            </h3>
            <p class="text-xs text-slate-500">สัดส่วนห้องพักมีคนอยู่ / ว่าง / ซ่อมบำรุง</p>
          </div>

          <div class="h-56 w-full flex items-center justify-center my-auto">
            <Doughnut :data="roomStatusChartData" :options="roomStatusChartOptions" />
          </div>

          <!-- Room Status Legend Pills -->
          <div class="grid grid-cols-3 gap-1.5 pt-3 border-t border-slate-100 text-center text-xs">
            <div class="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
              <div class="text-[10px] text-emerald-700 font-medium">มีผู้เช่า</div>
              <div class="font-bold text-emerald-900 font-mono">{{ summary.occupancy?.occupiedRooms || 0 }} ห้อง</div>
            </div>
            <div class="bg-teal-50/70 p-2 rounded-xl border border-teal-100">
              <div class="text-[10px] text-teal-700 font-medium">ห้องว่าง</div>
              <div class="font-bold text-teal-900 font-mono">{{ summary.occupancy?.availableRooms || 0 }} ห้อง</div>
            </div>
            <div class="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div class="text-[10px] text-slate-500 font-medium">ซ่อมบำรุง</div>
              <div class="font-bold text-slate-800 font-mono">{{ summary.occupancy?.maintenanceRooms || 0 }} ห้อง</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Bottom Grid: 2-Column To-Do Lists (Overdue Debtors & Expiring Leases) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Left Column: Overdue Debtors -->
        <div id="tour-overdue-debtors" class="bg-white border border-slate-200/90 rounded-3xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div class="p-4 sm:p-5 bg-gradient-to-r from-rose-50/50 via-white to-white border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-soft-pulse"></span>
                  <span>รายการห้องค้างชำระ (Overdue Invoices)</span>
                </h3>
                <p class="text-[11px] text-slate-500">รวม {{ summary.debt?.debtorCount || 0 }} ห้องพักที่รอดำเนินการทวงถามยอด</p>
              </div>

              <button
                @click="showRemindModal = true"
                :disabled="!summary.debt?.debtors || summary.debt?.debtors.length === 0"
                class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <MessageSquare class="w-3.5 h-3.5" />
                <span>ส่ง LINE ทวงหนี้</span>
              </button>
            </div>

            <div class="overflow-x-auto max-h-72">
              <table class="w-full text-left text-xs text-slate-700">
                <thead class="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 border-b border-slate-100">
                  <tr>
                    <th class="p-3.5">ห้องพัก</th>
                    <th class="p-3.5">ผู้เช่า</th>
                    <th class="p-3.5">รอบบิล</th>
                    <th class="p-3.5">ยอดรวม</th>
                    <th class="p-3.5 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="inv in summary.debt?.debtors" :key="inv.id" class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-3.5 font-bold text-slate-900 font-mono">
                      <span class="bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200">
                        🚪 {{ inv.room?.roomNumber }}
                      </span>
                    </td>
                    <td class="p-3.5 font-medium text-slate-800">
                      {{ inv.tenant ? `${inv.tenant.firstName} ${inv.tenant.lastName}` : '-' }}
                    </td>
                    <td class="p-3.5 text-slate-500 font-mono">
                      <span class="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        {{ inv.billingCycle }}
                      </span>
                    </td>
                    <td class="p-3.5 font-extrabold text-rose-600 font-mono text-sm">
                      ฿{{ Number(inv.grandTotal).toLocaleString() }}
                    </td>
                    <td class="p-3.5 text-right">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                        {{ inv.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!summary.debt?.debtors || summary.debt?.debtors.length === 0">
                    <td colspan="5" class="p-10 text-center text-slate-400">
                      <div class="text-3xl mb-1.5">🎉</div>
                      <div class="font-bold text-slate-700 text-sm">ไม่มีรายการห้องค้างชำระในระบบ</div>
                      <div class="text-xs text-slate-400 mt-0.5">ลูกบ้านทุกคนชำระค่าเช่าตรงเวลาเรียบร้อย</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: Expiring Leases in 30 Days -->
        <div id="tour-expiring-leases" class="bg-white border border-slate-200/90 rounded-3xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div class="p-4 sm:p-5 bg-gradient-to-r from-amber-50/50 via-white to-white border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>สัญญาใกล้หมดอายุใน 30 วัน (Expiring Leases)</span>
                </h3>
                <p class="text-[11px] text-slate-500">มีทั้งหมด {{ summary.expiringLeasesCount || 0 }} สัญญาที่ต้องติดต่อต่อสัญญา</p>
              </div>

              <router-link
                to="/leases"
                class="px-3 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl text-xs font-bold border border-cyan-200 transition-all flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <span>➔</span>
              </router-link>
            </div>

            <div class="overflow-x-auto max-h-72">
              <table class="w-full text-left text-xs text-slate-700">
                <thead class="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 border-b border-slate-100">
                  <tr>
                    <th class="p-3.5">ห้องพัก</th>
                    <th class="p-3.5">ผู้เช่า</th>
                    <th class="p-3.5">วันหมดสัญญา</th>
                    <th class="p-3.5 text-right">มัดจำ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="lease in summary.expiringLeases" :key="lease.id" class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-3.5 font-bold text-slate-900 font-mono">
                      <span class="bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200">
                        🚪 {{ lease.room?.roomNumber }}
                      </span>
                    </td>
                    <td class="p-3.5 font-medium text-slate-800">
                      <div>{{ lease.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : '-' }}</div>
                      <span class="block text-[10px] text-slate-400 font-mono mt-0.5">📞 {{ lease.tenant?.phone || '-' }}</span>
                    </td>
                    <td class="p-3.5 font-bold text-amber-700 font-mono">
                      {{ lease.expectedEndDate ? new Date(lease.expectedEndDate).toLocaleDateString('th-TH') : '-' }}
                    </td>
                    <td class="p-3.5 text-right font-extrabold text-emerald-700 font-mono text-sm">
                      ฿{{ Number(lease.depositAmount || 0).toLocaleString() }}
                    </td>
                  </tr>
                  <tr v-if="!summary.expiringLeases || summary.expiringLeases.length === 0">
                    <td colspan="4" class="p-10 text-center text-slate-400">
                      <div class="text-3xl mb-1.5">📑</div>
                      <div class="font-bold text-slate-700 text-sm">ไม่มีสัญญาที่กำลังจะหมดอายุใน 30 วัน</div>
                      <div class="text-xs text-slate-400 mt-0.5">สัญญาเช่าทุกห้องยังอยู่ในช่วงเวลาปกติ</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Debt Reminder Modal -->
    <div v-if="showRemindModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
        <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto shadow-2xs">
          <MessageSquare class="w-6 h-6" />
        </div>

        <h3 class="text-lg font-bold text-slate-900 text-center">ยืนยันการส่ง LINE ทวงหนี้</h3>

        <p class="text-sm text-slate-600 text-center leading-relaxed">
          คุณต้องการส่งข้อความแจ้งเตือนยอดค้างชำระผ่าน LINE ไปยัง
          <span class="font-bold text-slate-900">{{ summary.debt?.debtorCount }} ห้องพัก</span>
          (รวมยอด <span class="font-bold text-rose-600">฿{{ Number(summary.debt?.totalDebt).toLocaleString() }}</span>) ใช่หรือไม่?
        </p>

        <div class="flex gap-3 pt-2">
          <button
            @click="showRemindModal = false"
            class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            ยกเลิก (Cancel)
          </button>

          <button
            @click="handleRemindDebtors"
            :disabled="reminding"
            class="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
          >
            {{ reminding ? 'กำลังส่ง...' : 'ยืนยันส่ง LINE ทวงหนี้' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import {
  Calendar,
  Building2,
  Building,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  DollarSign,
  AlertTriangle,
  Home,
  Wrench,
  Globe,
  AlertCircle,
  BarChart3,
  PieChart,
  MessageSquare
} from 'lucide-vue-next';
import CycleDatePicker from '@/components/common/CycleDatePicker.vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bar, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError } from '@/utils/swal';
import { startTour } from '@/utils/tours';

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

const dashboardStore = useDashboardStore();
const buildingStore = useBuildingStore();
const selectedCycle = ref('');
const showRemindModal = ref(false);
const reminding = ref(false);

const summary = computed(() => dashboardStore.summary);
const revenueTrends = computed(() => dashboardStore.revenueTrends);
const isConsolidatedMode = computed(() => !buildingStore.activeBuildingId);

const activeBuildingName = computed(() => {
  if (!buildingStore.activeBuildingId) return 'ภาพรวมทุกหอพัก';
  const b = buildingStore.buildings.find((x) => x.id === buildingStore.activeBuildingId);
  return b ? b.name : 'ตึกที่เลือก';
});

const selectBuilding = (buildingId) => {
  buildingStore.setActiveBuildingId(buildingId);
};

onMounted(async () => {
  buildingStore.fetchBuildings();
  await loadDashboardData();
  setTimeout(() => {
    startTour('dashboard');
  }, 600);
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    loadDashboardData();
  }
);

const loadDashboardData = async () => {
  const bId = buildingStore.activeBuildingId;
  await dashboardStore.fetchSummary(bId);
  await dashboardStore.fetchRevenueTrend(bId);
  if (summary.value.financial?.currentCycle) {
    selectedCycle.value = summary.value.financial.currentCycle;
  }
};

const handleExportCsv = async () => {
  await dashboardStore.exportCsv(selectedCycle.value);
};

const handleExportPdf = async () => {
  await dashboardStore.exportPdf(selectedCycle.value);
};

const handleRemindDebtors = async () => {
  reminding.value = true;
  try {
    const res = await dashboardStore.remindDebtors();
    await showSuccess('สำเร็จ!', res.message || 'ส่งการแจ้งเตือนทวงถามยอดค้างชำระเรียบร้อยแล้ว');
    showRemindModal.value = false;
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to send debt reminders');
  } finally {
    reminding.value = false;
  }
};

// 6-Month Stacked Revenue Trend Chart Data
const trendChartData = computed(() => ({
  labels: revenueTrends.value.map((t) => t.cycle),
  datasets: [
    {
      label: 'ค่าเช่าห้องพัก (Room Rent)',
      backgroundColor: '#6366f1',
      data: revenueTrends.value.map((t) => t.roomPrice || 0),
      borderRadius: 6
    },
    {
      label: 'ค่าน้ำประปา (Water)',
      backgroundColor: '#06b6d4',
      data: revenueTrends.value.map((t) => t.waterTotal || 0),
      borderRadius: 6
    },
    {
      label: 'ค่าไฟฟ้า (Electricity)',
      backgroundColor: '#f59e0b',
      data: revenueTrends.value.map((t) => t.electricTotal || 0),
      borderRadius: 6
    },
    {
      label: 'ค่าส่วนกลาง (Common Fee)',
      backgroundColor: '#10b981',
      data: revenueTrends.value.map((t) => t.commonFee || 0),
      borderRadius: 6
    }
  ]
}));

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
    },
    y: {
      stacked: true,
      grid: { color: 'rgba(241, 245, 249, 0.9)' },
      ticks: {
        font: { family: 'Plus Jakarta Sans', size: 11 },
        callback: (val) => `฿${Number(val).toLocaleString()}`
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        font: { family: 'Prompt', size: 11 },
        usePointStyle: true,
        boxWidth: 8,
        padding: 14
      }
    },
    tooltip: {
      bodyFont: { family: 'Prompt' },
      titleFont: { family: 'Prompt' },
      callbacks: {
        label: (context) => ` ${context.dataset.label}: ฿${Number(context.raw || 0).toLocaleString()}`
      }
    }
  }
};

// Doughnut Chart Data for Room Status Breakdown
const roomStatusChartData = computed(() => ({
  labels: ['มีผู้เช่า (Occupied)', 'ห้องว่าง (Available)', 'ซ่อมบำรุง (Maintenance)'],
  datasets: [
    {
      backgroundColor: ['#10b981', '#6366f1', '#cbd5e1'],
      hoverBackgroundColor: ['#059669', '#4f46e5', '#94a3b8'],
      borderWidth: 3,
      borderColor: '#ffffff',
      data: [
        summary.value.occupancy?.occupiedRooms || 0,
        summary.value.occupancy?.availableRooms || 0,
        summary.value.occupancy?.maintenanceRooms || 0
      ]
    }
  ]
}));

const roomStatusChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      bodyFont: { family: 'Prompt' },
      callbacks: {
        label: (context) => ` ${context.label}: ${context.raw} ห้อง`
      }
    }
  }
};
</script>
