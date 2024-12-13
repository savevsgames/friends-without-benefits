function OpenCVReady() {
  cv["onRuntimeInitialized"] = () => {
    console.log("OpenCV.js is ready");
    let imageMain = cv.imread("image-main");
    cv.imshow("canvas-main", imageMain);
    imageMain.delete();
  };
}
