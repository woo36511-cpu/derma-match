import { useEffect, useRef, useState } from "react";

const vision = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21";
const model = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

export function GuidedFacePhoto() {
  const video = useRef(null);
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState("");
  const [status, setStatus] = useState("카메라를 준비하고 있어요.");
  const [closeUp, setCloseUp] = useState(false);

  useEffect(() => {
    if (!open || photo) return;
    let stopped = false;
    let stream, detector, timer;
    let steadySince = null;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    async function prepare() {
      try {
        setStatus("카메라를 준비하고 있어요.");
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (stopped) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        const preview = video.current;
        preview.srcObject = stream;
        await preview.play();
        if (!closeUp) {
          const { FaceDetector, FilesetResolver } = await import(/* webpackIgnore: true */ `${vision}/vision_bundle.mjs`);
          if (stopped) return;
          detector = await FaceDetector.createFromOptions(await FilesetResolver.forVisionTasks(`${vision}/wasm`), {
            baseOptions: { modelAssetPath: model }, runningMode: "VIDEO",
          });
          if (stopped) {
            detector.close();
            return;
          }
        }
        timer = setInterval(() => {
          if (!preview.videoWidth || preview.readyState < 2) return;
          try {
            const now = performance.now();
            const size = Math.min(preview.videoWidth, preview.videoHeight);
            const x = (preview.videoWidth - size) / 2;
            const y = (preview.videoHeight - size) / 2;
            const frame = detector?.detectForVideo(preview, now).detections;
            const box = frame?.[0]?.boundingBox;
            const [rightEye, leftEye] = frame?.[0]?.keypoints ?? [];
            const upright = rightEye && leftEye && Math.abs(rightEye.y - leftEye.y) < 0.06;
            const aligned = closeUp || (frame?.length === 1 && upright && box && box.width >= size * 0.35 &&
              box.height <= size * 0.85 && Math.abs(box.originX + box.width / 2 - preview.videoWidth / 2) < size * 0.12 &&
              Math.abs(box.originY + box.height / 2 - preview.videoHeight / 2) < size * 0.12);
            const sample = size * 0.45;
            context.drawImage(preview, x + (size - sample) / 2, y + (size - sample) / 2, sample, sample, 0, 0, 128, 128);
            const pixels = context.getImageData(0, 0, 128, 128).data;
            let light = 0;
            let edges = 0;
            for (let i = 0; i < pixels.length; i += 4) {
              light += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
              if (i % 512) edges += Math.abs(pixels[i + 1] - pixels[i - 3]);
            }
            light /= 128 ** 2;
            edges /= 128 ** 2;
            const issue = !aligned ? "얼굴 한 명을 가이드 가운데에 맞춰주세요."
              : light < 65 ? "조금 밝은 곳으로 이동해 주세요."
              : light > 220 ? "빛이 너무 강해요. 조명을 조절해 주세요."
              : edges < 2.5 ? "카메라를 움직이지 말고 초점을 맞춰주세요." : "";
            setStatus(issue || "✓ 촬영 가능 · 잠시 그대로 있어 주세요.");
            if (issue) {
              steadySince = null;
              return;
            }
            steadySince ??= now;
            if (now - steadySince < 900) return;
            const capture = document.createElement("canvas");
            capture.width = capture.height = Math.min(720, size);
            capture.getContext("2d").drawImage(preview, x, y, size, size, 0, 0, capture.width, capture.height);
            setPhoto(capture.toDataURL("image/jpeg", 0.85));
            clearInterval(timer);
          } catch {
            clearInterval(timer);
            stream.getTracks().forEach(track => track.stop());
            setStatus("사진 품질을 확인할 수 없어요. 설문을 계속할 수 있어요.");
          }
        }, 220);
      } catch {
        stream?.getTracks().forEach(track => track.stop());
        if (!stopped) setStatus("카메라를 열 수 없어요. 권한을 확인하거나 설문을 계속해 주세요.");
      }
    }

    prepare();
    return () => {
      stopped = true;
      clearInterval(timer);
      stream?.getTracks().forEach(track => track.stop());
      detector?.close();
    };
  }, [open, photo, closeUp]);

  return <section className="care-panel space-y-3" aria-label="피부 사진 확인">
    <h2 className="font-bold">피부 사진 확인 · 선택</h2>
    <p className="text-sm">사진은 이 화면에서 피부 상태를 살펴보는 데 쓰여요. 서버에 전송하거나 저장하지 않아요.</p>
    {!open ? <button type="button" className="care-secondary" onClick={() => setOpen(true)}>얼굴 사진 찍기</button> : <>
      <div className="relative mx-auto aspect-square max-w-xs overflow-hidden rounded-xl bg-slate-900">
        {photo ? <img src={photo} alt={closeUp ? "촬영한 고민 부위" : "촬영한 얼굴"} className="h-full w-full object-cover" /> : <>
          <video ref={video} autoPlay playsInline muted className="h-full w-full object-cover" />
          <div aria-hidden="true" className={`pointer-events-none absolute inset-6 border-2 border-white ${closeUp ? "rounded-xl" : "rounded-[50%]"}`} />
        </>}
      </div>
      <p role="status">{photo ? "사진을 확인해 주세요." : status}</p>
      <div className="flex flex-wrap gap-2">
        {photo && <button type="button" className="care-secondary" onClick={() => setPhoto("")}>다시 찍기</button>}
        {photo && !closeUp && <button type="button" className="care-secondary" onClick={() => { setCloseUp(true); setPhoto(""); }}>고민 부위 가까이 찍기</button>}
        <button type="button" className="care-secondary" onClick={() => { setOpen(false); setPhoto(""); setCloseUp(false); }}>닫기</button>
      </div>
    </>}
  </section>;
}
