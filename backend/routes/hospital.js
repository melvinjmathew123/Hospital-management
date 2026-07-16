const express = require('express');
const router = express.Router();
const {
  getDepartments, createDepartment,
  getWards, createWard,
  getBeds, createBed, updateBed,
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateCreateDepartment, validateCreateWard, validateCreateBed, validateUpdateBed,
} = require('../middleware/validate');

// Departments
router.get ('/departments',       protect,                                        getDepartments);
router.post('/departments',       protect, authorize('Super Admin'), validateCreateDepartment, createDepartment);

// Wards
router.get ('/wards',             protect,                                        getWards);
router.post('/wards',             protect, authorize('Super Admin'), validateCreateWard,       createWard);

// Beds
router.get ('/beds',              protect,                                        getBeds);
router.post('/beds',              protect, authorize('Super Admin'), validateCreateBed,        createBed);
router.put ('/beds/:id',          protect,                           validateUpdateBed,         updateBed);

module.exports = router;
