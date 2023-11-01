import mongoose from 'mongoose';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

//TODO: add indexing
const reasonSchema = new mongoose.Schema({
    label: { type: String, select: true, required: true, index: true },
    desc: { type: String, select: true, required: true, index: true },
    enabled: { type: Boolean, default: true, required: true }
});

export const Reason = mongoose.model('Reason', reasonSchema);

const allReasonsQuery = Reason.find();
const enabledReasonsQuery = allReasonsQuery.nor({ enabled: false });

export async function addReason(lbl, desc) {
    // call replaceOne to prevent duplicate reasons accumulating with app restarts
    let reason = Reason.create({ label: lbl, desc: desc, enabled: true });
    return reason;
}

export async function populateReasons() {
    const reasonDict = require('../data/reasons.json');

    const reasonArray = []
    for (const reason in reasonDict) {
        const description = reasonDict[reason];
        reasonArray.push({
            replaceOne: {
                upsert: true,
                filter: { label: reason },
                replacement: {
                    label: reason,
                    desc: description,
                    enabled: true
                }
            }
        });
    }

    Reason.bulkWrite(reasonArray).then();

    return await allReasonsQuery.lean();
}

export function getReasonById(id) {
    let r = Reason.findById(id);
    return r;
}

export function getReason(label) {
    let r = Reason.findOne({ label: label })
        .lean()
        .then(console.log);
    return r;
}

export function getReasons() {
    const r = enabledReasonsQuery.exec();
}

export function updateReason(id, ...fields) {
    let updateParams = {}
    for (let i = 0; i < fields.length - 1; i++) {
        const key = fields[i];
        const value = fields[i + 1];
        updateParams[key] = value;
    }

    let r = Reason.findByIdAndUpdate(id, { $set: updateParams })
        .lean()
        .then(console.log);
    return r;
}

//TODO: delete function needs to be protected for security reasons
export function __deleteReason(id) {
    let r = Reason.findByIdAndDelete(id)
        .lean()
        .then(console.log);
    return r;
}