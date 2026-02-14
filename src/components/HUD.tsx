import { Progress } from '@heroui/react';

interface HUDProps {
  trialNumber: number;
  totalTrials: number;
  loveMeter: number;
}

export default function HUD({
  trialNumber,
  totalTrials,
  loveMeter,
}: HUDProps) {
  return (
    <div className="fixed top-4 right-4 z-30 flex items-center gap-4">
      <div className="glass-card px-4 py-2 rounded-lg">
        <div className="text-sm font-mono text-white mb-1">
          Trial {trialNumber}/{totalTrials}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Love Meter</span>
          <Progress
            value={loveMeter}
            className="w-32"
            color="secondary"
            size="lg"
            aria-label="Love Meter"
          />
          <span className="text-xs text-white font-mono">{Math.round(loveMeter)}%</span>
        </div>
      </div>
    </div>
  );
}
