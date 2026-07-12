// EcoSphere - Training module controller
const trainingCourseModel = require('../models/trainingCourseModel');
const trainingRecordModel = require('../models/trainingRecordModel');
const { makeCrudController } = require('../utils/crudFactory');

const courseCrud = makeCrudController(trainingCourseModel, 'Training course');
const recordCrud = makeCrudController(trainingRecordModel, 'Training record');

async function listCourses(req, res, next) {
  try {
    const items = await trainingCourseModel.list({ q: req.query.q });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function listRecords(req, res, next) {
  try {
    const items = await trainingRecordModel.listDetailed({
      q: req.query.q,
      employee_id: req.query.employee_id,
      department_id: req.query.department_id,
      course_id: req.query.course_id,
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await trainingRecordModel.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Course endpoints
  listCourses,
  getCourse: courseCrud.get,
  createCourse: courseCrud.create,
  updateCourse: courseCrud.update,
  removeCourse: courseCrud.remove,
  
  // Record endpoints
  listRecords,
  getRecord: recordCrud.get,
  createRecord: recordCrud.create,
  updateRecord: recordCrud.update,
  removeRecord: recordCrud.remove,
  
  // Stats
  getStats,
};
