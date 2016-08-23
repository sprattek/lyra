'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    datasetActions = require('./datasetActions'),
    addDataset = datasetActions.addDataset,
    ADD_PIPELINE = 'ADD_PIPELINE',
    UPDATE_PIPELINE_PROPERTY = 'UPDATE_PIPELINE_PROPERTY',
    AGGREGATE_PIPELINE = 'AGGREGATE_PIPELINE';

/**
 * Action creator to add a new Pipeline in the store. A new pipeline requires
 * a new source dataset. Thus, we need to dispatch multiple actions.
 *
 * @param {Object} pipeline - The properties of the pipeline.
 * @param {Object} dataset - The properties of the dataset.
 * @param {Array} values - A JSON array of parsed values.
 * @param {Object} schema - An object containing the schema values.
 * @returns {Function} An async action function
 */
function addPipeline(pipeline, dataset, values, schema) {
  return function(dispatch) {
    var pid = pipeline._id || counter.global();

    var ds = addDataset(dl.extend({_parent: pid}, dataset), values, schema);
    dispatch(ds);

    pipeline = dl.extend({
      _id: pid,
      _source: pipeline._source || ds.id
    }, pipeline);

    dispatch({
      type: ADD_PIPELINE,
      id: pipeline._id,
      props: pipeline
    });
  };
}

// TODO: docs
function aggregatePipeline(pipelineId, groupby, datasetAttr, cb) {
  return function(dispatch) {
    var aggDsId = counter.global(),
        props = {
          _id: aggDsId,
          _parent: datasetAttr._parent,
          name: datasetAttr.name,
          source: datasetAttr.source,
          transform: datasetAttr.transform
        },
        ds = addDataset(props, undefined, datasetAttr.schema);

    try {
      dispatch(ds);
      dispatch({
        type: AGGREGATE_PIPELINE,
        id: pipelineId,
        dsId: aggDsId,
        groupby: groupby
      });
      cb(false, aggDsId);
    } catch (e) {
      cb(e);
    }
  };
}

function updatePipelineProperty(id, property, value) {
  return {
    type: UPDATE_PIPELINE_PROPERTY,
    id: id,
    property: property,
    value: value
  };
}

module.exports = {
  // Action Names
  ADD_PIPELINE: ADD_PIPELINE,
  UPDATE_PIPELINE_PROPERTY: UPDATE_PIPELINE_PROPERTY,
  AGGREGATE_PIPELINE: AGGREGATE_PIPELINE,

  // Action Creators
  addPipeline: addPipeline,
  updatePipelineProperty: updatePipelineProperty,
  aggregatePipeline: aggregatePipeline
};
