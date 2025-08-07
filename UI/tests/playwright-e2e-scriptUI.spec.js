const { test, expect } = require('@playwright/test');

test.describe('E2E Sign Flow: Patient Registration + Appointment Scheduling', () => {
  test('Complete flow from login to appointment verification', async ({ page }) => {
    // Test data
    const loginCredentials = {
      email: 'amol.shete+TP@medarch.com',
      password: 'Test@123$'
    };

    const providerData = {
      firstName: 'Leena',
      lastName: 'Brown',
      email: 'leenabrwn@yopmail.com',
      gender: 'Male',
      role: 'Provider'
    };

    const patientData = {
      firstName: 'pavan',
      lastName: 'Ingale',
      dob: '09-11-1999',
      gender: 'Male',
      mobile: '9876544400',
      email: 'Pavaningale@yopmail.com'
    };

    const appointmentData = {
      patientName: 'pavan Ingale',
      appointmentType: 'New Patient Visit',
      reasonForVisit: 'Fever',
      timeZone: 'Alaska Standard Time (GMT -09:00)',
      visitType: 'Telehealth',
      provider: 'Leena Brown'
    };

    // Navigate to the application
    await page.goto('https://stage_ketamin.uat.provider.ecarehealth.com/');
    
    // Step 1: Login
    console.log('Step 1: Logging in...');
    await page.fill('input[type="email"]', loginCredentials.email);
    await page.fill('input[type="password"]', loginCredentials.password);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle');
    
    // Step 2: Click "Let's Get Started"
    console.log('Step 2: Clicking Let\'s Get Started...');
    await page.click('text="Let\'s Get Started"');
    
    // Step 3: Navigate to Create > Settings
    console.log('Step 3: Navigating to Settings...');
    await page.click('text="Create"');
    await page.click('text="Settings"');
    
    // Step 4: Click on User Settings
    console.log('Step 4: Clicking User Settings...');
    await page.click('text="User Settings"');
    
    // Step 5: Click on Providers tab
    console.log('Step 5: Clicking Providers tab...');
    await page.click('text="Providers"');
    
    // Step 6: Click Add Provider User button
    console.log('Step 6: Adding new provider...');
    await page.click('text="Add Provider User"');
    
    // Step 7: Fill provider form
    console.log('Step 7: Filling provider form...');
    await page.fill('input[name="firstName"]', providerData.firstName);
    await page.fill('input[name="lastName"]', providerData.lastName);
    await page.fill('input[name="email"]', providerData.email);
    
    // Select role
    await page.click('text="Select Role"');
    await page.click(`text="${providerData.role}"`);
    
    // Select gender
    await page.click('text="Select Gender"');
    await page.click(`text="${providerData.gender}"`);
    
    // Fill other mandatory fields (adjust selectors as needed)
    // This may need to be customized based on actual form fields
    
    // Save provider
    await page.click('button:has-text("Save")');
    await page.waitForLoadState('networkidle');
    
    // Step 8: Set Provider Availability
    console.log('Step 8: Setting provider availability...');
    await page.click('text="Scheduling"');
    await page.click('text="Availability"');
    await page.click('text="Edit Availability"');
    
    // Select provider
    await page.click('text="Select Provider"');
    await page.fill('input[placeholder="Search provider"]', providerData.firstName + ' ' + providerData.lastName);
    await page.click(`text="${providerData.firstName} ${providerData.lastName}"`);
    
    // Select timezone
    await page.click('text="Select Time Zone"');
    await page.click('text="Alaska Standard Time (GMT -09:00)"');
    
    // Set booking window
    await page.fill('input[name="bookingWindow"]', '1');
    await page.click('text="week"');
    
    // Enable weekdays
    await page.click('text="Set to Weekdays"');
    
    // Set time (example: 9 AM to 5 PM)
    await page.fill('input[name="startTime"]', '09:00');
    await page.fill('input[name="endTime"]', '17:00');
    
    // Save availability
    await page.click('button:has-text("Save")');
    await page.waitForLoadState('networkidle');
    
    // Step 9: Patient Registration
    console.log('Step 9: Creating new patient...');
    await page.click('text="Create"');
    await page.click('text="New Patient"');
    await page.click('text="Enter Patient Details"');
    await page.click('button:has-text("Next")');
    
    // Fill patient details
    await page.fill('input[name="firstName"]', patientData.firstName);
    await page.fill('input[name="lastName"]', patientData.lastName);
    await page.fill('input[name="dateOfBirth"]', patientData.dob);
    
    // Select gender
    await page.click('text="Select Gender"');
    await page.click(`text="${patientData.gender}"`);
    
    // Fill contact info
    await page.fill('input[name="mobile"]', patientData.mobile);
    await page.fill('input[name="email"]', patientData.email);
    
    // Save patient
    await page.click('button:has-text("Save")');
    await page.waitForLoadState('networkidle');
    
    // Step 10: Appointment Scheduling
    console.log('Step 10: Scheduling appointment...');
    await page.click('text="Create"');
    await page.click('text="New Appointment"');
    
    // Fill appointment form
    await page.fill('input[placeholder="Search patient"]', appointmentData.patientName);
    await page.click(`text="${appointmentData.patientName}"`);
    
    // Select appointment type
    await page.click('text="Select Appointment Type"');
    await page.click(`text="${appointmentData.appointmentType}"`);
    
    // Fill reason for visit
    await page.fill('input[name="reasonForVisit"]', appointmentData.reasonForVisit);
    
    // Select timezone
    await page.click('text="Select Time Zone"');
    await page.click(`text="${appointmentData.timeZone}"`);
    
    // Select visit type
    await page.click('text="Select Visit Type"');
    await page.click(`text="${appointmentData.visitType}"`);
    
    // Select provider
    await page.click('text="Select Provider"');
    await page.click(`text="${appointmentData.provider}"`);
    
    // View availability and select slot
    await page.click('text="View Availability"');
    await page.waitForSelector('.available-slot');
    await page.click('.available-slot:first-child');
    
    // Save appointment
    await page.click('text="Save and Close"');
    await page.waitForLoadState('networkidle');
    
    // Step 11: Verify Appointment
    console.log('Step 11: Verifying appointment...');
    await page.click('text="Scheduling"');
    await page.click('text="Appointments"');
    
    // Verify appointment exists
    await expect(page.locator(`text="${appointmentData.patientName}"`)).toBeVisible();
    
    console.log('✅ Test completed successfully!');
  });
});
