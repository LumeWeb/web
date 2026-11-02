/** Metadata and sealed-object bounds let creation reserve its durable acknowledgement before SDK work. */
export const maximumMetadataBytes = 16 * 1024;
// Sector descriptors also live in the seal; metadata bytes alone cannot bound its acknowledgement.
export const maximumSealedObjectBytes = 1024 * 1024;
export const mutationRecordBytes = 4096;
export const uploadRecordBytes = maximumSealedObjectBytes + mutationRecordBytes;
