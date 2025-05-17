import axios from 'https://cdn.skypack.dev/axios';

// 사용 예시
for (let i = 0; i <= 10; i++) {
  axios.get(`http://localhost:3000/api/schools/${i}`)
  .then(response => {
    console.log('가장 가까운 학교 목록:');
    response.data.arr.forEach(school => {
      console.log(`${school.school}: ${school.distance_meters.toFixed(0)}m`);
    });
  })
  .catch(err => console.error('Error:', err));
}

  window.addEventListener('DOMContentLoaded', async () => {
    const response = await axios.get('http://localhost:3000/api/schools/1');
    console.log(response);
    console.log(response.data);
    const schools = response.data.arr;
    const resultsDiv = document.createElement('div');
    
    schools.forEach(school => {
      const p = document.createElement('p');
      p.textContent = `${school.school}: ${Math.round(school.distance_meters)}m`;
      resultsDiv.appendChild(p);
    });
    
    document.body.appendChild(resultsDiv);
  });

 