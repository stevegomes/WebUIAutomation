package com.facebook.testCases;

import java.io.IOException;

import org.testng.SkipException;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import com.facebook.base.Base;
import com.facebook.pages.SettingsPage;
import com.facebook.util.MyTestResultListnerMobile;
import com.facebook.util.TestUtil;

@Listeners(MyTestResultListnerMobile.class)
public class Logouttest {

	
	@Test(priority=3)
	public void logouttest() throws IOException, InterruptedException
	{
		if(!TestUtil.isExecutable("Settings",Base.xls1))
			 throw new SkipException("Runmode set to NO");
		LoginTest.config.setupWebConfig("Mozilla");
		Base b2 = new Base(LoginTest.config.getDriverW());
		b2.defaultlogin();
		SettingsPage page = new SettingsPage(LoginTest.config.getDriverW());
		page.settings();
		page.logout();
	}
	@AfterMethod
	public void teardown()
	{
		LoginTest.config.closeBrowser();
		
	}
}
