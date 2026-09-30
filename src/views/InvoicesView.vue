<template>
  <div class="space-y-6">
    <!-- View Navigation Tabs & Action Bar Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5 no-print">
      <!-- Left: Segmented Tabs Control -->
      <div class="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0 self-start sm:self-auto shadow-2xs">
        <button
          type="button"
          @click="activeTab = 'all-invoices'"
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer"
          :class="activeTab === 'all-invoices'
            ? 'bg-white text-slate-900 shadow-xs font-bold'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'"
        >
          <Receipt class="w-4 h-4" :class="activeTab === 'all-invoices' ? 'text-teal-600' : 'text-slate-400'" />
          <span>ใบแจ้งหนี้ทั้งหมด</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'draft-review'"
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer"
          :class="activeTab === 'draft-review'
            ? 'bg-white text-slate-900 shadow-xs font-bold'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'"
        >
          <FileEdit class="w-4 h-4" :class="activeTab === 'draft-review' ? 'text-teal-600' : 'text-slate-400'" />
          <span>ตรวจทานบิลร่าง (Draft)</span>
        </button>
      </div>

      <!-- Right: Action Buttons Group -->
      <div v-if="activeTab === 'all-invoices'" class="flex items-center gap-2 flex-wrap shrink-0">
        <!-- Secondary Utility Actions (neutral, equal weight) -->
        <div class="inline-flex items-center gap-1 p-1 bg-slate-100/70 rounded-xl border border-slate-200/70">
          <Button
            @click="handleRunLateFees"
            :disabled="runningLateFees"
            variant="ghost"
            size="sm"
            class="text-slate-600 hover:bg-white hover:shadow-2xs whitespace-nowrap text-xs"
            title="สั่งคำนวณและอัปเดตค่าปรับบิลค้างชำระอัตโนมัติตามนโยบายแต่ละตึก"
          >
            <span v-if="runningLateFees" class="animate-spin w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full"></span>
            <Zap v-else class="w-3.5 h-3.5 text-rose-500" />
            <span>{{ runningLateFees ? 'กำลังคำนวณ...' : 'คำนวณค่าปรับ' }}</span>
          </Button>

          <Button
            @click="handleExportCsv"
            :disabled="exportingCsv"
            variant="ghost"
            size="sm"
            class="text-slate-600 hover:bg-white hover:shadow-2xs whitespace-nowrap text-xs"
            title="Export รายงานบิลรายเดือนเป็น CSV (รองรับ Excel)"
          >
            <Download v-if="!exportingCsv" class="w-3.5 h-3.5 text-slate-500" />
            <span v-if="exportingCsv" class="animate-spin w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full"></span>
            <span>Export CSV</span>
          </Button>

          <Button
            @click="handleRemindBulk"
            :disabled="unpaidCount === 0 || sendingBulkReminder"
            variant="ghost"
            size="sm"
            class="text-slate-600 hover:bg-white hover:shadow-2xs whitespace-nowrap text-xs"
            title="ส่ง LINE Flex Message แจ้งเตือนไปยังลูกบ้านที่ค้างชำระทั้งหมด"
          >
            <Send class="w-3.5 h-3.5 text-emerald-600" />
            <span>เตือนยอดค้าง LINE</span>
            <Badge v-if="unpaidCount > 0" class="bg-emerald-600 text-white font-mono ml-0.5">
              {{ unpaidCount }}
            </Badge>
          </Button>
        </div>

        <!-- Create Custom Invoice Button (sole primary action) -->
        <Button
          @click="openCreateModal"
          size="sm"
          class="whitespace-nowrap text-xs font-bold"
        >
          <Plus class="w-4 h-4" />
          <span>ออกบิลใหม่</span>
        </Button>
      </div>
    </div>

    <!-- Tab 2: Draft Invoice Review (InvoiceReview.vue) -->
    <div v-if="activeTab === 'draft-review'">
      <InvoiceReview />
    </div>

    <!-- Tab 1: Invoices Table -->
    <div v-else class="space-y-6">
      <Card class="overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between no-print">
          <div class="flex items-center gap-3">
            <h3 class="font-bold text-slate-900 text-sm">All Invoices & Payments</h3>
            <Badge v-if="unpaidCount > 0" variant="warning">
              ค้างชำระ {{ unpaidCount }} รายการ
            </Badge>
          </div>
          <Button variant="link" size="sm" @click="invoiceStore.fetchInvoices()" class="text-teal-600">
            <RotateCw class="w-3.5 h-3.5" />
            <span>รีเฟรช</span>
          </Button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th class="p-3.5">สถานะ</th>
                <th class="p-3.5">ห้อง / ผู้เช่า</th>
                <th class="p-3.5">รอบบิล</th>
                <th class="p-3.5">ยอดรวม</th>
                <th class="p-3.5">รายละเอียด</th>
                <th class="p-3.5">สลิป</th>
                <th class="p-3.5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template v-for="inv in invoiceStore.invoices" :key="inv.id">
                <tr class="hover:bg-slate-50/60 transition-colors align-top">
                  <td class="p-3.5">
                    <Badge :variant="statusBadgeVariant(inv.status)" class="font-extrabold">
                      <component :is="inv.status === 'paid' ? CheckCircle2 : Clock" class="w-3 h-3" />
                      <span>{{ inv.status.toUpperCase() }}</span>
                    </Badge>
                  </td>
                  <td class="p-3.5">
                    <div class="font-bold text-slate-900">
                      ห้อง {{ inv.room?.roomNumber }} {{ inv.room?.building?.name ? `(${inv.room.building.name})` : '' }}
                    </div>
                    <div class="flex items-center gap-1 text-xs text-slate-600 font-medium mt-0.5">
                      <span>{{ inv.tenant ? `${inv.tenant.firstName} ${inv.tenant.lastName}` : 'N/A' }}</span>
                      <Badge v-if="inv.tenant?.lineUserId" variant="success" title="ผูกบัญชี LINE แล้ว">LINE</Badge>
                    </div>
                    <div class="text-xs font-mono text-slate-400 mt-0.5">{{ inv.invoiceNumber }}</div>
                  </td>
                  <td class="p-3.5 font-mono text-xs text-slate-600">{{ inv.billingCycle }}</td>
                  <td class="p-3.5">
                    <div class="font-mono font-black text-emerald-700 text-sm">฿{{ Number(inv.grandTotal).toLocaleString() }}</div>
                    <div v-if="Number(inv.lateFeeCharge) > 0" class="text-xs font-mono font-semibold text-rose-600 mt-0.5">
                      รวมค่าปรับ +฿{{ Number(inv.lateFeeCharge).toLocaleString() }}
                    </div>
                  </td>
                  <td class="p-3.5">
                    <Button variant="link" size="sm" class="h-auto p-0 text-xs" @click="toggleDetail(inv.id)">
                      <ChevronDown class="w-3.5 h-3.5 transition-transform" :class="expandedIds.has(inv.id) ? 'rotate-180' : ''" />
                      <span>{{ expandedIds.has(inv.id) ? 'ซ่อนรายการ' : 'ดูรายการ' }}</span>
                    </Button>
                  </td>
                  <td class="p-3.5">
                    <Button v-if="inv.slipUrl" variant="link" size="sm" class="h-auto p-0" @click="openSlipModal(inv)">ดูสลิป</Button>
                    <span v-else class="text-xs text-slate-400">-</span>
                  </td>
                  <td class="p-3.5 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <Button
                        v-if="inv.status !== 'paid'"
                        @click="openPaymentModal(inv)"
                        size="sm"
                      >
                        <Banknote class="w-3.5 h-3.5" />
                        <span>รับเงิน</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" size="sm" class="w-8 px-0" title="ตัวเลือกเพิ่มเติม">
                            <MoreVertical class="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            v-if="inv.status === 'reviewing'"
                            :disabled="rejectingSlipId === inv.id"
                            class="text-rose-700 hover:bg-rose-50 focus:bg-rose-50"
                            @select="handleRejectSlip(inv)"
                          >
                            <Ban class="w-3.5 h-3.5" />
                            <span>{{ rejectingSlipId === inv.id ? 'กำลังปฏิเสธ...' : 'ปฏิเสธสลิป' }}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            v-if="inv.status !== 'paid'"
                            :disabled="sendingReminderId === inv.id"
                            @select="handleRemindSingle(inv)"
                          >
                            <Send class="w-3.5 h-3.5 text-emerald-600" />
                            <span>{{ sendingReminderId === inv.id ? 'กำลังส่ง...' : 'เตือน LINE' }}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem @select="openPrintModal(inv)">
                            <Printer class="w-3.5 h-3.5 text-slate-500" />
                            <span>พิมพ์บิล</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem v-if="inv.status !== 'paid'" @select="openEditModal(inv)">
                            <Edit3 class="w-3.5 h-3.5 text-slate-500" />
                            <span>แก้ไข</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem @select="invoiceStore.exportPdf(inv.id, inv.invoiceNumber)">
                            <FileText class="w-3.5 h-3.5 text-slate-500" />
                            <span>PDF</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>

                <!-- Fee Breakdown Detail Row -->
                <tr v-if="expandedIds.has(inv.id)" class="bg-slate-50/60">
                  <td colspan="7" class="p-3.5">
                    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <div class="text-slate-400 font-bold uppercase">ค่าเช่า</div>
                        <div class="font-mono font-semibold text-slate-700 mt-0.5">฿{{ Number(inv.roomPrice).toLocaleString() }}</div>
                      </div>
                      <div>
                        <div class="text-slate-400 font-bold uppercase">ค่าน้ำ</div>
                        <div class="font-mono font-semibold text-slate-700 mt-0.5">฿{{ Number(inv.waterTotal).toLocaleString() }}</div>
                      </div>
                      <div>
                        <div class="text-slate-400 font-bold uppercase">ค่าไฟ</div>
                        <div class="font-mono font-semibold text-slate-700 mt-0.5">฿{{ Number(inv.electricTotal).toLocaleString() }}</div>
                      </div>
                      <div>
                        <div class="text-slate-400 font-bold uppercase">ส่วนกลาง</div>
                        <Badge v-if="Number(inv.commonFee) === 0" variant="success" class="mt-0.5">฿0 (ฟรี)</Badge>
                        <div v-else class="font-mono font-semibold text-slate-700 mt-0.5">฿{{ Number(inv.commonFee).toLocaleString() }}</div>
                      </div>
                      <div>
                        <div class="text-slate-400 font-bold uppercase">อื่นๆ</div>
                        <template v-if="Number(inv.otherFee) > 0">
                          <div class="font-mono font-semibold text-teal-700 mt-0.5">฿{{ Number(inv.otherFee).toLocaleString() }}</div>
                          <div v-if="inv.otherFeeNote" class="text-slate-400 truncate">{{ inv.otherFeeNote }}</div>
                        </template>
                        <div v-else class="font-mono text-slate-300 mt-0.5">-</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-if="invoiceStore.invoices.length === 0">
                <td colspan="7" class="p-6 text-center text-slate-400">ยังไม่มีรายการใบแจ้งหนี้</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- Edit / Create Custom Invoice Modal -->
      <EditInvoiceModal
        :show="showEditModal"
        :invoice="selectedInvoice"
        :rooms="roomStore.rooms"
        @close="showEditModal = false"
        @saved="invoiceStore.fetchInvoices()"
      />

      <!-- Record Manual Payment Dialog Modal -->
      <Dialog :open="showPaymentModal" @update:open="showPaymentModal = $event">
        <DialogContent class="max-w-md p-0 overflow-hidden no-print">
          <div class="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
            <DialogHeader class="pr-6">
              <DialogTitle class="text-white flex items-center gap-2">
                <Banknote class="w-5 h-5" />
                <span>บันทึกรับชำระเงิน (Record Payment)</span>
              </DialogTitle>
            </DialogHeader>
          </div>

          <form @submit.prevent="handleRecordPayment" class="p-6 space-y-4">
            <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-1">
              <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider">ยอดเงินที่ต้องรับชำระ (Total Payable)</div>
              <div class="text-3xl font-black text-emerald-700 font-mono">
                ฿{{ Number(payingInvoice?.grandTotal || 0).toLocaleString() }}
              </div>
              <div class="text-xs text-slate-600 font-medium">
                ห้อง {{ payingInvoice?.room?.roomNumber }} | รอบบิล {{ payingInvoice?.billingCycle }}
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ช่องทางการชำระเงิน (Payment Method)</label>
              <Select v-model="paymentForm.paymentMethod" required class="font-bold">
                <option value="CASH">เงินสดผ่านเคาน์เตอร์ (Cash)</option>
                <option value="PROMPTPAY">พร้อมเพย์ / สแกน QR (PromptPay)</option>
                <option value="BANK_TRANSFER">โอนเงินผ่านบัญชีธนาคาร (Bank Transfer)</option>
              </Select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">หมายเหตุการชำระเงิน (Payment Note - Optional)</label>
              <Input
                v-model="paymentForm.note"
                type="text"
                placeholder="เช่น รับเงินสดแบงก์ 5,000 บาท ทอน 200 บาท"
              />
            </div>

            <DialogFooter class="pt-3">
              <Button
                type="button"
                variant="outline"
                class="flex-1"
                @click="showPaymentModal = false"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                :disabled="recordingPayment"
                class="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 class="w-4 h-4" />
                <span>{{ recordingPayment ? 'กำลังบันทึก...' : 'บันทึกรับเงิน' }}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <!-- Slip Review Modal: ดูสลิปแล้วตัดสินใจอนุมัติ/ปฏิเสธในที่เดียว -->
      <Dialog :open="showSlipModal" @update:open="showSlipModal = $event">
        <DialogContent class="max-w-md p-0 overflow-hidden">
          <div class="px-6 py-4 bg-slate-900 text-white">
            <DialogHeader class="pr-6">
              <DialogTitle class="text-white">
                สลิปโอนเงิน ห้อง {{ slipModalInvoice?.room?.roomNumber }}
              </DialogTitle>
              <DialogDescription class="text-slate-300">
                ยอดตามบิล ฿{{ Number(slipModalInvoice?.grandTotal || 0).toLocaleString() }} · รอบบิล {{ slipModalInvoice?.billingCycle }}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div class="p-6 space-y-4">
            <img
              v-if="slipModalInvoice?.slipUrl"
              :src="slipModalInvoice.slipUrl"
              alt="สลิปโอนเงิน"
              class="w-full max-h-[60vh] object-contain rounded-xl border border-slate-200 bg-slate-50"
            />

            <template v-if="slipModalInvoice?.status === 'reviewing'">
              <p class="text-xs text-slate-500 text-center">ตรวจสอบยอดเงินให้ตรงกับบิลก่อนอนุมัติ</p>
              <div class="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  class="border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700"
                  :disabled="rejectingSlipId === slipModalInvoice.id"
                  @click="handleRejectSlip(slipModalInvoice)"
                >
                  <Ban class="w-3.5 h-3.5" />
                  <span>ปฏิเสธ</span>
                </Button>
                <Button
                  class="bg-emerald-600 hover:bg-emerald-700"
                  :disabled="approvingSlipId === slipModalInvoice.id"
                  @click="handleApproveSlip(slipModalInvoice)"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>{{ approvingSlipId === slipModalInvoice.id ? 'กำลังอนุมัติ...' : 'อนุมัติ' }}</span>
                </Button>
              </div>
            </template>
            <Button v-else variant="outline" class="w-full" @click="showSlipModal = false">ปิด</Button>
          </div>
        </DialogContent>
      </Dialog>

      <!-- Printable Invoice/Receipt Teleport Modal -->
      <teleport to="body">
        <div v-if="showPrintModal" id="print-modal-root" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card class="w-full max-w-2xl overflow-hidden my-8 p-0 animate-in fade-in zoom-in-95 duration-150">
            <!-- Print Toolbar Bar (Hidden during window.print) -->
            <div class="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <div class="flex items-center gap-2">
                <Printer class="w-4 h-4 text-cyan-300" />
                <span class="font-bold text-xs">พรีวิวใบแจ้งหนี้/ใบเสร็จ (Print Preview)</span>
              </div>

              <div class="flex items-center gap-2">
                <Button @click="triggerPrint" size="sm" class="bg-cyan-600 hover:bg-cyan-700">
                  <Printer class="w-3.5 h-3.5" />
                  <span>สั่งพิมพ์ออกเครื่องพิมพ์ (Print)</span>
                </Button>
                <Button @click="showPrintModal = false" variant="ghost" size="icon" class="text-slate-400 hover:text-white hover:bg-transparent h-auto w-auto p-1">
                  <X class="w-5 h-5" />
                </Button>
              </div>
            </div>

            <!-- Print Content Paper Box -->
            <div id="printable-receipt" class="p-8 bg-white text-slate-900 font-sans space-y-6 relative border-t-4 border-cyan-600">
              <!-- Watermark Stamp for PAID -->
              <div v-if="printingInvoice?.status === 'paid'" class="absolute top-20 right-8 pointer-events-none opacity-20 transform rotate-[-15deg] border-4 border-emerald-600 text-emerald-700 px-6 py-2 rounded-xl font-black text-3xl uppercase tracking-widest text-center select-none">
                ชำระเงินแล้ว<br/><span class="text-lg font-bold">PAID OFFICIAL</span>
              </div>

              <!-- Document Header -->
              <div class="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div class="text-xl font-black tracking-tight text-cyan-900 uppercase">
                    {{ printingInvoice?.room?.building?.name || 'หอพักสมาร์ทโดรม (Dormitory)' }}
                  </div>
                  <p class="text-xs text-slate-500 mt-1 font-semibold">ใบแจ้งหนี้ / ใบเสร็จรับเงิน (Invoice & Official Receipt)</p>
                  <div v-if="printingInvoice?.room?.building?.promptpayNumber" class="text-xs text-slate-600 mt-1 font-mono">
                    พร้อมเพย์: {{ printingInvoice.room.building.promptpayNumber }} ({{ printingInvoice.room.building.promptpayName }})
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-xs font-bold text-slate-400 uppercase">เลขที่เอกสาร / No.</div>
                  <div class="text-base font-black font-mono text-cyan-900">{{ printingInvoice?.invoiceNumber }}</div>
                  <div class="text-xs text-slate-500 font-mono mt-1">วันที่ออกบิล: {{ formatDate(printingInvoice?.createdAt) }}</div>
                </div>
              </div>

              <!-- Tenant & Room Info -->
              <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div class="text-xs font-bold text-slate-400 uppercase">ข้อมูลผู้เช่า / Tenant Information</div>
                  <div class="font-bold text-slate-900 text-sm mt-0.5">
                    {{ printingInvoice?.tenant ? `${printingInvoice.tenant.firstName} ${printingInvoice.tenant.lastName}` : 'ผู้เช่าห้องพัก' }}
                  </div>
                  <div class="text-slate-600 mt-0.5">โทร: {{ printingInvoice?.tenant?.phone || '-' }}</div>
                </div>

                <div class="text-right">
                  <div class="text-xs font-bold text-slate-400 uppercase">ห้องพัก & รอบบิล / Room & Cycle</div>
                  <div class="font-extrabold text-slate-900 text-sm mt-0.5">ห้อง {{ printingInvoice?.room?.roomNumber }}</div>
                  <div class="text-cyan-700 font-bold font-mono mt-0.5">ประจำรอบบิล: {{ printingInvoice?.billingCycle }}</div>
                </div>
              </div>

              <!-- Items Table -->
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                    <th class="p-3">รายการ (Description)</th>
                    <th class="p-3 text-right">จำนวนเงิน (Amount)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-slate-800 font-medium">
                  <tr>
                    <td class="p-3">ค่าเช่าห้องพักประจำเดือน (Monthly Room Rent)</td>
                    <td class="p-3 text-right font-mono font-semibold">฿{{ Number(printingInvoice?.roomPrice || 0).toLocaleString() }}</td>
                  </tr>
                  <tr>
                    <td class="p-3">ค่าน้ำประปา (Water Usage Fee)</td>
                    <td class="p-3 text-right font-mono font-semibold">฿{{ Number(printingInvoice?.waterTotal || 0).toLocaleString() }}</td>
                  </tr>
                  <tr>
                    <td class="p-3">ค่าไฟฟ้า (Electricity Usage Fee)</td>
                    <td class="p-3 text-right font-mono font-semibold">฿{{ Number(printingInvoice?.electricTotal || 0).toLocaleString() }}</td>
                  </tr>
                  <tr v-if="Number(printingInvoice?.commonFee) > 0">
                    <td class="p-3">ค่าส่วนกลาง (Common Maintenance Fee)</td>
                    <td class="p-3 text-right font-mono font-semibold">฿{{ Number(printingInvoice?.commonFee || 0).toLocaleString() }}</td>
                  </tr>
                  <tr v-if="Number(printingInvoice?.otherFee) > 0">
                    <td class="p-3">
                      ค่าบริการอื่นๆ (Other Charges)
                      <span v-if="printingInvoice?.otherFeeNote" class="text-slate-500 font-normal">({{ printingInvoice.otherFeeNote }})</span>
                    </td>
                    <td class="p-3 text-right font-mono font-semibold">฿{{ Number(printingInvoice?.otherFee || 0).toLocaleString() }}</td>
                  </tr>
                  <tr v-if="Number(printingInvoice?.lateFeeCharge) > 0" class="text-rose-600 font-bold bg-rose-50/50">
                    <td class="p-3">ค่าปรับชำระล่าช้า (Late Payment Penalty Fee)</td>
                    <td class="p-3 text-right font-mono font-semibold">+฿{{ Number(printingInvoice?.lateFeeCharge || 0).toLocaleString() }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-slate-900 bg-slate-50 font-bold">
                    <td class="p-3 text-slate-900 text-sm">ยอดเงินสุทธิทั้งสิ้น (Grand Total)</td>
                    <td class="p-3 text-right font-mono text-base text-cyan-900 font-black">
                      ฿{{ Number(printingInvoice?.grandTotal || 0).toLocaleString() }}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <!-- Payment Status Footer -->
              <div class="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
                <div>
                  <div class="text-xs text-slate-400 font-bold uppercase mb-1">สถานะการชำระเงิน</div>
                  <div v-if="printingInvoice?.status === 'paid'" class="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 class="w-4 h-4 text-emerald-600 inline-block" />
                    <span>ชำระเงินเรียบร้อยแล้ว</span>
                    <Badge variant="success" class="font-extrabold font-mono">
                      {{ printingInvoice.paymentMethod || 'CASH' }}
                    </Badge>
                    <span v-if="printingInvoice.paidAt" class="text-slate-500 font-mono text-xs">({{ formatDate(printingInvoice.paidAt) }})</span>
                  </div>
                  <div v-else class="text-amber-700 font-bold flex items-center gap-1.5">
                    <Clock class="w-4 h-4 text-amber-600 inline-block" />
                    <span>รอชำระเงิน (กำหนดชำระ: {{ formatDate(printingInvoice?.dueDate) }})</span>
                  </div>
                  <div v-if="printingInvoice?.paymentNote" class="text-slate-500 italic mt-1 text-xs">
                    หมายเหตุ: {{ printingInvoice.paymentNote }}
                  </div>
                </div>

                <div class="text-center w-44 pt-4">
                  <div class="border-b border-dashed border-slate-400 mb-1"></div>
                  <div class="text-xs text-slate-500 font-semibold">ผู้รับเงิน / Authorized Signature</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import {
  CheckCircle2,
  Clock,
  Receipt,
  FileEdit,
  Zap,
  Download,
  Send,
  Plus,
  RotateCw,
  Banknote,
  Printer,
  Edit3,
  FileText,
  ChevronDown,
  MoreVertical,
  Ban,
  X
} from 'lucide-vue-next';
import { useRoomStore } from '@/stores/useRoomStore';
import { useInvoiceStore } from '@/stores/useInvoiceStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import api from '@/utils/api';
import EditInvoiceModal from '@/components/EditInvoiceModal.vue';
import InvoiceReview from '@/components/invoice/InvoiceReview.vue';
import { showSuccess, showError, showConfirm, showPrompt } from '@/utils/swal';
import { formatDate } from '@/utils/formatters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const activeTab = ref('all-invoices');
const runningLateFees = ref(false);
const exportingCsv = ref(false);

const handleRunLateFees = async () => {
  const confirmed = await showConfirm(
    'คำนวณค่าปรับอัตโนมัติ',
    'คุณต้องการสั่งรันระบบคำนวณค่าปรับสำหรับบิลค้างชำระทั้งหมดตามนโยบายของแต่ละตึกใช่หรือไม่?',
    'เริ่มคำนวณค่าปรับ',
    'ยกเลิก'
  );
  if (!confirmed) return;

  runningLateFees.value = true;
  try {
    const res = await api.post('/api/v1/invoices/process-late-fees');
    if (res.data?.success) {
      await showSuccess('สำเร็จ', res.data.message || 'ประมวลผลค่าปรับเรียบร้อยแล้ว');
      await invoiceStore.fetchInvoices();
    }
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถประมวลผลค่าปรับได้');
  } finally {
    runningLateFees.value = false;
  }
};

const handleExportCsv = async () => {
  const buildingId = buildingStore.activeBuildingId;
  if (!buildingId) return showError('ข้อผิดพลาด', 'กรุณาเลือกตึกก่อน');

  const now = new Date();
  const defaultCycle = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  const cycle = window.prompt('ระบุรอบบิล (เช่น 09-2026):', defaultCycle);
  if (!cycle) return;

  exportingCsv.value = true;
  try {
    const res = await api.get(`/api/v1/buildings/${buildingId}/reports/monthly-csv`, {
      params: { cycle },
      responseType: 'blob'
    });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${cycle}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถ export CSV ได้');
  } finally {
    exportingCsv.value = false;
  }
};
const roomStore = useRoomStore();
const invoiceStore = useInvoiceStore();
const buildingStore = useBuildingStore();

const showEditModal = ref(false);
const selectedInvoice = ref(null);

const showPaymentModal = ref(false);
const payingInvoice = ref(null);
const recordingPayment = ref(false);

const showPrintModal = ref(false);
const printingInvoice = ref(null);

const sendingReminderId = ref(null);
const sendingBulkReminder = ref(false);
const rejectingSlipId = ref(null);
const approvingSlipId = ref(null);

const showSlipModal = ref(false);
const slipModalInvoice = ref(null);

const openSlipModal = (inv) => {
  slipModalInvoice.value = inv;
  showSlipModal.value = true;
};

const unpaidCount = computed(() => {
  return invoiceStore.invoices.filter((i) => i.status !== 'paid').length;
});

const expandedIds = ref(new Set());
const toggleDetail = (id) => {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id);
  } else {
    expandedIds.value.add(id);
  }
};

const statusBadgeVariant = (status) => {
  if (status === 'paid') return 'success';
  if (status === 'pending' || status === 'draft' || status === 'reviewing') return 'warning';
  if (status === 'overdue' || status === 'void' || status === 'rejected') return 'danger';
  return 'neutral';
};

const paymentForm = reactive({
  paymentMethod: 'CASH',
  note: ''
});

const loadData = (buildingId) => {
  roomStore.fetchRooms(buildingId);
  invoiceStore.fetchInvoices({ buildingId });
};

onMounted(() => {
  loadData(buildingStore.activeBuildingId);
});

watch(
  () => buildingStore.activeBuildingId,
  (newBuildingId) => {
    loadData(newBuildingId);
  }
);

const openCreateModal = () => {
  selectedInvoice.value = null;
  showEditModal.value = true;
};

const openEditModal = (inv) => {
  selectedInvoice.value = inv;
  showEditModal.value = true;
};

const openPaymentModal = (inv) => {
  payingInvoice.value = inv;
  paymentForm.paymentMethod = 'CASH';
  paymentForm.note = '';
  showPaymentModal.value = true;
};

const openPrintModal = (inv) => {
  printingInvoice.value = inv;
  showPrintModal.value = true;
};

const triggerPrint = () => {
  window.print();
};

const handleRecordPayment = async () => {
  recordingPayment.value = true;
  try {
    const res = await invoiceStore.recordManualPayment(payingInvoice.value.id, {
      paymentMethod: paymentForm.paymentMethod,
      note: paymentForm.note
    });

    await showSuccess('สำเร็จ!', res.message || 'บันทึกรับชำระเงินเรียบร้อยแล้ว');
    showPaymentModal.value = false;
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึกรับชำระเงินได้');
  } finally {
    recordingPayment.value = false;
  }
};

const handleRemindSingle = async (inv) => {
  const roomNum = inv.room?.roomNumber || 'N/A';
  const tenantName = inv.tenant ? `${inv.tenant.firstName} ${inv.tenant.lastName}` : 'ผู้เช่า';
  const amountStr = Number(inv.grandTotal).toLocaleString();

  if (!inv.tenant?.lineUserId) {
    showError(
      'ไม่สามารถส่ง LINE ได้',
      `ผู้เช่าห้อง ${roomNum} (${tenantName}) ยังไม่ได้ผูกบัญชี LINE OA จึงไม่สามารถส่งข้อความแจ้งเตือนได้`
    );
    return;
  }

  const confirmed = await showConfirm(
    'ส่ง LINE แจ้งเตือนบิลค้างชำระ?',
    `ต้องการส่งข้อความ LINE Flex Message แจ้งเตือนยอดค้างชำระบิล ${inv.invoiceNumber} (ยอด ฿${amountStr}) ไปยังห้อง ${roomNum} (${tenantName}) ใช่หรือไม่?`,
    'ส่ง LINE แจ้งเตือน',
    'ยกเลิก'
  );

  if (!confirmed) return;

  sendingReminderId.value = inv.id;
  try {
    const res = await invoiceStore.remindInvoice(inv.id);
    await showSuccess('ส่ง LINE สำเร็จ!', res.message || `ส่งข้อความแจ้งเตือนบิลห้อง ${roomNum} เรียบร้อยแล้ว`);
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถส่งข้อความ LINE ได้');
  } finally {
    sendingReminderId.value = null;
  }
};

const handleRemindBulk = async () => {
  const currentUnpaidCount = unpaidCount.value;
  if (currentUnpaidCount === 0) {
    showError('แจ้งเตือน', 'ไม่มีบิลที่ค้างชำระในรายการปัจจุบัน');
    return;
  }

  const confirmed = await showConfirm(
    'ส่ง LINE เตือนยอดค้างทั้งหมด?',
    `ต้องการส่งข้อความ LINE Flex Message แจ้งเตือนไปยังห้องที่ค้างชำระทั้งหมด ${currentUnpaidCount} รายการ ใช่หรือไม่?`,
    'ส่ง LINE เตือนทั้งหมด',
    'ยกเลิก'
  );

  if (!confirmed) return;

  sendingBulkReminder.value = true;
  try {
    const res = await invoiceStore.remindBulkInvoices({
      buildingId: buildingStore.activeBuildingId
    });
    await showSuccess('ส่งการแจ้งเตือนสำเร็จ!', res.message || 'ส่ง LINE แจ้งเตือนบิลค้างชำระเรียบร้อยแล้ว');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถส่งแจ้งเตือนกลุ่มได้');
  } finally {
    sendingBulkReminder.value = false;
  }
};

const handleRejectSlip = async (inv) => {
  // ต้องปิด Dialog (Radix) ก่อนเปิด SweetAlert เสมอ — ถ้าเปิดซ้อนกัน focus-trap ของ Dialog
  // จะแย่ง focus กับปุ่มใน SweetAlert ทำให้กดยืนยัน/ยกเลิกใน prompt ไม่ติด
  showSlipModal.value = false;

  const reason = await showPrompt(
    'ปฏิเสธสลิป',
    `ปฏิเสธสลิปของห้อง ${inv.room?.roomNumber || ''} (ยอด ฿${Number(inv.grandTotal).toLocaleString()}) และแจ้งเตือนลูกบ้านให้ส่งใหม่`,
    'ระบุเหตุผล (เช่น ยอดเงินไม่ตรง, สลิปไม่ชัดเจน)'
  );
  if (reason === null) return;

  rejectingSlipId.value = inv.id;
  try {
    await invoiceStore.updateStatus(inv.id, 'pending', { rejectionReason: reason.trim() || undefined });
    showSuccess('ปฏิเสธสลิปเรียบร้อย', 'ระบบแจ้งเตือนลูกบ้านให้ส่งสลิปใหม่ทาง LINE แล้ว');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถปฏิเสธสลิปได้');
  } finally {
    rejectingSlipId.value = null;
  }
};

const handleApproveSlip = async (inv) => {
  // เหตุผลเดียวกับ handleRejectSlip: ปิด Dialog ก่อนเปิด SweetAlert เสมอ
  showSlipModal.value = false;

  const confirmed = await showConfirm(
    'ยืนยันการอนุมัติสลิป?',
    `ยืนยันยอดเงิน ฿${Number(inv.grandTotal).toLocaleString()} ของห้อง ${inv.room?.roomNumber || ''}`,
    'อนุมัติ',
    'ยกเลิก'
  );
  if (!confirmed) return;

  approvingSlipId.value = inv.id;
  try {
    await invoiceStore.updateStatus(inv.id, 'paid');
    showSuccess('อนุมัติสลิปเรียบร้อยแล้ว', `บันทึกบิลห้อง ${inv.room?.roomNumber || ''} เป็นชำระแล้ว`);
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถอนุมัติสลิปได้');
  } finally {
    approvingSlipId.value = null;
  }
};
</script>

<style scoped>
@media print {
  body > *:not(#print-modal-root) {
    display: none !important;
  }

  #print-modal-root {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
  }

  #print-modal-root > div {
    max-width: 100% !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }

  #printable-receipt {
    padding: 20px !important;
    border-top: none !important;
  }

  .no-print {
    display: none !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
