function isDirectoryFile(file) {
  return file.data.webkitRelativePath || isFolderBundle(file);
}
function isFolderBundle(file) {
  const meta = file.meta;
  return !!(meta?.isVirtualBundle && meta?.displayAsFolder);
}

const UPLOAD_TYPE_MAIN = "main";
const UPLOAD_TYPE_AVATAR = "avatar";
var FileStatus = /* @__PURE__ */ ((FileStatus2) => {
  FileStatus2["COMPLETE"] = "complete";
  FileStatus2["ERROR"] = "error";
  FileStatus2["PENDING"] = "pending";
  FileStatus2["PREPROCESSING"] = "preprocessing";
  FileStatus2["UPLOADING"] = "uploading";
  return FileStatus2;
})(FileStatus || {});
var UploadStatus = /* @__PURE__ */ ((UploadStatus2) => {
  UploadStatus2["COMPLETED"] = "completed";
  UploadStatus2["ERROR"] = "error";
  UploadStatus2["IDLE"] = "idle";
  UploadStatus2["PENDING"] = "pending";
  UploadStatus2["UPLOADING"] = "uploading";
  return UploadStatus2;
})(UploadStatus || {});

export { FileStatus, UPLOAD_TYPE_AVATAR, UPLOAD_TYPE_MAIN, UploadStatus, isDirectoryFile, isFolderBundle };
