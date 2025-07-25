const { test, expect } = require('@playwright/test');

// Helper function to generate random strings
function generateRandomString(length = 8) {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Test data
const testData = {
  loginCredentials: {
    email: 'amol.shete+TP@medarch.com',
    password: 'Test@123$'
  },
  provider: {
    firstName: generateRandomString(6),
    lastName: generateRandomString(6),
    role: 'Provider',
    email: `${generateRandomString(8)}@yopmail.com`,
    gender: 'Male'
  },
  patient: {
    firstName: generateRandomString(6),
    lastName: generateRandomString(6),
    dateOfBirth: '09-11-1999',
    gender: 'Male',
    mobile: '9876544400',
    email: `${generateRandomString(8)}@yopmail.com`
  },
  appointment: {
    appointmentType: 'New Patient Visit',
    reasonForVisit: 'Fever',
    timeZone: 'Alaska Standard Time (GMT -09:00)',
    visitType: 'Telehealth'
  }
};

test.describe('Healthcare E2E Flow - Patient Registration & Appointment Scheduling', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 60000
  });

  test('Complete E2E Flow', async ({ page }) => {
    // Step 1: Login
    console.log('Step 1: Logging in...');
    await page.goto('https://stage_ketamin.uat.provider.ecarehealth.com/');
    
    // Wait for login page to load
    await page.waitForLoadState('networkidle');
    
    // Fill login credentials
    await page.fill('input[type="email"], input[name="email"], input[id*="email"]', testData.loginCredentials.email);
    await page.fill('input[type="password"], input[name="password"], input[id*="password"]', testData.loginCredentials.password);
    
    // Click login button
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    
    // Wait for dashboard
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Step 2: Click "Let's Get Started" if present
    console.log('Step 2: Looking for "Let\'s Get Started" button...');
    const getStartedButton = page.locator('button:has-text("Let\'s Get Started"), button:has-text("Get Started")');
    if (await getStartedButton.isVisible({ timeout: 5000 })) {
      await getStartedButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Step 3: Navigate to Create > Settings > User Settings
    console.log('Step 3: Navigating to User Settings...');
    
    // Click Create menu
    await page.click('text=Create, button:has-text("Create"), a:has-text("Create"), span:has-text("Create")');
    await page.waitForTimeout(1000);
    
    // Click Settings
    await page.click('text=Settings >> visible=true');
    await page.waitForLoadState('networkidle');
    
    // Click User Settings
    await page.click('text=User Settings >> visible=true');
    await page.waitForLoadState('networkidle');
    
    // Step 4: Add Provider User
    console.log('Step 4: Adding Provider User...');
    
    // Click Providers tab
    await page.click('text=Providers, button:has-text("Providers"), a:has-text("Providers"), [role="tab"]:has-text("Providers")');
    await page.waitForTimeout(2000);
    
    // Click Add Provider User button
    await page.click('button:has-text("Add Provider User"), button:has-text("Add Provider"), button:has-text("+ Provider")');
    await page.waitForTimeout(2000);
    
    // Fill provider form
    await page.fill('input[name="firstName"], input[placeholder*="First Name"]', testData.provider.firstName);
    await page.fill('input[name="lastName"], input[placeholder*="Last Name"]', testData.provider.lastName);
    
    // Select role
    const roleDropdown = page.locator('select[name="role"], select[id*="role"]');
    if (await roleDropdown.isVisible()) {
      await roleDropdown.selectOption({ label: testData.provider.role });
    } else {
      await page.click('div[role="combobox"], input[placeholder*="Role"]');
      await page.click(`text=${testData.provider.role}`);
    }
    
    // Fill email
    await page.fill('input[name="email"], input[type="email"]:not([disabled])', testData.provider.email);
    
    // Select gender
    const genderDropdown = page.locator('select[name="gender"], select[id*="gender"]');
    if (await genderDropdown.isVisible()) {
      await genderDropdown.selectOption({ label: testData.provider.gender });
    } else {
      await page.click('div[role="combobox"]:has-text("Gender"), input[placeholder*="Gender"]');
      await page.click(`text=${testData.provider.gender}`);
    }
    
    // Fill any other visible mandatory fields
    const mandatoryInputs = await page.locator('input[required]:visible, input:has(+ span:has-text("*")):visible').all();
    for (const input of mandatoryInputs) {
      const value = await input.getAttribute('value');
      if (!value) {
        const type = await input.getAttribute('type');
        if (type === 'tel' || type === 'phone') {
          await input.fill('1234567890');
        } else if (type === 'text' && !(await input.getAttribute('name'))?.includes('email')) {
          await input.fill('Test Value');
        }
      }
    }
    
    // Click Save
    await page.click('button:has-text("Save"):visible');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Step 5: Set Provider Availability
    console.log('Step 5: Setting Provider Availability...');
    
    // Navigate to Scheduling > Availability
    await page.click('text=Scheduling, button:has-text("Scheduling"), a:has-text("Scheduling")');
    await page.waitForTimeout(1000);
    await page.click('text=Availability >> visible=true');
    await page.waitForLoadState('networkidle');
    
    // Click Edit Availability
    await page.click('button:has-text("Edit Availability"), button:has-text("Edit"), a:has-text("Edit Availability")');
    await page.waitForTimeout(2000);
    
    // Select Provider - Leena Brown
    const providerSelect = page.locator('select:has-text("Provider"), input[placeholder*="Provider"], div:has-text("Select Provider")');
    if (await providerSelect.isVisible()) {
      await providerSelect.click();
      await page.fill('input[placeholder*="Search"]', 'Leena Brown');
      await page.click('text=Leena Brown >> visible=true');
    }
    
    // Select Time Zone
    const timezoneSelect = page.locator('select[name*="timezone"], input[placeholder*="Time Zone"], div:has-text("Time Zone")');
    if (await timezoneSelect.isVisible()) {
      await timezoneSelect.click();
      await page.click('text=Alaska Standard Time (GMT -09:00)');
    }
    
    // Set Booking Window
    await page.fill('input[name*="bookingWindow"], input[placeholder*="Booking Window"]', '1');
    
    // Enable Set to Weekdays toggle
    await page.click('input[type="checkbox"]:has-text("Set to Weekdays"), label:has-text("Set to Weekdays"), text=Set to Weekdays');
    
    // Set Start Time (9:00 AM)
    await page.fill('input[name*="startTime"], input[placeholder*="Start Time"]', '09:00');
    
    // Set End Time (5:00 PM)
    await page.fill('input[name*="endTime"], input[placeholder*="End Time"]', '17:00');
    
    // Click Save
    await page.click('button:has-text("Save"):visible');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Step 6: Patient Registration
    console.log('Step 6: Creating New Patient...');
    
    // Navigate to Create > New Patient
    await page.click('text=Create, button:has-text("Create"), a:has-text("Create")');
    await page.waitForTimeout(1000);
    await page.click('text=New Patient >> visible=true');
    await page.waitForLoadState('networkidle');
    
    // Click Enter Patient Details
    const enterDetailsButton = page.locator('button:has-text("Enter Patient Details"), text=Enter Patient Details');
    if (await enterDetailsButton.isVisible({ timeout: 5000 })) {
      await enterDetailsButton.click();
      await page.waitForTimeout(2000);
      
      // Click Next if present
      const nextButton = page.locator('button:has-text("Next"):visible');
      if (await nextButton.isVisible({ timeout: 3000 })) {
        await nextButton.click();
      }
    }
    
    // Fill patient details
    await page.fill('input[name="firstName"], input[placeholder*="First Name"]:visible', testData.patient.firstName);
    await page.fill('input[name="lastName"], input[placeholder*="Last Name"]:visible', testData.patient.lastName);
    
    // Fill Date of Birth
    await page.fill('input[name*="dateOfBirth"], input[placeholder*="Date of Birth"], input[type="date"]', '1999-11-09');
    
    // Select Gender
    const patientGenderDropdown = page.locator('select[name="gender"], select[id*="gender"]:visible');
    if (await patientGenderDropdown.isVisible()) {
      await patientGenderDropdown.selectOption({ label: testData.patient.gender });
    } else {
      await page.click('div[role="combobox"]:has-text("Gender"):visible, input[placeholder*="Gender"]:visible');
      await page.click(`text=${testData.patient.gender}`);
    }
    
    // Fill Contact Info
    await page.fill('input[name*="mobile"], input[name*="phone"], input[placeholder*="Mobile"], input[placeholder*="Phone"]', testData.patient.mobile);
    await page.fill('input[name="email"], input[type="email"]:not([disabled]):visible', testData.patient.email);
    
    // Click Save
    await page.click('button:has-text("Save"):visible');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Step 7: Schedule Appointment
    console.log('Step 7: Scheduling Appointment...');
    
    // Navigate to Create > New Appointment
    await page.click('text=Create, button:has-text("Create"), a:has-text("Create")');
    await page.waitForTimeout(1000);
    await page.click('text=New Appointment >> visible=true');
    await page.waitForLoadState('networkidle');
    
    // Fill appointment form
    // Select Patient
    const patientSelect = page.locator('input[placeholder*="Patient"], div:has-text("Patient Name")');
    if (await patientSelect.isVisible()) {
      await patientSelect.click();
      await page.fill('input[placeholder*="Search"]', testData.patient.firstName);
      await page.waitForTimeout(1000);
      await page.click(`text=${testData.patient.firstName} ${testData.patient.lastName}`);
    }
    
    // Select Appointment Type
    const appointmentTypeSelect = page.locator('select[name*="appointmentType"], input[placeholder*="Appointment Type"]');
    if (await appointmentTypeSelect.isVisible()) {
      await appointmentTypeSelect.click();
      await page.click(`text=${testData.appointment.appointmentType}`);
    }
    
    // Fill Reason for Visit
    await page.fill('input[name*="reason"], textarea[name*="reason"], input[placeholder*="Reason"]', testData.appointment.reasonForVisit);
    
    // Select Time Zone
    const appointmentTimezone = page.locator('select[name*="timezone"]:visible, input[placeholder*="Time Zone"]:visible');
    if (await appointmentTimezone.isVisible()) {
      await appointmentTimezone.click();
      await page.click('text=Alaska Standard Time (GMT -09:00)');
    }
    
    // Select Visit Type
    const visitTypeSelect = page.locator('select[name*="visitType"], input[placeholder*="Visit Type"]');
    if (await visitTypeSelect.isVisible()) {
      await visitTypeSelect.click();
      await page.click(`text=${testData.appointment.visitType}`);
    }
    
    // Select Provider (Leena Brown)
    const appointmentProvider = page.locator('select[name*="provider"], input[placeholder*="Provider"]:visible');
    if (await appointmentProvider.isVisible()) {
      await appointmentProvider.click();
      await page.fill('input[placeholder*="Search"]', 'Leena Brown');
      await page.click('text=Leena Brown >> visible=true');
    }
    
    // Click View Availability
    await page.click('button:has-text("View Availability"), text=View Availability');
    await page.waitForTimeout(3000);
    
    // Select available date and time
    const availableSlot = page.locator('.available-slot, button.time-slot:not([disabled]), div.available-time').first();
    if (await availableSlot.isVisible()) {
      await availableSlot.click();
    } else {
      // Try clicking on first available date
      await page.click('td.available, div.available-date, button.date-available').first();
      await page.waitForTimeout(1000);
      // Then click on first available time
      await page.click('.time-slot:not([disabled]), button.time:not([disabled])').first();
    }
    
    // Click Save and Close
    await page.click('button:has-text("Save and Close"), button:has-text("Save & Close"), button:has-text("Save"):visible');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Step 8: Verify Appointment
    console.log('Step 8: Verifying Appointment...');
    
    // Navigate to Scheduling > Appointments
    await page.click('text=Scheduling, button:has-text("Scheduling"), a:has-text("Scheduling")');
    await page.waitForTimeout(1000);
    await page.click('text=Appointments >> visible=true');
    await page.waitForLoadState('networkidle');
    
    // Verify appointment is listed
    const appointmentListing = page.locator(`text=${testData.patient.firstName}, text=${testData.patient.lastName}`);
    await expect(appointmentListing).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Test completed successfully!');
    console.log(`Provider created: ${testData.provider.firstName} ${testData.provider.lastName}`);
    console.log(`Patient created: ${testData.patient.firstName} ${testData.patient.lastName}`);
    console.log('Appointment scheduled and verified!');
  });
});