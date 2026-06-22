/* import { dirname } from 'path';
import { fileURLToPath } from 'url'; 
import axios from "axios";
import https from "https";*/
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
// import {JSDOM} from "jsdom"
import express from "express";
import path from 'path';
import 'dotenv/config'
import { normalOpenTime, saveArrayToFile, getLatestSavedData, getAllStockPrice } from "./Helpers.js"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());

// Serve static files from the "data" directory
app.use("/data", express.static(path.join(__dirname, "../data")));

// Example route
app.get("/", (_req, res) => {
  res.send("JSON server is running. Try /data/data_latest.json");
});

const server = http.createServer(app);
console.log({ FRONT_END_HOST: process.env.FRONT_END_HOST });

const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_HOST, // your React app's URL (Vite default)
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
let cachedData: any = false;

const main = async (): Promise<void> => {
  if (!normalOpenTime()) {

    let fileData = cachedData?.table ?? await getLatestSavedData('./data');
    if (!fileData?.data) {
      const data = await getAllStockPrice();

      await saveArrayToFile(data, './data');
      if (data?.lastUpdateTime != null) {
        fileData = data;
      }
    }
    console.log("dse is off", cachedData?.table ? "cache data available" : "file data");
    if (fileData) {
      if (!cachedData?.table)
        cachedData = fileData;
      // console.log({cachedData});

      const payload = {
        message: "Latest share price",
        time: new Date().toISOString(),
        data: { ...cachedData, marketStatus: false }
      };

      console.log('Broadcasting:', new Date().toISOString());
      io.emit('server_update', payload);
    }

    return;
  }
  /* const res = await axios.get("https://www.dsebd.org/latest_share_price_scroll_l.php", {
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });
  const dom = new JSDOM(res.data);
  const tableJson:any = [];
  const tableHeaders = ["sl","TRADING_CODE","LTP","HIGH","LOW","CLOSEP","YCP","CHANGE","TRADE","VALUE","VOLUME"];
      const tableContent = dom.window.document.querySelectorAll(".table-responsive.inner-scroll tbody")
      if (tableContent.length > 0) {
        
        tableContent.forEach((el,index)=>{
          const tableRow:any = {}
          if(el.querySelectorAll("td").length > 0)
            el.querySelectorAll("td").forEach((el2,in2)=>{            
              tableRow[tableHeaders[in2]] = el2?.textContent.replace(/[\t\n]/g, '');
            })
          tableJson[index] = tableRow;
        })
        // console.log({totaldata:tableJson})
        // saveArrayToFile(tableJson,'./data');

        
      }
      const lastUpdateText = dom.window.document.querySelector("h2.BodyHead.topBodyHead")?.textContent?.replace('Latest Share Price On ','');
      const lastUpdateTime = parseCustomDate(lastUpdateText??'');
      console.log({lastUpdateTime:lastUpdateTime });
      const data = {lastUpdateTime:lastUpdateTime, marketStatus:true, table: tableJson} */

  const data = await getAllStockPrice();

  await saveArrayToFile(data, './data');
  if (data?.lastUpdateTime != null) {
    const payload = {
      message: "Latest share price",
      time: new Date().toISOString(),
      data
    };

    console.log('Broadcasting:', new Date().toISOString());
    io.emit('server_update', payload);
  }
  // console.log(dom.window.document.querySelector(".table-responsive.inner-scroll tbody")?.textContent);
};

setInterval(main, 2 * 60 * 1000);

main();



const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* (async () => {
  const res = await axios.get("https://www.dsebd.org/latest_share_price_scroll_l.php", {
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });
  const dom = new JSDOM(res.data);
  const tableJson:any = [];
  const tableHeaders = ["sl","TRADING_CODE","LTP","HIGH","LOW","CLOSEP","YCP","CHANGE","TRADE","VALUE","VOLUME"];
      const tableContent = dom.window.document.querySelectorAll(".table-responsive.inner-scroll tbody")
      if (tableContent.length > 0) {
        
        tableContent.forEach((el,index)=>{
          const tableRow:any = {}
          if(el.querySelectorAll("td").length > 0)
            el.querySelectorAll("td").forEach((el2,in2)=>{            
              tableRow[tableHeaders[in2]] = el2?.textContent.replace(/[\t\n]/g, '');
            })
          tableJson[index] = tableRow;
        })
        // console.log({totaldata:tableJson})
        saveArrayToFile(tableJson,'./data');
        
      }
  // console.log(dom.window.document.querySelector(".table-responsive.inner-scroll tbody")?.textContent);
})(); */
