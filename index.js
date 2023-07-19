const express = require('express');
const app = express();
const { Client } = require('@notionhq/client');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 3004;
const dummyData = require('./db.json');
require('dotenv').config();
app.use(cors()); //允許Express後端和React前端通過API回應資料
app.use(bodyParser.json()); // 才拿得到req.body資料（解析http請求，將解析完成的請求儲存在req.body）

let DatabaseId = process.env.NOTION_DATABASE_ID;
let notion = process.env.NOTION_INTEGRATION_KEY;

// function makeid(length) {
//   let result = '';
//   const characters =
//     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   const charactersLength = characters.length;
//   let counter = 0;
//   while (counter < length) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     counter += 1;
//   }
//   return result;
// }

//取得login，回傳
app.post('/postNotionLogin', (req, res) => {
  console.log('postNotionLogin前',DatabaseId);
  const { secretKey, databaseId } = req.body;
  console.log('postNotionLogin後', databaseId);
  // let id = '0';
  // for (let i = 0; i < dummyData.dummy.length; i++) {
  //   if (dummyData.dummy[i].secretKey === secretKey) {
  //     id = dummyData.dummy[i].id;
  //     notion = new Client({ auth: secretKey });
  //     DatabaseId = databaseId;
  //   } else if (i === dummyData.dummy.length - 1) {
  //     dummyData.dummy.push({
  //       id: makeid(8),
  //       secretKey: secretKey,
  //       databaseId: databaseId,
  //     });
  //     id = dummyData.dummy[i].id;
  //     notion = new Client({ auth: secretKey });
  //     DatabaseId = databaseId;
  //   }
  // }//製作資料庫，每一隻都有獨立的ID，客戶端只需由ID後端工作區辨藉由ＩＤ到資料庫找定的資料
  try {
    notion = new Client({ auth: secretKey });
    DatabaseId = databaseId;
    console.log('postNotionLogin try-後', DatabaseId);
    res.send('success');
  } catch (error) {
    console.log(error);
  }
});

//取得資料庫
app.get('/getNotionDb', async (req, res) => {
  console.log('getNotionDb try-前', DatabaseId);
  try {
    const response = await notion.databases.query({
      database_id: DatabaseId,
    });
    res.status(200).send({data: response, status: 'success',message:'登入成功'});
    console.log('getNotionDb try-後', DatabaseId);
    console.log('success');
  } catch (error) {
    console.log(error);
    res.status(401).send({status:'error',message:'查詢不到相關資料（確認輸入資料是否有誤）'});
  }
});
//取得Page屬性
// app.get('/getNotionPage', async (req, res) => {
//   try {
//     const pageId = 'f9d44762786a4ac887a3d72c93e8a158';
//     const response = await notion.pages.retrieve({ page_id: pageId });
//     res.send(response);
//     console.log('success');
//   } catch (error) {
//     console.log(error);
//   }
// });
//取得Page的內容
app.get('/getNotionBlockList', async (req, res) => {
  const pageId = req.query.page;
  console.log('getNotionBlockList 前', pageId);
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 150,
    });
    res.status(200).send(response);
    console.log('getNotionBlockList 後', pageId, DatabaseId);
    console.log('success');
  } catch (error) {
    console.log(error);
  }
});
//修改checkbox狀態
app.patch('/patchNotionBlock', async (req, res) => {
  const { blockId, checkboxState } = req.body;
  try {
    const response = await notion.blocks.update({
      block_id: blockId,
      to_do: {
        checked: checkboxState,
      },
    });
    res.status(200).send(response);
    console.log('success');
  } catch (error) {
    console.log(error);
  }
});
//修改屬性的checkbox狀態
app.patch('/patchNotionProperties', async (req, res) => {
  const { pageId, checkboxState } = req.body;
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        Archive: {
          checkbox: checkboxState,
        },
      },
    });
    res.status(200).send(response);
    console.log('success');
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`My Notion API : http://localhost:${port}`);
});
