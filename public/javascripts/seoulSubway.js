const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

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

const rawData = fs.readFileSync(path.join(__dirname, '../../database/seoulLine.json'));
const seoulLine = JSON.parse(rawData);
const generateLineInserts = (seoulLine) => {
  let insertSql = "INSERT INTO lines (name, route, geom) values\n";
  const values = seoulLine.DATA.map(item => 
    `('${item.bldn_nm}','${item.route}',ST_MakePoint(${item.lot}, ${item.lat})::geography)`
  )
  return insertSql + values.join(',\n') + ';';
}

const lineSqlContent = generateLineInserts(seoulLine);
saveSqlToFile(lineSqlContent, 'seoulLine');