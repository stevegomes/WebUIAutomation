package com.facebook.config;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URL;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.safari.SafariDriver;

import com.facebook.base.Base;



public class WebAppConfiguration {

	// Create global variable

	Properties prop = new Properties();
	

	WebDriver driverW;
	public WebDriver setupWebConfig(String bType) throws IOException, InterruptedException
	{
		FileInputStream fs = new FileInputStream(System.getProperty("user.dir")+ "/src/test/java/com/facebook/config/WebOR.properties");
		prop.load(fs);
		if(!WebAppConfiguration.GRID_RUN){
			// local machine
			if(bType.equals("Mozilla"))
				driverW= new FirefoxDriver();
			else if(bType.equals("Chrome")){
				System.setProperty("webdriver.chrome.driver",prop.getProperty("chromedriver"));
				driverW= new ChromeDriver();
			}
			else if(bType.equals("Safari"))
				driverW=new SafariDriver();
			
		}else{
			// grid
			DesiredCapabilities cap=null;
			if(bType.equals("Mozilla")){
				cap = DesiredCapabilities.firefox();
				cap.setBrowserName("firefox");
				cap.setJavascriptEnabled(true);
				cap.setPlatform(org.openqa.selenium.Platform.MAC);
				
			}else if(bType.equals("Chrome")){
				 cap = DesiredCapabilities.chrome();
				 cap.setBrowserName("chrome");
				 cap.setPlatform(org.openqa.selenium.Platform.MAC);
			}
			else if(bType.equals("Safari")){
				 cap = DesiredCapabilities.safari();
				 cap.setBrowserName("safari");
				 cap.setPlatform(org.openqa.selenium.Platform.MAC);
			}
			try {
				driverW = new RemoteWebDriver(new URL("http://localhost:4444/wd/hub"), cap);
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		driverW.manage().timeouts().implicitlyWait(20, TimeUnit.SECONDS);
		driverW.manage().window().maximize();
		driverW.get("http://www.facebook.com");
		Thread.sleep(6000);
		return driverW;
		
	}
	
	public static boolean GRID_RUN=false;
	
	public void closeBrowser()
	{
		if(driverW!=null)
		{
		driverW.quit();
		}
	}

	
	public WebDriver getDriverW()
	{
		return driverW;
	}
	

}