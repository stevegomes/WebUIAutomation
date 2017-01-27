package com.facebook.testCases;

import java.io.IOException;
import java.util.Hashtable;

import org.testng.SkipException;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import com.facebook.base.Base;
import com.facebook.config.WebAppConfiguration;
import com.facebook.pages.HomePage;
import com.facebook.pages.SettingsPage;
import com.facebook.util.MyTestResultListnerMobile;
import com.facebook.util.TestUtil;


@Listeners(MyTestResultListnerMobile.class)
public class LoginTest 
{
	
	public static WebAppConfiguration config;
	
	
	@BeforeSuite //initializes the Webdriver
	public void setup()
	{
		config = new WebAppConfiguration();
		//config.setupWebConfig();
	}

	@Test(priority=1,dataProvider="getData")
	public void FacebookLogin(Hashtable<String,String> data) throws IOException, InterruptedException
	{

		config.setupWebConfig(data.get("Browser"));
		// check the runmode of test case
		if(!TestUtil.isExecutable("LoginFacebook",Base.xls1))
		throw new SkipException("Runmode set to NO");
		
		// check runmode for data set
		if(!data.get("Runmode").equals("Y"))
		throw new SkipException("Runmode set to NO for the data set");
		
		HomePage page1 = new HomePage(config.getDriverW());
		page1.username(data.get("Username"));
		page1.password(data.get("Password"));
		page1.loginaction();
		SettingsPage page2 = new SettingsPage(config.getDriverW());
		page2.settings();
		page2.logout();
		
		
	}

	@AfterMethod
	public void teardown()
	{
		config.closeBrowser();
		
	}
	
	@DataProvider
	public Object[][] getData(){
		return TestUtil.getData("LoginFacebook",Base.xls1);
	}
}
