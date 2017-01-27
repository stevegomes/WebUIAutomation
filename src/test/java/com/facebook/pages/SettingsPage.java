package com.facebook.pages;

import java.io.IOException;

import org.openqa.selenium.WebDriver;

import com.facebook.base.Base;

public class SettingsPage extends Base

{
	WebDriver driverW;

	public SettingsPage(WebDriver driverW) throws IOException {
		super(driverW);
		// TODO Auto-generated constructor stub
	}
	
	public void settings() throws InterruptedException
	{
		 click("settings");
		   Thread.sleep(3000);
	}

	public void logout()
	{
		  click("logout");
		  
	}

}
