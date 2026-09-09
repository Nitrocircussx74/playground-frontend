<template>
  <div class="space-y-6 font-sans">
    <!-- Header & Action Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
      <div class="space-y-1">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Kanban class="w-5 h-5" />
          </div>
          <span>ศูนย์รวมแจ้งซ่อม & ร้องเรียน (Service & Issue Board)</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">
          จัดการงานแจ้งซ่อม มอบหมายช่าง ตรวจสอบข้อร้องเรียน และส่งคำตอบกลับเข้า LINE ลูกบ้านในบอร์ดเดียว
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          @click="showNewModal = true"
          class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>สร้างใบแจ้งซ่อมใหม่</span>
        </button>
        <button
          @click="handleRefresh"
          class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw class="w-3.5 h-3.5 text-slate-500" :class="{ 'animate-spin': loading }" />
          <span>รีเฟรช</span>
        </button>
      </div>
    </div>

    <!-- Filter Pills & Search Bar -->
    <div class="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
        <button
          v-for="cat in categoryFilters"
          :key="cat.value"
          @click="selectedCategory = cat.value"
          class="px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs"
          :class="selectedCategory === cat.value ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60'"
        >
          <component :is="cat.icon" class="w-3.5 h-3.5" :class="cat.iconClass" />
          <span>{{ cat.label }}</span>
          <span
            class="px-1.5 py-0.2 rounded-full text-[10px]"
            :class="selectedCategory === cat.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'"
          >
            {{ cat.count }}
          </span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center px-3.5 py-2 min-w-[240px]">
        <Search class="w-4 h-4 text-slate-400 shrink-0 mr-2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาห้อง, ผู้เช่า, รายละเอียด..."
          class="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
        />
      </div>
    </div>

    <!-- Unified Kanban Board Grid (3 Columns) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      <!-- Column 1: Pending (รอดำเนินการ / รอรับเรื่อง) -->
      <div class="bg-slate-100/80 p-4 rounded-3xl border border-slate-200/80 space-y-3.5 min-h-[550px]">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 class="font-bold text-slate-800 text-sm">รอรับเรื่อง (Pending)</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {{ pendingList.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in pendingList"
            :key="item.uniqueId"
            @click="openDetailModal(item)"
            class="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer space-y-3 group"
          >
            <!-- Card Top: Category Badge + Room Pill -->
            <div class="flex items-center justify-between gap-2">
              <span
                class="px-2 py-0.5 rounded-lg text-[11px] font-bold shadow-2xs flex items-center gap-1"
                :class="getCategoryBadgeClass(item.category)"
              >
                <component :is="getCategoryIcon(item.category)" class="w-3 h-3" />
                <span>{{ getCategoryLabel(item.category) }}</span>
              </span>

              <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-mono flex items-center gap-1">
                <DoorClosed class="w-3 h-3 text-indigo-500" />
                <span>ห้อง {{ item.room?.roomNumber || '-' }} {{ item.building?.name ? `(${item.building.name})` : '' }}</span>
              </span>
            </div>

            <!-- Title & Description -->
            <div>
              <h4 class="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                {{ item.title }}
              </h4>
              <p class="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed whitespace-pre-line">
                {{ item.description }}
              </p>
            </div>

            <!-- Image Thumbnails -->
            <div v-if="item.imageUrls && item.imageUrls.length > 0" class="flex items-center gap-1.5 overflow-x-auto pt-0.5">
              <img
                v-for="(img, idx) in item.imageUrls"
                :key="idx"
                :src="resolveImageUrl(img)"
                class="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            </div>

            <!-- Card Bottom Bar -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span class="flex items-center gap-1 truncate max-w-[130px] text-slate-600">
                <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span class="truncate">{{ getTenantDisplayName(item) }}</span>
              </span>

              <button
                @click.stop="handleQuickStatusChange(item, 'in_progress')"
                class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-all border border-blue-200 flex items-center gap-1 cursor-pointer"
              >
                <Zap class="w-3 h-3" />
                <span>➔ กำลังทำ</span>
              </button>
            </div>
          </div>

          <div v-if="pendingList.length === 0" class="p-8 text-center text-slate-400 text-xs bg-white/60 rounded-2xl border border-dashed border-slate-200">
            ไม่มีรายการรอดำเนินการ 🎉
          </div>
        </div>
      </div>

      <!-- Column 2: In Progress (กำลังดำเนินการ / ส่งช่าง) -->
      <div class="bg-slate-100/80 p-4 rounded-3xl border border-slate-200/80 space-y-3.5 min-h-[550px]">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h3 class="font-bold text-slate-800 text-sm">กำลังดำเนินการ (In Progress)</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {{ inProgressList.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in inProgressList"
            :key="item.uniqueId"
            @click="openDetailModal(item)"
            class="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-3 group"
          >
            <!-- Card Top -->
            <div class="flex items-center justify-between gap-2">
              <span
                class="px-2 py-0.5 rounded-lg text-[11px] font-bold shadow-2xs flex items-center gap-1"
                :class="getCategoryBadgeClass(item.category)"
              >
                <component :is="getCategoryIcon(item.category)" class="w-3 h-3" />
                <span>{{ getCategoryLabel(item.category) }}</span>
              </span>

              <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-mono flex items-center gap-1">
                <DoorClosed class="w-3 h-3 text-indigo-500" />
                <span>ห้อง {{ item.room?.roomNumber || '-' }} {{ item.building?.name ? `(${item.building.name})` : '' }}</span>
              </span>
            </div>

            <!-- Title & Description -->
            <div>
              <h4 class="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                {{ item.title }}
              </h4>
              <p class="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed whitespace-pre-line">
                {{ item.description }}
              </p>
            </div>

            <!-- Technician info or Admin Note Preview -->
            <div v-if="item.technicianName" class="p-2 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 font-medium flex items-center gap-1.5">
              <UserCheck class="w-3.5 h-3.5 text-blue-600" />
              <span>ช่าง: {{ item.technicianName }}</span>
            </div>
            <div v-else-if="item.adminNote" class="p-2 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 line-clamp-2">
              <strong>ตอบแล้ว:</strong> {{ item.adminNote }}
            </div>

            <!-- Card Bottom Bar -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span class="flex items-center gap-1 truncate max-w-[130px] text-slate-600">
                <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span class="truncate">{{ getTenantDisplayName(item) }}</span>
              </span>

              <button
                @click.stop="handleQuickStatusChange(item, 'resolved')"
                class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition-all border border-emerald-200 flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 class="w-3 h-3" />
                <span>➔ เสร็จสิ้น</span>
              </button>
            </div>
          </div>

          <div v-if="inProgressList.length === 0" class="p-8 text-center text-slate-400 text-xs bg-white/60 rounded-2xl border border-dashed border-slate-200">
            ไม่มีรายการที่กำลังดำเนินการ
          </div>
        </div>
      </div>

      <!-- Column 3: Resolved (เสร็จสิ้น / ตอบกลับแล้ว) -->
      <div class="bg-slate-100/80 p-4 rounded-3xl border border-slate-200/80 space-y-3.5 min-h-[550px]">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 class="font-bold text-slate-800 text-sm">เสร็จสิ้นแล้ว (Resolved)</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {{ resolvedList.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in resolvedList"
            :key="item.uniqueId"
            @click="openDetailModal(item)"
            class="p-4.5 bg-white/90 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer space-y-3 group opacity-90 hover:opacity-100"
          >
            <!-- Card Top -->
            <div class="flex items-center justify-between gap-2">
              <span
                class="px-2 py-0.5 rounded-lg text-[11px] font-bold shadow-2xs flex items-center gap-1"
                :class="getCategoryBadgeClass(item.category)"
              >
                <component :is="getCategoryIcon(item.category)" class="w-3 h-3" />
                <span>{{ getCategoryLabel(item.category) }}</span>
              </span>

              <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                <DoorClosed class="w-3 h-3 text-slate-400" />
                <span>ห้อง {{ item.room?.roomNumber || '-' }}</span>
              </span>
            </div>

            <!-- Title & Description -->
            <div>
              <h4 class="font-bold text-slate-800 text-xs sm:text-sm line-through text-slate-400 group-hover:text-emerald-700 transition-colors line-clamp-1">
                {{ item.title }}
              </h4>
              <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {{ item.description }}
              </p>
            </div>

            <!-- Cost / Admin Note -->
            <div v-if="Number(item.repairCost || 0) > 0" class="p-2 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
              <Coins class="w-3.5 h-3.5 text-emerald-600" />
              <span>ค่าซ่อม: ฿{{ Number(item.repairCost).toLocaleString() }}</span>
            </div>
            <div v-else-if="item.adminNote" class="p-2 bg-emerald-50/70 rounded-xl border border-emerald-100 text-[11px] text-emerald-950 line-clamp-2">
              <strong class="text-emerald-800">คำตอบกลับ:</strong> {{ item.adminNote }}
            </div>

            <!-- Card Bottom Bar -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{{ getTenantDisplayName(item) }}</span>
              <span class="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                <span>ปิดเรื่องแล้ว</span>
              </span>
            </div>
          </div>

          <div v-if="resolvedList.length === 0" class="p-8 text-center text-slate-400 text-xs bg-white/60 rounded-2xl border border-dashed border-slate-200">
            ยังไม่มีงานที่เสร็จสิ้น
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== UNIFIED DETAIL & EDIT MODAL ==================== -->
    <div v-if="selectedTicket" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs" :class="getCategoryBadgeClass(selectedTicket.category)">
              {{ getCategoryLabel(selectedTicket.category) }}
            </span>
            <span class="text-xs text-slate-600 font-mono font-bold">
              ห้อง {{ selectedTicket.room?.roomNumber || '-' }} ({{ selectedTicket.building?.name || 'อาคารหลัก' }})
            </span>
          </div>

          <button @click="selectedTicket = null" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Tenant Information -->
        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-700">
          <div>
            <div class="text-[10px] text-slate-400">ผู้แจ้งเรื่อง:</div>
            <div class="font-bold text-slate-900">
              {{ getTenantDisplayName(selectedTicket) }}
            </div>
            <div v-if="selectedTicket.tenant?.phone" class="text-slate-500 text-[11px] font-mono">
              โทร: {{ selectedTicket.tenant.phone }}
            </div>
          </div>

          <div class="text-right">
            <div class="text-[10px] text-slate-400">วันเวลาที่แจ้ง:</div>
            <div class="font-mono text-slate-700 text-[11px]">
              {{ formatDate(selectedTicket.createdAt) }}
            </div>
          </div>
        </div>

        <!-- Description Details -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700">รายละเอียดปัญหา / ข้อร้องเรียน:</label>
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
            {{ selectedTicket.description }}
          </div>
        </div>

        <!-- Attached Images -->
        <div v-if="selectedTicket.imageUrls && selectedTicket.imageUrls.length > 0" class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700">รูปภาพประกอบ (แตะเพื่อดูรูปเต็ม):</label>
          <div class="grid grid-cols-3 gap-2">
            <a
              v-for="(img, idx) in selectedTicket.imageUrls"
              :key="idx"
              :href="resolveImageUrl(img)"
              target="_blank"
              class="aspect-square rounded-2xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity"
            >
              <img :src="resolveImageUrl(img)" class="w-full h-full object-cover" />
            </a>
          </div>
        </div>

        <!-- Edit Form -->
        <form @submit.prevent="handleSaveTicket" class="space-y-4 pt-2 border-t border-slate-100 text-xs text-slate-700">
          <!-- Status Selector -->
          <div>
            <label class="block font-bold text-slate-800 mb-1">ปรับเปลี่ยนสถานะ:</label>
            <select
              v-model="editForm.status"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-hidden"
            >
              <option value="pending">🟡 รอรับเรื่อง (Pending)</option>
              <option value="in_progress">🔵 กำลังดำเนินการตรวจสอบ / ส่งช่าง (In Progress)</option>
              <option value="resolved">🟢 แก้ไขเรียบร้อยแล้ว (Resolved)</option>
            </select>
          </div>

          <!-- Technician & Cost (Optional for Repairs) -->
          <div class="grid grid-cols-2 gap-3" v-if="selectedTicket.category === 'REPAIR'">
            <div>
              <label class="block font-bold text-slate-800 mb-1">ชื่อช่างผู้รับผิดชอบ</label>
              <input
                v-model="editForm.technicianName"
                type="text"
                placeholder="e.g. ช่างสมชาย"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden font-medium"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-800 mb-1">ค่าซ่อม/อุปกรณ์ (บาท)</label>
              <input
                v-model.number="editForm.repairCost"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          <!-- Admin Reply Note -->
          <div>
            <label class="block font-bold text-slate-800 mb-1">ข้อความตอบกลับลูกบ้าน (จะแสดงบน LINE LIFF):</label>
            <textarea
              v-model="editForm.adminNote"
              rows="3"
              placeholder="พิมพ์ข้อความตอบกลับ เช่น 'เจ้าหน้าที่รับเรื่องแล้ว กำลังส่งช่างเข้าตรวจสอบช่วงบ่ายครับ'..."
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-hidden leading-relaxed"
            ></textarea>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              v-if="selectedTicket.sourceType === 'maintenance'"
              type="button"
              @click="handleDelete"
              class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 class="w-4 h-4" />
              <span>ลบรายการ</span>
            </button>
            <div v-else></div>

            <div class="flex gap-2">
              <button
                type="button"
                @click="selectedTicket = null"
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
              >
                {{ submitting ? 'กำลังบันทึก...' : 'บันทึก & ตอบกลับ' }}
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
              class="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
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
  Kanban,
  Wrench,
  Plus,
  RefreshCw,
  Clock,
  Zap,
  CheckCircle2,
  UserCheck,
  Coins,
  MessageSquareWarning,
  HelpCircle,
  Sparkles,
  Trash2,
  Search,
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

const requests = ref([]);
const issueList = ref([]);
const loading = ref(false);
const uploading = ref(false);
const submitting = ref(false);

const showNewModal = ref(false);
const selectedTicket = ref(null);
const selectedCategory = ref('ALL');
const searchQuery = ref('');

const editForm = reactive({
  status: 'pending',
  technicianName: '',
  repairCost: 0,
  adminNote: ''
});

const newForm = reactive({
  roomId: '',
  title: '',
  description: '',
  imageUrl: ''
});

// Helper: Parse images
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

const getTenantDisplayName = (item) => {
  if (item.tenant) {
    return `${item.tenant.firstName || ''} ${item.tenant.lastName || ''}`.trim() || 'ลูกบ้าน';
  }
  return 'ลูกบ้าน';
};

// 1. Unified Tickets List (Merge Maintenance & Issues seamlessly)
const unifiedTickets = computed(() => {
  const list = [];

  // Add Maintenance Requests
  requests.value.forEach((m) => {
    list.push({
      uniqueId: `m_${m.id}`,
      rawId: m.id,
      sourceType: 'maintenance',
      category: 'REPAIR',
      title: m.title || 'รายการแจ้งซ่อมห้องพัก',
      description: m.description || '',
      status: (m.status || 'pending').toLowerCase(),
      room: m.room,
      building: m.room?.building || m.building,
      tenant: m.tenant,
      technicianName: m.technicianName,
      repairCost: m.repairCost,
      adminNote: m.adminNote,
      imageUrls: m.imageUrl || m.photoUrl ? [m.imageUrl || m.photoUrl] : [],
      createdAt: m.createdAt,
      resolvedAt: m.resolvedAt
    });
  });

  // Add Issue Tickets (Complaints, Repairs, Other)
  issueList.value.forEach((iss) => {
    list.push({
      uniqueId: `iss_${iss.id}`,
      rawId: iss.id,
      sourceType: 'issue',
      category: (iss.category || 'OTHER').toUpperCase(),
      title: iss.category === 'COMPLAINT' 
        ? `ข้อร้องเรียนห้อง ${iss.room?.roomNumber || '-'}`
        : (iss.category === 'REPAIR' ? `แจ้งซ่อมห้อง ${iss.room?.roomNumber || '-'}` : `เรื่องอื่นๆ ห้อง ${iss.room?.roomNumber || '-'}`),
      description: iss.description || '',
      status: (iss.status || 'PENDING').toLowerCase(),
      room: iss.room,
      building: iss.building,
      tenant: iss.user,
      technicianName: '',
      repairCost: 0,
      adminNote: iss.adminReply,
      imageUrls: getParsedImages(iss.imageUrls),
      createdAt: iss.createdAt,
      resolvedAt: iss.status === 'RESOLVED' ? iss.updatedAt : null
    });
  });

  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

// Category Filter Count Definitions
const categoryFilters = computed(() => {
  const allCount = unifiedTickets.value.length;
  const repairCount = unifiedTickets.value.filter((i) => i.category === 'REPAIR').length;
  const complaintCount = unifiedTickets.value.filter((i) => i.category === 'COMPLAINT').length;
  const otherCount = unifiedTickets.value.filter((i) => i.category === 'OTHER').length;

  return [
    { value: 'ALL', label: 'ทั้งหมด', count: allCount, icon: Sparkles, iconClass: 'text-indigo-400' },
    { value: 'REPAIR', label: 'แจ้งซ่อมบำรุง', count: repairCount, icon: Wrench, iconClass: 'text-amber-500' },
    { value: 'COMPLAINT', label: 'ข้อร้องเรียน', count: complaintCount, icon: MessageSquareWarning, iconClass: 'text-rose-500' },
    { value: 'OTHER', label: 'เรื่องอื่นๆ', count: otherCount, icon: HelpCircle, iconClass: 'text-purple-500' }
  ];
});

// Filter by Category and Search Query
const filteredTickets = computed(() => {
  return unifiedTickets.value.filter((t) => {
    const matchCategory = selectedCategory.value === 'ALL' || t.category === selectedCategory.value;
    if (!matchCategory) return false;

    if (!searchQuery.value.trim()) return true;
    const q = searchQuery.value.toLowerCase().trim();
    const roomNo = t.room?.roomNumber?.toLowerCase() || '';
    const desc = t.description?.toLowerCase() || '';
    const title = t.title?.toLowerCase() || '';
    const tenantName = `${t.tenant?.firstName || ''} ${t.tenant?.lastName || ''}`.toLowerCase();

    return roomNo.includes(q) || desc.includes(q) || title.includes(q) || tenantName.includes(q);
  });
});

// 3 Kanban Columns from Filtered List
const pendingList = computed(() => filteredTickets.value.filter((t) => t.status === 'pending'));
const inProgressList = computed(() => filteredTickets.value.filter((t) => t.status === 'in_progress'));
const resolvedList = computed(() => filteredTickets.value.filter((t) => ['resolved', 'completed', 'cancelled'].includes(t.status)));

const getCategoryLabel = (category) => {
  const map = {
    REPAIR: 'แจ้งซ่อม',
    COMPLAINT: 'ข้อร้องเรียน',
    OTHER: 'เรื่องอื่นๆ'
  };
  return map[(category || '').toUpperCase()] || 'ทั่วไป';
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

// Data Fetching
const fetchData = async () => {
  loading.value = true;
  try {
    const params = {};
    if (buildingStore.activeBuildingId) {
      params.buildingId = buildingStore.activeBuildingId;
    }

    const [maintenanceData, issuesRes] = await Promise.allSettled([
      maintenanceService.getMaintenanceRequests(buildingStore.activeBuildingId),
      api.get('/api/admin/issues', { params })
    ]);

    if (maintenanceData.status === 'fulfilled') {
      requests.value = maintenanceData.value || [];
    }
    if (issuesRes.status === 'fulfilled') {
      issueList.value = issuesRes.value.data?.data || [];
    }
  } catch (error) {
    console.error('Error fetching unified tickets:', error);
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async () => {
  await fetchData();
  showToast('รีเฟรชข้อมูลบอร์ดเรียบร้อยแล้ว');
};

const openDetailModal = (item) => {
  selectedTicket.value = item;
  editForm.status = item.status || 'pending';
  editForm.technicianName = item.technicianName || '';
  editForm.repairCost = item.repairCost || 0;
  editForm.adminNote = item.adminNote || '';
};

// Quick Status Toggle on Kanban Card
const handleQuickStatusChange = async (item, newStatus) => {
  try {
    if (item.sourceType === 'maintenance') {
      await maintenanceService.updateMaintenanceRequest(item.rawId, { status: newStatus });
    } else {
      await api.put(`/api/admin/issues/${item.rawId}`, { status: newStatus.toUpperCase() });
    }
    showToast(`อัปเดตสถานะเป็น ${newStatus} เรียบร้อยแล้ว`);
    fetchData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะได้');
  }
};

// Save Edit & Reply from Modal
const handleSaveTicket = async () => {
  if (!selectedTicket.value) return;
  submitting.value = true;
  try {
    if (selectedTicket.value.sourceType === 'maintenance') {
      await maintenanceService.updateMaintenanceRequest(selectedTicket.value.rawId, {
        status: editForm.status,
        technicianName: editForm.technicianName,
        repairCost: editForm.repairCost,
        adminNote: editForm.adminNote
      });
    } else {
      await api.put(`/api/admin/issues/${selectedTicket.value.rawId}`, {
        status: editForm.status.toUpperCase(),
        adminReply: editForm.adminNote
      });
    }

    showSuccess('สำเร็จ', 'บันทึกการแก้ไขและส่งข้อความตอบกลับเรียบร้อยแล้ว');
    selectedTicket.value = null;
    fetchData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้');
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
  if (!selectedTicket.value || selectedTicket.value.sourceType !== 'maintenance') return;
  const isConfirmed = await showConfirm(
    'ยืนยันการลบ',
    'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้ออกจากระบบ?'
  );
  if (isConfirmed) {
    try {
      await maintenanceService.deleteMaintenanceRequest(selectedTicket.value.rawId);
      showSuccess('สำเร็จ', 'ลบรายการเรียบร้อยแล้ว');
      selectedTicket.value = null;
      fetchData();
    } catch (error) {
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถลบรายการได้');
    }
  }
};

onMounted(() => {
  roomStore.fetchRooms();
  fetchData();
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    fetchData();
  }
);
</script>
