import logoPng from "~/images/lume-logo.png?url";

export default function LumeLogo() {
  return (
    <div>
      <img src={logoPng} alt="Lume logo" className="h-10" />
    </div>
  );
}
