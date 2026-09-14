<template>
  <div class="space-y-6">
    <!-- 1. Header Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200/80 rounded-full text-purple-700 text-xs font-bold mb-1.5">
          <MessageSquareQuote class="w-3.5 h-3.5" />
          <span>Developer & Product Feedback Hub</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">
          ศูนย์รับความคิดเห็นและข้อเสนอแนะถึงผู้พัฒนา
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">
          รวบรวมรายงานบั๊ก ฟีเจอร์ที่ต้องการ และข้อคิดเห็นจากผู้ดูแลระบบและลูกบ้านทุกช่องทาง
        </p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          @click="fetchFeedbacks"
          class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>รีเฟรชข้อมูล</span>
        </button>

        <button
          @click="showSubmitModal = true"
          class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <MessageSquarePlus class="w-3.5 h-3.5" />
          <span>ส่งความคิดเห็นใหม่</span>
        </button>
      </div>
    </div>

    <!-- 2. Statistics Overview Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <!-- Total -->
      <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>ทั้งหมด</span>
          <ListChecks class="w-4 h-4 text-slate-400" />
        </div>
        <div class="text-2xl font-black text-slate-900">{{ stats.total }}</div>
        <div class="text-[10px] text-slate-400">รายการฟีดแบ็กทั้งหมด</div>
      </div>

      <!-- New / Pending -->
      <div class="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 shadow-2xs space-y-1">
        <div class="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center justify-between">
          <span>รอตรวจสอบ</span>
          <Clock class="w-4 h-4 text-purple-600" />
        </div>
        <div class="text-2xl font-black text-purple-700">{{ stats.newCount }}</div>
        <div class="text-[10px] text-purple-500">ความคิดเห็นใหม่ (NEW)</div>
      </div>

      <!-- In Progress / Planned -->
      <div class="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
        <div class="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
          <span>กำลังดำเนินการ</span>
          <Clock3 class="w-4 h-4 text-amber-600" />
        </div>
        <div class="text-2xl font-black text-amber-700">{{ stats.inReviewCount + stats.plannedCount }}</div>
        <div class="text-[10px] text-amber-600">In Review & Planned</div>
      </div>

      <!-- Resolved -->
      <div class="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
        <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
          <span>แก้ไข/เสร็จสิ้น</span>
          <CheckCircle2 class="w-4 h-4 text-emerald-600" />
        </div>
        <div class="text-2xl font-black text-emerald-700">{{ stats.resolvedCount }}</div>
        <div class="text-[10px] text-emerald-600">เรียบร้อยแล้ว</div>
      </div>

      <!-- Average Rating -->
      <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>คะแนนเฉลี่ย</span>
          <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-black text-slate-900">{{ stats.avgRating }}</span>
          <span class="text-xs text-slate-400 font-bold">/ 5.0</span>
        </div>
        <div class="text-[10px] text-slate-400">จากผู้ประเมินทั้งหมด</div>
      </div>
    </div>

    <!-- 3. Search & Filter Bar -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
      <div class="flex items-center justify-between">
        <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Filter class="w-3.5 h-3.5 text-purple-600" />
          <span>ตัวกรองค้นหา (Filter Feedbacks)</span>
        </div>
        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="text-xs text-purple-600 hover:text-purple-800 font-bold cursor-pointer"
        >
          ล้างตัวกรองทั้งหมด
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Search Keyword -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">ค้นหา (Search)</label>
          <div class="relative">
            <input
              v-model="filters.search"
              @input="handleSearchInput"
              type="text"
              placeholder="ค้นหาข้อความ, ผู้ส่ง, เบอร์..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
            />
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <!-- Platform Filter -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">ช่องทาง (Platform)</label>
          <select
            v-model="filters.platform"
            @change="fetchFeedbacks"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">ทุกช่องทาง (All Platforms)</option>
            <option value="CMS_ADMIN">Admin Backoffice (CMS)</option>
            <option value="TENANT_LIFF">LINE LIFF Portal</option>
            <option value="TENANT_WEB">Tenant Web Portal</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">หมวดหมู่ (Category)</label>
          <select
            v-model="filters.category"
            @change="fetchFeedbacks"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">ทุกหมวดหมู่ (All Categories)</option>
            <option value="BUG">รายงานบั๊ก / ข้อผิดพลาด (BUG)</option>
            <option value="FEATURE_REQUEST">ขอฟีเจอร์ใหม่ (FEATURE_REQUEST)</option>
            <option value="UI_UX">ความสะดวก / UX (UI_UX)</option>
            <option value="GENERAL">ทั่วไป / ข้อเสนอแนะ (GENERAL)</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">สถานะ (Status)</label>
          <select
            v-model="filters.status"
            @change="fetchFeedbacks"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">ทุกสถานะ (All Status)</option>
            <option value="NEW">NEW (ใหม่ รอตรวจ)</option>
            <option value="IN_REVIEW">IN_REVIEW (กำลังพิจารณา)</option>
            <option value="PLANNED">PLANNED (วางแผนพัฒนา)</option>
            <option value="RESOLVED">RESOLVED (แก้ไขเสร็จแล้ว)</option>
            <option value="REJECTED">REJECTED (ยกเลิก/ไม่ดำเนินการ)</option>
          </select>
        </div>

        <!-- Rating Filter -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">คะแนน (Rating)</label>
          <select
            v-model="filters.rating"
            @change="fetchFeedbacks"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">ทุกคะแนน (All Ratings)</option>
            <option value="5">5 ดาว (ดีเยี่ยม)</option>
            <option value="4">4 ดาว (พึงพอใจ)</option>
            <option value="3">3 ดาว (ปานกลาง)</option>
            <option value="2">2 ดาว (พอใช้)</option>
            <option value="1">1 ดาว (ต้องปรับปรุง)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 4. Feedback Feed / Table -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
      <div v-if="loading && feedbacks.length === 0" class="p-12 text-center text-slate-500">
        <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        กำลังโหลดรายการความคิดเห็น...
      </div>

      <div v-else-if="feedbacks.length === 0" class="p-12 text-center text-slate-400">
        <MessageSquareQuote class="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <div class="text-base font-bold text-slate-700">ไม่พบข้อมูลความคิดเห็น</div>
        <p class="text-xs text-slate-400 mt-1">ยังไม่มีความคิดเห็นตรงกับตัวกรองที่เลือก</p>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div
          v-for="item in feedbacks"
          :key="item.id"
          class="p-5 hover:bg-slate-50/60 transition-colors space-y-3.5"
        >
          <!-- Top Row: Badges & Actions -->
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Platform Pill -->
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5"
                :class="getPlatformBadgeClass(item.platform)"
              >
                <component :is="getPlatformIcon(item.platform)" class="w-3 h-3" />
                <span>{{ formatPlatform(item.platform) }}</span>
              </span>

              <!-- Category Pill -->
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5"
                :class="getCategoryBadgeClass(item.category)"
              >
                <component :is="getCategoryIcon(item.category)" class="w-3 h-3" />
                <span>{{ formatCategory(item.category) }}</span>
              </span>

              <!-- Rating Stars -->
              <div v-if="item.rating" class="flex items-center gap-0.5 text-xs pl-1">
                <Star
                  v-for="s in 5"
                  :key="s"
                  class="w-3.5 h-3.5"
                  :class="s <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'"
                />
                <span class="text-[10px] text-slate-500 font-bold ml-1 font-mono">({{ item.rating }}/5)</span>
              </div>

              <!-- Time Ago -->
              <span class="text-[11px] text-slate-400">
                • {{ formatTime(item.createdAt) }}
              </span>
            </div>

            <!-- Status Dropdown & Action Buttons -->
            <div class="flex items-center gap-2">
              <select
                :value="item.status"
                @change="handleQuickStatusChange(item, $event.target.value)"
                class="text-xs font-bold rounded-xl px-2.5 py-1 border transition-all cursor-pointer focus:outline-hidden"
                :class="getStatusSelectClass(item.status)"
              >
                <option value="NEW">NEW (ใหม่)</option>
                <option value="IN_REVIEW">IN_REVIEW (กำลังพิจารณา)</option>
                <option value="PLANNED">PLANNED (วางแผนแล้ว)</option>
                <option value="RESOLVED">RESOLVED (เสร็จสิ้น)</option>
                <option value="REJECTED">REJECTED (ปฏิเสธ)</option>
              </select>

              <button
                @click="openDetailModal(item)"
                class="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-purple-600 rounded-lg transition-colors cursor-pointer"
                title="ดูรายละเอียดเชิงลึก & บันทึกนักพัฒนา"
              >
                <Eye class="w-4 h-4" />
              </button>

              <button
                @click="handleDelete(item)"
                class="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="ลบฟีดแบ็กนี้"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Middle: Content & Title -->
          <div class="space-y-1.5">
            <h3 v-if="item.title" class="text-sm font-black text-slate-900">
              {{ item.title }}
            </h3>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {{ item.content }}
            </p>
          </div>

          <!-- Image Attachments Gallery -->
          <div v-if="item.imageUrls && item.imageUrls.length > 0" class="flex items-center gap-2 overflow-x-auto pt-1">
            <a
              v-for="(img, idx) in item.imageUrls"
              :key="idx"
              :href="resolveImageUrl(img)"
              target="_blank"
              rel="noopener noreferrer"
              class="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-purple-500 transition-all shrink-0 group relative block"
            >
              <img :src="resolveImageUrl(img)" alt="Attachment" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </a>
          </div>

          <!-- Bottom: Sender Info & Technical Context Tags -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <!-- Sender details -->
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-700 flex items-center gap-1">
                <User class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ item.senderName || 'ผู้ใช้ไม่ระบุชื่อ (Guest)' }}</span>
              </span>
              <span v-if="item.senderRole" class="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-mono text-[10px]">
                {{ item.senderRole }}
              </span>
              <span v-if="item.senderPhone" class="text-slate-400 font-mono flex items-center gap-1">
                <Phone class="w-3 h-3" />
                <span>{{ item.senderPhone }}</span>
              </span>
            </div>

            <!-- Context snippet -->
            <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span v-if="item.currentRoute" class="truncate max-w-[180px] flex items-center gap-1" title="Path Route">
                <MapPin class="w-3 h-3" />
                <span>{{ item.currentRoute }}</span>
              </span>
              <span v-if="item.deviceContext?.platform || item.deviceContext?.screenResolution" class="flex items-center gap-1">
                <Laptop class="w-3 h-3" />
                <span>{{ item.deviceContext?.platform || '' }} {{ item.deviceContext?.screenResolution || '' }}</span>
              </span>
            </div>
          </div>

          <!-- Dev Notes Banner (if any) -->
          <div
            v-if="item.developerNotes"
            class="p-2.5 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-purple-900 flex items-start gap-2"
          >
            <span class="font-bold shrink-0 text-purple-600">บันทึกทีมพัฒนา:</span>
            <span class="text-[11px] leading-relaxed">{{ item.developerNotes }}</span>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div v-if="totalPages > 1" class="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div class="text-xs text-slate-500 font-medium">
          หน้า {{ currentPage }} จาก {{ totalPages }} (ทั้งหมด {{ totalItems }} รายการ)
        </div>
        <div class="flex items-center gap-1.5">
          <button
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
            class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            ก่อนหน้า
          </button>
          <button
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
            class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>

    <!-- 5. Feedback Detail & Developer Note Modal -->
    <div
      v-if="activeDetailItem"
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      @click.self="activeDetailItem = null"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-100 space-y-5 my-8 relative">
        <button
          @click="activeDetailItem = null"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Header -->
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1"
              :class="getCategoryBadgeClass(activeDetailItem.category)"
            >
              <component :is="getCategoryIcon(activeDetailItem.category)" class="w-3 h-3" />
              <span>{{ formatCategory(activeDetailItem.category) }}</span>
            </span>
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1"
              :class="getPlatformBadgeClass(activeDetailItem.platform)"
            >
              <component :is="getPlatformIcon(activeDetailItem.platform)" class="w-3 h-3" />
              <span>{{ formatPlatform(activeDetailItem.platform) }}</span>
            </span>
          </div>
          <h2 class="text-lg font-black text-slate-900 tracking-tight pt-1">
            {{ activeDetailItem.title || 'รายละเอียดข้อเสนอแนะ' }}
          </h2>
          <p class="text-xs text-slate-400 font-mono">
            ID: {{ activeDetailItem.id }} • บันทึกเมื่อ {{ formatTime(activeDetailItem.createdAt) }}
          </p>
        </div>

        <!-- Content -->
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ข้อความ / รายละเอียด</div>
          <p class="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {{ activeDetailItem.content }}
          </p>
        </div>

        <!-- Rating -->
        <div v-if="activeDetailItem.rating" class="flex items-center justify-between p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
          <span class="text-xs font-bold text-amber-800">คะแนนความพึงพอใจ:</span>
          <div class="flex items-center gap-1 text-sm">
            <Star
              v-for="s in 5"
              :key="s"
              class="w-4 h-4"
              :class="s <= activeDetailItem.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'"
            />
            <span class="text-xs font-bold text-slate-600 font-mono ml-1">({{ activeDetailItem.rating }}/5)</span>
          </div>
        </div>

        <!-- Attached Images -->
        <div v-if="activeDetailItem.imageUrls && activeDetailItem.imageUrls.length > 0" class="space-y-1.5">
          <div class="text-xs font-bold text-slate-700">รูปภาพแนบ (Screenshots)</div>
          <div class="grid grid-cols-3 gap-2">
            <a
              v-for="(img, idx) in activeDetailItem.imageUrls"
              :key="idx"
              :href="resolveImageUrl(img)"
              target="_blank"
              rel="noopener noreferrer"
              class="h-24 rounded-xl overflow-hidden border border-slate-200 block group relative"
            >
              <img :src="resolveImageUrl(img)" alt="Attachment" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </a>
          </div>
        </div>

        <!-- Technical Context Diagnostics -->
        <div class="space-y-1.5">
          <div class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Terminal class="w-3.5 h-3.5 text-purple-600" />
            <span>Technical Context (ข้อมูลแวดล้อมทางเทคนิค)</span>
          </div>
          <div class="p-3 bg-slate-900 text-slate-200 rounded-2xl text-[10px] font-mono space-y-1 overflow-x-auto">
            <div><span class="text-slate-500">Route:</span> {{ activeDetailItem.currentRoute || 'N/A' }}</div>
            <div><span class="text-slate-500">Sender Role:</span> {{ activeDetailItem.senderRole || 'N/A' }}</div>
            <div><span class="text-slate-500">Sender Name:</span> {{ activeDetailItem.senderName || 'N/A' }}</div>
            <div><span class="text-slate-500">Sender Phone:</span> {{ activeDetailItem.senderPhone || 'N/A' }}</div>
            <div><span class="text-slate-500">User Agent:</span> {{ activeDetailItem.deviceContext?.browser || 'N/A' }}</div>
            <div><span class="text-slate-500">Platform:</span> {{ activeDetailItem.deviceContext?.platform || 'N/A' }}</div>
            <div><span class="text-slate-500">Screen Resolution:</span> {{ activeDetailItem.deviceContext?.screenResolution || 'N/A' }}</div>
          </div>
        </div>

        <!-- Dev Note & Status Editor -->
        <div class="space-y-3 pt-2 border-t border-slate-100">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ปรับเปลี่ยนสถานะ</label>
              <select
                v-model="modalForm.status"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="NEW">NEW (ใหม่)</option>
                <option value="IN_REVIEW">IN_REVIEW (กำลังพิจารณา)</option>
                <option value="PLANNED">PLANNED (วางแผนพัฒนา)</option>
                <option value="RESOLVED">RESOLVED (แก้ไขเสร็จแล้ว)</option>
                <option value="REJECTED">REJECTED (ไม่ดำเนินการ)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">บันทึกของทีมพัฒนา (Developer Notes)</label>
            <textarea
              v-model="modalForm.developerNotes"
              rows="3"
              placeholder="บันทึกรายละเอียด เช่น Release v1.4, แก้ไขที่ PR #12..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
            ></textarea>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex gap-2.5 pt-2">
          <button
            @click="handleSaveDetail"
            :disabled="savingDetail"
            class="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save class="w-4 h-4" />
            <span>{{ savingDetail ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}</span>
          </button>
          <button
            @click="activeDetailItem = null"
            class="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>

    <!-- 6. Developer Feedback Submission Modal Component -->
    <DeveloperFeedbackModal
      v-model="showSubmitModal"
      platform="CMS_ADMIN"
      @submitted="fetchFeedbacks"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  RefreshCw,
  MessageSquarePlus,
  MessageSquareQuote,
  Filter,
  Search,
  Eye,
  Trash2,
  X,
  Save,
  User,
  Terminal,
  Bug,
  Lightbulb,
  Palette,
  Sparkles,
  Star,
  Building2,
  Smartphone,
  Laptop,
  Globe,
  MapPin,
  Phone,
  Clock,
  Clock3,
  CheckCircle2,
  ListChecks
} from 'lucide-vue-next';
import api from '@/utils/api';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import DeveloperFeedbackModal from '@/components/DeveloperFeedbackModal.vue';

const loading = ref(false);
const feedbacks = ref([]);
const totalItems = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);
const limit = ref(20);
const showSubmitModal = ref(false);

const activeDetailItem = ref(null);
const savingDetail = ref(false);
const modalForm = reactive({
  status: 'NEW',
  developerNotes: ''
});

const filters = reactive({
  search: '',
  platform: '',
  category: '',
  status: '',
  rating: ''
});

let searchTimeout = null;

const stats = reactive({
  total: 0,
  newCount: 0,
  inReviewCount: 0,
  plannedCount: 0,
  resolvedCount: 0,
  avgRating: '5.0'
});

const hasActiveFilters = computed(() => {
  return filters.search || filters.platform || filters.category || filters.status || filters.rating;
});

const resetFilters = () => {
  filters.search = '';
  filters.platform = '';
  filters.category = '';
  filters.status = '';
  filters.rating = '';
  currentPage.value = 1;
  fetchFeedbacks();
};

const handleSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchFeedbacks();
  }, 350);
};

const changePage = (page) => {
  currentPage.value = page;
  fetchFeedbacks();
};

const fetchFeedbacks = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.platform ? { platform: filters.platform } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.rating ? { rating: filters.rating } : {})
    };

    const res = await api.get('/api/admin/feedbacks', { params });
    if (res.data?.success) {
      feedbacks.value = res.data.data || [];
      totalItems.value = res.data.pagination?.total || 0;
      totalPages.value = res.data.pagination?.totalPages || 1;
      
      // Update Stats
      if (res.data.stats) {
        stats.total = res.data.stats.total || 0;
        stats.newCount = res.data.stats.newCount || 0;
        stats.inReviewCount = res.data.stats.inReviewCount || 0;
        stats.plannedCount = res.data.stats.plannedCount || 0;
        stats.resolvedCount = res.data.stats.resolvedCount || 0;
        stats.avgRating = Number(res.data.stats.avgRating || 5).toFixed(1);
      }
    }
  } catch (err) {
    console.error('Fetch feedbacks error:', err);
    showError('เกิดข้อผิดพลาดในการโหลดข้อมูล', err.response?.data?.message || err.message);
  } finally {
    loading.value = false;
  }
};

const handleQuickStatusChange = async (item, newStatus) => {
  try {
    const res = await api.patch(`/api/admin/feedbacks/${item.id}/status`, {
      status: newStatus
    });
    if (res.data?.success) {
      item.status = newStatus;
      showSuccess('อัปเดตสถานะสำเร็จ', `เปลี่ยนสถานะเป็น ${newStatus} แล้ว`);
    }
  } catch (err) {
    console.error('Update status error:', err);
    showError('ไม่สามารถอัปเดตสถานะได้', err.response?.data?.message || err.message);
    fetchFeedbacks();
  }
};

const openDetailModal = (item) => {
  activeDetailItem.value = item;
  modalForm.status = item.status;
  modalForm.developerNotes = item.developerNotes || '';
};

const handleSaveDetail = async () => {
  if (!activeDetailItem.value) return;
  savingDetail.value = true;
  try {
    const res = await api.patch(`/api/admin/feedbacks/${activeDetailItem.value.id}/status`, {
      status: modalForm.status,
      developerNotes: modalForm.developerNotes
    });
    if (res.data?.success) {
      activeDetailItem.value.status = modalForm.status;
      activeDetailItem.value.developerNotes = modalForm.developerNotes;
      showSuccess('บันทึกสำเร็จ', 'อัปเดตสถานะและบันทึกผู้พัฒนาเรียบร้อยแล้ว');
      activeDetailItem.value = null;
    }
  } catch (err) {
    console.error('Save detail error:', err);
    showError('บันทึกไม่สำเร็จ', err.response?.data?.message || err.message);
  } finally {
    savingDetail.value = false;
  }
};

const handleDelete = async (item) => {
  const confirmed = await showConfirm(
    'ยืนยันการลบฟีดแบ็ก?',
    `ต้องการลบฟีดแบ็ก #${item.id.slice(-6)} นี้ใช่หรือไม่?`,
    'ลบข้อมูล'
  );
  if (!confirmed) return;

  try {
    const res = await api.delete(`/api/admin/feedbacks/${item.id}`);
    if (res.data?.success) {
      showSuccess('ลบสำเร็จ', 'ลบรายการฟีดแบ็กเรียบร้อยแล้ว');
      fetchFeedbacks();
    }
  } catch (err) {
    console.error('Delete feedback error:', err);
    showError('ลบไม่สำเร็จ', err.response?.data?.message || err.message);
  }
};

// UI formatting helpers
const formatPlatform = (p) => {
  switch (p) {
    case 'CMS_ADMIN': return 'Admin Backoffice';
    case 'TENANT_LIFF': return 'LINE LIFF';
    case 'TENANT_WEB': return 'Tenant Web';
    default: return p;
  }
};

const getPlatformIcon = (p) => {
  switch (p) {
    case 'CMS_ADMIN': return Building2;
    case 'TENANT_LIFF': return Smartphone;
    case 'TENANT_WEB': return Laptop;
    default: return Globe;
  }
};

const getPlatformBadgeClass = (p) => {
  switch (p) {
    case 'CMS_ADMIN': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'TENANT_LIFF': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'TENANT_WEB': return 'bg-sky-50 text-sky-700 border-sky-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const formatCategory = (c) => {
  switch (c) {
    case 'BUG': return 'บั๊ก / ข้อผิดพลาด';
    case 'FEATURE_REQUEST': return 'ขอฟีเจอร์ใหม่';
    case 'UI_UX': return 'ความสะดวก / UI';
    case 'GENERAL': return 'ทั่วไป / ข้อเสนอแนะ';
    default: return c;
  }
};

const getCategoryIcon = (c) => {
  switch (c) {
    case 'BUG': return Bug;
    case 'FEATURE_REQUEST': return Lightbulb;
    case 'UI_UX': return Palette;
    case 'GENERAL': return Sparkles;
    default: return MessageSquareQuote;
  }
};

const getCategoryBadgeClass = (c) => {
  switch (c) {
    case 'BUG': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'FEATURE_REQUEST': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'UI_UX': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'GENERAL': return 'bg-blue-50 text-blue-700 border-blue-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStatusSelectClass = (s) => {
  switch (s) {
    case 'NEW': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'IN_REVIEW': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PLANNED': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REJECTED': return 'bg-slate-100 text-slate-500 border-slate-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchFeedbacks();
});
</script>
