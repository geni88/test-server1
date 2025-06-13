// import {seSchoolData, seSchoolCoords, seAparts} from "./seoulSchool.js";
// import * as XLSX from '../node_modules/xlsx/xlsx.mjs';

// import { rejects } from "assert";
// import { resolve } from "path";
// console.log(seSchoolData[1]);
var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(37.5095251011602, 127.038954823034), // 지도의 중심좌표
    level: 5, // 지도의 확대 레벨
  };

// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 위성지도를 표시합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도 오른쪽 위에 지도 타입 컨트롤이 표시되도록 지도에 컨트롤을 추가한다.
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

/*
kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
// 클릭한 위치에 마커를 표시합니다 
addMarker(mouseEvent.latLng);
});


// 지도에 표시된 마커 객체를 가지고 있을 배열입니다
var markers = [];

// 마커 하나를 지도위에 표시합니다 
addMarker(new kakao.maps.LatLng(37.485583, 126.879579));

// 마커를 생성하고 지도위에 표시하는 함수입니다
function addMarker(position) {
// 마커를 생성합니다
var marker = new kakao.maps.Marker({
    position: position
});

// 마커가 지도 위에 표시되도록 설정합니다
marker.setMap(map);

// 생성된 마커를 배열에 추가합니다
markers.push(marker);
}

// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
function setMarkers(map) {
for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
}
}

// "마커 보이기" 버튼을 클릭하면 호출되어 배열에 추가된 마커를 지도에 표시하는 함수입니다
function showMarkers() {
setMarkers(map)
}

// "마커 감추기" 버튼을 클릭하면 호출되어 배열에 추가된 마커를 지도에서 삭제하는 함수입니다
function hideMarkers() {
setMarkers(null);
}


var geocoder = new kakao.maps.services.Geocoder();

var marker = new kakao.maps.Marker(), // 클릭한 위치를 표시할 마커입니다
  infowindow = new kakao.maps.InfoWindow({ zindex: 1 }); // 클릭한 위치에한 주소를 표시할 인포윈도우입니다
*/
//주소검색 입력값을 받고 주소검색.
/* function searchAdress(callback) {
	var adressInfo = document.seeAdress.sawAdress.value;
	// if (!adressInfo) {
	// 	alert("주속검색란에 주소를 넣어주세요_jin");
	// }

	callback(adressInfo);
	// return false
	// return adressValue;

};
searchAdress(searchAdressInfo); */

fetch('apt_data_v2.json')
  .then(res => res.json())
  .then(apartments => {
    const colorSet = [
      '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4',
      '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff',
      '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1',
      '#000075', '#808080', '#ffffff', '#000000', '#ff7f00', '#4daf4a',
      '#377eb8', '#984ea3', '#ff69b4', '#a65628', '#f781bf'
    ];

    const clusterMap = {};     // cluster 번호 → 마커 배열
    const clusterers = {};     // cluster 번호 → 클러스터러

    // 마커 생성 및 그룹화
    apartments.forEach(apt => {
      const clusterNum = typeof apt.gcn_class === 'number' ? apt.gcn_class : 0;
      const color = colorSet[clusterNum % colorSet.length] || '#000000';
      const position = new kakao.maps.LatLng(apt.lat, apt.lng);

      const markerImage = new kakao.maps.MarkerImage(
        `https://dummyimage.com/20x20/${color.replace('#', '')}/ffffff.png&text=+`,
        new kakao.maps.Size(20, 20)
      );

      const marker = new kakao.maps.Marker({
        position: position,
        image: markerImage
      });

      // 마커 그룹에 추가
      if (!clusterMap[clusterNum]) clusterMap[clusterNum] = [];
      clusterMap[clusterNum].push(marker);

      // 지도에 원 추가 (선택)
      new kakao.maps.Circle({
        center: position,
        radius: 40,
        strokeWeight: 1,
        strokeColor: color,
        strokeOpacity: 0.8,
        fillColor: color,
        fillOpacity: 0.3,
        map: map
      });
      // 마우스 오버 시 정보창
      // 공용 InfoWindow
      const infowindow = new kakao.maps.InfoWindow();

      // 현재 열려 있는 마커 저장 변수
      let currentOpenMarker = null;

      kakao.maps.event.addListener(marker, 'click', function () {
        // 같은 마커를 다시 클릭한 경우 → 닫기
        if (currentOpenMarker === marker) {
          infowindow.close();
          currentOpenMarker = null;
        } else {
          // 다른 마커 클릭 시 내용 업데이트 및 열기
          infowindow.setContent(`
            <div style="
              width: 220px;
              max-height: 150px;
              overflow-y: auto;
              white-space: normal;
              word-break: keep-all;
              box-sizing: border-box;
            ">
              ${apt.apartment_name}<br>
              ${apt.주소}<br>
              <strong>클래스명:</strong> ${apt.gcn_class}
            </div>
          `);
          infowindow.open(map, marker);
          currentOpenMarker = marker; // 현재 열린 마커 업데이트
        }
});
      // kakao.maps.event.addListener(marker, 'mouseenter', () => infowindow.open(map, marker));
      // kakao.maps.event.addListener(marker, 'mouseleave', () => infowindow.close());
    });

    // 클러스터러 생성 및 마커 등록
    Object.entries(clusterMap).forEach(([clusterNum, markers]) => {
      const color = colorSet[clusterNum % colorSet.length].replace('#', '');
    
      const clusterer = new kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 8,
        styles: [{
          width: '40px',
          height: '40px',
          background: `linear-gradient(145deg, #${color}, #ffffff)`,
          color: '#000',
          textAlign: 'center',
          lineHeight: '40px',
          borderRadius: '20px',
          boxShadow: '2px 2px 6px rgba(0,0,0,0.3)',
          fontWeight: 'bold'
        }]
      });
    
      clusterer.addMarkers(markers);
      clusterers[clusterNum] = clusterer;
    });

    // 버튼으로 마커 숨기기 / 보이기
    document.getElementById('showMarkers').addEventListener('click', () => {
      Object.entries(clusterMap).forEach(([clusterNum, markers]) => {
        clusterers[clusterNum].addMarkers(markers);
      });
    });

    document.getElementById('hideMarkers').addEventListener('click', () => {
      Object.values(clusterers).forEach(clusterer => clusterer.clear());
    });
  })
  .catch(err => {
    console.error('❌ JSON 파일 로딩 실패:', err);
  });
// 학교좌표 배열로 만들기
const schoolLatLng = [];
const seSchoolDataCoord =[];
const findCoordsSchool = async () => {
    const getCoords = (school) => {
        return new Promise((resolve, reject) => {
           geocoder.addressSearch(school, function (result, status){
               if (status === kakao.maps.services.Status.OK) {
                 resolve(result);
               } else{
                    reject(status)
                };
               
           });
        });

    };
    try{
        for (let i = 0; i < seSchoolData.length; i++) {
            const CoordsResult = await getCoords(seSchoolData[i]);
            seSchoolDataCoord.push({x: CoordsResult[0].x ,y: CoordsResult[0].y})
        }
        if(seSchoolDataCoord.length === seSchoolData.length) {
            createXlsx(seSchoolDataCoord)
        }
    }
    catch(error) {
        console.error('error is occured', error);
    }
} 
findCoordsSchool(); 

//--------------------------------------------------------             거리계산

const REST_API_KEY = 'ce2001a391896abd462c7dac32779946'; // Replace with your actual API key

const getDirections = async (origin, destination) => {
    const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}&waypoints=&priority=DISTANCE&car_fuel=GASOLINE&car_hipass=false&alternatives=false&road_details=false`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `KakaoAK ${REST_API_KEY}`,
            },
        });
        console.log('Status:', response.status);
        console.log('Headers:', [...response.headers.entries()]);
        const body = await response.text();
        console.log('Body:', body);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Handle the response data here

    } catch (error) {
        console.error('Error fetching directions:', error);
    }
};


//-----------------------------------------------------------------------     가장 가까운 학교 찾기

/*const seSchoolData = [
    // Array of school coordinates: { x: longitude, y: latitude }
    { x: 127.11015314141542, y: 37.39472714688412 },
    { x: 127.10824367964793, y: 37.401937080111644 },
    // Add more schools here...
]; */

// const specificAddress = seAparts[1]; // Replace with the specific address

const getCoordinates = async (address) => {
    if (!address) throw new Error('Address parameter is required.');
    console.log("Address:", address);
  
    const urlK = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    
    try {
        const response = await fetch(urlK, {
            method: 'GET',
            headers: {
                'Authorization': `KakaoAK ${REST_API_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.documents.length > 0) {
            return {
                x: data.documents[0].x,
                y: data.documents[0].y,
            };
        } else {
            throw new Error('No results found for the address.');
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
    }
};

const findClosestSchool = async (specificAddress) => {
  const addressCoords = await getCoordinates(specificAddress);
  console.log(addressCoords);
  if (!addressCoords) return null;
  let closestSchool = null;
  let shortestDistance = Infinity;
  
  for (const school of seSchoolCoords) {
    const directionsData = await getDirections(`${addressCoords.x},${addressCoords.y}`, `${school.x},${school.y}`);
    if (directionsData && directionsData.routes) {
      const distance = directionsData.routes[0].sections[0].distance; // Distance in meters
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestSchool = school;
      }
    }
  }

  if (closestSchool) {
    console.log(`Closest school coordinates: (${closestSchool.x}, ${closestSchool.y})`);
    geocoder.coord2Address(closestSchool.x, closestSchool.y, function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        console.log(`가장 가까운 학교는 ${result[0].address.address_name} 입니다!`);
      }
    });
    console.log(`Shortest distance: ${shortestDistance} meters`);
    return { school: closestSchool, distance: shortestDistance };
  } else {
    console.log('No school found.');
    return null;
  }
};

const closestSchoolSet = [];

async function findClosestSchoolSet(seAparts) {
  for (const apart of seAparts) {
    const result = await findClosestSchool(apart);
    if (result) {
      closestSchoolSet.push({
        apart: apart,
        school: result.school,
        distance: result.distance
      });
    }
  }
  return closestSchoolSet;
}

// (async()=> {
//   try {
//     const result = await findClosestSchoolSet(seAparts[1]);
//     console.log(result);
//   } catch (error) {
//     console.error('Error finding closest school set:', error.message);
//   }
// })();
// Call the function to find the closest school




//클러스터에 마커를 추가!!!
function searchCoordsSchool() {
  for (let i = 0; i < seSchoolData.length; i++) {
    geocoder.addressSearch(seSchoolData[i], function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        // console.log(result[0].x)
        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        
        var jsonobj = new Object();
        jsonobj.x = coords.getLat();
        jsonobj.y = coords.getLng();
            
        // coordsSet = JSON.stringify(jsonobj);
        schoolLatLng.push(jsonobj );
        // schoolLatLng.push(JSON.parse(coordsSet) );
        // console.log(schoolLatLng[0]);
        // 결과값으로 받은 위치를 마커로 표시합니다
        var MarkerClusterer = new kakao.maps.Marker({
          position: coords,
        });

        const markers = [];
        markers.push(MarkerClusterer);
        // 인포윈도우로 장소에 대한 설명을 표시합니다
        var infowindow = new kakao.maps.InfoWindow({
          content:
            '<div style="width:150px;text-align:center;padding:6px 0;">' +
            result[0].address.address_name +
            "</div>",
        });
        // 클러스터러에 마커들을 추가합니다
        clusterer.addMarkers(markers);
        // infowindow.open(map, marker);

        // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
        map.setCenter(coords);
      }
    });
  }
}
searchCoordsSchool();
console.log(schoolLatLng);
console.log(seSchoolDataCoord);
/*
const saveJsonToFile = (data, filename) => {
    const jsonString = JSON.stringify(data, null, 2); // JSON 문자열로 변환
    fs.writeFile(filename, jsonString, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('JSON file has been saved:', filename);
        }
    });
};
saveJsonToFile(schoolLatLng, filename); */
//json to excel
console.log(typeof schoolLatLng);
console.log(Array.isArray(schoolLatLng));

const schoolLatLng_json = JSON.stringify(schoolLatLng);
console.log(schoolLatLng_json);
const createXlsx = (data) => {
	// 워크북 만들기
    const workbook = XLSX.utils.book_new();
	// 워크 시트 만들기 (json 데이터를)
	const worksheet = XLSX.utils.json_to_sheet(data);
    'json_to_excel.xlsx'
	// 워크북에 워크시트 추가하기
	// 마지막 파라미터에 sheet명을 입력해준다.
    XLSX.utils.book_append_sheet(workbook, worksheet, "lat");
    // XLSX.utils.book_append_sheet(workbook, worksheet, "lng");


	// 생성할 엑셀 워크북과 엑셀 파일 명을 넘겨준다.
    XLSX.writeFile(workbook, "/Users/Jin/Downloads/schoolLatLng.xlsx");
};

function searchAdress() {
  var adressInfo = document.seeAdress.sawAdress.value;

  geocoder.addressSearch(adressInfo, function (result, status) {
    // 정상적으로 검색이 완료됐으면
    //console.log(result);
    if (status === kakao.maps.services.Status.OK) {
      var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

      // 결과값으로 받은 위치를 마커로 표시합니다
      var marker = new kakao.maps.Marker({
        map: map,
        position: coords,
      });

      // 인포윈도우로 장소에 대한 설명을 표시합니다
      var infowindow = new kakao.maps.InfoWindow({
        content:
          '<div style="width:150px;text-align:center;padding:6px 0;">' +
          result[0].address.address_name +
          "</div>",
      });
      infowindow.open(map, marker);

      // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
      map.setCenter(coords);
    } else {
      alert("주소를 정확히 입력해 주세요");
    }
  });
}

// 지도를 클릭했을 때 클릭 위치 좌표에 대한 주소정보를 표시하도록 이벤트를 등록합니다.
kakao.maps.event.addListener(map, "click", function (mouseEvent) {
  searchDetailAddrFromCoords(mouseEvent.latLng, function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      console.log(result);
      var detailAddr = !!result[0].road_address
        ? "<div>도로명주소 : " + result[0].road_address.address_name + "</div>"
        : "";
      detailAddr +=
        "<div>지번 주소 : " + result[0].address.address_name + "</div>";

      //산지번을 pnu값으로 변경합니다.
      if (result[0].address.mountain_yn == "N") {
        mountain_yn = 1;
      } else {
        mountain_yn = 2;
      }
      //지번을 텍스트 값으로 변경시켜줌
      main_address_no = ("000" + result[0].address.main_address_no).substr(
        -4,
        4
      );

      if (result[0].address.sub_address_no == 0) {
        sub_address_no = "0000";
      } else {
        sub_address_no = ("000" + result[0].address.sub_address_no).substr(
          -4,
          4
        );
      }
      //지번 pnu 변경
      var lowAddr2 = mountain_yn + main_address_no + sub_address_no;

      searchAddrFromCoords(mouseEvent.latLng, function (result1, status) {
        if (status === kakao.maps.services.Status.OK) {
          console.log(result1);
          //전체 pnu 값
          let pnu = result1[0].code + lowAddr2;
          let lowAddr1 = "<div>" + "PNU : " + pnu + "</div>";
          let content =
            '<div class="bAddr">' +
            '<span class="title">법정동 주소정보</span>' +
            detailAddr +
            lowAddr1 +
            "</div>";

          // 마커를 클릭한 위치에 표시합니다
          marker.setPosition(mouseEvent.latLng);
          marker.setMap(map);

          // 인포윈도우에 클릭한 위치에 대한 법정동 상세 주소정보를 표시합니다
          infowindow.setContent(content);
          infowindow.open(map, marker);
        }
      });
    }
  });
});
// 중심 좌표나 확대 수준이 변경됐을 때 지도 중심 좌표에 대한 주소 정보를 표시하도록 이벤트를 등록합니다
kakao.maps.event.addListener(map, "idle", function () {
  searchAddrFromCoords(map.getCenter(), displayCenterInfo);
});

function searchAddrFromCoords(coords, callback) {
  // 좌표로 행정동 주소 정보를 요청합니다
  geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
}

function searchDetailAddrFromCoords(coords, callback) {
  // 좌표로 법정동 상세 주소 정보를 요청합니다
  geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}

// 현재 지도 중심좌표로 주소를 검색해서 지도 좌측 상단에 표시합니다
searchAddrFromCoords(map.getCenter(), displayCenterInfo);
// 지도 좌측상단에 지도 중심좌표에 대한 주소정보를 표출하는 함수입니다
function displayCenterInfo(result, status) {
  if (status === kakao.maps.services.Status.OK) {
    var infoDiv = document.getElementById("centerAddr");
    for (var i = 0; i < result.length; i++) {
      // 행정동의 region_type 값은 'H' 이므로
      if (result[i].region_type === "H") {
        infoDiv.innerHTML =
          result[i].address_name +
          "<div> 법정동코드명: " +
          result[i].code +
          "</div>";
        break;
      }
    }
  }
}
var currentTypeId;
function setOverlayMapTypeId(maptype) {
  var changeMaptype;
  // var mapTypes = document.querySelector("#map_type");
  // var mapTypesDistrict = mapTypes.querySelector(".map_type_district");
  // var mapTypesRoad = mapTypes.querySelector(".map_type_road");

  if (maptype === "use_district") {
    changeMaptype = kakao.maps.MapTypeId.USE_DISTRICT;
    // mapTypesDistrict.value = "지적도 끄기";
  } else if (maptype === "roadview") {
    changeMaptype = kakao.maps.MapTypeId.ROADVIEW;
    // mapTypesRoad.value = "로드뷰 끄기";
  }
  // 이미 등록된 지도 타입이 있으면 제거합니다
  if (currentTypeId) {
    map.removeOverlayMapTypeId(currentTypeId);
  }

  // maptype에 해당하는 지도타입을 지도에 추가합니다
  map.addOverlayMapTypeId(changeMaptype);

  // 지도에 추가된 타입정보를 갱신합니다
  currentTypeId = changeMaptype;

  // 지적도 보이기를 다시 클릭하면 초기화 하는 코드인데 재수정 필요
  // if (mapTypesDistrict.value === "지적도 끄기") {
  // 	map.removeOverlayMapTypeId(currentTypeId);
  // } else if (mapTypesRoad === "로드뷰 끄기") {
  // 	map.removeOverlayMapTypeId(currentTypeId);
  // }
}

function mapTypeFirst() {
  map.removeOverlayMapTypeId(currentTypeId);
}
// 	pnu 값 배열에 담는 함수

var pnuS = [];
function addPnu(pnu) {
  pnuS.push(pnu);
}
// console.log(pnuS);
var pnuSeeker = () => {
  var pnu;
  kakao.maps.event.addListener(map, "click", function (mouseEvent) {
    searchDetailAddrFromCoords(mouseEvent.latLng, function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        // var detailAddr = !!result[0].road_address ? '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
        // detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';

        //산지번을 pnu값으로 변경합니다.
        if (result[0].address.mountain_yn == "N") {
          mountain_yn = 1;
        } else {
          mountain_yn = 2;
        }
        //지번을 텍스트 값으로 변경시켜줌
        main_address_no = ("000" + result[0].address.main_address_no).substr(
          -4,
          4
        );

        if (result[0].address.sub_address_no == 0) {
          sub_address_no = "0000";
        } else {
          sub_address_no = ("000" + result[0].address.sub_address_no).substr(
            -4,
            4
          );
        }
        //지번 pnu 변경
        var lowAddr2 = mountain_yn + main_address_no + sub_address_no;

        searchAddrFromCoords(mouseEvent.latLng, function (result1, status) {
          if (status === kakao.maps.services.Status.OK) {
            //전체 pnu 값
            pnu = result1[0].code + lowAddr2;
            addPnu(pnu);
          }
        });
      }
    });
  });
};

var pnuSearch = function (callback) {
  var pnu;
  kakao.maps.event.addListener(map, "click", function (mouseEvent) {
    searchDetailAddrFromCoords(mouseEvent.latLng, function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        // var detailAddr = !!result[0].road_address ? '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
        // detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';

        //산지번을 pnu값으로 변경합니다.
        if (result[0].address.mountain_yn == "N") {
          mountain_yn = 1;
        } else {
          mountain_yn = 2;
        }
        //지번을 텍스트 값으로 변경시켜줌
        main_address_no = ("000" + result[0].address.main_address_no).substr(
          -4,
          4
        );

        if (result[0].address.sub_address_no == 0) {
          sub_address_no = "0000";
        } else {
          sub_address_no = ("000" + result[0].address.sub_address_no).substr(
            -4,
            4
          );
        }
        //지번 pnu 변경
        var lowAddr2 = mountain_yn + main_address_no + sub_address_no;

        searchAddrFromCoords(mouseEvent.latLng, function (result1, status) {
          if (status === kakao.maps.services.Status.OK) {
            //전체 pnu 값
            pnu = result1[0].code + lowAddr2;
            callback(pnu);
          }
        });
      }
    });
  });
}; //callback
// console.log(pnuSearch(displayGonsiga));
// console.log(pnu);
window.addEventListener("load", function () {
  var gongsiga = document.querySelector("#gongsiga");
  gongsiga.onclick = function () {
    // for (var i = 0; i < pnuS.length; i++) {
    // displayGonsiga(pnu);
    pnuSearch(displayGonsiga);
    // }
  };
});
function displayGonsiga(pnu) {
  // window.addEventListener("load", function () {
  // var gongsiga = document.querySelector("#gongsiga");
  var httpRequest;
  // gongsiga.onclick = function makeRequest() {
  httpRequest = new XMLHttpRequest();

  if (!httpRequest) {
    alert("XMLHTTP 인스턴스를 만들 수가 없어요 ㅠㅠ");
    return false;
  }
  httpRequest.onreadystatechange = alertContents;
  // url = 'http://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr?ServiceKey=DCGCLKgxkKvdE%2F%2F3NNZJoNkacYaV%2BJ110w%2B1qi%2Bd9kWwYunxWXyWGJOfTNIZu6q1sqaeBm5p7b6uZQsxaNmqgw%3D%3D&pnu=1111017700102110000&stdrYear=2015&format=xml&numOfRows=10&pageNo=1'
  //토지특성정보 api
  var urlData =
    "http://apis.data.go.kr/1611000/nsdi/LandCharacteristicsService/attr/getLandCharacteristics";
  //개별공시지가 api
  // var urlData = 'http://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr';
  var serviceKey =
    "serviceKey=" +
    "DCGCLKgxkKvdE%2F%2F3NNZJoNkacYaV%2BJ110w%2B1qi%2Bd9kWwYunxWXyWGJOfTNIZu6q1sqaeBm5p7b6uZQsxaNmqgw%3D%3D";
  var pnuV = "&pnu=" + pnu;
  var stdrYear = "&stdrYear=" + 2020;
  var format = "&format=" + "json"; //xml, json 형식 변경 가능
  var numOfRows = "&numOfRows=" + 10;
  var pageNo = "&pageNo=" + 1;
  //개별공시지가 이용시 쿼리변수
  // var queryParams = '?' + serviceKey + pnuV + stdrYear + format + numOfRows + pageNo;
  var queryParams =
    "?" + serviceKey + pageNo + numOfRows + pnuV + stdrYear + format;
  var url = urlData + queryParams;
  httpRequest.open("GET", url, true);
  httpRequest.send();
  // }

  var gongsigaJson = new Array();
  function alertContents() {
    try {
      if (httpRequest.readyState === httpRequest.DONE) {
        if (httpRequest.status === 200) {
          var response = JSON.parse(httpRequest.responseText);
          console.log(response);

          var responseLandCharacter = response.landCharacteristicss.field[0];

          gongsigaJson.push(responseLandCharacter);

          for (let i = 0; i < gongsigaJson.length; i++) {
            document.querySelector(".num" + i).innerHTML = i + 1;
            document.querySelector(".address" + i).innerHTML =
              gongsigaJson[i].ldCodeNm;
            document.querySelector(".jibun" + i).innerHTML =
              gongsigaJson[i].mnnmSlno;
            document.querySelector(".gimok" + i).innerHTML =
              gongsigaJson[i].lndcgrCodeNm;
            document.querySelector(".acre" + i).innerHTML =
              gongsigaJson[i].lndpclAr;
            document.querySelector(".uselandschem" + i).innerHTML =
              gongsigaJson[i].prposArea1Nm;
            document.querySelector(".roadside" + i).innerHTML =
              gongsigaJson[i].roadSideCodeNm;
            document.querySelector(".landshape" + i).innerHTML =
              gongsigaJson[i].tpgrphFrmCodeNm;
            document.querySelector(".landtilt" + i).innerHTML =
              gongsigaJson[i].tpgrphHgCodeNm;
            document.querySelector(".landuse" + i).innerHTML =
              gongsigaJson[i].ladUseSittnNm;
            document.querySelector(".gongsiga" + i).innerHTML =
              gongsigaJson[i].pblntfPclnd;
            document.querySelector(".stdryear" + i).innerHTML =
              gongsigaJson[i].stdrYear;
          }
        } else {
          alert("request에 뭔가 문제가 있어요.");
        }
      }
    } catch (e) {
      alert("Caught Exception: " + e.description);
    }
  }
}

// 공시지가 2개이상 특성 비교하는 함수.
pnuSeeker();
window.addEventListener("load", function () {
  var landlike = document.querySelector("#landlikley");
  var tableGongsiga = document.querySelector("#tablegonsiga");
  var tbody = tableGongsiga.querySelector("tbody");
  var delButton = document.querySelector(".del-button");

  delButton.onclick = () => {
    var inputs = tbody.querySelectorAll("input[type =checkbox]:checked");
    console.log(inputs.length);
    for (var d = 0; d < inputs.length; d++) {
      inputs[d].parentElement.parentElement.remove();
    }
  };

  landlike.onclick = function () {
    if (pnuS.length > 1) {
      pnuS.forEach((pnu, index) => {
        console.log(pnuS.length);
        console.log(pnuS);

        var httpRequest;
        httpRequest = new XMLHttpRequest();

        if (!httpRequest) {
          alert("XMLHTTP 인스턴스를 만들 수가 없어요 ㅠㅠ");
          return false;
        }
        httpRequest.onreadystatechange = alertContents;
        // url = 'http://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr?ServiceKey=DCGCLKgxkKvdE%2F%2F3NNZJoNkacYaV%2BJ110w%2B1qi%2Bd9kWwYunxWXyWGJOfTNIZu6q1sqaeBm5p7b6uZQsxaNmqgw%3D%3D&pnu=1111017700102110000&stdrYear=2015&format=xml&numOfRows=10&pageNo=1'
        //토지특성정보 api
        var urlData =
          "http://apis.data.go.kr/1611000/nsdi/LandCharacteristicsService/attr/getLandCharacteristics";
        //개별공시지가 api
        // var urlData = 'http://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr';
        var serviceKey =
          "serviceKey=" +
          "DCGCLKgxkKvdE%2F%2F3NNZJoNkacYaV%2BJ110w%2B1qi%2Bd9kWwYunxWXyWGJOfTNIZu6q1sqaeBm5p7b6uZQsxaNmqgw%3D%3D";
        var pnuV = "&pnu=" + pnu;
        var stdrYear = "&stdrYear=" + 2020;
        var format = "&format=" + "json"; //xml, json 형식 변경 가능
        var numOfRows = "&numOfRows=" + 10;
        var pageNo = "&pageNo=" + 1;
        //개별공시지가 이용시 쿼리변수
        // var queryParams = '?' + serviceKey + pnuV + stdrYear + format + numOfRows + pageNo;
        var queryParams =
          "?" + serviceKey + pageNo + numOfRows + pnuV + stdrYear + format;
        var url = urlData + queryParams;
        httpRequest.open("GET", url, true);
        httpRequest.send();
        // }
        var template = document.querySelector("template");
        var cloneNode = document.importNode(template.content, true);
        var tds = cloneNode.querySelectorAll("td");

        var gongsigaJson = new Array();
        function alertContents() {
          try {
            if (httpRequest.readyState === httpRequest.DONE) {
              if (httpRequest.status === 200) {
                //json으로 받아오는 경우
                var response = JSON.parse(httpRequest.responseText);
                console.log(response);
                // console.log(response.indvdLandPrices.field[0].ldCodeNm);

                var responseLandCharacter =
                  response.landCharacteristicss.field[0];
                // var idcodenum = responseLandCharacter.ldCodeNm;
                // var bunji = responseLandCharacter.mnnmSlno;
                // var gimok = responseLandCharacter.lndcgrCodeNm;
                // var acre = responseLandCharacter.lndpclAr;
                // var uselandSchem = responseLandCharacter.prposArea1Nm;
                // var roadSide = responseLandCharacter.roadSideCodeNm;
                // var landShape = responseLandCharacter.tpgrphFrmCodeNm;
                // var landTilt = responseLandCharacter.tpgrphHgCodeNm;
                // var landUse = responseLandCharacter.ladUseSittnNm;
                // var gongsiga = responseLandCharacter.pblntfPclnd;
                //xml 로 데이터 추출시
                // var gongsiga = xmlrequest.getElementsByTagName("pblntfPclnd")[0].firstChild.data;
                // var stdryear = responseLandCharacter.stdrYear;

                gongsigaJson.push(responseLandCharacter);
                console.log(gongsigaJson);

                // 2개씩 보여줄지 선택해서 노드 결정.
                for (let j = 0; j < gongsigaJson.length; j++) {
                  // document.querySelector(".num" + index).innerHTML = index + 1;
                  // document.querySelector(".address" + index).innerHTML = gongsigaJson[j].ldCodeNm;
                  // document.querySelector(".jibun" + index).innerHTML = gongsigaJson[j].mnnmSlno;
                  // document.querySelector(".gimok" + index).innerHTML = gongsigaJson[j].lndcgrCodeNm;
                  // document.querySelector(".acre" + index).innerHTML = gongsigaJson[j].lndpclAr;
                  // document.querySelector(".uselandschem" + index).innerHTML = gongsigaJson[j].prposArea1Nm;
                  // document.querySelector(".roadside" + index).innerHTML = gongsigaJson[j].roadSideCodeNm;
                  // document.querySelector(".landshape" + index).innerHTML = gongsigaJson[j].tpgrphFrmCodeNm;
                  // document.querySelector(".landtilt" + index).innerHTML = gongsigaJson[j].tpgrphHgCodeNm;
                  // document.querySelector(".landuse" + index).innerHTML = gongsigaJson[j].ladUseSittnNm;
                  // document.querySelector(".gongsiga" + index).innerHTML = gongsigaJson[j].pblntfPclnd;
                  // document.querySelector(".stdryear" + index).innerHTML = gongsigaJson[j].stdrYear;
                  tds[1].innerHTML = index + 1;
                  tds[2].innerHTML = gongsigaJson[j].ldCodeNm;
                  tds[3].innerHTML = gongsigaJson[j].mnnmSlno;
                  tds[4].innerHTML = gongsigaJson[j].lndcgrCodeNm;
                  tds[5].innerHTML = gongsigaJson[j].lndpclAr;
                  tds[6].innerHTML = gongsigaJson[j].prposArea1Nm;
                  tds[7].innerHTML = gongsigaJson[j].roadSideCodeNm;
                  tds[8].innerHTML = gongsigaJson[j].tpgrphFrmCodeNm;
                  tds[9].innerHTML = gongsigaJson[j].tpgrphHgCodeNm;
                  tds[10].innerHTML = gongsigaJson[j].ladUseSittnNm;
                  tds[11].innerHTML = gongsigaJson[j].pblntfPclnd;
                  tds[12].innerHTML = gongsigaJson[j].stdrYear;
                }
                tbody.appendChild(cloneNode);
              } else {
                alert("request에 뭔가 문제가 있어요.");
              }
            }
          } catch (e) {
            alert("Caught Exception: " + e.description);
          }
        }
      });
    }
  };
});
//ajax 예제
/*
window.addEventListener("load", function () {
var callIndexes = document.querySelector("#callIndex");
var tableIndexes = document.querySelector("#tableIndex");

callIndexes.onclick = function () {
    //console.log("진행시켜")

    $.ajaxPrefilter('json', function (options, orig, jqXHR) {
        return 'jsonp';
    });
    $.ajax({
        url: 'http://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/010Y002/MM/201101/201106/AAAA11/',
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            makeTable(result);
        },
        error: function (result) {
            console.log("error >> " + $(result).text());
        }
    });

    function makeTable(jsonData) {
        var rows = jsonData.StatisticSearch.row;

        $data = "";

        for (var idx in rows) {
            $data += '<tr><td>' + rows[idx].TIME + '</td><td>' + rows[idx].DATA_VALUE + '</td></tr>';
        }

        $(tableIndexes).append($data);
    }
};


});
*/
