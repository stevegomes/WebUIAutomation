package com.facebook.base;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class TestWeb {

	public static void main(String[] args) throws InterruptedException 
	{
		WebDriver driver = new FirefoxDriver();
		driver.manage().window().maximize();
		driver.get("https://www.flipkart.com/");
		Thread.sleep(15000);
		/*driver.findElement(By.xpath("//*[@id='email']")).sendKeys("stevegomester@gmail.com");
		driver.findElement(By.xpath("//*[@id='pass']")).sendKeys("Strongsteve@123#");
		driver.findElement(By.xpath("//*[@id='loginbutton']")).click();
		Thread.sleep(15000);*/
		WebDriverWait wait = new WebDriverWait(driver, 10);
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[@id='container']/div/header/div[2]/div/ul/li[4]/a")));
		WebElement el = driver.findElement(By.xpath("//*[@id='container']/div/header/div[2]/div/ul/li[4]/a"));
		Actions builder = new Actions(driver);
		Action mouse = builder.moveToElement(el).build();
		mouse.perform();
		/*driver.findElement(By.xpath("//*[@id='userNavigationLabel']")).click();
		Thread.sleep(3000);
		driver.findElement(By.xpath("//*[@id='BLUE_BAR_ID_DO_NOT_USE']/div/div/div[1]/div/div/ul/li[16]/a/span/span")).click();
		Thread.sleep(5000);*/
		driver.close();

	}

}
