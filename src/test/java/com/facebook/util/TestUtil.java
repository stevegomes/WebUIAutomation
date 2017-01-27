package com.facebook.util;

import java.util.Hashtable;

public class TestUtil 

{
	
	public static boolean isExecutable(String testName, Xls_Reader xls)
	{
		
		for(int rNum=2;rNum<=xls.getRowCount("TestCases");rNum++){
			
			if(testName.equals(xls.getCellData("TestCases", "TCID", rNum))){
				if(xls.getCellData("TestCases", "Runmode", rNum).equals("Y"))
					return true;
				else
					return false;
			}
			
		}
		
		return false;
	}
	
	
	public static void putdata(String testname ,Xls_Reader xls,String data)
	{

		for(int rNum=2;rNum<=xls.getRowCount("TestCases");rNum++)
		{
			
			if(testname.equals(xls.getCellData("TestCases", "TCID", rNum)))
			{
				if(xls.getCellData("TestCases", "Runmode", rNum).equals("Y"))
				{
	
				xls.setCellData("TestCases", "Results", rNum, data);
				}
				else if(xls.getCellData("TestCases", "Runmode", rNum).equals("N"))
				{
					xls.setCellData("TestCases", "Results",rNum, data);
				}
			}
		}
	}
	
	public static Object[][] getData(String testName,Xls_Reader xls){
		System.out.println("**************");
		// find the test in the xls file
		// find number of col in the test
		// find number of rows in the test
		// print the data of the test
		// put the data in object array
		int testCaseStartIndex=0;
		for(int rNum=1;rNum<=xls.getRowCount("TestData");rNum++){
			if(testName.equals(xls.getCellData("TestData", 0, rNum))){
				testCaseStartIndex=rNum;
				break;
			}
			
		}
		System.out.println("Test Starts from - "+ testCaseStartIndex);
		
		int colStartIndex=testCaseStartIndex+1;
		int cols=0;
		while(!xls.getCellData("TestData", cols, colStartIndex).equals("")){
			cols++;
		}
		System.out.println("Total cols are  - "+cols);
		
		int dataStartIndex=testCaseStartIndex+2;
		int rows=0;
		while(!xls.getCellData("TestData", 0, (dataStartIndex+rows)).equals("")){
			rows++;
		}
		System.out.println("Total rows are - "+rows);
		Object[][] data = new Object[rows][1];
		Hashtable<String,String> table = null;
		for(int rNum=dataStartIndex;rNum<(dataStartIndex+rows);rNum++){
			table = new Hashtable<String,String>();
			for(int cNum=0;cNum<cols;cNum++){
				table.put(xls.getCellData("TestData", cNum, colStartIndex), xls.getCellData("TestData", cNum, rNum));
				//System.out.print(xls.getCellData("Test Data", cNum, rNum)+" -- ");
			}
			//System.out.println();
			data[rNum-dataStartIndex][0]=table;
		}
		
		//System.out.println();
		
		
		return data;

	}
}
