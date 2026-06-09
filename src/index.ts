/* import { dirname } from 'path';
import { fileURLToPath } from 'url'; */
import {JSDOM} from "jsdom"
import {normalOpenTime, saveArrayToFile} from "./Helpers"

/* const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); */

const greet = (name: string): string => {
  return `Hello, ${name}! Your Node.js + TypeScript project is ready.`;
};

const main = (): void => {
  if(!normalOpenTime()) return;
  /* console.log(greet('World'));
  console.log('Running from:', __dirname); */
  // const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
  const tableHeaders = ["sl","TRADING_CODE","LTP","HIGH","LOW","CLOSEP","YCP","CHANGE","TRADE","VALUE","VOLUME"];
   JSDOM.fromURL("https://www.dsebd.org/latest_share_price_scroll_l.php").then(dom => {
      const tableJson:any = [];
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
        // console.log(dom.window.document.querySelector(".table-responsive.inner-scroll tbody"));

      })
      .then(()=>{
        console.log("finished");
      }).catch((er)=>{
        console.log({error:er});
        
      });

  // console.log(dom.window.document.querySelector("p")?.textContent); 
};

setInterval(main, 2 * 60 * 1000);

main();
