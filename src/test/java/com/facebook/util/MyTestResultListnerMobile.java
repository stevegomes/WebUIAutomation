package com.facebook.util;

import org.testng.ITestResult;
import org.testng.TestListenerAdapter;

import com.facebook.base.Base;


public class MyTestResultListnerMobile extends TestListenerAdapter
{
	
static int i=2;

	Xls_Reader xlse = new Xls_Reader(System.getProperty("user.dir")+"/src/test/java/com/facebook/xls/TestCasesFacebookWeb.xlsx");
   
	//This method will get executed when a test case is failed
public void onTestFailure(ITestResult result) 
{
	try
	{
	xlse.setCellData("TestCases", "Results", i, "Fail");
	Base.takeScreenshot();
	i++;
	
	
	}
	catch(Throwable e)
	{
		
	}

	
	System.out.println("The test case fails :" + result.getName());
  
  }
          

//This method will get executed when a test case is passed
   public void onTestSuccess(ITestResult result) {

	try
	{
	xlse.setCellData("TestCases", "Results", i, "Pass");
	Base.takeScreenshot();
	i++;
	}
	catch(Throwable e)
	{
		
	}
	//TestUtil.putdata(testname, Base.xls1, "PASS");
	System.out.println("The test case passess :" + result.getName());
	/*AppiumUIMethodsIOS.ExcelDataConfig(System.getProperty("user.dir")+"/target/TestCases.xlsx");
		try {
			AppiumUIMethodsIOS.writeData2(i, 2, "PASS", System.getProperty("user.dir") + "/target/TestCases.xlsx");
			i++;
			System.out.println("Try code executed");
			}
	        catch (Throwable e)
	        {			
	        }	*/
			
	      }

//This method will get executed when a test case is skipped
    public void onTestSkipped(ITestResult result){
	try
	{
	xlse.setCellData("TestCases", "Results", i, "Skipped");
	Base.takeScreenshot();
	i++;
	}
	catch(Throwable e)
	{
		
	}
	System.out.println("The test case has skipped:"+result.getName());
}
}