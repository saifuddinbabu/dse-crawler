import moment from 'moment-timezone';
import fs from "fs"
import path from 'path';

export const normalOpenTime = ():boolean =>{
  // Get current time in Dhaka timezone
  const now = moment().tz("Asia/Dhaka");

  const hour = now.hour(); // 0–23
  const day = now.day();   // 0 = Sunday, 1 = Monday, ... 6 = Saturday

  // Allow only between 10AM (10) and 2PM (14), excluding Friday (5) and Saturday (6)
  const withinTime = hour >= 10 && hour < 14;
  const notWeekend = day !== 5 && day !== 6;

  return withinTime && notWeekend;
}

export const saveArrayToFile = (dataArray:any,targetDir:string):void =>{
  // Ensure directory exists (create if missing)
  fs.mkdirSync(targetDir, { recursive: true });

  // Get current time in Dhaka timezone
  const now = moment().tz("Asia/Dhaka");

  // Format timestamp for filename
  const timestamp = now.format("YYYY-MM-DD_HH-mm");

  // Build full file path
  const filename = path.join(targetDir, `data_${timestamp}.json`);

  // Convert array to JSON string
  const jsonData = JSON.stringify(dataArray);

  // Write to file
  fs.writeFileSync(filename, jsonData);

  console.log(`Data saved to ${filename}`);

  
}