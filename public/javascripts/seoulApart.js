const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile(path.join(__dirname, '../../database/아파트신주소좌표.xlsx'));
const sheetName = workbook.SheetNames[0]; 
const seoulAparts = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]).filter(row => row.lat && row.lng).map(row => {
  return {
    name: row['단지명'],
    address: row['주소'],
    lng: row.lng,
    lat: row.lat
  };
});
  
   // SQL 파일 생성 함수
function saveSqlToFile(sqlContent, sqlFileName) {
  // 데이터베이스 폴더 경로 (프로젝트 구조에 맞게 조정)
  const dbFolderPath = path.join(__dirname, '../../database');
  
  // 폴더가 없으면 생성
  if (!fs.existsSync(dbFolderPath)) {
    fs.mkdirSync(dbFolderPath, { recursive: true });
  }

  // 파일 경로
  const filePath = path.join(dbFolderPath, `${sqlFileName}.sql`);
  
  // 파일 저장
  fs.writeFile(filePath, sqlContent, (err) => {
    if (err) {
      console.error('파일 저장 중 오류 발생:', err);
    } else {
      console.log(`SQL 파일이 성공적으로 저장되었습니다: ${filePath}`);
      console.log(`생성된 파일 크기: ${fs.statSync(filePath).size} bytes`);
    }
  });
}

function generateApartInserts(seoulAparts) {

  let inserts = "INSERT INTO apartments (name, address, geom) VALUES\n";
  
  const values = seoulAparts.map(apart => {
    return `('${apart.name}', '${apart.address}', ST_MakePoint(${apart.lng}, ${apart.lat})::geography)`;
  });

  return inserts + values.join(",\n") + ";";
}

const apartInserts = generateApartInserts(seoulAparts);
console.log(apartInserts);
// export {seAparts, seApartsCoords, apartInserts};
saveSqlToFile(apartInserts, 'seoulApart');