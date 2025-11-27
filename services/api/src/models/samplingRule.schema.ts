// samplingRule.schema.ts
// MongoDB schema for dynamic sampling rules

import { Schema, model } from 'mongoose';

const SamplingRuleSchema = new Schema({
  service: { type: String, required: true },
  rule: { type: String, enum: ['tail', 'priority'], required: true },
  rate: { type: Number, min: 0, max: 1, required: true },
  conditions: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

export default model('SamplingRule', SamplingRuleSchema);
