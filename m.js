function getRecords (appId, opt_query, opt_offset, opt_limit, opt_records) {
    if (!appId) return Promise.resolve([]);
    var query = opt_query || "";
    var offset = opt_offset || 0;
    var limit = opt_limit || 500;
    var allRecords = opt_records || [];
    var params = {
      "app": appId,
      "totalCount": true,
      "query": query + " limit " + limit + " offset " + offset
    };

    return kintone.api("/k/v1/records", "GET", params).then(function (resp) {
      allRecords = allRecords.concat(resp.records);
      if (resp.records.length === limit) {
        return Common.getRecords(appId, query, offset + limit, limit, allRecords);
      }
      return allRecords;
    });

  };




  async function getAllRecords(appId, queryStr, fields = [], limit = 500, lastRecordId = 0, records = []) {
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
  }
  

const appId = kintone.app.getId();
const query = kintone.app.getQueryCondition();
const records = await getAllRecords(appId, query);






(() => {
    'use strict';
  
    kintone.events.on('app.record.index.show', event => {
      if (!document.getElementById('datepicker')) {
        const datePicker = document.createElement('input');
        datePicker.type = 'date';
        datePicker.id  = 'datepicker';
        
        const headerSpace = kintone.app.getHeaderSpaceElement();
        headerSpace.appendChild(datePicker);
  
        const saveButton = document.createElement('button');
        saveButton.textContent = '一括保存';
 
        saveButton.addEventListener('click', () => {
          bulkSave()
        });
 
        headerSpace.appendChild(saveButton);
      }
      return event;
    });
 
    const bulkSave = async() => {
      const datePickerValue = document.getElementById("datepicker").value;
      if (!datePickerValue) {
        // TODO エラー内容
        return;
      }
      try {
        // TODO 対応ステータス
        const status = '';
        const appId = kintone.app.getId();
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
          actionRecords.push({id: record.$id.value, action: '', assignee: ''});
          updateRecords.push({id: record.$id.value, record: { 日付: { value: datePickerValue }}});
        });
        await actionAllRecords(appId, actionRecords);
        await putAllRecords(appId, updateRecords);
      } catch (error) {
        console.log(error);
        // TODO　エラーなど
      } 
    };
 
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