<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-24">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>⚙️</span>
          <span>ตั้งค่าตึกและอาคาร (Building Settings)</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          กำหนดข้อมูลทั่วไป บัญชีรับเงิน อัตราค่าน้ำ-ไฟ และกฎระเบียบประจำตึก
        </p>
      </div>

      <!-- RBAC Status Badge -->
      <div>
        <span
          v-if="!isReadOnly"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>สิทธิ์สแกนแก้ไข: OWNER / Super Admin</span>
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
        >
          <span>🔒</span>
          <span>สิทธิ์ดูอย่างเดียว: MANAGER / Admin</span>
        </span>
      </div>
    </div>

    <!-- Read-Only Banner Warning for MANAGER -->
    <div
      v-if="isReadOnly"
      class="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-800 text-xs sm:text-sm shadow-2xs"
    >
      <span class="text-lg">🔒</span>
      <div>
        <h4 class="font-bold">โหมดดูได้อย่างเดียว (View-only Mode)</h4>
        <p class="mt-0.5 text-amber-700">
          บัญชีของคุณได้รับสิทธิ์ระดับ MANAGER / Admin สามารถดูตั้งค่าของตึกได้เท่านั้น เฉพาะสิทธิ์ OWNER / Super Admin จึงจะสามารถแก้ไขได้
        </p>
      </div>
    </div>

    <!-- Feedback Alerts -->
    <div v-if="successMessage" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
      <span>✅</span>
      <span>{{ successMessage }}</span>
    </div>
    <div v-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
      <span>❌</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div class="animate-spin inline-block w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full mb-3"></div>
      <p class="text-sm font-semibold">กำลังโหลดข้อมูลการตั้งค่าตึก...</p>
    </div>

    <!-- Main Settings Form & Shadcn Tabs -->
    <div v-else>
      <Tabs v-model="activeTab" class="w-full">
        <!-- Tab List Headers -->
        <TabsList class="w-full justify-start overflow-x-auto bg-slate-200/60 p-1.5 rounded-2xl">
          <TabsTrigger value="general" class="flex items-center gap-2">
            <span>🏢</span>
            <span>ข้อมูลทั่วไป</span>
          </TabsTrigger>
          <TabsTrigger value="payment" class="flex items-center gap-2">
            <span>💰</span>
            <span>การชำระเงิน & QR Code</span>
          </TabsTrigger>
          <TabsTrigger value="billing" class="flex items-center gap-2">
            <span>⚡</span>
            <span>ค่าบริการและรอบบิล</span>
          </TabsTrigger>
          <TabsTrigger value="rules" class="flex items-center gap-2">
            <span>📝</span>
            <span>กฎระเบียบ</span>
          </TabsTrigger>
          <TabsTrigger value="line" class="flex items-center gap-2">
            <span class="text-emerald-500">💬</span>
            <span>LINE Official Account</span>
          </TabsTrigger>
        </TabsList>

        <!-- 🏢 Tab 1: ข้อมูลทั่วไป (General Info) -->
        <TabsContent value="general">
          <Card class="border-slate-200 shadow-xs rounded-2xl">
            <CardHeader>
              <CardTitle class="text-base sm:text-lg flex items-center gap-2">
                <span>🏢</span>
                <span>ข้อมูลทั่วไปของตึก (General Information)</span>
              </CardTitle>
              <CardDescription>
                ชื่อ ที่อยู่ เบอร์โทรศัพท์ติดต่อ และรูปภาพหน้าปกประจำตึก
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">ชื่ออาคาร/ตึก <span class="text-rose-500">*</span></label>
                  <Input
                    v-model="form.name"
                    :disabled="isReadOnly"
                    placeholder="เช่น อาคาร A (Main Building)"
                    class="bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">เบอร์โทรศัพท์ติดต่อ</label>
                  <Input
                    v-model="form.phone"
                    :disabled="isReadOnly"
                    placeholder="เช่น 02-123-4567 หรือ 081-234-5678"
                    class="bg-white font-mono"
                  />
                  <div v-if="phoneValidation.message" class="text-[11px] font-medium flex items-center gap-1" :class="phoneValidation.isValid ? 'text-emerald-600' : 'text-amber-600'">
                    <span>{{ phoneValidation.icon }}</span>
                    <span>{{ phoneValidation.message }}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700">ที่อยู่หรือสถานที่ตั้ง</label>
                <Input
                  v-model="form.address"
                  :disabled="isReadOnly"
                  placeholder="เช่น 123/1 ถนนสุขุมวิท เขตวัฒนา กรุงเทพมหานคร"
                  class="bg-white"
                />
              </div>

              <!-- 🎨 LIFF App Dynamic Theming & Branding Section -->
              <div class="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎨</span>
                    <span>ธีมสีและโลโก้ประจำตึก (LIFF App Dynamic Branding)</span>
                  </h4>
                  <p class="text-[11px] text-slate-500 mt-0.5">
                    กำหนดธีมสีและโลโก้ที่ลูกบ้านในตึกนี้จะเห็นเมื่อเปิด LINE LIFF App
                  </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Theme Color Picker & Presets -->
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-700 block">ธีมสีหลักประจำตึก (Theme Color)</label>
                    <div class="flex items-center gap-3">
                      <input
                        type="color"
                        v-model="form.themeColor"
                        :disabled="isReadOnly"
                        class="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white shrink-0"
                      />
                      <Input
                        v-model="form.themeColor"
                        :disabled="isReadOnly"
                        placeholder="#0E7490"
                        class="bg-white font-mono uppercase text-xs"
                      />
                    </div>

                    <!-- Quick Preset Palette Chips -->
                    <div class="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        v-for="color in presetColors"
                        :key="color.hex"
                        type="button"
                        @click="form.themeColor = color.hex"
                        :disabled="isReadOnly"
                        class="px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer"
                        :class="form.themeColor?.toLowerCase() === color.hex.toLowerCase() ? 'ring-2 ring-cyan-600 border-transparent shadow-xs bg-cyan-50 text-cyan-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'"
                      >
                        <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: color.hex }"></span>
                        <span>{{ color.name }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Building Logo Upload & Preview -->
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-700 block">โลโก้ประจำตึก (Building Logo)</label>
                    <div class="flex items-start gap-4">
                      <!-- Logo preview box / avatar -->
                      <div class="relative group shrink-0">
                        <div class="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shadow-2xs">
                          <img
                            v-if="form.logoUrl"
                            :src="form.logoUrl"
                            alt="Building Logo"
                            class="w-full h-full object-contain p-1"
                          />
                          <span v-else class="text-2xl text-slate-400">🏢</span>
                        </div>
                        <button
                          v-if="form.logoUrl && !isReadOnly"
                          type="button"
                          @click="form.logoUrl = ''"
                          class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs cursor-pointer"
                          title="ลบรูปโลโก้"
                        >
                          ✕
                        </button>
                      </div>

                      <div class="flex-1 space-y-2">
                        <div class="flex flex-wrap items-center gap-2">
                          <label
                            v-if="!isReadOnly"
                            class="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-bold rounded-xl transition-all shadow-2xs hover:shadow-xs"
                            :class="{ 'opacity-50 pointer-events-none': isUploadingLogo }"
                          >
                            <span v-if="isUploadingLogo" class="animate-spin w-3.5 h-3.5 border-2 border-cyan-600 border-t-transparent rounded-full"></span>
                            <span v-else>📷</span>
                            <span>{{ isUploadingLogo ? 'กำลังอัปโหลด...' : (form.logoUrl ? 'เปลี่ยนรูปโลโก้' : 'อัปโหลดรูปโลโก้') }}</span>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              class="hidden"
                              @change="handleLogoUpload"
                              :disabled="isUploadingLogo"
                            />
                          </label>

                          <button
                            v-if="form.logoUrl && !isReadOnly"
                            type="button"
                            @click="form.logoUrl = ''"
                            class="px-2.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                          >
                            ลบรูป
                          </button>
                        </div>
                        <p class="text-[11px] text-slate-400 leading-tight">รองรับไฟล์ JPG, PNG, WebP (ขนาดไม่เกิน 5MB) จะแสดงบนแถบหัว LIFF</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Live LIFF App Header Preview -->
                <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2">
                  <div class="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <span>📱</span>
                    <span>ตัวอย่างการแสดงผลบน LINE LIFF App ของลูกบ้านตึกนี้ (Live Preview):</span>
                  </div>
                  <div
                    class="p-4 rounded-2xl text-white shadow-md relative overflow-hidden transition-all duration-300"
                    :style="{
                      background: `linear-gradient(135deg, ${form.themeColor || '#0E7490'}, ${adjustBrightness(form.themeColor || '#0E7490', -25)})`,
                      boxShadow: `0 10px 15px -3px ${form.themeColor || '#0E7490'}40`
                    }"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <img
                          v-if="form.logoUrl"
                          :src="form.logoUrl"
                          alt="Logo Preview"
                          class="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-white/40 shadow-xs"
                        />
                        <div v-else class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                          🏢
                        </div>
                        <div>
                          <div class="font-extrabold text-sm">{{ form.name || 'ชื่ออาคาร/ตึก' }}</div>
                          <div class="text-[10px] opacity-80">ธีมสีที่ลูกบ้านจะมองเห็นบนหน้าแรกและบิลค่าเช่า</div>
                        </div>
                      </div>
                      <span class="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold border border-white/30">
                        ห้อง 101
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cover Image Upload & Preview -->
              <div class="space-y-2 pt-2 border-t border-slate-100">
                <label class="text-xs font-bold text-slate-700 block">รูปภาพหน้าปกตึก (Building Cover Image)</label>
                
                <div v-if="form.coverImageUrl" class="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                  <img
                    :src="form.coverImageUrl"
                    alt="Building Cover Preview"
                    class="w-full h-48 sm:h-56 object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-90"></div>
                  <div class="absolute bottom-3 right-3 flex items-center gap-2">
                    <label
                      v-if="!isReadOnly"
                      class="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md text-xs font-bold rounded-xl shadow-md transition-all"
                      :class="{ 'opacity-50 pointer-events-none': isUploadingCover }"
                    >
                      <span v-if="isUploadingCover" class="animate-spin w-3 h-3 border-2 border-cyan-600 border-t-transparent rounded-full"></span>
                      <span v-else>📷</span>
                      <span>{{ isUploadingCover ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปหน้าปก' }}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        class="hidden"
                        @change="handleCoverUpload"
                        :disabled="isUploadingCover"
                      />
                    </label>

                    <button
                      v-if="!isReadOnly"
                      type="button"
                      @click="form.coverImageUrl = ''"
                      class="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-white backdrop-blur-md text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      ลบรูปหน้าปก
                    </button>
                  </div>
                </div>

                <!-- Dropzone / Empty State for Cover Image -->
                <div
                  v-else
                  class="p-6 border-2 border-dashed border-slate-200 hover:border-cyan-300 rounded-2xl bg-slate-50/50 hover:bg-cyan-50/20 text-center transition-all"
                >
                  <div class="max-w-xs mx-auto space-y-3">
                    <div class="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center text-xl mx-auto shadow-2xs">
                      🖼️
                    </div>
                    <div>
                      <p class="text-xs font-bold text-slate-700">อัปโหลดรูปภาพหน้าปกตึก</p>
                      <p class="text-[11px] text-slate-400 mt-0.5">ไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 5MB</p>
                    </div>
                    <label
                      v-if="!isReadOnly"
                      class="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-cyan-600/20"
                      :class="{ 'opacity-50 pointer-events-none': isUploadingCover }"
                    >
                      <span v-if="isUploadingCover" class="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                      <span v-else>📷</span>
                      <span>{{ isUploadingCover ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพหน้าปก' }}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        class="hidden"
                        @change="handleCoverUpload"
                        :disabled="isUploadingCover"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- 💰 Tab 2: การชำระเงิน (Payment Options & Real QR Code) -->
        <TabsContent value="payment">
          <Card class="border-slate-200 shadow-xs rounded-2xl">
            <CardHeader>
              <CardTitle class="text-base sm:text-lg flex items-center gap-2">
                <span>💰</span>
                <span>ช่องทางชำระเงินและพร้อมเพย์ (Payment Options)</span>
              </CardTitle>
              <CardDescription>
                กำหนด PromptPay QR Code บัญชีธนาคารรับโอนเงิน และคำอธิบายการชำระเงิน
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">หมายเลข PromptPay <span class="text-rose-500">*</span></label>
                  <Input
                    v-model="form.promptpayNum"
                    :disabled="isReadOnly"
                    placeholder="เช่น 0812345678 หรือ เลขประจำตัวผู้เสียภาษี 13 หลัก"
                    class="bg-white font-mono font-semibold"
                  />
                  <!-- Real-time PromptPay Validation Badge -->
                  <div v-if="promptPayValidation.message" class="text-[11px] font-medium flex items-center gap-1.5" :class="promptPayValidation.isValid ? 'text-emerald-600' : 'text-rose-500'">
                    <span>{{ promptPayValidation.icon }}</span>
                    <span>{{ promptPayValidation.message }}</span>
                    <span v-if="promptPayValidation.formatted" class="text-slate-500 font-mono font-semibold">({{ promptPayValidation.formatted }})</span>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>ชื่อธนาคารผู้รับโอน</span>
                    <span v-if="activeBankObj" class="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1" :style="{ backgroundColor: activeBankObj.bgColor, color: activeBankObj.textColor }">
                      <span>{{ activeBankObj.icon }}</span>
                      <span>{{ activeBankObj.code }}</span>
                    </span>
                  </label>
                  <select
                    v-model="selectedBankCode"
                    :disabled="isReadOnly"
                    class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-600 disabled:bg-slate-100 disabled:text-slate-500 font-sans cursor-pointer transition-all"
                  >
                    <option value="" disabled>-- เลือกธนาคารผู้รับโอน (Official Thai Banks) --</option>
                    <option
                      v-for="bank in THAI_BANKS"
                      :key="bank.code"
                      :value="bank.code"
                    >
                      {{ bank.icon }} {{ bank.officialName }}
                    </option>
                  </select>
                  
                  <!-- Custom Bank Input if 'OTHER' selected -->
                  <div v-if="selectedBankCode === 'OTHER'" class="pt-1.5">
                    <Input
                      :value="form.bankName"
                      @input="onCustomBankInput"
                      :disabled="isReadOnly"
                      placeholder="ระบุชื่อธนาคารหรือสถาบันการเงินเอง..."
                      class="bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">ชื่อบัญชีธนาคาร</label>
                  <Input
                    v-model="form.bankAccountName"
                    :disabled="isReadOnly"
                    placeholder="เช่น บริษัท หอพักสุขสบาย จำกัด หรือ นายสมชาย ใจดี"
                    class="bg-white"
                  />
                  <p class="text-[11px] text-slate-400">ชื่อเจ้าของบัญชีสำหรับให้ผู้เช่าตรวจสอบชื่อก่อนกดยืนยันโอนเงิน</p>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">เลขที่บัญชีธนาคาร</label>
                  <Input
                    v-model="form.bankAccountNo"
                    :disabled="isReadOnly"
                    placeholder="เช่น 123-4-56789-0 (10-12 หลัก)"
                    class="bg-white font-mono"
                  />
                  <div v-if="bankAccountValidation.message" class="text-[11px] font-medium flex items-center gap-1" :class="bankAccountValidation.isValid ? 'text-emerald-600' : 'text-amber-600'">
                    <span>{{ bankAccountValidation.icon }}</span>
                    <span>{{ bankAccountValidation.message }}</span>
                  </div>
                </div>
              </div>

              <!-- PromptPay QR Code Control Bar -->
              <div class="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label class="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>📱 รูปภาพ PromptPay QR Code ประจำตึก</span>
                  <span class="text-[11px] text-cyan-700 font-semibold">อัปโหลดรูปภาพ หรือสร้าง QR Code อัตโนมัติ</span>
                </label>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    v-model="form.paymentQrUrl"
                    :disabled="isReadOnly"
                    placeholder="https://example.com/qr.png หรือ Data URL"
                    class="bg-white flex-1 font-mono text-xs"
                  />

                  <label
                    v-if="!isReadOnly"
                    class="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shrink-0 transition-colors"
                  >
                    <span>📷</span>
                    <span>{{ isUploadingQr ? 'กำลังอัปโหลด...' : 'อัปโหลดรูป QR' }}</span>
                    <input type="file" accept="image/png, image/jpeg, image/jpg" class="hidden" @change="handleQrUpload" :disabled="isUploadingQr" />
                  </label>

                  <Button
                    v-if="!isReadOnly"
                    type="button"
                    @click="generatePromptPayQr"
                    :disabled="isGeneratingQr || !form.promptpayNum"
                    variant="outline"
                    class="text-xs font-bold border-cyan-300 text-cyan-700 hover:bg-cyan-100 shrink-0 shadow-2xs"
                  >
                    <span>⚡</span>
                    <span>{{ isGeneratingQr ? 'กำลังสร้าง...' : 'สร้าง QR อัตโนมัติ' }}</span>
                  </Button>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700">คำอธิบาย/หมายเหตุการชำระเงิน</label>
                <textarea
                  v-model="form.paymentNote"
                  :disabled="isReadOnly"
                  rows="3"
                  placeholder="เช่น ชำระเงินภายในวันที่ 5 ของทุกเดือน ชำระแล้วกรุณาแนบสลิปผ่านทางระบบ LIFF"
                  class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-600 disabled:bg-slate-100 disabled:text-slate-500"
                ></textarea>
              </div>

              <!-- 📲 Authentic PromptPay QR Code Preview Box -->
              <div class="mt-4 p-6 bg-slate-900 text-white rounded-3xl shadow-lg border border-slate-800 text-center space-y-4 max-w-sm mx-auto">
                <div class="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full border border-cyan-500/30">
                  <span>📲 PromptPay QR Code ประจำตึก</span>
                </div>

                <div class="p-3 bg-white rounded-2xl border border-slate-200 inline-block shadow-inner">
                  <img
                    :src="displayQrUrl"
                    alt="PromptPay QR Code Preview"
                    class="w-56 h-56 object-contain mx-auto rounded-lg"
                  />
                </div>

                <div class="text-xs space-y-1 text-slate-300">
                  <div>หมายเลขพร้อมเพย์: <span class="font-bold text-emerald-400 font-mono text-sm">{{ form.promptpayNum || 'ยังไม่ได้ระบุ' }}</span></div>
                  <div v-if="form.bankAccountName" class="text-[11px] text-slate-400">ชื่อบัญชี: {{ form.bankAccountName }}</div>
                  <div v-if="form.bankName" class="text-[11px] text-slate-400">ธนาคาร: {{ form.bankName }} ({{ form.bankAccountNo }})</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- ⚡ Tab 3: ค่าบริการและรอบบิล (Billing & Utilities) -->
        <TabsContent value="billing">
          <Card class="border-slate-200 shadow-xs rounded-2xl">
            <CardHeader>
              <CardTitle class="text-base sm:text-lg flex items-center gap-2">
                <span>⚡</span>
                <span>อัตราค่าบริการและรอบบิล (Billing & Utility Rates)</span>
              </CardTitle>
              <CardDescription>
                กำหนดอัตราค่าน้ำ ค่าไฟ วันครบกำหนดชำระ และนโยบายค่าปรับกรณีชำระล่าช้า
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- 1. Utility Rates & Due Date -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">อัตราค่าน้ำ (บาท / หน่วย)</label>
                  <Input
                    type="number"
                    step="0.5"
                    v-model="form.waterRate"
                    :disabled="isReadOnly"
                    placeholder="18.00"
                    class="bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">อัตราค่าไฟ (บาท / หน่วย)</label>
                  <Input
                    type="number"
                    step="0.5"
                    v-model="form.electricRate"
                    :disabled="isReadOnly"
                    placeholder="7.00"
                    class="bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">วันกำหนดชำระเงินของเดือน (1 - 31)</label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    v-model="form.dueDateDay"
                    :disabled="isReadOnly"
                    placeholder="5"
                    class="bg-white font-mono"
                  />
                  <div class="text-[11px] font-medium flex items-center gap-1" :class="dueDateValidation.isValid ? 'text-slate-500' : 'text-rose-500'">
                    <span>{{ dueDateValidation.icon }}</span>
                    <span>{{ dueDateValidation.message }}</span>
                  </div>
                </div>
              </div>

              <!-- 2. Late Fee Policy Section (นโยบายค่าปรับชำระล่าช้า) -->
              <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <h3 class="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>⚖️</span>
                      <span>นโยบายค่าปรับชำระล่าช้า (Late Fee Policy)</span>
                    </h3>
                    <p class="text-[11px] text-slate-500">
                      ระบบจะประมวลผลคำนวณค่าปรับอัตโนมัติทุกวันเวลาเที่ยงคืน (00:00 น.) เข้าสู่บิลของลูกบ้าน
                    </p>
                  </div>
                  <span
                    class="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                    :class="{
                      'bg-emerald-100 text-emerald-800 border-emerald-300': form.lateFeeType === 'NONE',
                      'bg-teal-100 text-teal-800 border-teal-300': form.lateFeeType === 'DAILY',
                      'bg-amber-100 text-amber-800 border-amber-300': form.lateFeeType === 'FLAT'
                    }"
                  >
                    {{ form.lateFeeType === 'NONE' ? 'ไม่มีค่าปรับ' : (form.lateFeeType === 'DAILY' ? 'คิดปรับรายวัน' : 'เหมาจ่ายครั้งเดียว') }}
                  </span>
                </div>

                <!-- Radio Group: Late Fee Type Selection -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <!-- Option 1: NONE -->
                  <label
                    class="p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none"
                    :class="form.lateFeeType === 'NONE' ? 'bg-white border-cyan-500 ring-2 ring-cyan-100 shadow-xs' : 'bg-white/60 border-slate-200 hover:bg-white'"
                  >
                    <input
                      type="radio"
                      v-model="form.lateFeeType"
                      value="NONE"
                      :disabled="isReadOnly"
                      class="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div>
                      <div class="text-xs font-bold text-slate-800">ไม่มีค่าปรับ (None)</div>
                      <div class="text-[11px] text-slate-400 mt-0.5">ไม่คิดค่าปรับเพิ่มเมื่อชำระเกินกำหนด</div>
                    </div>
                  </label>

                  <!-- Option 2: DAILY -->
                  <label
                    class="p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none"
                    :class="form.lateFeeType === 'DAILY' ? 'bg-white border-cyan-500 ring-2 ring-cyan-100 shadow-xs' : 'bg-white/60 border-slate-200 hover:bg-white'"
                  >
                    <input
                      type="radio"
                      v-model="form.lateFeeType"
                      value="DAILY"
                      :disabled="isReadOnly"
                      class="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div>
                      <div class="text-xs font-bold text-slate-800">คิดรายวัน (Daily Fee)</div>
                      <div class="text-[11px] text-slate-400 mt-0.5">คำนวณตามจำนวนวันที่เกินกำหนด x ยอดปรับ</div>
                    </div>
                  </label>

                  <!-- Option 3: FLAT -->
                  <label
                    class="p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none"
                    :class="form.lateFeeType === 'FLAT' ? 'bg-white border-cyan-500 ring-2 ring-cyan-100 shadow-xs' : 'bg-white/60 border-slate-200 hover:bg-white'"
                  >
                    <input
                      type="radio"
                      v-model="form.lateFeeType"
                      value="FLAT"
                      :disabled="isReadOnly"
                      class="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div>
                      <div class="text-xs font-bold text-slate-800">เหมาจ่ายครั้งเดียว (Flat Fee)</div>
                      <div class="text-[11px] text-slate-400 mt-0.5">คิดค่าปรับก้อนเดียวคงที่เมื่อเกินกำหนด</div>
                    </div>
                  </label>
                </div>

                <!-- Parameters (Amount & Grace Period) -->
                <div v-if="form.lateFeeType !== 'NONE'" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80 animate-in fade-in duration-200">
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-slate-700">
                      {{ form.lateFeeType === 'DAILY' ? 'จำนวนเงินค่าปรับ (บาท / วัน)' : 'จำนวนเงินค่าปรับ (บาท / บิล)' }}
                      <span class="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="10"
                      min="0"
                      v-model="form.lateFeeAmount"
                      :disabled="isReadOnly"
                      placeholder="เช่น 50.00"
                      class="bg-white font-mono"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-slate-700">
                      ระยะเวลาผ่อนผัน (Grace Period - วัน)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      v-model="form.gracePeriodDays"
                      :disabled="isReadOnly"
                      placeholder="0"
                      class="bg-white font-mono"
                    />
                    <span class="text-[11px] text-slate-500">
                      ใส่ 0 หากต้องการเริ่มคิดทันทีหลังวันครบกำหนด หรือใส่ 3 เพื่อผ่อนผันให้ 3 วัน
                    </span>
                  </div>
                </div>

                <!-- Live Simulation Preview Box -->
                <div v-if="form.lateFeeType !== 'NONE'" class="p-3.5 bg-cyan-50/70 border border-cyan-100 rounded-xl text-xs text-cyan-900 space-y-1">
                  <div class="font-bold flex items-center gap-1.5">
                    <span>💡 ตัวอย่างการคำนวณจริง:</span>
                  </div>
                  <div class="text-[11px] text-cyan-800 leading-relaxed">
                    หากบิลครบกำหนดชำระวันที่ <strong>{{ form.dueDateDay || 5 }}</strong>
                    <span v-if="Number(form.gracePeriodDays) > 0"> (ผ่อนผันให้ <strong>{{ form.gracePeriodDays }}</strong> วัน ถึงวันที่ <strong>{{ (Number(form.dueDateDay) || 5) + Number(form.gracePeriodDays) }}</strong>)</span>
                    และลูกบ้านมาชำระช้ากว่ากำหนด <strong>5 วัน</strong>:
                    <br />
                    ➔ บิลจะถูกคิดค่าปรับอัตโนมัติเท่ากับ
                    <strong class="text-rose-600 font-mono text-xs">
                      ฿{{ form.lateFeeType === 'FLAT' 
                        ? Number(form.lateFeeAmount || 0).toLocaleString() 
                        : (Math.max(0, 5 - Number(form.gracePeriodDays || 0)) * Number(form.lateFeeAmount || 0)).toLocaleString() 
                      }}
                    </strong>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- 📝 Tab 4: กฎระเบียบ (Rules & Contracts) -->
        <TabsContent value="rules">
          <Card class="border-slate-200 shadow-xs rounded-2xl">
            <CardHeader>
              <CardTitle class="text-base sm:text-lg flex items-center gap-2">
                <span>📝</span>
                <span>กฎระเบียบและสัญญาเช่า (Rules & Contracts)</span>
              </CardTitle>
              <CardDescription>
                กำหนดเงินมัดจำ ค่าเช่าล่วงหน้า และเงื่อนไขข้อตกลงสัญญาเช่าประจำตึก
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">เงินมัดจำ/ประกัน (จำนวนเดือน)</label>
                  <Input
                    type="number"
                    min="0"
                    v-model="form.depositMonths"
                    :disabled="isReadOnly"
                    placeholder="2"
                    class="bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">ค่าเช่าล่วงหน้า (จำนวนเดือน)</label>
                  <Input
                    type="number"
                    min="0"
                    v-model="form.advanceMonths"
                    :disabled="isReadOnly"
                    placeholder="1"
                    class="bg-white"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700">กฎระเบียบและข้อตกลงสัญญาเช่า (Terms & Conditions)</label>
                <textarea
                  v-model="form.termsAndConditions"
                  :disabled="isReadOnly"
                  rows="6"
                  placeholder="1. ห้ามส่งเสียงดังหลังเวลา 22:00 น.&#10;2. ห้ามเลี้ยงสัตว์เลี้ยงทุกชนิด&#10;3. ห้ามสูบบุหรี่ภายในห้องพักและระเบียง"
                  class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-600 disabled:bg-slate-100 disabled:text-slate-500 font-sans"
                ></textarea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- 💬 Tab 5: LINE Official Account & LIFF (การตั้งค่า LINE OA ประจำตึก) -->
        <!-- 💬 Tab 5: LINE Official Account & LIFF -->
        <TabsContent value="line" class="space-y-6">
          <!-- LINE Messaging Quota Monitor Card -->
          <LineQuotaCard ref="lineQuotaCardRef" :building-id="buildingStore.activeBuildingId" />

          <Card class="border-slate-200 shadow-xs rounded-2xl">
            <CardHeader class="border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle class="text-base sm:text-lg flex items-center gap-2 text-slate-900">
                    <span class="text-emerald-600">💬</span>
                    <span>การตั้งค่า LINE Official Account & LIFF ประจำตึก</span>
                  </CardTitle>
                  <CardDescription>
                    กำหนด Channel Access Token, Secret และ LIFF ID เฉพาะของตึกนี้ เพื่อส่งข้อความแจ้งเตือนบิล/พัสดุ และเปิด Web App แยกตาม LINE OA รายสาขา
                  </CardDescription>
                </div>
                <div class="shrink-0">
                  <span
                    v-if="form.lineChannelAccessToken || form.lineOaId"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                  >
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>ใช้งาน LINE OA ประจำตึกนี้</span>
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    <span>🌐</span>
                    <span>ใช้การตั้งค่าส่วนกลาง (.env)</span>
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-6 pt-6">
              <!-- Info Callout Banner -->
              <div class="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 space-y-2">
                <div class="font-bold flex items-center gap-2 text-emerald-800 text-sm">
                  <span>💡</span>
                  <span>คำแนะนำการเชื่อมต่อ LINE Official Account แบบแยกรายตึก</span>
                </div>
                <p class="leading-relaxed text-emerald-900/90 text-xs">
                  หากตึกนี้มี LINE Official Account เป็นของตัวเอง ให้กรอกข้อมูลจาก <strong>LINE Developers Console</strong> ด้านล่าง 
                  ระบบจะใช้ Token และ LIFF ID นี้ในการส่งแจ้งเตือนบิล ใบเสร็จ และพัสดุไปยังลูกบ้านของตึกนี้โดยตรง 
                  (หากเว้นว่างไว้ ระบบจะใช้ค่าเริ่มต้นจาก Environment Variables ของระบบส่วนกลางโดยอัตโนมัติ)
                </p>
              </div>

              <!-- General LINE OA Information -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>LINE OA Basic ID / Account Name</span>
                    <span class="text-[10px] font-normal text-slate-400">เช่น @horhub_a</span>
                  </label>
                  <Input
                    v-model="form.lineOaId"
                    :disabled="isReadOnly"
                    placeholder="เช่น @horhub_building_a"
                    class="bg-white font-mono text-xs"
                  />
                  <div v-if="lineSettingsValidation.oaError" class="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{{ lineSettingsValidation.oaError }}</span>
                  </div>
                  <p v-else class="text-[11px] text-slate-400">ID บัญชี LINE OA สำหรับแสดงและค้นหา</p>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>ลิงก์กดเพิ่มเพื่อน (LINE Add Friend URL)</span>
                    <span class="text-[10px] font-normal text-slate-400">https://lin.ee/...</span>
                  </label>
                  <Input
                    v-model="form.lineAddFriendUrl"
                    :disabled="isReadOnly"
                    placeholder="เช่น https://line.me/R/ti/p/@horhub_a หรือ https://lin.ee/xxxxx"
                    class="bg-white text-xs"
                  />
                  <p class="text-[11px] text-slate-400">สำหรับสร้างปุ่มกดเพิ่มเพื่อนในหน้าต้อนรับลูกบ้านใหม่</p>
                </div>
              </div>

              <!-- Messaging API & Security Credentials Section -->
              <div class="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-4">
                <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔐</span>
                  <span>ข้อมูลความปลอดภัยและการเชื่อมต่อ (Messaging API & LIFF)</span>
                </h4>

                <!-- 1. LIFF ID -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>LINE LIFF ID ประจำตึก</span>
                    <span class="text-[10px] font-normal text-slate-400">LIFF App ID</span>
                  </label>
                  <Input
                    v-model="form.lineLiffId"
                    :disabled="isReadOnly"
                    placeholder="เช่น 2011289517-SB8YziXL"
                    class="bg-white font-mono text-xs"
                  />
                  <div v-if="lineSettingsValidation.liffError" class="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{{ lineSettingsValidation.liffError }}</span>
                  </div>
                  <p v-else class="text-[11px] text-slate-400">รหัส LIFF ID สำหรับเปิด Web App ของตึกนี้ผ่านห้องแชต LINE</p>
                </div>

                <!-- 2. Channel Secret -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Channel Secret</span>
                    <button
                      type="button"
                      @click="showSecret = !showSecret"
                      class="text-[11px] text-cyan-600 hover:text-cyan-800 font-semibold cursor-pointer"
                    >
                      {{ showSecret ? 'ซ่อน' : 'แสดง' }}
                    </button>
                  </label>
                  <Input
                    :type="showSecret ? 'text' : 'password'"
                    v-model="form.lineChannelSecret"
                    :disabled="isReadOnly"
                    placeholder="กรอก Channel Secret (32 ตัวอักษร)"
                    class="bg-white font-mono text-xs"
                  />
                  <div v-if="lineSettingsValidation.secretError" class="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{{ lineSettingsValidation.secretError }}</span>
                  </div>
                  <p v-else class="text-[11px] text-slate-400">ใช้สำหรับตรวจสอบ Signature ความปลอดภัยของ Webhook</p>
                </div>

                <!-- 3. Channel Access Token (Long-Lived) -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Messaging API Channel Access Token (Long-Lived)</span>
                    <button
                      type="button"
                      @click="showToken = !showToken"
                      class="text-[11px] text-cyan-600 hover:text-cyan-800 font-semibold cursor-pointer"
                    >
                      {{ showToken ? 'ซ่อน' : 'แสดง' }}
                    </button>
                  </label>
                  <textarea
                    v-model="form.lineChannelAccessToken"
                    :disabled="isReadOnly"
                    :rows="showToken ? 3 : 2"
                    :class="{ 'font-sans blur-xs select-none': !showToken }"
                    placeholder="กรอก Channel Access Token (v2.1) ที่ออกให้จาก LINE Developers Console..."
                    class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-600 disabled:bg-slate-100 disabled:text-slate-500 font-mono transition-all"
                  ></textarea>
                  <p class="text-[11px] text-slate-400">ใช้สำหรับสั่ง Push Flex Message แจ้งเตือนค่าน้ำ-ไฟ บิลชำระเงิน และพัสดุเข้าห้องพัก</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- LINE Notification Delivery History Logs -->
          <DeliveryLogsTab :building-id="buildingStore.activeBuildingId" />
        </TabsContent>
      </Tabs>
    </div>

    <!-- Sticky Bottom Save Action Bar (Shown ONLY for OWNER / Super Admin) -->
    <div
      v-if="!isReadOnly && !isLoading"
      class="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 shadow-lg z-40"
    >
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <div class="text-xs text-slate-500 hidden sm:block">
          <span>สิทธิ์ปัจจุบัน: <strong class="text-cyan-700">OWNER / Super Admin</strong> (สามารถบันทึกการเปลี่ยนแปลงได้)</span>
        </div>

        <Button
          @click="saveSettings"
          :disabled="isSaving"
          class="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span v-if="isSaving" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          <span v-else>💾</span>
          <span>{{ isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการตั้งค่า (Save Changes)' }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import QRCode from 'qrcode';
import { useAuthStore } from '@/stores/auth';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { adjustBrightness } from '@/composables/useDynamicTheme';
import uploadService from '@/services/uploadService';
import api from '@/utils/api';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import LineQuotaCard from '@/components/LineQuotaCard.vue';
import DeliveryLogsTab from '@/components/DeliveryLogsTab.vue';
import { THAI_BANKS, findBank } from '@/constants/thaiBanks';

const authStore = useAuthStore();
const buildingStore = useBuildingStore();

const lineQuotaCardRef = ref(null);
const activeTab = ref('general');
const isLoading = ref(false);
const isSaving = ref(false);
const isGeneratingQr = ref(false);
const isUploadingQr = ref(false);
const isUploadingLogo = ref(false);
const isUploadingCover = ref(false);
const showSecret = ref(false);
const showToken = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const customBankName = ref('');

// Preset Palette for LIFF Dynamic Theming
const presetColors = [
  { name: 'HorHub Teal', hex: '#0E7490' },
  { name: 'น้ำเงิน (Blue)', hex: '#3B82F6' },
  { name: 'แดง (Ruby)', hex: '#EF4444' },
  { name: 'เขียว (Emerald)', hex: '#10B981' },
  { name: 'ม่วง (Indigo)', hex: '#8B5CF6' },
  { name: 'ส้ม (Amber)', hex: '#F97316' },
  { name: 'ฟ้า (Sky)', hex: '#0EA5E9' },
  { name: 'ชมพู (Rose)', hex: '#F43F5E' },
  { name: 'เทาเข้ม (Slate)', hex: '#475569' }
];

// Reactive Form Data
const form = ref({
  name: '',
  address: '',
  themeColor: '#0E7490',
  logoUrl: '',
  phone: '',
  coverImageUrl: '',
  paymentQrUrl: '',
  promptpayNum: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNo: '',
  paymentNote: '',
  waterRate: 18.00,
  electricRate: 7.00,
  dueDateDay: 5,
  latePenalty: 50.00,
  lateFeeType: 'NONE',
  lateFeeAmount: 0.00,
  gracePeriodDays: 0,
  depositMonths: 2,
  advanceMonths: 1,
  termsAndConditions: '',
  lineOaId: '',
  lineChannelAccessToken: '',
  lineChannelSecret: '',
  lineLiffId: '',
  lineAddFriendUrl: ''
});

/**
 * Bank Selection Helpers & Active Bank Object
 */
const selectedBankCode = computed({
  get: () => {
    if (!form.value.bankName) return '';
    const found = findBank(form.value.bankName);
    return found ? found.code : 'OTHER';
  },
  set: (val) => {
    if (val === 'OTHER') {
      if (!customBankName.value) customBankName.value = form.value.bankName || '';
      form.value.bankName = customBankName.value;
    } else {
      const found = THAI_BANKS.find(b => b.code === val);
      if (found) {
        form.value.bankName = found.officialName;
      } else {
        form.value.bankName = '';
      }
    }
  }
});

const activeBankObj = computed(() => {
  if (!form.value.bankName) return null;
  return findBank(form.value.bankName);
});

const onCustomBankInput = (e) => {
  customBankName.value = e.target.value;
  form.value.bankName = e.target.value;
};

/**
 * Real-time Validation Rules & Formatting Helpers
 */
const promptPayValidation = computed(() => {
  const raw = (form.value.promptpayNum || '').trim();
  if (!raw) {
    return { isValid: false, message: 'กรุณาระบุหมายเลข PromptPay (จำเป็นสำหรับการสร้าง QR Code และรับชำระเงิน)', icon: '⚠️', type: 'empty' };
  }
  const clean = raw.replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    if (/^(06|08|09)/.test(clean)) {
      const formatted = `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
      return { isValid: true, message: 'เบอร์โทรศัพท์มือถือ (10 หลัก)', formatted, icon: '📱', type: 'mobile' };
    }
    return { isValid: false, message: 'เบอร์มือถือต้องขึ้นต้นด้วย 06, 08 หรือ 09', icon: '⚠️', type: 'invalid' };
  }
  if (clean.length === 13) {
    const formatted = `${clean.slice(0, 1)}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean.slice(12)}`;
    return { isValid: true, message: 'เลขประจำตัวประชาชน / ผู้เสียภาษี (13 หลัก)', formatted, icon: '🪪', type: 'id' };
  }
  if (clean.length === 15) {
    return { isValid: true, message: 'e-Wallet ID (15 หลัก)', formatted: clean, icon: '💳', type: 'wallet' };
  }
  return { isValid: false, message: 'หมายเลข PromptPay ต้องเป็นเบอร์มือถือ 10 หลัก หรือเลขบัตรประชาชน/ผู้เสียภาษี 13 หลัก', icon: '⚠️', type: 'invalid' };
});

const bankAccountValidation = computed(() => {
  const raw = (form.value.bankAccountNo || '').trim();
  if (!raw) return { isValid: true, message: '' };
  const clean = raw.replace(/[^0-9]/g, '');
  if (clean.length >= 10 && clean.length <= 12) {
    return { isValid: true, message: `เลขที่บัญชีถูกต้อง (${clean.length} หลัก)`, icon: '✅' };
  }
  return { isValid: false, message: `เลขที่บัญชีธนาคารมาตรฐานควรมี 10 - 12 หลัก (ปัจจุบันมี ${clean.length} หลัก)`, icon: '⚠️' };
});

const phoneValidation = computed(() => {
  const raw = (form.value.phone || '').trim();
  if (!raw) return { isValid: true, message: '' };
  const clean = raw.replace(/[^0-9]/g, '');
  if (clean.length === 9 || clean.length === 10) {
    return { isValid: true, message: 'รูปแบบเบอร์โทรศัพท์ถูกต้อง', icon: '✅' };
  }
  return { isValid: false, message: 'เบอร์โทรศัพท์ติดต่อควรมี 9 - 10 หลัก (เช่น 02-xxx-xxxx หรือ 08x-xxx-xxxx)', icon: '⚠️' };
});

const dueDateValidation = computed(() => {
  const day = Number(form.value.dueDateDay);
  if (!day || isNaN(day) || day < 1 || day > 31) {
    return { isValid: false, message: 'วันกำหนดชำระต้องอยู่ระหว่างวันที่ 1 ถึง 31 ของเดือน', icon: '⚠️' };
  }
  return { isValid: true, message: `กำหนดชำระทุกวันที่ ${day} ของทุกเดือน`, icon: '📅' };
});

const lineSettingsValidation = computed(() => {
  const oaId = (form.value.lineOaId || '').trim();
  const liffId = (form.value.lineLiffId || '').trim();
  const secret = (form.value.lineChannelSecret || '').trim();

  const oaError = oaId && !oaId.startsWith('@') ? 'LINE OA ID ควรขึ้นต้นด้วยเครื่องหมาย @ (เช่น @horhub)' : null;
  const liffError = liffId && !/^\d{10}-[A-Za-z0-9_-]{6,}$/.test(liffId) ? 'รูปแบบ LIFF ID ควรเป็นตัวเลข 10 หลักตามด้วยขีด (เช่น 2011289517-SB8YziXL)' : null;
  const secretError = secret && secret.length !== 32 ? `Channel Secret ควรมีความยาว 32 ตัวอักษร (ปัจจุบัน ${secret.length} ตัวอักษร)` : null;

  return { oaError, liffError, secretError };
});

/**
 * Dynamic PromptPay QR Code Image Display Computation
 */
const displayQrUrl = computed(() => {
  if (form.value.paymentQrUrl && !form.value.paymentQrUrl.includes('unsplash.com')) {
    return form.value.paymentQrUrl;
  }

  const num = form.value.promptpayNum ? form.value.promptpayNum.replace(/[^0-9]/g, '') : '0812345678';
  return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=PromptPay_${num}`;
});

/**
 * Generate Real PromptPay EMVCo QR Code Data URL
 */
const generatePromptPayQr = async () => {
  const num = form.value.promptpayNum ? form.value.promptpayNum.replace(/[^0-9]/g, '') : '0812345678';
  if (!num) return;

  isGeneratingQr.value = true;
  try {
    const targetNum = num.length === 10 ? `0066${num.substring(1)}` : num;
    const qrPayload = `00020101021129370016A0000006770101110115${targetNum}53037645802TH5912DORMITORY6007BANGKOK6304`;
    const dataUrl = await QRCode.toDataURL(qrPayload, { width: 400, margin: 2 });
    form.value.paymentQrUrl = dataUrl;
  } catch (err) {
    form.value.paymentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=PromptPay_${num}`;
  } finally {
    isGeneratingQr.value = false;
  }
};

/**
 * Handle Direct File Upload for Logo
 */
const handleLogoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  isUploadingLogo.value = true;
  errorMessage.value = '';
  try {
    const res = await uploadService.uploadFile(file);
    const url = res.data?.url || res.fileUrl || res.url;
    if (url) {
      form.value.logoUrl = url;
    }
  } catch (err) {
    errorMessage.value = 'ไม่สามารถอัปโหลดไฟล์รูปโลโก้ได้ (รองรับ JPG, PNG, WebP ขนาดไม่เกิน 5MB)';
  } finally {
    isUploadingLogo.value = false;
    e.target.value = '';
  }
};

/**
 * Handle Direct File Upload for Cover Image
 */
const handleCoverUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  isUploadingCover.value = true;
  errorMessage.value = '';
  try {
    const res = await uploadService.uploadFile(file);
    const url = res.data?.url || res.fileUrl || res.url;
    if (url) {
      form.value.coverImageUrl = url;
    }
  } catch (err) {
    errorMessage.value = 'ไม่สามารถอัปโหลดไฟล์รูปภาพหน้าปกได้ (รองรับ JPG, PNG, WebP ขนาดไม่เกิน 5MB)';
  } finally {
    isUploadingCover.value = false;
    e.target.value = '';
  }
};

/**
 * Handle Direct File Upload for PromptPay QR Code Image
 */
const handleQrUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  isUploadingQr.value = true;
  errorMessage.value = '';
  try {
    const res = await uploadService.uploadFile(file);
    const url = res.data?.url || res.fileUrl || res.url;
    if (url) {
      form.value.paymentQrUrl = url;
    }
  } catch (err) {
    errorMessage.value = 'ไม่สามารถอัปโหลดไฟล์ QR Code ได้';
  } finally {
    isUploadingQr.value = false;
    e.target.value = '';
  }
};

/**
 * UI Guard & Security Check
 */
const isReadOnly = computed(() => {
  const userRole = (
    authStore.currentUser?.role ||
    authStore.user?.role ||
    ''
  ).toLowerCase();

  if (userRole === 'manager' || userRole === 'tenant') {
    return true;
  }

  return false;
});

/**
 * Fetch Building Settings from API
 */
const fetchBuildingSettings = async () => {
  if (!buildingStore.activeBuildingId) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const res = await api.get(`/api/v1/buildings/${buildingStore.activeBuildingId}/settings`);
    const buildingData = res.data.data;
    const settingData = buildingData.setting || {};

    form.value = {
      name: buildingData.name || '',
      address: buildingData.address || '',
      themeColor: buildingData.themeColor || '#0E7490',
      logoUrl: buildingData.logoUrl || '',
      phone: settingData.phone || '',
      coverImageUrl: settingData.coverImageUrl || '',
      paymentQrUrl: settingData.paymentQrUrl || '',
      promptpayNum: settingData.promptpayNum || '',
      bankName: settingData.bankName || '',
      bankAccountName: settingData.bankAccountName || '',
      bankAccountNo: settingData.bankAccountNo || '',
      paymentNote: settingData.paymentNote || '',
      waterRate: settingData.waterRate ? parseFloat(settingData.waterRate) : 18.00,
      electricRate: settingData.electricRate ? parseFloat(settingData.electricRate) : 7.00,
      dueDateDay: settingData.dueDateDay ? parseInt(settingData.dueDateDay, 10) : 5,
      latePenalty: settingData.latePenalty ? parseFloat(settingData.latePenalty) : 50.00,
      lateFeeType: settingData.lateFeeType || 'NONE',
      lateFeeAmount: settingData.lateFeeAmount != null ? parseFloat(settingData.lateFeeAmount) : (settingData.latePenalty ? parseFloat(settingData.latePenalty) : 0.00),
      gracePeriodDays: settingData.gracePeriodDays != null ? parseInt(settingData.gracePeriodDays, 10) : 0,
      depositMonths: settingData.depositMonths ? parseInt(settingData.depositMonths, 10) : 2,
      advanceMonths: settingData.advanceMonths ? parseInt(settingData.advanceMonths, 10) : 1,
      termsAndConditions: settingData.termsAndConditions || '',
      lineOaId: settingData.lineOaId || '',
      lineChannelAccessToken: settingData.lineChannelAccessToken || '',
      lineChannelSecret: settingData.lineChannelSecret || '',
      lineLiffId: settingData.lineLiffId || '',
      lineAddFriendUrl: settingData.lineAddFriendUrl || ''
    };
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'ไม่สามารถดึงข้อมูลการตั้งค่าตึกได้';
  } finally {
    isLoading.value = false;
  }
};

/**
 * Save Settings API Call
 */
const saveSettings = async () => {
  if (isReadOnly.value) return;

  // Validation Checks
  if (!form.value.name?.trim()) {
    errorMessage.value = 'กรุณาระบุชื่ออาคาร/ตึก';
    activeTab.value = 'general';
    return;
  }

  if (form.value.promptpayNum && !promptPayValidation.value.isValid) {
    errorMessage.value = promptPayValidation.value.message;
    activeTab.value = 'financial';
    return;
  }

  if (form.value.bankAccountNo && !bankAccountValidation.value.isValid) {
    errorMessage.value = bankAccountValidation.value.message;
    activeTab.value = 'financial';
    return;
  }

  if (form.value.phone && !phoneValidation.value.isValid) {
    errorMessage.value = phoneValidation.value.message;
    activeTab.value = 'general';
    return;
  }

  if (!dueDateValidation.value.isValid) {
    errorMessage.value = dueDateValidation.value.message;
    activeTab.value = 'financial';
    return;
  }

  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await api.put(
      `/api/v1/buildings/${buildingStore.activeBuildingId}/settings`,
      form.value
    );

    successMessage.value = 'บันทึกข้อมูลการตั้งค่าตึกสำเร็จเรียบร้อยแล้ว!';
    await buildingStore.fetchBuildings();
    if (lineQuotaCardRef.value?.fetchQuota) {
      lineQuotaCardRef.value.fetchQuota();
    }

    setTimeout(() => {
      successMessage.value = '';
    }, 4000);
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  if (buildingStore.buildings.length === 0) {
    buildingStore.fetchBuildings().then(() => {
      fetchBuildingSettings();
    });
  } else {
    fetchBuildingSettings();
  }
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    fetchBuildingSettings();
  }
);
</script>
