<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Top Header Bar / Navigation -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          @click="goBack"
          class="p-2.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
          title="ย้อนกลับ"
        >
          <span class="text-base font-bold">←</span>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>👤</span>
            <span>โปรไฟล์และประวัติผู้เช่า (Tenant 360° Profile)</span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-500">
            ศูนย์รวมข้อมูลส่วนตัว สัญญาเช่า ประวัติการชำระเงิน และบันทึกแจ้งซ่อมของลูกบ้าน
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="loadTenantData"
          class="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>🔄</span>
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-16 text-center bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
      <div class="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm text-slate-600 font-medium">กำลังโหลดข้อมูลโปรไฟล์ผู้เช่าแบบ 360°...</p>
    </div>

    <!-- Error / Not Found State -->
    <div v-else-if="error || !tenant" class="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
      <div class="text-5xl">⚠️</div>
      <h3 class="text-lg font-bold text-slate-800">ไม่พบข้อมูลผู้เช่า</h3>
      <p class="text-xs text-slate-500">{{ error || 'ไม่พบเรคคอร์ดของผู้เช่ารายนี้ในระบบ' }}</p>
      <button
        @click="goBack"
        class="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
      >
        กลับไปหน้าหลัก
      </button>
    </div>

    <!-- Content State -->
    <div v-else class="space-y-6">
      <!-- 👑 Header Section (360-degree Profile Summary Card) -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-850 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <!-- Accent Glow background decoration -->
        <div class="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <!-- Profile Info Left -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <!-- Avatar image with LINE fallback ring -->
            <div class="relative group shrink-0">
              <img
                v-if="tenant.linePictureUrl"
                :src="tenant.linePictureUrl"
                :alt="tenant.firstName"
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-purple-500/40 shadow-lg"
              />
              <div
                v-else
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center ring-4 ring-purple-500/40 shadow-lg"
              >
                {{ tenant.firstName ? tenant.firstName.charAt(0).toUpperCase() : '👤' }}
              </div>
              <div v-if="tenant.lineUserId" class="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-xs shadow-md" title="ผูกบัญชี LINE แล้ว">
                💬
              </div>
            </div>

            <!-- Text Profile Summary -->
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {{ tenant.firstName }} {{ tenant.lastName }}
                </h2>

                <!-- Status Badges -->
                <span
                  v-if="tenant.isBlacklisted"
                  class="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-xs"
                >
                  <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  🔴 Blacklist
                </span>

                <span
                  v-if="isCurrentlyRenting"
                  class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-xs"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  🟢 กำลังเช่าอยู่
                </span>

                <span
                  v-else
                  class="px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1 shadow-xs"
                >
                  ⚪ ย้ายออกแล้ว
                </span>
              </div>

              <!-- Contact & Identity Attributes -->
              <div class="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-slate-300">
                <div class="flex items-center gap-1.5 font-medium">
                  <span class="text-purple-400">📞</span>
                  <a :href="`tel:${tenant.phone}`" class="hover:underline hover:text-white font-mono">{{ tenant.phone || '-' }}</a>
                </div>

                <div v-if="tenant.idCard" class="flex items-center gap-1.5 font-medium">
                  <span class="text-purple-400">🪪</span>
                  <span class="font-mono">เลขบัตร: {{ tenant.idCard }}</span>
                </div>

                <div v-if="tenant.lineDisplayName" class="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span>💬 LINE:</span>
                  <span>{{ tenant.lineDisplayName }}</span>
                </div>
              </div>

              <!-- Current Active Rooms Badge if any -->
              <div v-if="activeRoomsList.length > 0" class="pt-1 flex flex-wrap items-center gap-2 text-xs">
                <span class="text-slate-400">ห้องพักปัจจุบัน:</span>
                <span
                  v-for="r in activeRoomsList"
                  :key="r.id"
                  class="bg-purple-900/60 text-purple-200 border border-purple-700/60 px-2.5 py-1 rounded-lg font-bold"
                >
                  🏠 {{ r.building?.name || 'อาคาร' }} - ห้อง {{ r.roomNumber }} (ชั้น {{ r.floor }})
                </span>
              </div>
            </div>
          </div>

          <!-- Profile Quick Stats Summary Right -->
          <div class="grid grid-cols-3 gap-3 bg-slate-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800/80 text-center shrink-0">
            <div class="px-2">
              <div class="text-[11px] text-slate-400 font-medium">สัญญาเช่า</div>
              <div class="text-lg font-extrabold text-white mt-0.5">{{ tenant.leaseContracts?.length || 0 }}</div>
            </div>
            <div class="px-2 border-x border-slate-800">
              <div class="text-[11px] text-slate-400 font-medium">ประวัติบิล</div>
              <div class="text-lg font-extrabold text-white mt-0.5">{{ tenant.invoices?.length || 0 }}</div>
            </div>
            <div class="px-2">
              <div class="text-[11px] text-slate-400 font-medium">แจ้งซ่อม</div>
              <div class="text-lg font-extrabold text-white mt-0.5">{{ tenant.maintenanceRequests?.length || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🗂️ Tabs Component Layout -->
      <Tabs v-model="activeTab" class="w-full">
        <!-- Tabs Trigger List Navigation -->
        <div class="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
          <TabsList class="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full">
            <TabsTrigger value="overview" class="flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <span>📜</span>
              <span>ภาพรวม & สัญญาเช่า</span>
            </TabsTrigger>

            <TabsTrigger value="billing" class="flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <span>🧾</span>
              <span>ประวัติการชำระเงิน</span>
              <span v-if="latePaymentsCount > 0" class="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-bold">
                {{ latePaymentsCount }}
              </span>
            </TabsTrigger>

            <TabsTrigger value="maintenance" class="flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <span>🛠️</span>
              <span>ประวัติแจ้งซ่อม</span>
              <span v-if="pendingMaintenanceCount > 0" class="px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold">
                {{ pendingMaintenanceCount }}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <!-- 📌 TAB 1: ภาพรวม & สัญญาเช่า (Overview & Leases) -->
        <TabsContent value="overview">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left 2 Cols: Tenancy History & Rooms -->
            <div class="lg:col-span-2 space-y-6">
              <div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>🏠</span>
                      <span>ประวัติการอยู่อาศัย & สัญญาเช่า (Lease History)</span>
                    </h3>
                    <p class="text-xs text-slate-500">
                      แสดงรายการห้องพักที่เคยเช่าตั้งแต่วันเริ่มต้นสัญญาจนถึงปัจจุบัน
                    </p>
                  </div>
                  <span class="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    ทั้งหมด {{ tenant.leaseContracts?.length || 0 }} สัญญา
                  </span>
                </div>

                <!-- Empty Leases List -->
                <div v-if="!tenant.leaseContracts || tenant.leaseContracts.length === 0" class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-slate-400 space-y-1">
                  <div class="text-3xl">📜</div>
                  <div class="text-xs font-bold text-slate-600">ยังไม่มีบันทึกสัญญาเช่า</div>
                  <p class="text-[11px]">ผู้เช่าคนนี้ยังไม่มีประวัติเปิดสัญญาเช่าอย่างเป็นทางการในระบบ</p>
                </div>

                <!-- Leases Timeline List -->
                <div v-else class="space-y-4">
                  <div
                    v-for="lease in tenant.leaseContracts"
                    :key="lease.id"
                    class="p-5 rounded-2xl border transition-all space-y-3"
                    :class="lease.status === 'ACTIVE' ? 'bg-purple-50/40 border-purple-200 shadow-2xs' : 'bg-slate-50/60 border-slate-200'"
                  >
                    <!-- Lease Item Header -->
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div class="flex items-center gap-2.5">
                        <div
                          class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs"
                          :class="lease.status === 'ACTIVE' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'"
                        >
                          🏠
                        </div>
                        <div>
                          <div class="text-sm font-bold text-slate-900">
                            {{ lease.building?.name || lease.room?.building?.name || 'อาคาร' }} - ห้อง {{ lease.room?.roomNumber || '-' }}
                          </div>
                          <div class="text-xs text-slate-500">
                            ชั้น {{ lease.room?.floor || '-' }} • ค่าเช่า {{ formatCurrency(lease.room?.price) }}/เดือน
                          </div>
                        </div>
                      </div>

                      <!-- Lease Status Badge -->
                      <span
                        class="px-3 py-1 rounded-full text-xs font-bold"
                        :class="{
                          'bg-emerald-100 text-emerald-800 border border-emerald-300': lease.status === 'ACTIVE',
                          'bg-slate-200 text-slate-700 border border-slate-300': lease.status === 'ENDED',
                          'bg-rose-100 text-rose-800 border border-rose-300': lease.status === 'CANCELLED'
                        }"
                      >
                        {{ lease.status === 'ACTIVE' ? '🟢 กำลังพักอาศัย' : lease.status === 'ENDED' ? '⚪ ย้ายออกแล้ว' : '🔴 ยกเลิกสัญญา' }}
                      </span>
                    </div>

                    <!-- Dates & Deposit Info -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <span class="text-slate-400 block text-[10px]">วันเริ่มสัญญา:</span>
                        <span class="font-bold text-slate-800">{{ formatDate(lease.startDate) }}</span>
                      </div>

                      <div>
                        <span class="text-slate-400 block text-[10px]">วันสิ้นสุดสัญญา:</span>
                        <span class="font-bold text-slate-800">
                          {{ lease.actualEndDate ? formatDate(lease.actualEndDate) : formatDate(lease.expectedEndDate) }}
                          <span v-if="lease.status === 'ACTIVE'" class="text-purple-600 font-normal"> (ปัจจุบัน)</span>
                        </span>
                      </div>

                      <div class="col-span-2 sm:col-span-1">
                        <span class="text-slate-400 block text-[10px]">เงินประกัน/มัดจำ:</span>
                        <span class="font-bold text-purple-700">{{ formatCurrency(lease.depositAmount) }}</span>
                      </div>
                    </div>

                    <!-- Move Out Reason & Record Details if present -->
                    <div v-if="lease.moveOutReason || lease.moveOutRecord" class="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs space-y-1 text-amber-900">
                      <div v-if="lease.moveOutReason" class="font-medium">
                        <span class="font-bold">📌 เหตุผลที่ย้ายออก:</span> {{ lease.moveOutReason }}
                      </div>

                      <div v-if="lease.moveOutRecord" class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/60 text-[11px]">
                        <span>💰 ยอดคืนมัดจำสุทธิ: <strong>{{ formatCurrency(lease.moveOutRecord.netRefund) }}</strong></span>
                        <span class="px-2 py-0.5 rounded-md bg-amber-200/60 font-bold">
                          สถานะคืนเงิน: {{ lease.moveOutRecord.refundStatus === 'PAID' ? 'ชำระคืนเรียบร้อย' : 'รอคืนเงิน' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right 1 Col: Internal Notes Box (🔒 RBAC Controlled for OWNER / MANAGER) -->
            <div class="space-y-6">
              <div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🔒</span>
                    <span>บันทึกภายใน (Internal Notes)</span>
                  </h3>
                  <span
                    class="text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase"
                    :class="canManageNotes ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ canManageNotes ? 'OWNER / MANAGER ONLY' : 'READ ONLY' }}
                  </span>
                </div>

                <p class="text-xs text-slate-500">
                  บันทึกพฤติกรรม ข้อสังเกต หรือสัญลักษณ์แจ้งเตือนเฉพาะกลุ่มผู้บริหารและแอดมิน (ลูกบ้านจะไม่เห็นข้อมูลนี้)
                </p>

                <!-- Blacklist Flag Checkbox Toggle -->
                <div
                  class="p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3"
                  :class="notesForm.isBlacklisted ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'"
                >
                  <div class="flex items-center gap-2.5">
                    <input
                      id="blacklist-toggle"
                      type="checkbox"
                      v-model="notesForm.isBlacklisted"
                      :disabled="!canManageNotes || savingNotes"
                      class="w-4 h-4 text-rose-600 rounded-md border-slate-300 focus:ring-rose-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <label for="blacklist-toggle" class="text-xs font-bold text-slate-800 cursor-pointer select-none">
                      ⚠️ กำหนดสถานะ Blacklist (ติดแบล็กลิสต์)
                    </label>
                  </div>
                  <span v-if="notesForm.isBlacklisted" class="text-[11px] font-extrabold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                    ความเสี่ยงสูง
                  </span>
                </div>

                <!-- Textarea Internal Notes -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">ข้อความบันทึกภายในเพิ่มเติม:</label>
                  <textarea
                    v-model="notesForm.internalNotes"
                    rows="6"
                    :disabled="!canManageNotes || savingNotes"
                    placeholder="พิมพ์บันทึกภายใน เช่น จ่ายค่าเช่าตรงเวลา, มักขอผ่อนผันค่าน้ำไฟ, มีเสียงดังรบกวนห้องข้างเคียง..."
                    class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-slate-100 disabled:text-slate-500"
                  ></textarea>
                </div>

                <!-- Action Save Button for Authorized Admin -->
                <div v-if="canManageNotes">
                  <button
                    @click="saveInternalNotes"
                    :disabled="savingNotes"
                    class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="savingNotes" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{{ savingNotes ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลภายใน' }}</span>
                  </button>
                </div>

                <!-- Restricted Access Alert Notice -->
                <div v-else class="p-3 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>คุณมีสิทธิ์อ่านเท่านั้น (เฉพาะ Role OWNER หรือ MANAGER ที่แก้ไขได้)</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <!-- 🧾 TAB 2: ประวัติการชำระเงิน (Billing Behavior) -->
        <TabsContent value="billing">
          <div class="space-y-6">
            <!-- Header Summary Metrics Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- Metric 1: Total Paid Amount -->
              <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ยอดรวมที่เคยจ่าย</div>
                <div class="text-xl sm:text-2xl font-extrabold text-emerald-600">{{ formatCurrency(totalPaidAmount) }}</div>
                <div class="text-[10px] text-slate-400">จากบิลที่ชำระเรียบร้อยแล้ว</div>
              </div>

              <!-- Metric 2: Late Payments Count -->
              <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">จำนวนครั้งที่จ่ายช้า</div>
                <div class="text-xl sm:text-2xl font-extrabold" :class="latePaymentsCount > 0 ? 'text-rose-600' : 'text-slate-800'">
                  {{ latePaymentsCount }} ครั้ง
                </div>
                <div class="text-[10px] text-slate-400">จ่ายหลังวันครบกำหนด หรือค้างชำระ</div>
              </div>

              <!-- Metric 3: Total Invoices -->
              <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">จำนวนบิลทั้งหมด</div>
                <div class="text-xl sm:text-2xl font-extrabold text-purple-700">{{ tenant.invoices?.length || 0 }} ใบ</div>
                <div class="text-[10px] text-slate-400">ประวัติออกบิลย้อนหลัง</div>
              </div>

              <!-- Metric 4: Outstanding Balance -->
              <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ยอดค้างชำระปัจจุบัน</div>
                <div class="text-xl sm:text-2xl font-extrabold" :class="outstandingBalance > 0 ? 'text-amber-600' : 'text-slate-800'">
                  {{ formatCurrency(outstandingBalance) }}
                </div>
                <div class="text-[10px] text-slate-400">สถานะ Pending หรือ Overdue</div>
              </div>
            </div>

            <!-- Invoices History Table Card -->
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🧾</span>
                    <span>ตารางประวัติใบแจ้งหนี้และการชำระเงิน (Invoice Log)</span>
                  </h3>
                  <p class="text-xs text-slate-500">
                    เรียงตามรอบบิลล่าสุดและแสดงสถานะความตรงต่อเวลาของการชำระเงิน
                  </p>
                </div>
              </div>

              <!-- Empty Invoices Table -->
              <div v-if="!tenant.invoices || tenant.invoices.length === 0" class="p-12 text-center text-slate-400 space-y-2">
                <div class="text-4xl">🧾</div>
                <div class="text-xs font-bold text-slate-600">ยังไม่มีประวัติใบแจ้งหนี้</div>
                <p class="text-[11px]">ไม่พบบิลค่าเช่าของผู้เช่ารายนี้ในระบบ</p>
              </div>

              <!-- Invoices Table -->
              <div v-else class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-700">
                  <thead class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th class="py-3.5 px-4">เลขที่บิล</th>
                      <th class="py-3.5 px-4">รอบบิล</th>
                      <th class="py-3.5 px-4">ห้องพัก</th>
                      <th class="py-3.5 px-4">ยอดสุทธิ</th>
                      <th class="py-3.5 px-4">วันครบกำหนด</th>
                      <th class="py-3.5 px-4">วันที่ชำระ</th>
                      <th class="py-3.5 px-4 text-center">สถานะ</th>
                      <th class="py-3.5 px-4 text-right">พฤติกรรมชำระ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="inv in tenant.invoices" :key="inv.id" class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-3.5 px-4 font-mono font-bold text-purple-700">{{ inv.invoiceNumber }}</td>
                      <td class="py-3.5 px-4 font-medium">{{ inv.billingCycle }}</td>
                      <td class="py-3.5 px-4 font-semibold">ห้อง {{ inv.room?.roomNumber || '-' }}</td>
                      <td class="py-3.5 px-4 font-extrabold text-slate-900">{{ formatCurrency(inv.grandTotal) }}</td>
                      <td class="py-3.5 px-4 text-slate-500 font-mono">{{ formatDate(inv.dueDate) }}</td>
                      <td class="py-3.5 px-4 font-mono">
                        {{ inv.paidAt ? formatDate(inv.paidAt) : '-' }}
                      </td>
                      <td class="py-3.5 px-4 text-center">
                        <span
                          class="px-2.5 py-1 rounded-full text-[11px] font-bold inline-block"
                          :class="{
                            'bg-emerald-100 text-emerald-800 border border-emerald-200': inv.status === 'paid',
                            'bg-amber-100 text-amber-800 border border-amber-200': inv.status === 'pending',
                            'bg-rose-100 text-rose-800 border border-rose-200': inv.status === 'overdue'
                          }"
                        >
                          {{ inv.status === 'paid' ? 'ชำระแล้ว' : inv.status === 'pending' ? 'รอชำระ' : 'เกินกำหนด' }}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 text-right">
                        <span v-if="getInvoicePaymentBehavior(inv).isLate" class="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[11px] font-bold">
                          ⚠️ จ่ายช้า {{ getInvoicePaymentBehavior(inv).daysLate }} วัน
                        </span>
                        <span v-else-if="inv.status === 'paid'" class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                          🟢 ตรงเวลา
                        </span>
                        <span v-else class="text-slate-400 text-[11px] italic">
                          -
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        <!-- 🛠️ TAB 3: ประวัติแจ้งซ่อม (Maintenance Log) -->
        <TabsContent value="maintenance">
          <div class="space-y-6">
            <!-- Summary Metrics Header -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- Metric 1: Total Maintenance Requests -->
              <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">แจ้งซ่อมทั้งหมด</div>
                <div class="text-xl sm:text-2xl font-extrabold text-slate-900">{{ tenant.maintenanceRequests?.length || 0 }} ครั้ง</div>
                <div class="text-[10px] text-slate-400">ประวัติขอรับบริการซ่อม</div>
              </div>

              <!-- Metric 2: Resolved Requests -->
              <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ซ่อมเสร็จสิ้น</div>
                <div class="text-xl sm:text-2xl font-extrabold text-emerald-600">{{ resolvedMaintenanceCount }} รายการ</div>
                <div class="text-[10px] text-slate-400">สถานะ Resolved</div>
              </div>

              <!-- Metric 3: In Progress / Pending -->
              <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">กำลังดำเนินการ</div>
                <div class="text-xl sm:text-2xl font-extrabold text-amber-600">{{ pendingMaintenanceCount }} รายการ</div>
                <div class="text-[10px] text-slate-400">รอดำเนินการหรือกำลังซ่อม</div>
              </div>

              <!-- Metric 4: Total Repair Cost -->
              <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ค่าซ่อมแซมรวม</div>
                <div class="text-xl sm:text-2xl font-extrabold text-purple-700">{{ formatCurrency(totalRepairCost) }}</div>
                <div class="text-[10px] text-slate-400">รวมทุกรายการแจ้งซ่อม</div>
              </div>
            </div>

            <!-- Maintenance Request Log Cards / List -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🛠️</span>
                    <span>บันทึกการแจ้งซ่อมแซมสิ่งอำนวยความสะดวก (Maintenance Log)</span>
                  </h3>
                  <p class="text-xs text-slate-500">
                    แสดงข้อมูลการใช้งานห้องและประวัติเรียกช่างซ่อมบำรุง
                  </p>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!tenant.maintenanceRequests || tenant.maintenanceRequests.length === 0" class="p-12 text-center text-slate-400 space-y-2">
                <div class="text-4xl">🛠️</div>
                <div class="text-xs font-bold text-slate-600">ยังไม่มีรายการแจ้งซ่อม</div>
                <p class="text-[11px]">ผู้เช่าคนนี้ไม่เคยส่งคำขอแจ้งซ่อมแซมสิ่งของในห้องพัก</p>
              </div>

              <!-- Maintenance Log Items -->
              <div v-else class="space-y-4">
                <div
                  v-for="req in tenant.maintenanceRequests"
                  :key="req.id"
                  class="p-5 rounded-2xl border bg-slate-50/70 border-slate-200 hover:border-purple-300 transition-all space-y-3"
                >
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-base font-bold text-slate-900">{{ req.title }}</span>
                        <span class="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          ห้อง {{ req.room?.roomNumber || '-' }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-600 leading-relaxed">{{ req.description }}</p>
                    </div>

                    <!-- Status Badge -->
                    <span
                      class="px-3 py-1 rounded-full text-xs font-bold"
                      :class="{
                        'bg-amber-100 text-amber-800 border border-amber-300': req.status === 'pending',
                        'bg-blue-100 text-blue-800 border border-blue-300': req.status === 'in_progress',
                        'bg-emerald-100 text-emerald-800 border border-emerald-300': req.status === 'resolved',
                        'bg-slate-200 text-slate-700 border border-slate-300': req.status === 'cancelled'
                      }"
                    >
                      {{
                        req.status === 'pending' ? '⏳ รอดำเนินการ' :
                        req.status === 'in_progress' ? '🔨 กำลังซ่อม' :
                        req.status === 'resolved' ? '✅ ซ่อมเสร็จสิ้น' : '❌ ยกเลิก'
                      }}
                    </span>
                  </div>

                  <!-- Details Grid -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span class="text-slate-400 block text-[10px]">ช่างผู้รับผิดชอบ:</span>
                      <span class="font-bold text-slate-800">{{ req.technicianName || 'ยังไม่มอบหมาย' }}</span>
                    </div>

                    <div>
                      <span class="text-slate-400 block text-[10px]">ค่าซ่อมแซม:</span>
                      <span class="font-bold text-purple-700">{{ formatCurrency(req.repairCost) }}</span>
                    </div>

                    <div>
                      <span class="text-slate-400 block text-[10px]">วันที่แจ้ง:</span>
                      <span class="font-mono text-slate-700">{{ formatDate(req.createdAt) }}</span>
                    </div>
                  </div>

                  <!-- Admin Note if present -->
                  <div v-if="req.adminNote" class="p-2.5 bg-purple-50/60 border border-purple-200/70 rounded-xl text-xs text-purple-900">
                    <span class="font-bold">📝 บันทึกแอดมิน/ช่าง:</span> {{ req.adminNote }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showSuccess, showError } from '@/utils/swal';
import tenantService from '@/services/tenantService';
import { useAuthStore } from '@/stores/auth';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const buildingStore = useBuildingStore();

const tenantId = computed(() => route.params.id || route.params.tenantId);

const loading = ref(true);
const error = ref(null);
const tenant = ref(null);
const activeTab = ref('overview');

// Notes form state
const savingNotes = ref(false);
const notesForm = ref({
  internalNotes: '',
  isBlacklisted: false
});

// Check Security & RBAC permission for internal notes (OWNER / MANAGER / ADMIN)
const userRole = computed(() => {
  return (authStore.user?.role || authStore.currentUser?.role || 'tenant').toLowerCase();
});

const canManageNotes = computed(() => {
  return ['owner', 'manager', 'super_admin', 'superadmin', 'admin'].includes(userRole.value);
});

// Computed Statuses
const isCurrentlyRenting = computed(() => {
  if (!tenant.value?.leaseContracts) return false;
  return tenant.value.leaseContracts.some((l) => l.status === 'ACTIVE');
});

const activeRoomsList = computed(() => {
  if (!tenant.value?.rooms) return [];
  return tenant.value.rooms;
});

// Billing Statistics
const totalPaidAmount = computed(() => {
  if (!tenant.value?.invoices) return 0;
  return tenant.value.invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
});

const outstandingBalance = computed(() => {
  if (!tenant.value?.invoices) return 0;
  return tenant.value.invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
});

const latePaymentsCount = computed(() => {
  if (!tenant.value?.invoices) return 0;
  return tenant.value.invoices.filter((inv) => {
    if (inv.status === 'overdue') return true;
    if (inv.status === 'paid' && inv.paidAt && inv.dueDate) {
      const paidDate = new Date(inv.paidAt);
      const dueDate = new Date(inv.dueDate);
      return paidDate > dueDate;
    }
    return false;
  }).length;
});

// Maintenance Statistics
const resolvedMaintenanceCount = computed(() => {
  if (!tenant.value?.maintenanceRequests) return 0;
  return tenant.value.maintenanceRequests.filter((m) => m.status === 'resolved').length;
});

const pendingMaintenanceCount = computed(() => {
  if (!tenant.value?.maintenanceRequests) return 0;
  return tenant.value.maintenanceRequests.filter((m) => m.status === 'pending' || m.status === 'in_progress').length;
});

const totalRepairCost = computed(() => {
  if (!tenant.value?.maintenanceRequests) return 0;
  return tenant.value.maintenanceRequests.reduce((sum, m) => sum + Number(m.repairCost || 0), 0);
});

// Lifecycle hook
onMounted(() => {
  loadTenantData();
});

// Watch active building changes to reload
watch(
  () => buildingStore.activeBuildingId,
  () => {
    loadTenantData();
  }
);

// Methods
const loadTenantData = async () => {
  if (!tenantId.value) {
    error.value = 'ไม่พบรหัสผู้เช่าใน URL';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const params = {};
    if (buildingStore.activeBuildingId) {
      params.buildingId = buildingStore.activeBuildingId;
    }
    const res = await tenantService.getTenantDetail(tenantId.value, params);
    if (res.success && res.data) {
      tenant.value = res.data;
      notesForm.value = {
        internalNotes: res.data.internalNotes || '',
        isBlacklisted: Boolean(res.data.isBlacklisted)
      };
    } else {
      error.value = res.message || 'ไม่สามารถโหลดข้อมูลผู้เช่าได้';
    }
  } catch (err) {
    console.error('Error fetching tenant profile:', err);
    error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้เช่า';
  } finally {
    loading.value = false;
  }
};

const saveInternalNotes = async () => {
  if (!canManageNotes.value) {
    showError('ไม่มีสิทธิ์ดำเนินการ', 'เฉพาะสิทธิ์ OWNER หรือ MANAGER เท่านั้นที่สามารถบันทึกได้');
    return;
  }

  savingNotes.value = true;

  try {
    const res = await tenantService.updateTenantNotes(tenantId.value, {
      internalNotes: notesForm.value.internalNotes,
      isBlacklisted: notesForm.value.isBlacklisted
    });

    if (res.success) {
      if (tenant.value) {
        tenant.value.internalNotes = notesForm.value.internalNotes;
        tenant.value.isBlacklisted = notesForm.value.isBlacklisted;
      }

      showSuccess('บันทึกสำเร็จ', 'อัปเดตบันทึกภายในและสถานะผู้เช่าเรียบร้อยแล้ว');
    }
  } catch (err) {
    console.error('Failed to update internal notes:', err);
    showError('บันทึกไม่สำเร็จ', err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  } finally {
    savingNotes.value = false;
  }
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/tenants');
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2
  }).format(num);
};

const getInvoicePaymentBehavior = (inv) => {
  if (!inv) return { isLate: false, daysLate: 0 };
  if (inv.status === 'overdue') {
    const due = new Date(inv.dueDate);
    const now = new Date();
    const diffTime = Math.max(0, now - due);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { isLate: true, daysLate: diffDays };
  }
  if (inv.status === 'paid' && inv.paidAt && inv.dueDate) {
    const paid = new Date(inv.paidAt);
    const due = new Date(inv.dueDate);
    if (paid > due) {
      const diffTime = paid - due;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { isLate: true, daysLate: diffDays };
    }
  }
  return { isLate: false, daysLate: 0 };
};
</script>
