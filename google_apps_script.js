/**
 * =========================================================================
 * TIFFINMATE x GOOGLE SHEETS FULL TWO-WAY AUTO-SYNC SCRIPT
 * =========================================================================
 * 
 * 1. वेबसाइट से शीट में डेटा कैसे आएगा (जब वेंडर ऑर्डर/मील पंच करेगा):
 *    - Google Apps Script को "Web App" के रूप में Deploy किया जाता है।
 *    - जब भी वेंडर वेबसाइट पर कोई मील पंच करेगा, वेबसाइट सीधे इस शीट के `doPost(e)` 
 *      पर भेजेगी और शीट के 'LiveOrders' व 'DishApprovals' में तुरंत नई पंक्ति जुड़ जाएगी।
 * 
 * 2. शीट से वेबसाइट में डेटा कैसे जाएगा (जब आप नया रेट कार्ड या डिश जोड़ेंगे):
 *    - जब भी आप 'RateCard' में नई डिश (जैसे tea) या रेट बदलेंगे, यह स्वतः वेबसाइट 
 *      के वेबहुक पर सिंक हो जाएगा।
 */

// Live App Webhook URL
const APP_WEBHOOK_URL = "https://ais-dev-tfk2tv5urovpas7alj5xr2-146578201468.asia-southeast1.run.app/api/vendor/sheets/webhook";

/**
 * 1. शीट खुलते ही ऊपर कस्टम मेनू जोड़ेगा
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🍱 TiffinMate Menu")
    .addItem("🔄 1. Sync Rate Card to App (रेट कार्ड ऐप में भेजें)", "syncRateCardToApp")
    .addItem("📥 2. Pull Live Orders into Sheet (लाइव ऑर्डर्स शीट में लाएं)", "pullOrdersToSheet")
    .addItem("📊 3. Update Monday Payout & Wallet (सोमवार पेआउट अपडेट करें)", "updateMondayPayout")
    .addSeparator()
    .addItem("⚡ 4. Full Sync Everything (पूरी शीट सिंक करें)", "fullSyncAll")
    .addToUi();
}

/**
 * 2. वेबहुक रिसीवर (doPost): जब वेबसाइट से वेंडर ऑर्डर पंच करेगा या डिश जोड़ेगा
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = contents.action;

    // ए) नया ऑर्डर पंच हुआ वेबसाइट पर -> LiveOrders में तुरंत जोड़ें
    if (action === "new_vendor_order" && contents.order) {
      appendOrderToSheet(ss, contents.order);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Order logged in Sheet" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // बी) वेंडर ने नया फूड / मील अप्रूवल के लिए सबमिट किया -> DishApprovals में जोड़ें
    if (action === "vendor_dish_submission" && contents.dish) {
      appendDishApprovalToSheet(ss, contents.dish);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Dish approval logged in Sheet" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // सी) ऑर्डर स्टेटस अपडेट हुआ (उदा. Delivered -> वॉलेट क्रेडिटेड)
    if (action === "order_status_update") {
      updateOrderStatusInSheet(ss, contents.orderId, contents.newStatus);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // डी) कस्टमर कैंसिलेशन व रिफंड कटौती
    if (action === "refund_deduction" && contents.deduction) {
      appendRefundToSheet(ss, contents.deduction);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ई) सोमवार पेआउट स्नैपशॉट
    if (action === "sync_monday_payout" && contents.mondayPayoutRow) {
      writeMondayPayoutToSheet(ss, contents.mondayPayoutRow);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Unknown action: " + action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 3. रेट कार्ड ऐप में भेजना (और अपनी Web App Deployment URL भी ऐप को बताना)
 */
function syncRateCardToApp() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("RateCard") || ss.getSheets()[0];
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert("त्रुटि: 'RateCard' नाम का टैब नहीं मिला।");
    return;
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) {
    SpreadsheetApp.getUi().alert("RateCard टैब में डेटा पंक्तियाँ नहीं हैं।");
    return;
  }

  // यदि आपने Web App Deploy किया है, तो यह उसका URL खुद ले लेगा
  let deployedUrl = "";
  try {
    deployedUrl = ScriptApp.getService().getUrl() || "";
  } catch (e) {}

  const payload = {
    action: "sync_rate_card",
    spreadsheetId: ss.getId(),
    scriptWebhookUrl: deployedUrl,
    rows: rows
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(APP_WEBHOOK_URL, options);
    const code = response.getResponseCode();
    const result = JSON.parse(response.getContentText());

    if (code === 200 && result.success) {
      if (result.liveOrders) writeOrdersToSheet(ss, result.liveOrders);
      if (result.refundsDeductions) writeRefundsToSheet(ss, result.refundsDeductions);
      if (result.mondayPayoutRow) writeMondayPayoutToSheet(ss, result.mondayPayoutRow);

      SpreadsheetApp.getActiveSpreadsheet().toast(
        `✅ सफलता! ${result.syncedCount || (rows.length - 1)} डिशेज़ ऐप में सिंक हो गईं।`, 
        "TiffinMate Sync", 
        6
      );
    } else {
      SpreadsheetApp.getUi().alert("सिंक त्रुटि: " + (result.message || response.getContentText()));
    }
  } catch (err) {
    SpreadsheetApp.getUi().alert("सर्वर से संपर्क करने में त्रुटि: " + err.toString());
  }
}

/**
 * 4. ऐप के लाइव ऑर्डर्स शीट में लोड करना
 */
function pullOrdersToSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const response = UrlFetchApp.fetch(APP_WEBHOOK_URL, { method: "get", muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());

    if (result.success && result.liveOrders) {
      writeOrdersToSheet(ss, result.liveOrders);
      if (result.refundsDeductions) writeRefundsToSheet(ss, result.refundsDeductions);
      if (result.mondayPayoutRow) writeMondayPayoutToSheet(ss, result.mondayPayoutRow);
      SpreadsheetApp.getActiveSpreadsheet().toast("✅ लाइव ऑर्डर्स व पेआउट शीट में लोड हो गए!", "TiffinMate", 5);
    }
  } catch (err) {
    SpreadsheetApp.getUi().alert("त्रुटि: " + err.toString());
  }
}

/**
 * 5. सोमवार पेआउट और रिफंड कटौती अपडेट करना
 */
function updateMondayPayout() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const response = UrlFetchApp.fetch(APP_WEBHOOK_URL, { method: "get", muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());

    if (result.success) {
      if (result.refundsDeductions) writeRefundsToSheet(ss, result.refundsDeductions);
      if (result.mondayPayoutRow) writeMondayPayoutToSheet(ss, result.mondayPayoutRow);
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `✅ सोमवार पेआउट गणना अपडेट! देय राशि: ₹${result.eligiblePay || 0}`, 
        "TiffinMate Payout", 
        6
      );
    }
  } catch (err) {
    SpreadsheetApp.getUi().alert("त्रुटि: " + err.toString());
  }
}

function fullSyncAll() {
  syncRateCardToApp();
}

/**
 * 6. सेल एडिट होते ही ऑटो-सिंक (जब भी आप RateCard में कुछ बदलेंगे)
 */
function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    
    // यदि RateCard में कुछ भी बदला
    if (sheetName === "RateCard") {
      Utilities.sleep(1500);
      syncRateCardToApp();
    }

    // यदि DishApprovals में स्टेटस बदला गया (उदा. PENDING से APPROVED)
    if (sheetName === "DishApprovals") {
      const range = e.range;
      if (range.getColumn() === 7) { // Status Column
        const newStatus = String(range.getValue()).toUpperCase();
        const dishId = sheet.getRange(range.getRow(), 1).getValue();
        if (dishId && (newStatus === "APPROVED" || newStatus === "REJECTED")) {
          // वेबसाइट को स्टेटस भेजें
          UrlFetchApp.fetch(APP_WEBHOOK_URL, {
            method: "post",
            contentType: "application/json",
            payload: JSON.stringify({
              action: "update_dish_status",
              dishId: dishId,
              status: newStatus
            }),
            muteHttpExceptions: true
          });
          SpreadsheetApp.getActiveSpreadsheet().toast(`डिश ${dishId} को ${newStatus} मार्क किया गया।`, "Approval", 4);
        }
      }
    }
  } catch (err) {}
}

// =========================================================================
// HELPER WRITER FUNCTIONS
// =========================================================================

function appendOrderToSheet(ss, order) {
  let sheet = ss.getSheetByName("LiveOrders");
  if (!sheet) {
    sheet = ss.insertSheet("LiveOrders");
    sheet.setTabColor("#2196F3");
    sheet.appendRow(["Order #", "Source", "Item Name", "Quantity", "Vendor Payout (₹)", "Status", "Created At", "Notes"]);
    sheet.getRange("A1:H1").setBackground("#1976D2").setFontColor("#FFFFFF").setFontWeight("bold");
  }

  sheet.appendRow([
    order.orderNumber,
    (order.source || "3P").toUpperCase(),
    order.itemName,
    order.quantity,
    order.totalVendorPayout,
    (order.status || "PREPARING").toUpperCase(),
    order.createdAt || new Date().toISOString(),
    order.notes || ""
  ]);
}

function appendDishApprovalToSheet(ss, dish) {
  let sheet = ss.getSheetByName("DishApprovals");
  if (!sheet) {
    sheet = ss.insertSheet("DishApprovals");
    sheet.setTabColor("#FFA000");
    sheet.appendRow(["Dish ID", "Dish Name", "Hindi Name", "Category", "Listing Price (₹)", "Vendor Payout (₹)", "Status (PENDING/APPROVED)", "Submitted At"]);
    sheet.getRange("A1:H1").setBackground("#FF8F00").setFontColor("#FFFFFF").setFontWeight("bold");
  }

  const firstPortion = (dish.portions && dish.portions[0]) ? dish.portions[0] : { listingPrice: 149, vendorPayoutRate: 60 };
  sheet.appendRow([
    dish.id,
    dish.name,
    dish.hindiName || dish.name,
    dish.categoryLabel || dish.category || "स्पेशल मील",
    firstPortion.listingPrice,
    firstPortion.vendorPayoutRate,
    dish.status || "PENDING",
    dish.submittedAt || new Date().toISOString()
  ]);
}

function updateOrderStatusInSheet(ss, orderId, newStatus) {
  const sheet = ss.getSheetByName("LiveOrders");
  if (!sheet) return;
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(orderId)) {
      sheet.getRange(i + 1, 6).setValue(String(newStatus).toUpperCase());
      break;
    }
  }
}

function appendRefundToSheet(ss, d) {
  let sheet = ss.getSheetByName("RefundsDeductions");
  if (!sheet) {
    sheet = ss.insertSheet("RefundsDeductions");
    sheet.setTabColor("#E53935");
    sheet.appendRow(["Deduction ID", "Order ID", "Customer Refund (₹)", "Vendor Cut Deducted (₹)", "Reason", "Timestamp", "Status"]);
    sheet.getRange("A1:G1").setBackground("#C62828").setFontColor("#FFFFFF").setFontWeight("bold");
  }

  sheet.appendRow([
    d.id,
    d.orderId,
    d.customerRefundAmount,
    d.vendorCutDeducted,
    d.reason,
    d.timestamp || new Date().toISOString(),
    (d.status || "DEDUCTED").toUpperCase()
  ]);
}

function writeOrdersToSheet(ss, orders) {
  let sheet = ss.getSheetByName("LiveOrders");
  if (!sheet) {
    sheet = ss.insertSheet("LiveOrders");
    sheet.setTabColor("#2196F3");
    sheet.appendRow(["Order #", "Source", "Item Name", "Quantity", "Vendor Payout (₹)", "Status", "Created At", "Notes"]);
    sheet.getRange("A1:H1").setBackground("#1976D2").setFontColor("#FFFFFF").setFontWeight("bold");
  }

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (orders.length > 0) {
    sheet.getRange(2, 1, orders.length, orders[0].length).setValues(orders);
  }
}

function writeRefundsToSheet(ss, refunds) {
  let sheet = ss.getSheetByName("RefundsDeductions");
  if (!sheet) {
    sheet = ss.insertSheet("RefundsDeductions");
    sheet.setTabColor("#E53935");
    sheet.appendRow(["Deduction ID", "Order ID", "Customer Refund (₹)", "Vendor Cut Deducted (₹)", "Reason", "Timestamp", "Status"]);
    sheet.getRange("A1:G1").setBackground("#C62828").setFontColor("#FFFFFF").setFontWeight("bold");
  }

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (refunds.length > 0) {
    sheet.getRange(2, 1, refunds.length, refunds[0].length).setValues(refunds);
  }
}

function writeMondayPayoutToSheet(ss, payoutRow) {
  let sheet = ss.getSheetByName("MondayPayouts");
  if (!sheet) {
    sheet = ss.insertSheet("MondayPayouts");
    sheet.setTabColor("#8E24AA");
    sheet.appendRow([
      "Settlement Batch #", 
      "Billing Cycle", 
      "Gross Wallet Balance (₹)", 
      "Refund Deductions (₹)", 
      "Minimum Reserve (₹)", 
      "Eligible Monday Transfer (₹)", 
      "Vendor Payout Channel", 
      "Transfer Status", 
      "Bank / UTR Reference"
    ]);
    sheet.getRange("A1:I1").setBackground("#6A1B9A").setFontColor("#FFFFFF").setFontWeight("bold");
  }
  sheet.getRange(2, 1, 1, payoutRow.length).setValues([payoutRow]);
}
