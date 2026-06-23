import { useEffect, useRef, useState } from "react";
import { Camera, Upload, RefreshCw, ScanFace, X } from "lucide-react";
import { Button } from "./Button.jsx";

/* Face capture widget. Returns { base64, dataUrl } via onCapture.
   `base64` is the bare base64 payload (no data-URL prefix) the backend expects.

   Two paths:
   - Webcam: getUserMedia → canvas frame → JPEG.
   - Upload: pick an existing image file. With the synthetic AI backend a
     successful 1:1 match requires the *same image bytes* used at enrolment,
     so the upload path is the reliable way to reproduce an APPROVED demo. */
export function BiometricCapture({ onCapture, onClear, dark = false, height = 280, label = "Position the face within the frame" }) {
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const streamRef = useRef(null);
  const [mode, setMode] = useState("idle"); // idle | live | shot
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState("");

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  useEffect(() => () => stop(), []);

  const startCam = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      setMode("live");
      // attach after render
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); } }, 50);
    } catch (e) {
      setErr("Camera unavailable — use “Upload image” instead.");
      setMode("idle");
    }
  };

  const snap = () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    stop();
    setPreview(dataUrl);
    setMode("shot");
    onCapture?.({ base64: dataUrl.split(",")[1], dataUrl });
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      stop();
      setPreview(dataUrl);
      setMode("shot");
      onCapture?.({ base64: String(dataUrl).split(",")[1], dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    stop();
    setPreview(null);
    setMode("idle");
    setErr("");
    if (fileRef.current) fileRef.current.value = "";
    onClear?.();
  };

  const frameBg = dark ? "rgba(255,255,255,0.04)" : "var(--bg-inset)";
  const frameBorder = dark ? "1px dashed var(--border-strong)" : "1px dashed var(--border-default)";

  return (
    <div className="sp-stack sp-gap-3">
      <div style={{ position: "relative", height, borderRadius: "var(--radius-lg)", overflow: "hidden", background: frameBg, border: frameBorder, display: "grid", placeItems: "center" }}>
        {mode === "shot" && preview && <img src={preview} alt="Captured face" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        {mode === "live" && <video ref={videoRef} playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />}
        {mode === "idle" && (
          <div className="sp-stack sp-gap-2" style={{ alignItems: "center", color: "var(--text-muted)", textAlign: "center", padding: 16 }}>
            <ScanFace size={40} strokeWidth={1.5} />
            <div className="t-sm">{label}</div>
          </div>
        )}
        {mode === "live" && (
          <div style={{ position: "absolute", inset: 18, border: "2px solid rgba(255,255,255,.7)", borderRadius: "50% / 42%", pointerEvents: "none" }} />
        )}
      </div>

      {err && <div className="t-xs" style={{ color: "var(--status-rejected-text)" }}>{err}</div>}

      <div className="sp-row sp-gap-2 sp-wrap">
        {mode === "idle" && (
          <>
            <Button size="sm" variant="secondary" iconLeft={<Camera size={15} />} onClick={startCam}>Use camera</Button>
            <Button size="sm" variant="secondary" iconLeft={<Upload size={15} />} onClick={() => fileRef.current?.click()}>Upload image</Button>
          </>
        )}
        {mode === "live" && (
          <>
            <Button size="sm" variant="primary" iconLeft={<Camera size={15} />} onClick={snap}>Capture</Button>
            <Button size="sm" variant="ghost" iconLeft={<X size={15} />} onClick={reset}>Cancel</Button>
          </>
        )}
        {mode === "shot" && (
          <Button size="sm" variant="ghost" iconLeft={<RefreshCw size={15} />} onClick={reset}>Retake</Button>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
    </div>
  );
}
