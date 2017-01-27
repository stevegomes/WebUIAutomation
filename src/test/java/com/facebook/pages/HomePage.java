package com.facebook.pages;

import java.io.IOException;

import org.openqa.selenium.WebDriver;

import com.facebook.base.Base;

public class HomePage extends Base
{
	WebDriver driverW;
	
	public HomePage(WebDriver driverW) throws IOException 
	{
		super(driverW);
	}
	
	public void username(String username)
	{
		 input("username_xpath", username);
	}
	
	public void password(String password)
	{
		 input("password_xpath", password);
	}
	
	public void loginaction() throws InterruptedException
	{
		click("login_button");
		Thread.sleep(10000);
	}
  
    
	
}
