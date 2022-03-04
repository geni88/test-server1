const request = require('request')
const publicservicekey = require('../../keys/key')

var serviceKey = publicservicekey

const gongsidata = async (addressName, callback) => {
    const urlData = 'http://apis.data.go.kr/1611000/nsdi/LandCharacteristicsService/attr/getLandCharacteristics'

    var serviceKey = "serviceKey=" + serviceKey;
    var pnuV = "&pnu=" + pnu;
    var stdrYear = "&stdrYear=" + 2020;
    var format = "&format=" + 'json'; //xml, json 형식 변경 가능
    var numOfRows = "&numOfRows=" + 10;
    var pageNo = "&pageNo=" + 1;
    //개별공시지가 이용시 쿼리변수
    // var queryParams = '?' + serviceKey + pnuV + stdrYear + format + numOfRows + pageNo;
    var queryParams = '?' + serviceKey + pageNo + numOfRows + pnuV + stdrYear + format;
    var url = urlData + queryParams;

    request(url, (error, { body }) => {
        const gonsi = JSON.parse(body)
        callback(undefined, {
            gongsi: gongsi
        })
    }

    )

}
module.exports = gongsidata;
