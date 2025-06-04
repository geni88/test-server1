// convert-to-json.js (Node.js에서 실행)
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile(path.join(__dirname, '../../database/gnn_result_coords.xlsx'));
const sheetName = workbook.SheetNames[0];

const gnnResult = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
  .filter(row => row.lat && row.lng)
  .map(row => ({
    apt_name: row['apt_name'],
    address: row['address'],
    lng: row.lng,
    lat: row.lat,
    cluster: row['cluster'] // 클러스터 번호도 포함해야 나중에 색상 구분 가능
  }));

fs.writeFileSync(path.join(__dirname, '../../database/apt_data.json'), JSON.stringify(gnnResult, null, 2));

console.log('JSON 파일 생성 완료!');