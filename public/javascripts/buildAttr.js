const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: '../../.env' });
const params = {
  sigunguCd: '11110',
  bjdongCd: '11500',
  platGbCd: '0',
  bun: '0009',
  ji: '0001',
  numOfRows: '10',
  pageNo: '1',
  _type: 'json',
  serviceKey: process.env.SERVICE_KEY
}
const url_recap = 'https://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo';
const url_title = 'https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo';

const buildAttr = async () => {
  try {
    const [resTitle, resRecap] = await Promise.all([
      axios.get(url_title, { params }),
      axios.get(url_recap, { params })
    ]);

    const result = {};

    // Recap 데이터 처리
    if (resRecap.status === 200) {
      const item = resRecap.data?.response?.body?.items?.item;
      const recap = Array.isArray(item) ? item[0] : item;

      result.build_area = recap?.archArea;
      result.total_area = recap?.totArea;
      result.household_count = recap?.hhldCnt;
      result.total_parking = recap?.totPkngCnt;
      result.mainBuildingCount = recap?.mainBldCnt;
      result.address = recap?.platPlc;
      result.building_name = recap?.bldNm;
    }

    // Title 데이터 처리 (보완용)
    if (resTitle.status === 200) {
      const item = resTitle.data?.response?.body?.items?.item;
      const title = Array.isArray(item)
        ? item.find(el => el.mainAtchGbCd === '0')
        : item;

      // recap에 없을 경우 보완
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
    console.error("호출에 문제 발생:", error.message);
  }
};

const result_buildAttr = async() => {
  const result = await buildAttr();
  console.log(result);
}

result_buildAttr();