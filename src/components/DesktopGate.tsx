export default function DesktopGate() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-4 px-8">
        <h1 className="text-4xl font-bold cyber-glow-text text-primary-500">
          Desktop required
        </h1>
        <p className="text-xl text-gray-400">
          Open this link on a computer to continue.
        </p>
      </div>
    </div>
  );
}
