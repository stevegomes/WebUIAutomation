package com.facebook.testCases;

import java.io.IOException;

import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import com.facebook.base.Base;
import com.facebook.pages.Profilepage;
import com.facebook.util.MyTestResultListnerMobile;
import com.facebook.util.TestUtil;

@Listeners(MyTestResultListnerMobile.class)
public class Profiletest 
{
	
	@Test(priority=2)
	public void profiletest() throws IOException, InterruptedException
	{
		if(!TestUtil.isExecutable("Profile",Base.xls1))
			throw new SkipException("Runmode set to NO");
		LoginTest.config.setupWebConfig("Chrome");
		Base b1 = new Base(LoginTest.config.getDriverW());
	    b1.defaultlogin();
		Profilepage page = new Profilepage(LoginTest.config.getDriverW());
		page.profilename();
		page.aboutprofile();
		Assert.fail("This is an intentional fail");
	}
	@AfterMethod
	public void teardown()
	{
		LoginTest.config.closeBrowser();
		
	}

}
