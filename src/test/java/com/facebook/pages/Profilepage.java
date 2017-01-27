package com.facebook.pages;

import java.io.IOException;

import org.openqa.selenium.WebDriver;

import com.facebook.base.Base;

public class Profilepage extends Base
{
   WebDriver driverW;
	public Profilepage(WebDriver driverW) throws IOException 
	{
		super(driverW);
		
	}
	
	public void profilename() throws InterruptedException
	{
		click("profile_name");
		Thread.sleep(5000);
	}
	
	public void aboutprofile() throws InterruptedException
	{
		click("aboutprofile");
		Thread.sleep(4000);
	}
	

}
