<template>
  <div class="space-y-6 font-sans">
    <!-- Header & Action Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Wrench v-if="activeMainTab === 'maintenance'" class="w-5 h-5" />
            <MessageSquareWarning v-else class="w-5 h-5" />
          </div>
          <span>{{ activeMainTab === 'maintenance' ? 'ระบบแจ้งซ่อมและติดตามงาน (Maintenance)' : 'เรื่องร้องเรียนและแจ้งเหตุจากลูกบ้าน (Complaints & Issues)' }}</span>
        </h1>
        <p class="text-sm text-slate-500">
          {{ activeMainTab === 'maintenance' 
            ? 'จัดการตั๋วงานซ่อม มอบหมายช่าง คำนวณค่าซ่อม และส่งสัญญาณอัปเดต LINE ลูกบ้าน' 
            : 'ตรวจสอบข้อร้องเรียน ปัญหาห้องพัก และตอบกลับลูกบ้านผ่าน LINE LIFF ได้ทันที' }}
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          v-if="activeMainTab === 'maintenance'"
          @click="showNewModal = true"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>สร้างใบแจ้งซ่อมใหม่</span>
        </button>
        <button
          @click="handleRefresh"
          class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <RefreshCw class="w-3.5 h-3.5 text-slate-500" :class="{ 'animate-spin': loadingIssues }" />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
      <button
        @click="activeMainTab = 'maintenance'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        :class="activeMainTab === 'maintenance' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'"
      >
        <Wrench class="w-4 h-4" />
        <span>ตารางงานแจ้งซ่อม (Kanban)</span>
        <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
          {{ requests.length }}
        </span>
      </button>

      <button
        @click="activeMainTab = 'issues'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        :class="activeMainTab === 'issues' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'"
      >
        <MessageSquareWarning class="w-4 h-4" />
        <span>เรื่องร้องเรียน & แจ้งเหตุ (Issues Inbox)</span>
        <span
          v-if="pendingIssuesCount > 0"
          class="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono animate-pulse"
        >
          {{ pendingIssuesCount }} ใหม่
        </span>
        <span v-else class="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
          {{ issueList.length }}
        </span>
      </button>
    </div>

    <!-- ==================== VIEW 1: MAINTENANCE KANBAN ==================== -->
    <div v-if="activeMainTab === 'maintenance'" class="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      <!-- Column 1: Pending (รอดำเนินการ) -->
      <div id="tour-kanban-pending" class="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 space-y-3.5 min-h-[500px]">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-amber-500" />
            <h3 class="font-bold text-slate-800 text-sm">รอดำเนินการ (Pending)</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {{ pendingList.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in pendingList"
            :key="item.id"
            @click="openEditModal(item)"
            class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer space-y-3 group"
          >
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 font-mono flex items-center gap-1">
                <DoorClosed class="w-3.5 h-3.5" />
                <span>ห้อง {{ item.room?.roomNumber || 'N/A' }} {{ item.room?.building?.name || item.building?.name ? `(${item.room?.building?.name || item.building?.name})` : '' }}</span>
              </span>
              <span class="text-[11px] text-slate-400 font-mono">
                {{ new Date(item.createdAt).toLocaleDateString('th-TH') }}
              </span>
            </div>

            <div>
              <h4 class="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                <Wrench class="w-4 h-4 text-amber-500 shrink-0" />
                <span>{{ item.title }}</span>
              </h4>
              <p class="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{{ item.description }}</p>
            </div>

            <div v-if="item.imageUrl || item.photoUrl" class="rounded-xl overflow-hidden max-h-32 border border-slate-100">
              <img :src="item.imageUrl || item.photoUrl" class="w-full h-full object-cover" />
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span class="flex items-center gap-1">
                <UserCheck class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ item.tenant ? `${item.tenant.firstName}` : 'ลูกบ้าน' }}</span>
              </span>
              <button
                @click.stop="handleQuickStatus(item.id, 'in_progress')"
                class="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-all border border-blue-200 flex items-center gap-1"
              >
                <Zap class="w-3 h-3" />
                <span>➔ กำลังซ่อม</span>
              </button>
            </div>
          </div>

          <div v-if="pendingList.length === 0" class="p-8 text-center text-slate-400 text-xs bg-white/60 rounded-2xl border border-dashed border-slate-200">
            ไม่มีรายการรอดำเนินการ 🎉
          </div>
        </div>
      </div>

      <!-- Column 2: In Progress (กำลังดำเนินการซ่อม) -->
      <div id="tour-kanban-inprogress" class="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 space-y-3.5 min-h-[500px]">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <Zap class="w-4 h-4 text-blue-500" />
            <h3 class="font-bold text-slate-800 text-sm">กำลังดำเนินการ (In Progress)</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {{ inProgressList.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in inProgressList"
            :key="item.id"
            @click="openEditModal(item)"
            class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-3 group"
          >
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 font-mono flex items-center gap-1">
                <DoorClosed class="w-3.5 h-3.5" />
                <span>ห้อง {{ item.room?.roomNumber || 'N/A' }} {{ item.room?.building?.name || item.building?.name ? `(${item.room?.building?.name || item.building?.name})` : '' }}</span>
              </span>
              <span class="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                <Zap class="w-3 h-3" />
                <span>กำลังซ่อม</span>
              </span>
            </div>

            <div>
              <h4 class="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <Wrench class="w-4 h-4 text-blue-500 shrink-0" />
                <span>{{ item.title }}</span>
              </h4>
              <p class="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{{ item.description }}</p>
            </div>

            <div v-if="item.technicianName" class="p-2 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 font-medium flex items-center gap-1.5">
              <UserCheck class="w-3.5 h-3.5 text-blue-600" />
              <span>ช่าง: {{ item.technicianName }}</span>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span class="flex items-center gap-1">
                <UserCheck class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ item.tenant ? `${item.tenant.firstName}` : 'ลูกบ้าน' }}</span>
              </span>
              <button
                @click.stop="handleQuickStatus(item.id, 'resolved')"
                class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition-all border border-emerald-200 flex items-center gap-1"
              >
                <CheckCircle2 class="w-3 h-3" />
                <span>➔ ซ่อมเสร็จแล้ว</span>
              </button>
            </div>
          </div>

          <div v-if="inProgressList.length === 0" class="p-8 text-center text-slate-400 text-xs bg-white/60 rounded-2xl border border-dashed border-slate-200">
            ไม่มีงานที่กำลังซ่อม
          </div>
        </div>
      </div>

      <!-- Column 3: Resolved (เสร็จสิ้น) -->
      <div id="tour-kanban-resolved" class="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 space-y-3.5 min-h-[500px]">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-600" />
            <h3 class="font-bold text-slate-800 text-sm">เสร็จสิ้น (Resolved)</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {{ resolvedList.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in resolvedList"
            :key="item.id"
            @click="openEditModal(item)"
            class="p-4 bg-white/90 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer space-y-3 group opacity-90 hover:opacity-100"
          >
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 font-mono flex items-center gap-1">
                <DoorClosed class="w-3.5 h-3.5" />
                <span>ห้อง {{ item.room?.roomNumber || 'N/A' }} {{ item.room?.building?.name || item.building?.name ? `(${item.room?.building?.name || item.building?.name})` : '' }}</span>
              </span>
              <span class="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 class="w-3 h-3" />
                <span>เสร็จสิ้น</span>
              </span>
            </div>

            <div>
              <h4 class="font-bold text-slate-800 text-sm line-through text-slate-500 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                <Wrench class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{{ item.title }}</span>
              </h4>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{{ item.description }}</p>
            </div>

            <div v-if="Number(item.repairCost || 0) > 0" class="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
              <Coins class="w-3.5 h-3.5 text-emerald-600" />
              <span>ค่าซ่อม: ฿{{ Number(item.repairCost).toLocaleString() }}</span>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{{ item.tenant ? `${item.tenant.firstName}` : 'ลูกบ้าน' }}</span>
              <span>{{ item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString('th-TH') : 'ปิดงานแล้ว' }}</span>
            </div>
          </div>

          <div v-if="resolvedList.length === 0" class="p-8 text-center text-slate-400 text-xs bg-white/60 rounded-2xl border border-dashed border-slate-200">
            ยังไม่มีงานที่เสร็จสิ้น
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== VIEW 2: COMPLAINTS & ISSUES INBOX ==================== -->
    <div v-else class="space-y-4">
      <!-- Filter Controls Bar -->
      <div class="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Category Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            v-for="cat in issueCategoryFilters"
            :key="cat.value"
            @click="selectedCategoryFilter = cat.value"
            class="px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            :class="selectedCategoryFilter === cat.value ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'"
          >
            <span>{{ cat.label }}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px]" :class="selectedCategoryFilter === cat.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'">
              {{ cat.count }}
            </span>
          </button>
        </div>

        <!-- Status Filter -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500">สถานะ:</span>
          <select
            v-model="selectedStatusFilter"
            class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-hidden"
          >
            <option value="ALL">ทั้งหมดทุกสถานะ</option>
            <option value="PENDING">รอรับเรื่อง (Pending)</option>
            <option value="IN_PROGRESS">กำลังดำเนินการ (In Progress)</option>
            <option value="RESOLVED">แก้ไขเสร็จสิ้น (Resolved)</option>
            <option value="CANCELLED">ยกเลิก (Cancelled)</option>
          </select>
        </div>
      </div>

      <!-- Issues List Cards -->
      <div v-if="filteredIssues.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="issue in filteredIssues"
          :key="issue.id"
          @click="openIssueDetailModal(issue)"
          class="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer space-y-3.5 flex flex-col justify-between"
        >
          <div class="space-y-3">
            <!-- Card Header: Category Badge + Status Badge -->
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span
                class="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                :class="getCategoryBadgeClass(issue.category)"
              >
                <component :is="getCategoryIcon(issue.category)" class="w-3.5 h-3.5" />
                <span>{{ getCategoryLabel(issue.category) }}</span>
              </span>

              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1"
                :class="getIssueStatusBadgeClass(issue.status)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="getIssueStatusDotClass(issue.status)"></span>
                <span>{{ getIssueStatusLabel(issue.status) }}</span>
              </span>
            </div>

            <!-- Room & Tenant Info -->
            <div class="flex items-center justify-between text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100">
              <div class="flex items-center gap-2 font-bold text-slate-900">
                <DoorClosed class="w-4 h-4 text-indigo-600" />
                <span>ห้อง {{ issue.room?.roomNumber || '-' }} {{ issue.building?.name ? `(${issue.building.name})` : '' }}</span>
              </div>
              <div class="text-slate-500 font-medium flex items-center gap-1">
                <User class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ issue.user ? `${issue.user.firstName} ${issue.user.lastName}` : 'ลูกบ้าน' }}</span>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs text-slate-700 leading-relaxed line-clamp-3 whitespace-pre-line">
              {{ issue.description }}
            </p>

            <!-- Image Thumbnails -->
            <div v-if="getParsedImages(issue.imageUrls).length > 0" class="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
              <img
                v-for="(img, idx) in getParsedImages(issue.imageUrls)"
                :key="idx"
                :src="resolveImageUrl(img)"
                class="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            </div>

            <!-- Admin Reply Preview (if exists) -->
            <div v-if="issue.adminReply" class="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <div class="font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 class="w-3.5 h-3.5 text-indigo-600" />
                <span>ตอบกลับแล้ว:</span>
              </div>
              <p class="text-slate-600 text-[11px] line-clamp-2">{{ issue.adminReply }}</p>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>แจ้งเมื่อ: {{ formatDate(issue.createdAt) }}</span>
            <span class="text-indigo-600 font-bold hover:underline">คลิกเพื่อดูและตอบกลับ ➔</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-12 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-xs">
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <MessageSquareWarning class="w-6 h-6" />
        </div>
        <h3 class="text-sm font-bold text-slate-800">ไม่มีรายการเรื่องร้องเรียนหรือแจ้งเหตุ</h3>
        <p class="text-xs text-slate-400">ยังไม่มีลูกบ้านส่งเรื่องร้องเรียนในหมวดหมู่นี้</p>
      </div>
    </div>

    <!-- ==================== ISSUE DETAIL & ADMIN REPLY MODAL ==================== -->
    <div v-if="selectedIssue" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs" :class="getCategoryBadgeClass(selectedIssue.category)">
              {{ getCategoryLabel(selectedIssue.category) }}
            </span>
            <span class="text-xs text-slate-400 font-mono">
              ห้อง {{ selectedIssue.room?.roomNumber || '-' }}
            </span>
          </div>

          <button @click="selectedIssue = null" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Tenant Information -->
        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-700">
          <div>
            <div class="text-[10px] text-slate-400">ผู้แจ้งเหตุ:</div>
            <div class="font-bold text-slate-900">
              {{ selectedIssue.user ? `${selectedIssue.user.firstName} ${selectedIssue.user.lastName}` : 'ผู้เช่า' }}
            </div>
            <div v-if="selectedIssue.user?.phone" class="text-slate-500 text-[11px] font-mono">
              โทร: {{ selectedIssue.user.phone }}
            </div>
          </div>

          <div class="text-right">
            <div class="text-[10px] text-slate-400">อาคาร & ห้อง:</div>
            <div class="font-bold text-indigo-600 font-mono">
              ห้อง {{ selectedIssue.room?.roomNumber || '-' }} ({{ selectedIssue.building?.name || 'อาคารหลัก' }})
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700">รายละเอียดปัญหาที่แจ้ง:</label>
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
            {{ selectedIssue.description }}
          </div>
        </div>

        <!-- Attached Images -->
        <div v-if="getParsedImages(selectedIssue.imageUrls).length > 0" class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700">รูปภาพประกอบ:</label>
          <div class="grid grid-cols-3 gap-2">
            <a
              v-for="(img, idx) in getParsedImages(selectedIssue.imageUrls)"
              :key="idx"
              :href="resolveImageUrl(img)"
              target="_blank"
              class="aspect-square rounded-2xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity"
            >
              <img :src="resolveImageUrl(img)" class="w-full h-full object-cover" />
            </a>
          </div>
        </div>

        <!-- Admin Reply & Status Form -->
        <form @submit.prevent="handleSaveIssueReply" class="space-y-4 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label class="block font-bold text-slate-800 mb-1">ปรับเปลี่ยนสถานะตั๋ว:</label>
            <select
              v-model="replyForm.status"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-hidden"
            >
              <option value="PENDING">รอรับเรื่อง (Pending)</option>
              <option value="IN_PROGRESS">กำลังดำเนินการตรวจสอบ / ส่งช่าง (In Progress)</option>
              <option value="RESOLVED">แก้ไขเรียบร้อยแล้ว (Resolved)</option>
              <option value="CANCELLED">ยกเลิกเรื่อง (Cancelled)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">ข้อความตอบกลับลูกบ้าน (จะแสดงบน LINE LIFF):</label>
            <textarea
              v-model="replyForm.adminReply"
              rows="3"
              placeholder="พิมพ์ข้อความตอบกลับ เช่น 'เจ้าหน้าที่ได้รับเรื่องแล้ว กำลังประสานงานช่างเข้าตรวจสอบช่วงบ่ายครับ'..."
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-hidden leading-relaxed"
            ></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="selectedIssue = null"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              :disabled="savingReply"
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {{ savingReply ? 'กำลังบันทึก...' : 'บันทึก & ส่งคำตอบกลับ' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ==================== EXISTING MAINTENANCE EDIT MODAL ==================== -->
    <div v-if="selectedItem" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">จัดการงานซ่อม: {{ selectedItem.title }}</h3>
            <p class="text-xs text-slate-400 font-mono">ห้อง {{ selectedItem.room?.roomNumber || 'N/A' }}</p>
          </div>
          <button @click="selectedItem = null" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleEditSubmit" class="space-y-4 text-xs text-slate-700">
          <div>
            <label class="block font-bold text-slate-800 mb-1">สถานะงานซ่อม</label>
            <select
              v-model="editForm.status"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-hidden"
            >
              <option value="pending">รอดำเนินการ (Pending)</option>
              <option value="in_progress">กำลังดำเนินการซ่อม (In Progress)</option>
              <option value="resolved">เสร็จสิ้นแล้ว (Resolved)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">ชื่อช่างผู้รับผิดชอบ</label>
            <input
              v-model="editForm.technicianName"
              type="text"
              placeholder="e.g. ช่างสมชาย, บริษัทแอร์เซอร์วิส"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">ค่าซ่อม / ค่าอุปกรณ์ (บาท)</label>
            <input
              v-model.number="editForm.repairCost"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-emerald-700 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">ข้อความตอบกลับลูกบ้าน (Admin Note)</label>
            <textarea
              v-model="editForm.adminNote"
              rows="3"
              placeholder="ข้อความที่จะส่งแจ้งเตือนไปยัง LINE ลูกบ้าน..."
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden"
            ></textarea>
          </div>

          <div class="flex justify-between items-center pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="handleDelete"
              class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 class="w-4 h-4" />
              <span>ลบรายการ</span>
            </button>

            <div class="flex gap-2">
              <button
                type="button"
                @click="selectedItem = null"
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
              >
                {{ submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ==================== CREATE MAINTENANCE MODAL ==================== -->
    <div v-if="showNewModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">สร้างใบแจ้งซ่อมใหม่ (Manual)</h3>
          <button @click="showNewModal = false" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleCreateSubmit" class="space-y-4 text-xs text-slate-700">
          <div>
            <label class="block font-bold text-slate-800 mb-1">เลือกห้องพัก <span class="text-rose-500">*</span></label>
            <select
              v-model="newForm.roomId"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-hidden"
            >
              <option value="" disabled>-- เลือกห้องพัก --</option>
              <option v-for="room in roomStore.rooms" :key="room.id" :value="room.id">
                ห้อง {{ room.roomNumber }} {{ room.building?.name ? `(${room.building.name})` : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">หัวข้อเรื่องแจ้งซ่อม <span class="text-rose-500">*</span></label>
            <input
              v-model="newForm.title"
              type="text"
              placeholder="e.g. เครื่องปรับอากาศมีเสียงดัง / หลอดไฟห้องน้ำเสีย"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">รายละเอียดเพิ่มเติม <span class="text-rose-500">*</span></label>
            <textarea
              v-model="newForm.description"
              rows="3"
              placeholder="รายละเอียดอาการชำรุด..."
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden"
            ></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">อัปโหลดรูปภาพประกอบ</label>
            <input
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showNewModal = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="submitting || uploading"
              class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
            >
              {{ submitting ? 'กำลังบันทึก...' : 'สร้างตั๋วแจ้งซ่อม' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import {
  Wrench,
  Plus,
  RefreshCw,
  Clock,
  Zap,
  CheckCircle2,
  UserCheck,
  Coins,
  MessageSquare,
  MessageSquareWarning,
  HelpCircle,
  Trash2,
  Edit3,
  Camera,
  DoorClosed,
  User,
  X
} from 'lucide-vue-next';
import { useRoomStore } from '@/stores/useRoomStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';
import maintenanceService from '@/services/maintenanceService';
import api from '@/utils/api';
import { showSuccess, showError, showToast, showConfirm } from '@/utils/swal';

const roomStore = useRoomStore();
const buildingStore = useBuildingStore();

const activeMainTab = ref('maintenance');
const requests = ref([]);
const issueList = ref([]);
const loadingIssues = ref(false);
const uploading = ref(false);
const submitting = ref(false);
const savingReply = ref(false);

const showNewModal = ref(false);
const selectedItem = ref(null);
const selectedIssue = ref(null);

const selectedCategoryFilter = ref('ALL');
const selectedStatusFilter = ref('ALL');

const editForm = reactive({
  id: '',
  status: 'pending',
  technicianName: '',
  repairCost: 0,
  adminNote: ''
});

const replyForm = reactive({
  status: 'PENDING',
  adminReply: ''
});

const newForm = reactive({
  roomId: '',
  title: '',
  description: '',
  imageUrl: ''
});

const pendingList = computed(() => requests.value.filter((r) => r.status === 'pending'));
const inProgressList = computed(() => requests.value.filter((r) => r.status === 'in_progress'));
const resolvedList = computed(() => requests.value.filter((r) => r.status === 'resolved' || r.status === 'completed'));

const pendingIssuesCount = computed(() => {
  return issueList.value.filter((i) => (i.status || '').toUpperCase() === 'PENDING').length;
});

const issueCategoryFilters = computed(() => {
  const allCount = issueList.value.length;
  const complaintCount = issueList.value.filter((i) => (i.category || '').toUpperCase() === 'COMPLAINT').length;
  const repairCount = issueList.value.filter((i) => (i.category || '').toUpperCase() === 'REPAIR').length;
  const otherCount = issueList.value.filter((i) => (i.category || '').toUpperCase() === 'OTHER').length;

  return [
    { value: 'ALL', label: 'ทั้งหมด', count: allCount },
    { value: 'COMPLAINT', label: 'ข้อร้องเรียน (Complaint)', count: complaintCount },
    { value: 'REPAIR', label: 'แจ้งซ่อม (Repair)', count: repairCount },
    { value: 'OTHER', label: 'เรื่องอื่นๆ (Other)', count: otherCount }
  ];
});

const filteredIssues = computed(() => {
  return issueList.value.filter((i) => {
    const matchCat = selectedCategoryFilter.value === 'ALL' || (i.category || '').toUpperCase() === selectedCategoryFilter.value;
    const matchStatus = selectedStatusFilter.value === 'ALL' || (i.status || '').toUpperCase() === selectedStatusFilter.value;
    return matchCat && matchStatus;
  });
});

const getCategoryLabel = (category) => {
  const map = {
    REPAIR: 'แจ้งซ่อมบำรุง',
    COMPLAINT: 'เรื่องร้องเรียน',
    OTHER: 'เรื่องอื่นๆ'
  };
  return map[(category || '').toUpperCase()] || 'เรื่องทั่วไป';
};

const getCategoryIcon = (category) => {
  const cat = (category || '').toUpperCase();
  if (cat === 'REPAIR') return Wrench;
  if (cat === 'COMPLAINT') return MessageSquareWarning;
  return HelpCircle;
};

const getCategoryBadgeClass = (category) => {
  const cat = (category || '').toUpperCase();
  if (cat === 'REPAIR') return 'bg-amber-100 text-amber-800 border border-amber-200';
  if (cat === 'COMPLAINT') return 'bg-rose-100 text-rose-800 border border-rose-200';
  return 'bg-purple-100 text-purple-800 border border-purple-200';
};

const getIssueStatusLabel = (status) => {
  const map = {
    PENDING: 'รอรับเรื่อง',
    IN_PROGRESS: 'กำลังดำเนินการ',
    RESOLVED: 'แก้ไขเรียบร้อย',
    CANCELLED: 'ยกเลิก'
  };
  return map[(status || '').toUpperCase()] || status;
};

const getIssueStatusBadgeClass = (status) => {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'IN_PROGRESS':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'RESOLVED':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getIssueStatusDotClass = (status) => {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'bg-amber-500 animate-pulse';
    case 'IN_PROGRESS':
      return 'bg-blue-500 animate-pulse';
    case 'RESOLVED':
      return 'bg-emerald-500';
    case 'CANCELLED':
      return 'bg-rose-500';
    default:
      return 'bg-slate-400';
  }
};

const getParsedImages = (imageUrls) => {
  if (!imageUrls) return [];
  if (Array.isArray(imageUrls)) return imageUrls;
  try {
    const parsed = JSON.parse(imageUrls);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [imageUrls];
  }
};

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchData = async () => {
  try {
    const data = await maintenanceService.getMaintenanceRequests(buildingStore.activeBuildingId);
    requests.value = data;
  } catch (error) {
    showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายการแจ้งซ่อมได้');
  }
};

const fetchIssues = async () => {
  loadingIssues.value = true;
  try {
    const params = {};
    if (buildingStore.activeBuildingId) {
      params.buildingId = buildingStore.activeBuildingId;
    }
    const res = await api.get('/api/admin/issues', { params });
    issueList.value = res.data?.data || [];
  } catch (error) {
    console.warn('Failed to fetch admin issues:', error);
  } finally {
    loadingIssues.value = false;
  }
};

const handleRefresh = async () => {
  await Promise.allSettled([fetchData(), fetchIssues()]);
  showToast('รีเฟรชข้อมูลเรียบร้อยแล้ว');
};

const openIssueDetailModal = (issue) => {
  selectedIssue.value = issue;
  replyForm.status = (issue.status || 'PENDING').toUpperCase();
  replyForm.adminReply = issue.adminReply || '';
};

const handleSaveIssueReply = async () => {
  if (!selectedIssue.value?.id) return;
  savingReply.value = true;
  try {
    await api.put(`/api/admin/issues/${selectedIssue.value.id}`, {
      status: replyForm.status,
      adminReply: replyForm.adminReply
    });

    showToast('บันทึกคำตอบกลับเรียบร้อยแล้ว');
    selectedIssue.value = null;
    await fetchIssues();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถบันทึกคำตอบกลับได้');
  } finally {
    savingReply.value = false;
  }
};

const openEditModal = (item) => {
  selectedItem.value = item;
  editForm.id = item.id;
  editForm.status = item.status || 'pending';
  editForm.technicianName = item.technicianName || '';
  editForm.repairCost = item.repairCost || 0;
  editForm.adminNote = item.adminNote || '';
};

const handleQuickStatus = async (id, newStatus) => {
  try {
    await maintenanceService.updateMaintenanceRequest(id, { status: newStatus });
    showToast(`อัปเดตสถานะเป็น ${newStatus} แล้ว`);
    fetchData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะด่วนได้');
  }
};

const handleEditSubmit = async () => {
  submitting.value = true;
  try {
    await maintenanceService.updateMaintenanceRequest(editForm.id, {
      status: editForm.status,
      technicianName: editForm.technicianName,
      repairCost: editForm.repairCost,
      adminNote: editForm.adminNote
    });
    showSuccess('สำเร็จ', 'อัปเดตข้อมูลการแจ้งซ่อมเรียบร้อยแล้ว');
    selectedItem.value = null;
    fetchData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
  } finally {
    submitting.value = false;
  }
};

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploading.value = true;
  try {
    const res = await uploadService.uploadFile(file);
    newForm.imageUrl = res.url;
    showToast('อัปโหลดรูปภาพสำเร็จ');
  } catch (error) {
    showError('อัปโหลดล้มเหลว', 'ไม่สามารถอัปโหลดรูปภาพได้');
  } finally {
    uploading.value = false;
  }
};

const handleCreateSubmit = async () => {
  submitting.value = true;
  try {
    await maintenanceService.createMaintenanceRequest({
      roomId: newForm.roomId,
      title: newForm.title,
      description: newForm.description,
      imageUrl: newForm.imageUrl
    });
    showSuccess('สำเร็จ', 'สร้างใบแจ้งซ่อมเรียบร้อยแล้ว');
    showNewModal.value = false;
    newForm.roomId = '';
    newForm.title = '';
    newForm.description = '';
    newForm.imageUrl = '';
    fetchData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างใบแจ้งซ่อมได้');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async () => {
  if (!selectedItem.value) return;
  const isConfirmed = await showConfirm(
    'ยืนยันการลบ',
    'คุณแน่ใจหรือไม่ว่าต้องการลบรายการแจ้งซ่อมนี้ออกจากระบบ?'
  );
  if (isConfirmed) {
    try {
      await maintenanceService.deleteMaintenanceRequest(selectedItem.value.id);
      showSuccess('สำเร็จ', 'ลบรายการแจ้งซ่อมเรียบร้อยแล้ว');
      selectedItem.value = null;
      fetchData();
    } catch (error) {
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถลบรายการได้');
    }
  }
};

onMounted(() => {
  roomStore.fetchRooms();
  fetchData();
  fetchIssues();
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    fetchData();
    fetchIssues();
  }
);
</script>
