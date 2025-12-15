const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    await document.deleteOne();
    res.status(204).send();
  });

const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    await document.save();
    res.status(200).json({ data: document });
  });

const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    res.status(201).json({ data: document });
  });

const getOne = (Model, populateOpts) =>
  asyncHandler(async (req, res, next) => {

    const query = Model.findById(req.params.id);
    if(populateOpts){
      query.populate(populateOpts)
    }
    const document = await query;
    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: document });
  });

const getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) filter = req.filterObj;
    const documentCounts = await Model.estimatedDocumentCount();
    // Build Query
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .search()
      .sort(modelName)
      .limitFields()
      .pagination(documentCounts);

    const { mongooseQuery, paginationResult } = apiFeatures;
    // Execute Query
    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ paginationResult, results: documents.length, data: documents });
  });

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };
