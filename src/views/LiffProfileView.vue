<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">
    <!-- Loading Skeleton State -->
    <div v-if="loading" class="space-y-4 animate-pulse">
      <!-- Header Skeleton -->
      <div class="p-5 sm:p-6 rounded-2xl bg-slate-200/70 skeleton-shimmer space-y-3.5">
        <div class="flex items-start gap-3.5">
          <div class="w-14 h-14 rounded-full bg-slate-300/80 shrink-0"></div>
          <div class="space-y-2 flex-1 pt-1">
            <div class="h-4 w-32 bg-slate-300/80 rounded-lg"></div>
            <div class="h-3 w-24 bg-slate-300/60 rounded-md"></div>
            <div class="h-5 w-20 bg-slate-300/60 rounded-full"></div>
          </div>
        </div>
        <div class="pt-3 border-t border-slate-300/40 flex justify-between">
          <div class="h-7 w-24 bg-slate-300/60 rounded-xl"></div>
          <div class="h-7 w-24 bg-slate-300/60 rounded-xl"></div>
        </div>
      </div>

      <!-- Quick Actions Skeleton (Grid responsive) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2.5">
          <div class="w-9 h-9 rounded-xl bg-slate-100 skeleton-shimmer"></div>
          <div class="h-3.5 w-20 bg-slate-100 rounded-md skeleton-shimmer"></div>
          <div class="h-2.5 w-28 bg-slate-100 rounded-md skeleton-shimmer"></div>
        </div>
      </div>
    </div>

    <!-- Loaded Content -->
    <div v-else class="space-y-5">
      <!-- Session Expired / Not Verified Warning Card -->
      <div v-if="sessionExpired" class="p-4 bg-amber-50 border border-amber-200/70 rounded-2xl space-y-3 shadow-xs">
        <div class="flex items-center justify-between text-xs font-semibold text-amber-900">
          <span>เซสชัน LINE หมดอายุ หรือยังไม่ได้ยืนยันตัวตน</span>
          <span class="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
            Expired
          </span>
        </div>
        <p class="text-xs text-amber-800 leading-relaxed">
          ไม่พบการเข้าสู่ระบบ LINE หรือ Token หมดอายุ กรุณากดปุ่มด้านล่างเพื่อยืนยันตัวตนผ่าน LINE
        </p>
        <button
          @click="loginLiff()"
          class="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>เข้าสู่ระบบด้วย LINE เพื่อต่ออายุเซสชัน</span>
        </button>
      </div>

      <!-- 1. Header Section: Profile & Digital ID Card -->
      <div
        class="p-5 sm:p-6 text-white rounded-2xl shadow-xs relative overflow-hidden transition-all duration-500"
        :style="{
          background: `linear-gradient(135deg, ${themeColor}, ${adjustBrightness(themeColor, -25)})`
        }"
      >
        <div class="flex items-start justify-between gap-3.5 flex-wrap sm:flex-nowrap">
          <div class="flex items-center gap-3.5">
            <!-- Avatar จาก LINE Profile -->
            <div class="relative shrink-0">
              <img
                v-if="tenantProfile.avatarUrl && !imageLoadError"
                :src="tenantProfile.avatarUrl"
                alt="Tenant Avatar"
                class="w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-xs bg-white/20"
                @error="handleAvatarError"
              />
              <div
                v-else
                class="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs border-2 border-white/80 shadow-xs flex items-center justify-center text-xl font-bold text-white select-none"
              >
                {{ tenantInitial }}
              </div>
              <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>

            <!-- ข้อมูลชื่อ และ Badge หมายเลขห้องพัก -->
            <div class="space-y-1">
              <h1 class="font-bold text-base sm:text-lg truncate text-white">
                {{ tenantProfile.firstName }} {{ tenantProfile.lastName }}
              </h1>
              <p class="text-xs text-indigo-100/90 font-mono">{{ tenantProfile.phone || '-' }}</p>

              <!-- Current Active Room Badge -->
              <div class="pt-0.5">
                <span class="px-2.5 py-0.5 bg-white/20 backdrop-blur-xs text-white font-medium text-[11px] rounded-full border border-white/30 inline-flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ห้อง {{ selectedRoom?.roomNumber || tenantProfile.roomNumber || '-' }}</span>
                  <span v-if="selectedRoom?.buildingName || tenantProfile.buildingName" class="text-[10px] text-white/80">
                    ({{ selectedRoom?.buildingName || tenantProfile.buildingName }})
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- Action Bar: Digital ID & Link More Rooms -->
          <div class="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/20 justify-end">
            <button
              @click="showLinkRoomModal = true"
              class="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-medium transition-colors border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle class="w-3.5 h-3.5" />
              <span>ผูกห้องเพิ่ม</span>
            </button>

            <!-- Digital ID Button -->
            <button
              v-if="featureStore.isEnabled('ENABLE_DIGITAL_ID')"
              @click="showQrModal = true"
              class="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold transition-colors border border-white/30 flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode class="w-3.5 h-3.5" />
              <span>Digital ID</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Multi-Room Selector (Shown if > 1 room) -->
      <div v-if="tenantProfile.rooms && tenantProfile.rooms.length > 1" class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xs font-bold text-slate-700">
              ห้องพักของคุณ ({{ tenantProfile.rooms.length }} ห้อง)
            </h2>
            <p class="text-[11px] text-slate-400 mt-0.5">แตะที่ห้องเพื่อสลับดูข้อมูล</p>
          </div>
          <button
            @click="showLinkRoomModal = true"
            class="text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1 text-indigo-600"
            :style="{ color: themeColor }"
          >
            <PlusCircle class="w-3.5 h-3.5" />
            <span>ผูกห้องเพิ่ม</span>
          </button>
        </div>

        <!-- Room Selector Buttons Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          <button
            v-for="room in tenantProfile.rooms"
            :key="room.id"
            @click="selectRoom(room)"
            class="p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer relative overflow-hidden active:scale-[0.99]"
            :class="selectedRoomId === room.id 
              ? 'bg-indigo-50/60 border-indigo-200 shadow-2xs' 
              : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-100/90 text-slate-600'"
          >
            <!-- Left: Room Icon & Room Details -->
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                :class="selectedRoomId === room.id 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-white text-slate-500 border border-slate-200/60'"
                :style="selectedRoomId === room.id ? { backgroundColor: themeColor } : {}"
              >
                <DoorClosed class="w-4.5 h-4.5" />
              </div>
              
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span
                    class="text-xs font-bold truncate"
                    :class="selectedRoomId === room.id ? 'text-indigo-950 font-extrabold' : 'text-slate-800'"
                    :style="selectedRoomId === room.id ? { color: themeColor } : {}"
                  >
                    ห้อง {{ room.roomNumber }}
                  </span>
                  <span
                    v-if="selectedRoomId === room.id"
                    class="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-indigo-100 text-indigo-700"
                    :style="{ backgroundColor: `${themeColor}18`, color: themeColor }"
                  >
                    ใช้งานอยู่
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                  {{ room.buildingName || 'อาคารหลัก' }}
                </div>
              </div>
            </div>

            <!-- Right: Check Indicator -->
            <div
              v-if="selectedRoomId === room.id"
              class="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
              :style="{ backgroundColor: themeColor }"
            >
              <Check class="w-3 h-3 stroke-[3]" />
            </div>
            <div
              v-else
              class="w-5 h-5 rounded-full border border-slate-200/80 shrink-0"
            ></div>
          </button>
        </div>
      </div>

      <!-- 2.5 Live Action Hub & Smart Notifications (ศูนย์รวมการแจ้งเตือนและสถานะที่ต้องดำเนินการ) -->
      <div class="space-y-2.5 animate-in fade-in duration-300">
        <!-- Section Header -->
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span v-if="hasAnyActionItems" class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span v-else class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h2 class="text-xs font-bold text-slate-800 tracking-tight">
              สถานะ & การแจ้งเตือนห้องพัก
            </h2>
          </div>
          <span v-if="!hasAnyActionItems" class="text-[11px] font-medium text-emerald-600 inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <CheckCircle2 class="w-3 h-3 text-emerald-600" />
            <span>ทุกอย่างเรียบร้อยดี</span>
          </span>
        </div>

        <!-- Action Items List (เมื่อมีรายการที่ต้องทำ) -->
        <div v-if="hasAnyActionItems" class="space-y-2.5">
          <!-- 1. บิลค่าเช่าค้างชำระ / รอชำระ (Pending Invoices) -->
          <div
            v-if="featureStore.isEnabled('ENABLE_LINE_PAYMENT') && unpaidInvoices.length > 0"
            @click="goToPayment(unpaidInvoices[0])"
            class="p-4 bg-gradient-to-r from-rose-50/95 via-amber-50/40 to-white rounded-2xl border border-rose-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-[0.99] relative overflow-hidden"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                  <CreditCard class="w-5 h-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                      รอชำระเงิน ({{ unpaidInvoices.length }} บิล)
                    </span>
                    <span v-if="unpaidInvoices[0].dueDate" class="text-[10px] text-slate-400 font-medium">
                      ครบกำหนด {{ formatDate(unpaidInvoices[0].dueDate) }}
                    </span>
                  </div>
                  <div class="text-xs font-bold text-slate-900 mt-0.5 truncate">
                    ยอดรวมค้างชำระ: <span class="text-rose-600 font-mono font-extrabold text-sm">฿{{ Number(totalUnpaidAmount).toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <span class="hidden sm:inline text-xs font-bold text-rose-600">ชำระเงิน</span>
                <div class="w-7 h-7 rounded-xl bg-white border border-rose-200 text-rose-600 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight class="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <!-- 2. พัสดุมาถึงรอรับ (Pending Parcels) -->
          <div
            v-if="featureStore.isEnabled('ENABLE_PARCEL_NOTIFY') && pendingParcels.length > 0"
            @click="router.push('/liff/parcels')"
            class="p-4 bg-gradient-to-r from-orange-50/95 via-amber-50/40 to-white rounded-2xl border border-orange-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-[0.99] relative overflow-hidden"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  <Package class="w-5 h-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-700">
                      พัสดุมาถึงห้อง ({{ pendingParcels.length }} ชิ้น)
                    </span>
                    <span v-if="pendingParcels[0].courier" class="text-[10px] text-slate-400 font-medium">
                      {{ pendingParcels[0].courier }}
                    </span>
                  </div>
                  <div class="text-xs font-bold text-slate-900 mt-0.5 truncate">
                    รหัสรับของ: <span class="font-mono text-orange-600 font-semibold">{{ pendingParcels[0].trackingNumber || pendingParcels[0].packageCode || 'พร้อมรับที่นิติบุคคล' }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <span class="hidden sm:inline text-xs font-bold text-orange-600">ดูพัสดุ</span>
                <div class="w-7 h-7 rounded-xl bg-white border border-orange-200 text-orange-600 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight class="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <!-- 3. รายการแจ้งซ่อมกำลังดำเนินการ (Active Maintenance) -->
          <div
            v-if="featureStore.isEnabled('ENABLE_MAINTENANCE_REQUEST') && activeMaintenance.length > 0"
            @click="router.push('/liff/issues')"
            class="p-4 bg-gradient-to-r from-sky-50/95 via-indigo-50/40 to-white rounded-2xl border border-sky-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-[0.99] relative overflow-hidden"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                  <Wrench class="w-5 h-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-700">
                      กำลังดำเนินการซ่อม ({{ activeMaintenance.length }} งาน)
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium">
                      {{ formatMaintenanceStatus(activeMaintenance[0].status) }}
                    </span>
                  </div>
                  <div class="text-xs font-bold text-slate-900 mt-0.5 truncate">
                    {{ activeMaintenance[0].title || 'รายการแจ้งซ่อมห้องพัก' }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <span class="hidden sm:inline text-xs font-bold text-sky-600">ติดตามงาน</span>
                <div class="w-7 h-7 rounded-xl bg-white border border-sky-200 text-sky-600 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight class="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. All Clear Status Card (กรณีไม่มีรายการค้างชำระ/ตกค้าง) -->
        <div
          v-else
          class="p-4 bg-white rounded-2xl border border-slate-100/90 shadow-2xs flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs font-bold text-slate-800">ไม่มีรายการค้างชำระหรือพัสดุตกค้าง</div>
              <div class="text-[11px] text-slate-400">สถานะห้องพักและบัญชีของคุณเป็นปัจจุบันเรียบร้อยครับ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Dynamic Quick Actions Grid (Responsive 2 to 4 cols) -->
      <div class="space-y-2.5" v-if="availableQuickActions.length > 0">
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-0.5">
          เมนูด่วน
        </h2>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            v-for="menu in availableQuickActions"
            :key="menu.id"
            @click="handleMenuClick(menu)"
            class="p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-100 shadow-xs text-left transition-all group flex flex-col justify-between h-28 cursor-pointer active:scale-[0.99] relative overflow-hidden"
          >
            <div
              class="relative w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              :class="menu.bgClass"
            >
              <component :is="menu.icon" class="w-4.5 h-4.5" :class="menu.iconClass" />
              <!-- Badges on Quick Actions -->
              <span
                v-if="menu.id === 'invoices' && unpaidInvoices.length > 0"
                class="absolute -top-1 -right-1 flex h-2.5 w-2.5"
              >
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white"></span>
              </span>
              <span
                v-else-if="menu.id === 'parcels' && pendingParcels.length > 0"
                class="absolute -top-1 -right-1 flex h-2.5 w-2.5"
              >
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 border border-white"></span>
              </span>
              <span
                v-else-if="menu.id === 'maintenance' && activeMaintenance.length > 0"
                class="absolute -top-1 -right-1 flex h-2.5 w-2.5"
              >
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500 border border-white"></span>
              </span>
              <span
                v-else-if="menu.id === 'announcements' && unreadCount > 0"
                class="absolute -top-1 -right-1 flex h-2.5 w-2.5"
              >
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
              </span>
            </div>
            <div>
              <div class="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                {{ menu.title }}
              </div>
              <div class="text-[10px] text-slate-400 font-medium truncate mt-0.5">{{ menu.subtitle }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 3.5 Featured News & Announcements Showcase (ข่าวสาร & ประกาศหอพัก) -->
      <div v-if="featureStore.isEnabled('ENABLE_ANNOUNCEMENTS') && announcements && announcements.length > 0" class="space-y-3">
        <!-- Section Header -->
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Megaphone class="w-3.5 h-3.5" />
            </div>
            <h2 class="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <span>ข่าวสาร & ประกาศหอพัก</span>
              <span
                v-if="unreadCount > 0"
                class="px-2 py-0.5 text-[9px] font-bold rounded-full bg-rose-500 text-white animate-pulse shadow-2xs"
              >
                {{ unreadCount }} ใหม่
              </span>
            </h2>
          </div>

          <router-link
            to="/liff/announcements"
            class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-0.5 group"
          >
            <span>ดูทั้งหมด ({{ announcements.length }})</span>
            <ChevronRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </router-link>
        </div>

        <!-- 1 Announcement: Featured Full Card -->
        <div
          v-if="announcements.length === 1"
          @click="openAnnouncementModal(announcements[0])"
          class="bg-white rounded-3xl border border-slate-100/90 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer group active:scale-[0.99]"
        >
          <div v-if="announcements[0].imageUrl" class="w-full h-36 sm:h-44 relative overflow-hidden bg-slate-100">
            <img
              :src="announcements[0].imageUrl"
              :alt="announcements[0].title"
              class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <span
              v-if="!isRead(announcements[0].id)"
              class="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold rounded-full bg-rose-500 text-white shadow-md animate-pulse"
            >
              ข่าวใหม่
            </span>
            <span
              class="absolute bottom-3 left-3 px-2 py-0.5 text-[10px] font-medium rounded-lg bg-black/60 text-white backdrop-blur-md"
            >
              {{ announcements[0].building?.name || 'ประกาศทั่วไป' }}
            </span>
          </div>
          <div v-else class="p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-between">
            <span class="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
              {{ announcements[0].building?.name || 'ประกาศทั่วไป' }}
            </span>
            <span v-if="!isRead(announcements[0].id)" class="text-[9px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
              ข่าวใหม่
            </span>
          </div>

          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{{ formatDate(announcements[0].createdAt) }}</span>
              <span>{{ announcements[0].createdBy || 'ผู้ดูแลหอพัก' }}</span>
            </div>
            <h3 class="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {{ announcements[0].title }}
            </h3>
            <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {{ announcements[0].content }}
            </p>
            <div class="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-600 border-t border-slate-50">
              <span>อ่านรายละเอียดข่าว</span>
              <ChevronRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        <!-- Multiple Announcements: Horizontal Swipeable Showcase -->
        <div
          v-else
          class="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none snap-x snap-mandatory"
        >
          <div
            v-for="item in announcements"
            :key="item.id"
            @click="openAnnouncementModal(item)"
            class="w-[270px] sm:w-[300px] shrink-0 snap-start bg-white rounded-2xl border border-slate-100/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer active:scale-[0.99]"
          >
            <!-- Cover or Header -->
            <div>
              <div v-if="item.imageUrl" class="w-full h-28 relative overflow-hidden bg-slate-100">
                <img
                  :src="item.imageUrl"
                  :alt="item.title"
                  class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <span
                  v-if="!isRead(item.id)"
                  class="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] font-bold rounded-full bg-rose-500 text-white shadow-2xs animate-pulse"
                >
                  ใหม่
                </span>
                <span
                  class="absolute bottom-2 left-2 px-2 py-0.5 text-[9px] font-medium rounded-md bg-black/60 text-white backdrop-blur-md"
                >
                  {{ item.building?.name || 'ประกาศทั่วไป' }}
                </span>
              </div>
              <div v-else class="p-2.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-b border-slate-100/80 flex items-center justify-between">
                <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {{ item.building?.name || 'ประกาศทั่วไป' }}
                </span>
                <span v-if="!isRead(item.id)" class="text-[9px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                  ใหม่
                </span>
              </div>

              <!-- Content Body -->
              <div class="p-3.5 space-y-1.5">
                <div class="text-[10px] text-slate-400 font-mono">
                  {{ formatDate(item.createdAt) }}
                </div>
                <h3 class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {{ item.title }}
                </h3>
                <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {{ item.content }}
                </p>
              </div>
            </div>

            <div class="p-3 pt-0 flex items-center justify-between text-[11px] font-semibold text-emerald-600 border-t border-slate-50 mt-1">
              <span>อ่านต่อ</span>
              <ChevronRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Personal Profile & Settings Link Card -->
      <router-link
        to="/liff/settings"
        class="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between transition-all group cursor-pointer block"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <User class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 flex-wrap">
              <span>โปรไฟล์และการตั้งค่า</span>
              <span class="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">Settings</span>
            </div>
            <div class="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              เปลี่ยนรหัส PIN, ข้อมูลผู้เช่า, รถยนต์/มอเตอร์ไซค์
            </div>
          </div>
        </div>
        <div class="w-7 h-7 rounded-xl bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-all text-slate-400 shrink-0 ml-2">
          <ChevronRight class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </router-link>
    </div>

    <!-- Digital ID QR Code Modal -->
    <div v-if="showQrModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4 border border-slate-100 text-center relative">
        <button @click="showQrModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <X class="w-5 h-5" />
        </button>

        <div class="space-y-1 pt-2">
          <h3 class="text-base font-bold text-slate-900">Digital Tenant ID</h3>
          <p class="text-xs text-slate-500">แสดง QR Code นี้แก่เจ้าหน้าที่หอพัก</p>
        </div>

        <div class="py-2">
          <img :src="digitalIdQrUrl" alt="Digital ID QR" class="w-48 h-48 mx-auto rounded-xl border border-slate-100 p-1 bg-white" />
        </div>

        <div class="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 font-mono">
          <div>ผู้เช่า: <span class="font-bold text-slate-800">{{ tenantProfile.firstName }} {{ tenantProfile.lastName }}</span></div>
          <div>ห้องพัก: <span class="font-bold text-indigo-600">{{ formattedRooms }}</span></div>
        </div>

        <button
          @click="showQrModal = false"
          class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>

    <!-- Link Room Modal -->
    <div v-if="showLinkRoomModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4 border border-slate-100 relative">
        <button @click="showLinkRoomModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <X class="w-5 h-5" />
        </button>

        <div class="space-y-1 pt-2 text-center">
          <h3 class="text-base font-bold text-slate-900">ผูกห้องพักเพิ่มเติม</h3>
          <p class="text-xs text-slate-500">กรอกรหัสเชิญ (Invite Code) ที่ได้รับจากเจ้าหน้าที่หอพัก</p>
        </div>

        <form @submit.prevent="handleLinkRoom" class="space-y-3">
          <div class="space-y-1">
            <label class="block text-xs font-medium text-slate-700">รหัสเชิญห้องพัก</label>
            <input
              v-model="inviteCodeInput"
              type="text"
              placeholder="เช่น ROOM-A102-XYZ"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono text-center uppercase focus:outline-hidden focus:border-indigo-400"
            />
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              @click="showLinkRoomModal = false"
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="linkingRoom"
              class="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {{ linkingRoom ? 'กำลังผูกห้อง...' : 'ยืนยันผูกห้อง' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Announcement Detail Modal Popup -->
    <Teleport to="body">
      <div
        v-if="selectedAnnouncement"
        class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        @click.self="closeAnnouncementModal"
      >
        <div
          class="bg-white w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-3xl shadow-2xl max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        >
          <!-- Modal Top Header Bar -->
          <div class="shrink-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-10">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                {{ selectedAnnouncement.building?.name || 'ประกาศทั่วไป' }}
              </span>
              <span class="text-xs text-slate-400 font-mono">
                {{ formatDate(selectedAnnouncement.createdAt) }}
              </span>
            </div>

            <button
              @click="closeAnnouncementModal"
              class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Scrollable Modal Content -->
          <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <!-- Full Cover Image -->
            <div v-if="selectedAnnouncement.imageUrl" class="w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-xs">
              <img
                :src="selectedAnnouncement.imageUrl"
                :alt="selectedAnnouncement.title"
                class="w-full max-h-72 object-cover object-center"
              />
            </div>

            <!-- Title -->
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {{ selectedAnnouncement.title }}
            </h2>

            <!-- Author & Metadata Pill -->
            <div class="flex items-center gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs text-slate-600">
              <div class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <User class="w-3.5 h-3.5" />
              </div>
              <div>
                <div class="text-[10px] text-slate-400">ผู้ประกาศ</div>
                <div class="font-semibold text-slate-800">{{ selectedAnnouncement.createdBy || 'ผู้ดูแลหอพัก' }}</div>
              </div>
            </div>

            <!-- Content Body -->
            <div class="prose prose-sm text-slate-700 leading-relaxed whitespace-pre-line text-sm pt-2 border-t border-slate-100">
              {{ selectedAnnouncement.content }}
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="shrink-0 p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <button
              @click="closeAnnouncementModal"
              class="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              รับทราบ / ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { useDynamicTheme } from '@/composables/useDynamicTheme';
import { useAnnouncements } from '@/composables/useAnnouncements';
import { initLiff, isLiffLoggedIn, getLiffProfile, loginLiff } from '@/utils/liff';
import api from '@/utils/api';
import { showSuccess, showError } from '@/utils/swal';
import QRCode from 'qrcode';
import {
  CreditCard,
  Wrench,
  Package,
  Megaphone,
  User,
  QrCode,
  ChevronRight,
  PlusCircle,
  X,
  DoorClosed,
  Check,
  CheckCircle2
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const featureStore = useFeatureStore();
const { themeColor, applyTheme, adjustBrightness } = useDynamicTheme();
const {
  latestUnreadAnnouncements,
  announcements,
  unreadCount,
  isRead,
  checkUnread,
  markAsRead
} = useAnnouncements();

const cachedTenant = authStore.tenant || null;
const loading = ref(!cachedTenant?.firstName);
const showQrModal = ref(false);
const showLinkRoomModal = ref(false);
const sessionExpired = ref(false);
const imageLoadError = ref(false);
const inviteCodeInput = ref('');
const linkingRoom = ref(false);
const digitalIdQrUrl = ref('');
const currentLineUserId = ref('');
const selectedAnnouncement = ref(null);

const unpaidInvoices = ref([]);
const pendingParcels = ref([]);
const activeMaintenance = ref([]);

const totalUnpaidAmount = computed(() => {
  return unpaidInvoices.value.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
});

const hasAnyActionItems = computed(() => {
  return (
    (featureStore.isEnabled('ENABLE_LINE_PAYMENT') && unpaidInvoices.value.length > 0) ||
    (featureStore.isEnabled('ENABLE_PARCEL_NOTIFY') && pendingParcels.value.length > 0) ||
    (featureStore.isEnabled('ENABLE_MAINTENANCE_REQUEST') && activeMaintenance.value.length > 0)
  );
});

const formatMaintenanceStatus = (status) => {
  const map = {
    pending: 'รอดำเนินการ',
    in_progress: 'กำลังเข้าซ่อม',
    assigned: 'มอบหมายช่างแล้ว',
    resolved: 'เสร็จสิ้น',
    completed: 'เสร็จสิ้น'
  };
  return map[status] || status || 'กำลังดำเนินการ';
};

const goToPayment = (invoice) => {
  if (invoice?.id) {
    router.push(`/liff/pay/${invoice.id}`);
  } else {
    router.push('/liff/invoices');
  }
};

const fetchLiveActionMetrics = async (lineUserId = '') => {
  try {
    const params = {};
    if (lineUserId) params.lineUserId = lineUserId;

    const [invoicesRes, parcelsRes, maintenanceRes] = await Promise.allSettled([
      api.get('/api/v1/liff/invoices/history', { params }),
      api.get('/api/v1/liff/parcels', { params }),
      api.get('/api/v1/liff/maintenance', { params })
    ]);

    // 1. Unpaid Invoices
    if (invoicesRes.status === 'fulfilled') {
      const invList = invoicesRes.value.data?.data || [];
      unpaidInvoices.value = invList.filter((i) =>
        ['unpaid', 'issued', 'overdue', 'pending_payment', 'partially_paid'].includes((i.status || '').toLowerCase())
      );
    }

    // 2. Pending Parcels
    if (parcelsRes.status === 'fulfilled') {
      const parcelList = parcelsRes.value.data?.data || [];
      pendingParcels.value = parcelList.filter((p) =>
        ['pending', 'arrived'].includes((p.status || '').toLowerCase())
      );
    }

    // 3. Active Maintenance
    if (maintenanceRes.status === 'fulfilled') {
      const mList = maintenanceRes.value.data?.data || [];
      activeMaintenance.value = mList.filter((m) =>
        ['pending', 'in_progress', 'assigned'].includes((m.status || '').toLowerCase())
      );
    }
  } catch (err) {
    console.warn('Live action metrics fetch warning:', err);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const openAnnouncementModal = (item) => {
  selectedAnnouncement.value = item;
  if (item?.id) {
    markAsRead(item.id);
  }
};

const closeAnnouncementModal = () => {
  selectedAnnouncement.value = null;
};

const tenantProfile = reactive({
  firstName: cachedTenant?.firstName || '',
  lastName: cachedTenant?.lastName || '',
  roomNumber: cachedTenant?.roomNumber || '',
  rooms: cachedTenant?.rooms || [],
  phone: cachedTenant?.phone || '',
  avatarUrl: cachedTenant?.avatarUrl || cachedTenant?.linePictureUrl || ''
});

const tenantInitial = computed(() => {
  if (tenantProfile.firstName && tenantProfile.firstName.trim()) {
    return tenantProfile.firstName.trim().charAt(0).toUpperCase();
  }
  return 'U';
});

const handleAvatarError = () => {
  imageLoadError.value = true;
};

const selectedRoomId = ref('');

const selectedRoom = computed(() => {
  if (!tenantProfile.rooms || tenantProfile.rooms.length === 0) return null;
  return tenantProfile.rooms.find((r) => r.id === selectedRoomId.value) || tenantProfile.rooms[0];
});

const selectRoom = (room) => {
  if (!room) return;
  selectedRoomId.value = room.id;
  localStorage.setItem('active_tenant_room_id', room.id);
  tenantProfile.roomNumber = room.roomNumber;
  applyTheme(room);
};

const formattedRooms = computed(() => {
  if (tenantProfile.rooms && tenantProfile.rooms.length > 0) {
    return tenantProfile.rooms.map((r) => `ห้อง ${r.roomNumber}`).join(', ');
  }
  return `ห้อง ${tenantProfile.roomNumber || '-'}`;
});

const fetchTenantProfile = async (lineUserId = '') => {
  try {
    const params = {};
    if (lineUserId) params.lineUserId = lineUserId;
    if (route.query.room) params.room = route.query.room;
    if (route.query.roomNumber) params.roomNumber = route.query.roomNumber;
    if (route.query.tenantId) params.tenantId = route.query.tenantId;

    const res = await api.get('/api/v1/liff/profile', { params });
    if (res.data?.success && res.data?.data) {
      sessionExpired.value = false;
      const data = res.data.data;
      tenantProfile.firstName = data.firstName || 'ผู้เช่า';
      tenantProfile.lastName = data.lastName || '';
      tenantProfile.roomNumber = data.roomNumber || '-';
      tenantProfile.rooms = data.rooms || [];
      tenantProfile.phone = data.phone || '';
      if (data.linePictureUrl) {
        tenantProfile.avatarUrl = data.linePictureUrl;
      }

      if (tenantProfile.rooms.length > 0) {
        const storedRoomId = localStorage.getItem('active_tenant_room_id');
        const matched = tenantProfile.rooms.find((r) => r.id === storedRoomId) || tenantProfile.rooms[0];
        selectedRoomId.value = matched.id;
        tenantProfile.roomNumber = matched.roomNumber;
        applyTheme(matched);
      } else {
        applyTheme(data);
      }
    }
  } catch (err) {
    console.warn('Failed to fetch tenant profile from API:', err.message);
    if (err.response?.status === 401 || err.response?.status === 403 || !isLiffLoggedIn()) {
      sessionExpired.value = true;
      authStore.clearLiffAuth();
      router.replace('/liff');
      return;
    }
  } finally {
    loading.value = false;
  }
};

const handleLinkRoom = async () => {
  if (!inviteCodeInput.value.trim()) return;
  linkingRoom.value = true;
  try {
    const rawName = `${tenantProfile.firstName || ''} ${tenantProfile.lastName || ''}`.trim() || 'ลูกบ้าน';
    const nameParts = rawName.split(' ');
    const firstName = tenantProfile.firstName || nameParts[0] || 'ลูกบ้าน';
    const lastName = tenantProfile.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-');

    const payload = {
      inviteCode: inviteCodeInput.value.trim().toUpperCase(),
      firstName,
      lastName,
      phone: tenantProfile.phone || '0800000000',
      lineDisplayName: firstName,
      linePictureUrl: tenantProfile.avatarUrl || undefined
    };

    const res = await api.post('/api/v1/liff/register/invite', payload);
    if (res.data?.success) {
      await showSuccess('สำเร็จ', 'เพิ่มห้องพักใหม่เข้าสู่บัญชีของคุณเรียบร้อยแล้ว');
      showLinkRoomModal.value = false;
      inviteCodeInput.value = '';
      await fetchTenantProfile(currentLineUserId.value);
    }
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถผูกห้องพักได้');
  } finally {
    linkingRoom.value = false;
  }
};

// Quick Actions Grid Config
const quickActionsConfig = [
  {
    id: 'invoices',
    title: 'บิลค่าเช่า',
    subtitle: 'ชำระเงิน & ดูยอดเงิน',
    icon: CreditCard,
    bgClass: 'bg-indigo-50',
    iconClass: 'text-indigo-600',
    route: '/liff/invoices',
    featureKey: 'ENABLE_LINE_PAYMENT'
  },
  {
    id: 'maintenance',
    title: 'แจ้งซ่อม & ร้องเรียน',
    subtitle: 'ส่งเรื่อง & ติดตามสถานะ',
    icon: Wrench,
    bgClass: 'bg-amber-50',
    iconClass: 'text-amber-600',
    route: '/liff/issues',
    featureKey: 'ENABLE_MAINTENANCE_REQUEST'
  },
  {
    id: 'parcels',
    title: 'พัสดุของฉัน',
    subtitle: 'แจ้งเตือน & สแกนรับของ',
    icon: Package,
    bgClass: 'bg-orange-50',
    iconClass: 'text-orange-600',
    route: '/liff/parcels',
    featureKey: 'ENABLE_PARCEL_NOTIFY'
  },
  {
    id: 'announcements',
    title: 'ข่าวสาร & ประกาศ',
    subtitle: 'ประกาศสำคัญจากหอพัก',
    icon: Megaphone,
    bgClass: 'bg-sky-50',
    iconClass: 'text-sky-600',
    route: '/liff/announcements',
    featureKey: 'ENABLE_ANNOUNCEMENTS'
  }
];

const availableQuickActions = computed(() => {
  return quickActionsConfig.filter((menu) => {
    if (!menu.featureKey) return true;
    return featureStore.isEnabled(menu.featureKey);
  });
});

const handleMenuClick = (menu) => {
  if (menu.route) {
    const query = {};
    if (selectedRoom.value?.roomNumber) query.room = selectedRoom.value.roomNumber;
    if (selectedRoom.value?.id) query.roomId = selectedRoom.value.id;
    router.push({ path: menu.route, query });
  }
};

onMounted(async () => {
  featureStore.fetchFeatures();

  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const profile = await getLiffProfile();
      if (profile?.userId) {
        currentLineUserId.value = profile.userId;
        if (profile.pictureUrl) {
          tenantProfile.avatarUrl = profile.pictureUrl;
          imageLoadError.value = false;
        }
      }
    } else if (!authStore.liffToken && !localStorage.getItem('dev_line_user_id')) {
      authStore.clearLiffAuth();
      router.replace('/liff');
      return;
    }
  } catch (err) {
    console.warn('LIFF init fallback mode:', err.message);
  }

  await fetchTenantProfile(currentLineUserId.value);
  await Promise.allSettled([
    checkUnread(currentLineUserId.value),
    fetchLiveActionMetrics(currentLineUserId.value)
  ]);

  if (currentLineUserId.value || tenantProfile.phone) {
    api.patch('/api/v1/liff/auth/sync-profile', {
      lineUserId: currentLineUserId.value || undefined,
      lineDisplayName: tenantProfile.firstName,
      linePictureUrl: tenantProfile.avatarUrl,
      phone: tenantProfile.phone || undefined,
      roomNumber: tenantProfile.roomNumber || undefined
    }).catch(() => {});
  }

  const payload = `TENANT-ID:${tenantProfile.firstName}-ROOMS-${tenantProfile.roomNumber}-${Date.now()}`;
  digitalIdQrUrl.value = await QRCode.toDataURL(payload, { margin: 1, width: 260 });
});
</script>
