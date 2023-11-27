(() => {
    'use strict';
  console.log('一括更新');//コンソールに一括更新のメッセージを表示
  
  //ボタンの動作情報を定義
  const processInfo = {
    'info01': {'bName': '未処理ボタン', 'actionNames': ['未処理', '処理開始']},
    'info02': {'bName': '処理中ボタン', 'actionNames': ['処理中', '完了する']},
  };
    // 一覧画面が表示された時のイベント処理
    kintone.events.on('app.record.index.show', event => {
      if (!document.getElementById('datepicker')) {
        
        // 日付入力フィールドを追加
        const datePicker = document.createElement('input');
        datePicker.type = 'date';
        datePicker.id  = 'datepicker';
        
        // ヘッダースペースに日付入力フィールドを追加
        const headerSpace = kintone.app.getHeaderSpaceElement();
        headerSpace.appendChild(datePicker);
        
        // 未処理ボタンの作成
        const saveButton = document.createElement('button');
        saveButton.textContent = processInfo['info01']['bName'];
        
        // 未処理ボタンがクリックされた時の処理
        saveButton.addEventListener('click', () => {
          const btnInfo = processInfo['info01']['actionNames'];
          bulkSave(btnInfo,1);
        });
        
        // 処理中ボタンの作成
        const saveButton2 = document.createElement('button');
        saveButton2.textContent = processInfo['info02']['bName'];
        
        // 処理中ボタンがクリックされた時の処理
        saveButton2.addEventListener('click', () => {
          const btnInfo = processInfo['info02']['actionNames'];
          bulkSave(btnInfo,2);
        });

        // ヘッダースペースにボタンを追加
        headerSpace.appendChild(saveButton);
        headerSpace.appendChild(saveButton2);
      }
      return event;
    });
 
    const bulkSave = async(bInfo,bNo) => {
      const datePickerValue = document.getElementById("datepicker").value;
      if (!datePickerValue) {
        // TODO エラー内容
        return;
      }
      try {
        // TODO 対応ステータス
        const status = bInfo[0];            // ★更新したい現在のステータス
        const appId = kintone.app.getId();
        //一覧画面上の絞り込み時の画面に表示されたレコードでステータスが対象のものを変更する。
        const query = kintone.app.getQueryCondition() ? `${kintone.app.getQueryCondition()} and ステータス = "${status}"` : `ステータス = "${status}"`;
        const records = await getAllRecords(appId, query);
        if (!records.length) {
          // TODOメッセージ等あれば
          return;
        }
        const updateRecords = [];
        const actionRecords = [];
 
        records.forEach(record => {
          // TODO 対応action,ユーザー指定等あれば
          actionRecords.push({id: record.$id.value, action: bInfo[1], assignee: ''});               // ★action=アクション名, assignee=次の作業者
          //処理日と更新日を別々に更新するためのIF文
          if(bNo == 1){
            updateRecords.push({id: record.$id.value, record: { 日付: { value: datePickerValue }}});

          }else{
            updateRecords.push({id: record.$id.value, record: { 日付_2: { value: datePickerValue }}});
          };
          
        });
        await actionAllRecords(appId, actionRecords);
        await putAllRecords(appId, updateRecords);
        alert('更新終了');
        location.reload();
      } catch (error) {
        console.log(error);
        // TODO　エラーなど
      } 
    };
 //レコードが500以上の場合
    const getAllRecords = async(appId, queryStr, fields = [], limit = 500, lastRecordId = 0, records = []) => {
      if (fields.length && !fields.includes('$id')) fields.push('$id');
      const query = `$id > ${lastRecordId}${queryStr ? ' and (' + queryStr + ')': ''} order by $id asc limit ${limit}`;
      const body = fields.length == 0 ? { app: appId, query: query } : { app: appId, query: query, fields: fields };
      try {
        const resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body);
        records = records.concat(resp.records);
        if (resp.records.length == limit) {
          return await getAllRecords(appId, queryStr, fields, limit, resp.records[resp.records.length - 1].$id.value, records);
        }
        return records;
      } catch (e) {
        console.log(e);
        return kintone.Promise.reject(e);
      }
    };
 
    const putAllRecords = async (appId, putRecords) => {
      const step = 100;
      for (let i = 0; i < putRecords.length; i += step) {
        const records = putRecords.slice(i , i + step);
        await kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', { app: appId, records: records });
      }
    };
 
    const actionAllRecords = async (appId, statusRecords) => {
      const step = 100;
      for (let i = 0; i < statusRecords.length; i += step) {
        const records = statusRecords.slice(i , i + step);
        await kintone.api(kintone.api.url('/k/v1/records/status', true), 'PUT', { app: appId, records: records });
      }
    }
  })();