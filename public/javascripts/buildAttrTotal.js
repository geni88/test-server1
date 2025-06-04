const axios = require('axios');
const XLSX = require('xlsx');
const ProgressBar = require('progress');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '../../.env' });
// 엑셀 파일 읽기 (df_pnu.xlsx)
const workbook = XLSX.readFile('../../database/df_pnu.xlsx');
const sheetName = workbook.SheetNames[0];
const dfPnu = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

// PNU 코드 처리 및 API 호출 함수
const buildingAttr = async (pnucode) => {
  if (!pnucode) {
    return { error: 'Invalid PNU code' };
  }

  // PNU 코드를 19자리로 맞춤
  pnucode = pnucode.toString().padStart(19, '0');
  if (pnucode.length !== 19) {
    return { error: 'PNU code must be 19 digits' };
  }

  // PNU 코드 분해
  const dfSigungu = pnucode.substring(0, 5);
  const dfBjdong = pnucode.substring(5, 10);
  const dfPlatGbCd = pnucode[10] === '1' ? '0' : '1';
  const dfBun = pnucode.substring(11, 15);
  const dfJi = pnucode.substring(15, 19);

  console.log(`Processing PNU: ${dfSigungu} ${dfBjdong} ${dfPlatGbCd} ${dfBun} ${dfJi}`);

  const url_recap = 'https://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo';
  const url_title = 'https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo';
  const params = {
    serviceKey: process.env.SERVICE_KEY,
    sigunguCd: dfSigungu,
    bjdongCd: dfBjdong,
    platGbCd: dfPlatGbCd,
    bun: dfBun,
    ji: dfJi,
    numOfRows: '10',
    pageNo: '1',
    _type: 'json',
  };

  try {
    const [response_recap, response_title] = await Promise.allSettled([
      axios.get(url_recap, {
        params: params,
        timeout: 10000, // 10초 타임아웃
      }),
      axios.get(url_title, {
        params: params,
        timeout: 10000, // 10초 타임아웃
      })
    ]);

    const result = {};
    if (response_recap.status === 'fulfilled' && response_recap.value.status === 200) {
      const data_recap = response_recap.value.data;
      const item_recap = data_recap?.response?.body?.items?.item;
      const recap = Array.isArray(item_recap) ? item_recap[0] : item_recap;

      result.address = recap?.platPlc;
      result.building_name = recap?.bldNm;
      result.build_area = recap?.archArea;
      result.total_area = recap?.totArea;
      result.household_count = recap?.hhldCnt;
      result.total_parking = recap?.totPkngCnt;
      result.mainBuildingCount = recap?.mainBldCnt;
      result.mainPurps = recap?.etcPurps;
    }

    if (response_title.status === 'fulfilled' && response_title.value.status === 200) {
      const data_title = response_title.value.data;
      const item_title = data_title?.response?.body?.items?.item;
      const title = Array.isArray(item_title) ? item_title.find(el => el.mainAtchGbCd === '0') : item_title;

      result.build_area = result.build_area || title?.archArea;
      result.total_area = result.total_area || title?.totArea;
      result.household_count = result.household_count || title?.hhldCnt;
      result.total_parking = result.total_parking || title?.indrAutoUtcnt;
      result.grndFlrCnt = title?.grndFlrCnt || null;
      result.building_name = result.building_name || title?.bldNm;
      result.address = result.address || title?.platPlc;
    }

    return result;  
  } catch (error) {
    return { error: error.message };
  }
};

// 메인 처리 함수
const processPnuData = async () => {
  const batchSize = 100;
  const resultLandAttr = [];

  // 첫 번째 PNU 코드 테스트
  const firstResult = await buildingAttr(dfPnu[0][0]); // dfPnu는 2D 배열, 첫 번째 열(pnu) 사용
  console.log('First PNU Result:', firstResult);

  // 진행바 설정
  const bar = new ProgressBar('📦 PNU 처리 중 [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 50,
    total: Math.ceil(dfPnu.length / batchSize),
  });

  // 배치 처리
  for (let i = 0; i < dfPnu.length; i += batchSize) {
    const batch = dfPnu.slice(i, i + batchSize);

    for (const row of batch) {
      const pnu = row[0]; // 첫 번째 열이 pnu
      try {
        const result = await buildingAttr(pnu);
        if (result && !result.error) {
          resultLandAttr.push({
            pnu: pnu,
            attr: result,
          });
        } else {
          resultLandAttr.push({
            pnu: pnu,
            attr: result.error || null,
          });
        }
      } catch (error) {
        console.error(`[❌오류] PNU '${pnu}' 처리 중 문제: ${error.message}`);
        resultLandAttr.push({
          pnu: pnu,
          attr: `ERROR: ${error.message}`,
        });
      }
    }

    // API 요청 제한 고려하여 대기
    await new Promise((resolve) => setTimeout(resolve, 500)); // 1초 대기
    bar.tick();
  }

  // 결과 처리
  const dfAttr = resultLandAttr.map((r) => ({
    pnu: r.pnu,
    building_name: r.attr?.building_name,
    address: r.attr?.address,
    build_area: r.attr?.build_area,
    total_area: r.attr?.total_area,
    household_count: r.attr?.household_count,
    total_parking: r.attr?.total_parking,
    mainBuildingCount: r.attr?.mainBuildingCount,
    floor: r.attr?.floor,
    groundFloor: r.attr?.grndFlrCnt,
    mainPurps: r.attr?.mainPurps,
  }));

  // JSON 파일로 저장
  fs.writeFileSync('df_building_attr_add2.json', JSON.stringify(dfAttr, null, 2));

  // 엑셀 파일로 저장
  const ws = XLSX.utils.json_to_sheet(dfAttr);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BuildingAttr');
  XLSX.writeFile(wb, 'df_building_attr_add2.xlsx');

  console.log('처리 완료! 결과가 df_building_attr_add2.xlsx에 저장되었습니다.');
};

// 실행
processPnuData().catch((error) => {
  console.error('프로그램 실행 중 오류:', error.message);
});
