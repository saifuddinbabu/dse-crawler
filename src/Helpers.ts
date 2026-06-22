import moment from 'moment-timezone';
import fs from "fs"
import path from 'path';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import https from "https";
import 'dotenv/config'

export const normalOpenTime = (): boolean => {
  // Get current time in Dhaka timezone
  const now = moment().tz("Asia/Dhaka");

  const hour = now.hour(); // 0–23
  const day = now.day();   // 0 = Sunday, 1 = Monday, ... 6 = Saturday

  // Allow only between 10AM (10) and 2PM (14), excluding Friday (5) and Saturday (6)
  const withinTime = hour >= 10 && hour < 15;
  const notWeekend = day !== 5 && day !== 6;

  return withinTime && notWeekend;
}

export const saveArrayToFile = async (dataArray: any, targetDir: string): Promise<void> => {
  // Ensure directory exists (create if missing)
  fs.mkdirSync(targetDir, { recursive: true });

  // Get current time in Dhaka timezone
  // const now = moment().tz("Asia/Dhaka");

  // Format timestamp for filename
  // const timestamp = now.format("YYYY-MM-DD_HH-mm");

  // Build full file path
  // const filename = path.join(targetDir, `data_${timestamp}.json`);
  const filename = path.join(targetDir, `data_latest.json`);

  // Convert array to JSON string
  const jsonData = JSON.stringify(dataArray);

  // Write to file
  await fs.writeFileSync(filename, jsonData);

  console.log(`Data saved to ${filename}`);


}

export const parseCustomDate = (dateStr: string): Date | null => {
  // Remove the "at" for easier parsing
  const cleaned = dateStr.replace(" at ", " ");

  // Create a Date object
  const date = new Date(cleaned);

  // Check if parsing succeeded
  if (isNaN(date.getTime())) {
    return null;
    throw new Error("Invalid date format");
  }

  return date; // You can also return date.getTime() for timestamp
}

export const getLatestSavedData = async (targetDir: string): Promise<any> => {
  const filename = path.join(targetDir, `data_latest.json`);
  // Read file synchronously
  const rawData = fs.readFileSync(filename, "utf-8");

  // Parse JSON into a variable
  const jsonData = JSON.parse(rawData);
  return jsonData ?? [];
}

export const formatDate = (date: Date = new Date(), format: string = "YYYY-MM-DD HH:mm:ss"): string => {
  const pad = (n: number): string => String(n).padStart(2, "0");

  const year: number = date.getFullYear();
  const month: string = pad(date.getMonth() + 1);
  const day: string = pad(date.getDate());
  const hours: string = pad(date.getHours());
  const minutes: string = pad(date.getMinutes());
  const seconds: string = pad(date.getSeconds());

  return format
    .replace("YYYY", year.toString())
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

export const getAllStockPrice = async (): Promise<any> => {
  const stockUrl = process.env.ALL_STOCK_PRICE_URL ?? "";
  const res = await axios.get(stockUrl, {
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });
  const dom = new JSDOM(res.data);
  const tableJson: any = [];
  const tableHeaders = ["sl", "TRADING_CODE", "LTP", "HIGH", "LOW", "CLOSEP", "YCP", "CHANGE", "TRADE", "VALUE", "VOLUME"];
  const tableContent = dom.window.document.querySelectorAll(".table-responsive.inner-scroll tbody")
  if (tableContent.length > 0) {

    tableContent.forEach((el, index) => {
      const tableRow: any = {}
      if (el.querySelectorAll("td").length > 0)
        el.querySelectorAll("td").forEach((el2, in2) => {
          tableRow[tableHeaders[in2]] = el2?.textContent.replace(/[\t\n]/g, '');
        })
      tableJson[index] = tableRow;
    })
    // console.log({totaldata:tableJson})
    // saveArrayToFile(tableJson,'./data');


  }
  const lastUpdateText = dom.window.document.querySelector("h2.BodyHead.topBodyHead")?.textContent?.replace('Latest Share Price On ', '');
  const lastUpdateTime = parseCustomDate(lastUpdateText ?? '');
  console.log({ lastUpdateTime: lastUpdateTime });
  return { lastUpdateTime: lastUpdateTime, marketStatus: true, table: tableJson }
}