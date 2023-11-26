(function() {
    'use strict';
      // ページが読み込まれた際に実行される処理
      document.addEventListener('DOMContentLoaded', function() {
      // 新しい日付入力フィールドを作成
      var datePicker = document.createElement("input");
      datePicker.setAttribute("type", "date");
      datePicker.setAttribute("id", "datepicker");
  
      // 一覧画面のヘッダー部分に日付入力フィールドを追加
      var headerSpace = kintone.app.getHeaderSpaceElement();
      headerSpace.appendChild(datePicker);
  
      // 一括保存ボタンを作成
      var saveButton = document.createElement("button");
      saveButton.textContent = "一括保存"; // ボタンのテキストを設定
  
      // ボタンがクリックされた時に実行する関数を設定
      saveButton.addEventListener('click', function() {
          bulkSave(); // 一括保存の関数を実行
      });
  
      // 日付入力フィールドの隣にボタンを追加
      headerSpace.appendChild(saveButton);
      });
  
      // 一括保存を行う関数
      function bulkSave() {
      var datePickerValue = document.getElementById("datepicker").value; // 日付入力フィールドの値を取得
      console.log('取得した日付:', datePickerValue); // コンソールに日付をログ出力
  
      // 一覧に表示されている全てのレコードを取得するためのクエリ
      var query = ''; // 全てのレコードを取得する場合は空のクエリでOK
  
     // kintone.api(kintone.api.url('/k/v1/records', true) + '?query=' + encodeURIComponent(query), 'GET', {}, function(response) {
        var body = {
            'app': kintone.app.getId(),
            'query': query
          };
        
          kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body, function(response) {

          // 一覧に表示されている全てのレコードを取得
          var records = response.records; 
           // コンソールにレコードをログ出力
          console.log('取得したレコード:', records); 
  
           // 更新するレコードの配列
          var updateRecords = []; 
  


          for (var i = 0; i < records.length; i++) {
              var record = records[i];
              record['日付']['value'] = datePickerValue; // レコードの日付フィールドに値を設定
              
              

              var aRecord = {'id': record['$id'].value,'record': record} ;

              updateRecords.push(aRecord);  

              //updateRecords.push(record); // 更新対象となるレコードを配列に追加
          }
  
           var PutBody = {
            'app': kintone.app.getId(),
            'records': updateRecords	// レコード情報
        };
          // 更新対象となるレコードを一括で更新
          kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', PutBody, function(response) {
              // 更新成功時の処理
              console.log('レコードが更新されました。', response);
          }, function(error) {
              // エラー時の処理
              console.error('更新に失敗しました。', error);
          });
      }, function(error) {
          // エラー時の処理
          console.error('一覧のレコードの取得に失敗しました。', error);
      });
  }
  })();

  //コミットTEST