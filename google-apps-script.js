/**
 * Google Apps Script backend for Bihar Digital Data and Network (BDDN)
 * Connects the Enquiry & Contact forms directly with a Google Sheet.
 * 
 * =========================================================================
 * STEP-BY-STEP DEPLOYMENT INSTRUCTIONS:
 * =========================================================================
 * 1. Open Google Sheets (https://docs.google.com/spreadsheets).
 * 2. Create a new Spreadsheet and name it "BDDN Leads".
 * 3. Ensure the active tab sheet is named "Sheet1" (default).
 * 4. Add the following column names in the first row (A1 to H1):
 *    Timestamp | Name | Mobile | Email | Business Type | Service Needed | Budget Range | Message
 * 5. In the top menu, click Extensions -> Apps Script.
 * 6. Delete any existing template code in code.gs and paste this script file content.
 * 7. Click the Save icon (floppy disk).
 * 8. Click Deploy -> New Deployment.
 * 9. Select type "Web App" by clicking the gear icon next to "Select type".
 * 10. Set the deployment configuration:
 *     - Description: BDDN Leads Receiver
 *     - Execute as: Me (your-email@gmail.com)
 *     - Who has access: Anyone
 * 11. Click Deploy. Authorize access when prompted (review permissions -> advanced -> Go to BDDN Leads (unsafe) -> Allow).
 * 12. Copy the generated "Web App URL" (ends with /exec).
 * 13. Open your project file `js/script.js` locally.
 * 14. Find the constant `GOOGLE_SCRIPT_URL` at the top of the `initFormSubmissions` function:
 *     const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
 * 15. Replace that placeholder string with your copied Web App URL and save the script.js file.
 * =========================================================================
 */

function doPost(e) {
  try {
    // 1. Open the active sheet by name
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("Sheet1");
    
    // Fallback to active sheet if Sheet1 is renamed
    if (!sheet) {
      sheet = doc.getActiveSheet();
    }
    
    // 2. Extract parameters sent from frontend fetch request
    var timestamp = new Date();
    
    // Support both application/json payloads and urlencoded form parameters
    var name = e.parameter.name || "";
    var mobile = e.parameter.mobile || "";
    var email = e.parameter.email || "";
    var business = e.parameter.business || "";
    var service = e.parameter.service || "";
    var budget = e.parameter.budget || "";
    var message = e.parameter.message || "";
    
    // If the request came as JSON contents (e.g. Content-Type: application/json)
    if (e.postData && e.postData.contents) {
      try {
        var jsonData = JSON.parse(e.postData.contents);
        name = jsonData.name || name;
        mobile = jsonData.mobile || mobile;
        email = jsonData.email || email;
        business = jsonData.business || business;
        service = jsonData.service || service;
        budget = jsonData.budget || budget;
        message = jsonData.message || message;
      } catch (parseError) {
        // Fall back to URL parameters if JSON parse failed
      }
    }
    
    // 3. Append a new row to the sheet
    sheet.appendRow([
      timestamp,
      name,
      mobile,
      email,
      business,
      service,
      budget,
      message
    ]);
    
    // 4. Return success response with CORS-friendly TextOutput
    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    // Return error message if spreadsheet append failed
    return ContentService.createTextOutput("Error: " + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// Add simple doGet to verify that the script is alive
function doGet(e) {
  return ContentService.createTextOutput("BDDN Webhook Status: Active. Use POST request to submit leads.")
    .setMimeType(ContentService.MimeType.TEXT);
}
