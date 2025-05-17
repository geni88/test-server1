const pool = require("../model/closerSchool")
const express = require("express");
const router = express.Router();

router.get("/schools/:apartmentId", async(req, res) => {
  const query = `
      SELECT s.name AS school, ST_Distance(a.geom, s.geom) AS distance_meters
      FROM schools s, apartments a
      WHERE a.id = $1
      ORDER BY distance_meters ASC
      LIMIT 5;
    `;
  try{
    const result = await pool.query(query, [req.params.apartmentId]);
    res.status(200).json({status: 200, arr: result.rows});
  } 
  catch(error){
    console.error("data fail", error);
    res.status(500).json({status: 500, message: "data fail"});
  }
})

module.exports = router
