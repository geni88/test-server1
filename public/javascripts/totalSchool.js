const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile(path.join(__dirname, '../../database/학교주소좌표.xlsx'));
const sheetName = workbook.SheetNames[0]; 
const seoulSchool = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]).filter(row => row.lat && row.lng).map(row => {
  return {
    name: row['학교명'],
    address: row['주소'],
    lng: row.lng,
    lat: row.lat
  };
});

const saveSqlToFile = (sqlContent, sqlFileName) => {
  const dbFolderPath = path.join(__dirname, '../../database');
  const filePath = path.join(dbFolderPath, `${sqlFileName}.sql`);
  fs.writeFile(filePath, sqlContent, (error) => {
    if(error) {
      console.error('파일이 생성되지 않았습니다.', error)
    } else{
      console.log(`파일이 생성되었습니다. ${filePath}`)
      console.log(`생성된 파일크기: ${fs.statSync(filePath).size} bytes`)
    }
  })
}

const generateSchoolInserts = (seoulSchool) => {
  let insertSql = "INSERT INTO schools (name, address, geom) values\n";

  const values = seoulSchool.map(school => 
    `('${school.name}', '${school.address}', St_MakePoint(${school.lng}, ${school.lat})::geography)`
  )
  return insertSql + values.join(",\n") + ";";
}

const sqlContent = generateSchoolInserts(seoulSchool);
saveSqlToFile(sqlContent, 'totalSchool');


const rawData = fs.readFileSync(path.join(__dirname, '../../database/seoulLine.json'));
const seoulLine = json.parse(rawData);
const generateLineInserts = (seoulLine) => {
  let insertSql = "INSERT INTO lines (name, route, geom) values\n";
  const values = seoulLine.DATA.map(item => 
    `(${item.bldn_nm},${item.route},ST_MakePoint(${item.lot}, ${item.lat})::geography)`
  )
  return insertSql + values.join(',\n') + ';';
}

const lineSqlContent = generateLineInserts(seoulLine);
saveSqlToFile(lineSqlContent, 'seoulLine');