package com.facebook.base;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Date;
import java.util.Properties;


import org.apache.commons.io.FileUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;


import com.facebook.util.Xls_Reader;


public class Base {
	static WebDriver driver;
	public static Xls_Reader xls1= new Xls_Reader(System.getProperty("user.dir")+"/src/test/java/com/facebook/xls/TestCasesFacebookWeb.xlsx");
	

	Properties OR = new Properties();

	public Base(WebDriver driverW) throws IOException 
	{
		Base.driver = driverW;

		try {
			FileInputStream fs = new FileInputStream(System.getProperty("user.dir")+ "/src/test/java/com/facebook/config/WebOR.properties");
			OR.load(fs);
		} catch (FileNotFoundException e) 
		{
			e.printStackTrace();
		}
		
	}

/////These are all the custom function//////
	
	public void move(String xpathkey)
	{
		WebElement element = driver.findElement(By.xpath(xpathkey));
		Actions act = new Actions(driver);
		Action moouserover = act.moveToElement(element).build();
		moouserover.perform();
		
	}
	
	public void getURL(String xpathKey)
	{
		driver.get(OR.getProperty(xpathKey));
		driver.manage().window().maximize();
	}
	
	public void click(String xpathKey) {
		try {
			driver.findElement(By.xpath(OR.getProperty(xpathKey))).click();
		} catch (Exception e) {
			System.out.println("error");
			e.printStackTrace();
			// report error
		}
	}
   // inputtext
	public void input(String xpathKey, String text) {
		try {
			driver.findElement(By.xpath(OR.getProperty(xpathKey))).sendKeys(text);
		} catch (Exception e) {
			// report error
			e.printStackTrace();
		}
	}

	// verification
	public boolean isElementPresent(String xpathKey) {
		try {
			driver.findElement(By.xpath(OR.getProperty(xpathKey)));
		} catch (Exception e) {
			return false;
		}

		return true;
	}

	// finds the link on page
	public boolean isLinkPresent(String linkText) {
		try {
			driver.findElement(By.linkText(linkText));
		} catch (Exception e) {
			return false;
		}

		return true;
	}

	public String text(String xpathkey)// gettext
	{
		// WebDriverWait wait = new WebDriverWait (driver,10);
		// wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath(OR.getProperty(xpathkey))));

		String actual_text = driver.findElement(By.xpath(OR.getProperty(xpathkey))).getText();
		return actual_text;
		//System.out.println("Actual text is:" + actual_text);
		// Assert.assertEquals(actual_text,expected );
	}
	
	public void defaultlogin() throws InterruptedException //this is a generic function
	{
		driver.findElement(By.xpath(OR.getProperty("username_xpath"))).sendKeys("odpyzdbxxd_1483952209@tfbnw.net");
		driver.findElement(By.xpath(OR.getProperty("password_xpath"))).sendKeys("Steve@123#");
		driver.findElement(By.xpath(OR.getProperty("login_button"))).click();
		Thread.sleep(4000);
		//driver.switchTo().alert().accept();
	}

	public static void takeScreenshot() 
	{
		// fileName of the screenshot
	Date d=new Date();
	String screenshotFile=d.toString().replace(":", "_").replace(" ", "_")+".png";
				// store screenshot in that file
		File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
		try {
			FileUtils.copyFile(scrFile, new File(System.getProperty("user.dir")+ "/screenshots/" + screenshotFile));
		} catch (IOException e) {

			e.printStackTrace();
		}
}
	
	

}
